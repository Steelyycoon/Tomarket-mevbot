/**
 * Script with options to perform the typical DB commands.
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import retry from 'p-retry'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { Client } = pg

/**
 * @param {Object} [opts]
 * @param {boolean} [opts.reset]
 * @param {boolean} [opts.cargo]
 * @param {boolean} [opts.testing]
 */
export async function dbSqlCmd ({ reset, cargo, testing } = {}) {
  // read all the SQL files
  const configSql = fs.readFileSync(path.join(__dirname, '../../postgres/config.sql'), {
    encoding: 'utf-8'
  })

  const tablesSql = fs.readFileSync(path.join(__dirname, '../../postgres/tables.sql'), {
    encoding: 'utf-8'
  })
  const functionsSql = fs.readFileSync(path.join(__dirname, '../../postgres/functions.sql'), {
    encoding: 'utf-8'
  })
  const resetSql = fs.readFileSync(path.join(__dirname, '../../postgres/reset.sql'), {
    encoding: 'utf-8'
  })

  // Setup postgres client
  const connectionString = process.env.PG_CONNECTION
  const client = await retry(
    async () => {
      const c = new Client({ connectionString })
      await c.connect()
      return c
    },
    { minTimeout: 100 }
  )

  if (reset) {
    await client.query(resetSql)
  }

  await client.query(configSql)
  await client.query(tablesSql)

  if (cargo) {
    await client.query(cargoSchema)
  }

  await client.query(functionsSql)
  await client.end()
}

const cargoSchema = `
CREATE SCHEMA IF NOT EXISTS cargo;

CREATE TABLE IF NOT EXISTS cargo.aggregate_entries (
  aggregate_cid TEXT NOT NULL,
  cid_v1 TEXT NOT NULL,
  datamodel_selector TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cargo.aggregates (
  aggregate_cid TEXT NOT NULL UNIQUE,
  piece_cid TEXT UNIQUE NOT NULL,
  sha256hex TEXT NOT NULL,
  payload_size BIGINT NOT NULL,
  metadata JSONB,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cargo.deals (
  deal_id BIGINT UNIQUE NOT NULL,
  aggregate_cid TEXT NOT NULL,
  client TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  status_meta TEXT,
  start_epoch INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_epoch INTEGER NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sector_start_epoch INTEGER,
  sector_start_time TIMESTAMP WITH TIME ZONE,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  entry_last_updated TIMESTAMP WITH TIME ZONE NOT NULL
);
`