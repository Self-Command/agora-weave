\set ON_ERROR_STOP on
BEGIN;
CREATE SCHEMA IF NOT EXISTS ci_bootstrap;
CREATE TABLE IF NOT EXISTS ci_bootstrap.health_probe (
  id integer PRIMARY KEY CHECK (id = 1),
  label text NOT NULL CHECK (label = 'synthetic-bootstrap'),
  observed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO ci_bootstrap.health_probe (id, label) VALUES (1, 'synthetic-bootstrap')
  ON CONFLICT (id) DO UPDATE SET observed_at = clock_timestamp();
DO $$
BEGIN
  IF (SELECT count(*) FROM ci_bootstrap.health_probe WHERE id = 1 AND label = 'synthetic-bootstrap') <> 1 THEN
    RAISE EXCEPTION 'Bootstrap schema/seed probe failed';
  END IF;
END $$;
ROLLBACK;
