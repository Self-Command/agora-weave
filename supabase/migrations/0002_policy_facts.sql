CREATE TABLE core.follow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), follower_id uuid NOT NULL REFERENCES core.account(id),
  followed_id uuid NOT NULL REFERENCES core.account(id), CHECK (follower_id <> followed_id),
  state text NOT NULL CHECK (state IN ('effective','removed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE UNIQUE INDEX follow_effective_pair ON core.follow(follower_id, followed_id) WHERE state = 'effective';
CREATE INDEX ON core.follow(followed_id, follower_id) WHERE state = 'effective';
CREATE TABLE core.block (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), blocker_id uuid NOT NULL REFERENCES core.account(id),
  blocked_id uuid NOT NULL REFERENCES core.account(id), CHECK (blocker_id <> blocked_id),
  active boolean NOT NULL DEFAULT true, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE UNIQUE INDEX block_active_pair ON core.block(blocker_id, blocked_id) WHERE active;
CREATE INDEX ON core.block(blocked_id, blocker_id) WHERE active;
CREATE TABLE core.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_id uuid NOT NULL UNIQUE REFERENCES core.account(id),
  follow_approval boolean NOT NULL DEFAULT false, dm_policy text NOT NULL DEFAULT 'following',
  read_receipt boolean NOT NULL DEFAULT false, typing boolean NOT NULL DEFAULT false,
  push boolean NOT NULL DEFAULT true, notification_categories text[] NOT NULL DEFAULT ARRAY[]::text[],
  video_policy text NOT NULL DEFAULT 'wifi_only' CHECK (video_policy IN ('always','wifi_only','never')),
  preload boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE TABLE core.mute_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner uuid NOT NULL REFERENCES core.account(id),
  kind text NOT NULL CHECK (kind IN ('account','keyword','topic')), target text NOT NULL, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (owner, kind, target)
);
SELECT core.protect_table('core.follow');
SELECT core.protect_table('core.block');
SELECT core.protect_table('core.user_preferences');
SELECT core.protect_table('core.mute_rule');
