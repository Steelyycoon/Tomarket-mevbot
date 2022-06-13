-- Due to the parameters differing from the old function definition, if we don't drop the old one then it's not replaced.
DROP FUNCTION IF EXISTS users_by_storage_used;

CREATE OR REPLACE FUNCTION users_by_storage_used(
  from_percent INTEGER,
  to_percent INTEGER DEFAULT NULL,
  user_id_gt BIGINT DEFAULT 0,
  user_id_lte BIGINT DEFAULT NULL
)
  RETURNS TABLE
    (
      id            TEXT,
      name          TEXT,
      email         TEXT,
      storage_quota TEXT,
      storage_used  TEXT
    )
LANGUAGE plpgsql
AS
$$
DECLARE
  -- Default storage quota 1TiB = 1099511627776 bytes
  default_quota BIGINT := 1099511627776;
BEGIN
  RETURN QUERY
    WITH user_account AS (
      SELECT  u.id::TEXT                                        AS id,
              u.name                                            AS name,
              u.email                                           AS email,
              COALESCE(ut.value::BIGINT, default_quota)::TEXT   AS storage_quota,
              (user_used_storage(u.id)).total::TEXT             AS storage_used
      FROM public.user u
      LEFT JOIN user_tag ut ON u.id = ut.user_id
      WHERE (ut.tag IS NULL OR ut.tag = 'StorageLimitBytes')
      AND ut.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 42
        FROM user_tag r
        WHERE u.id = r.user_id
        AND r.tag = 'HasAccountRestriction'
        AND r.value ILIKE 'true'
        AND r.deleted_at IS NULL
      )
      AND u.id > user_id_gt
      AND u.id <= user_id_lte
    )
    SELECT *
    FROM user_account
    WHERE user_account.storage_used::BIGINT >= (from_percent/100::NUMERIC) * user_account.storage_quota::BIGINT
    AND (to_percent IS NULL OR user_account.storage_used::BIGINT < (to_percent/100::NUMERIC) * user_account.storage_quota::BIGINT)
    ORDER BY user_account.storage_used::BIGINT DESC;
END
$$;

CREATE OR REPLACE FUNCTION upsert_pins(data json) RETURNS TEXT[]
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  pin json;
  pin_ids TEXT[];
BEGIN
  FOREACH pin IN array json_arr_to_json_element_array(data -> 'pins')
  LOOP
    SELECT pin_ids || upsert_pin(pin -> 'data') INTO pin_ids;
  END LOOP;

  RETURN pin_ids;
END
$$;
