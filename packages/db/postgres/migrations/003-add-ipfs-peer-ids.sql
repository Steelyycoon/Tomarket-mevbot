-- add the ipfs_peer_id column (nullable because Cluster does not report it if
-- the IPFS node is down)
ALTER TABLE pin_location ADD COLUMN ipfs_peer_id TEXT;
-- swap back cluster peer IDs in peer_id and add IPFS peer IDs to ipfs_peer_id
-- am6
UPDATE pin_location SET peer_id='12D3KooWF6uxxqZf4sXpQEbNE4BfbVJWAKWrFSKamxmWm4E9vyzd', ipfs_peer_id='12D3KooWPySxxWQjBgX9Jp6uAHQfVmdq8HG1gVvS1fRawHNSrmqW' WHERE peer_id='12D3KooWPySxxWQjBgX9Jp6uAHQfVmdq8HG1gVvS1fRawHNSrmqW';
-- sv15
UPDATE pin_location SET peer_id='12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6', ipfs_peer_id='12D3KooWR19qPPiZH4khepNjS3CLXiB7AbrbAD4ZcDjN1UjGUNE1' WHERE peer_id='12D3KooWR19qPPiZH4khepNjS3CLXiB7AbrbAD4ZcDjN1UjGUNE1';
-- dc13-2
UPDATE pin_location SET peer_id='12D3KooWHdBjmicdXu5X57mQ65oBpfy4p3ca5p31kfJT9FSUFu3P', ipfs_peer_id='12D3KooWKytRAd2ujxhGzaLHKJuje8sVrHXvjGNvHXovpar5KaKQ' WHERE peer_id='12D3KooWKytRAd2ujxhGzaLHKJuje8sVrHXvjGNvHXovpar5KaKQ';
-- sv15-2
UPDATE pin_location SET peer_id='12D3KooWJeRQfPbiv5U2RqQ9yK3qijbNxKarKEGLMkGrfXJuZ2Bo', ipfs_peer_id='12D3KooWEDMw7oRqQkdCJbyeqS5mUmWGwTp8JJ2tjCzTkHboF6wK' WHERE peer_id='12D3KooWEDMw7oRqQkdCJbyeqS5mUmWGwTp8JJ2tjCzTkHboF6wK';
-- am6-2
UPDATE pin_location SET peer_id='12D3KooWLWFUri36dmTkki6o9PwfQNwGb2gsHuKD5FdcwzCXYnwc', ipfs_peer_id='12D3KooWNuoVEfVLJvU3jWY2zLYjGUaathsecwT19jhByjnbQvkj' WHERE peer_id='12D3KooWNuoVEfVLJvU3jWY2zLYjGUaathsecwT19jhByjnbQvkj';
-- dc13
UPDATE pin_location SET peer_id='12D3KooWMbibcXHwkSjgV7VZ8TMfDKi6pZvmi97P83ZwHm9LEsvV', ipfs_peer_id='12D3KooWSnniGsyAF663gvHdqhyfJMCjWJv54cGSzcPiEMAfanvU' WHERE peer_id='12D3KooWSnniGsyAF663gvHdqhyfJMCjWJv54cGSzcPiEMAfanvU';
-- sv15-3
UPDATE pin_location SET peer_id='12D3KooWGFuccA83SpGGHb92PtM4LAQenxmCYkbB2G2BSEPa2Reo', ipfs_peer_id='12D3KooWRi18oHN1j8McxS9RMnuibcTwxu6VCTYHyLNH2R14qhTy' WHERE peer_id='12D3KooWRi18oHN1j8McxS9RMnuibcTwxu6VCTYHyLNH2R14qhTy';
-- am6-3
UPDATE pin_location SET peer_id='12D3KooWLf5E9SqSuA8BNmFPkokEayfKpHVyg8zT8qEm4Ruz6gk3', ipfs_peer_id='12D3KooWQYBPcvxFnnWzPGEx6JuBnrbF1FZq4jTahczuG2teEk1m' WHERE peer_id='12D3KooWQYBPcvxFnnWzPGEx6JuBnrbF1FZq4jTahczuG2teEk1m';
-- dc13-3
UPDATE pin_location SET peer_id='12D3KooW9yCAQ2edw5N75b7t9qCGYb7uFVzkfAgp4KoyTEJKXenF', ipfs_peer_id='12D3KooWJEfH2MB4RsUoaJPogDPRWbFTi8iehsxsqrQpiJwFNDrP' WHERE peer_id='12D3KooWJEfH2MB4RsUoaJPogDPRWbFTi8iehsxsqrQpiJwFNDrP';
-- sv15-4
UPDATE pin_location SET peer_id='12D3KooWN1voqaVzyvPHGLV9s4WnSR699bzvmKB9K73wiYnZ8bYc', ipfs_peer_id='12D3KooWKhPb9tSnCqBswVfC5EPE7iSTXhbF4Ywwz2MKg5UCagbr' WHERE peer_id='12D3KooWKhPb9tSnCqBswVfC5EPE7iSTXhbF4Ywwz2MKg5UCagbr';
-- sv15-5
UPDATE pin_location SET peer_id='12D3KooWFBRdRnrokAwhqpYHRz5VBkGkcVLN5ygy1GZLZ1US4cma', ipfs_peer_id='12D3KooWAdxvJCV5KXZ6zveTJmnYGrSzAKuLUKZYkZssLk7UKv4i' WHERE peer_id='12D3KooWAdxvJCV5KXZ6zveTJmnYGrSzAKuLUKZYkZssLk7UKv4i';
-- am6-4
UPDATE pin_location SET peer_id='12D3KooWGEtscYaBrGPmCBupTcGzXJyDnKfB7vfUeHBzGkMSD2YJ', ipfs_peer_id='12D3KooWDdzN3snjaMJEH9zuq3tjKUFpYHeSGNkiAreF6dQSbCiL' WHERE peer_id='12D3KooWDdzN3snjaMJEH9zuq3tjKUFpYHeSGNkiAreF6dQSbCiL';
-- am6-5
UPDATE pin_location SET peer_id='12D3KooWARoNFfnVTS6gBHNUQ4bgSLbXHb3aFfzdaiVffmu1sv89', ipfs_peer_id='12D3KooWEzCun34s9qpYEnKkG6epx2Ts9oVGRGnzCvM2s2edioLA' WHERE peer_id='12D3KooWEzCun34s9qpYEnKkG6epx2Ts9oVGRGnzCvM2s2edioLA';
-- dc13-4
UPDATE pin_location SET peer_id='12D3KooWGuxTyiADDRbmMmcP7A2EZA34BSdy91u7oBPhEJfUGPnU', ipfs_peer_id='12D3KooWHpE5KiQTkqbn8KbU88ZxwJxYJFaqP4mp9Z9bhNPhym9V' WHERE peer_id='12D3KooWHpE5KiQTkqbn8KbU88ZxwJxYJFaqP4mp9Z9bhNPhym9V';
-- dc13-5
UPDATE pin_location SET peer_id='12D3KooWQhAHsCcfWT2WFbtGC8s2QBt37exdpSEihHoj5obifYpy', ipfs_peer_id='12D3KooWBHvsSSKHeragACma3HUodK5FcPUpXccLu2vHooNsDf9k' WHERE peer_id='12D3KooWBHvsSSKHeragACma3HUodK5FcPUpXccLu2vHooNsDf9k';
