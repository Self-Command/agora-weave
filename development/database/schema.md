# 已有SQL数据字典

核读日期：2026-10-18。以下为仓库56份迁移的静态字典，按 `tools/ci/validation-manifest.json` 的真实依赖拓扑读取；没有连接DB，也不声称当前环境已应用全部56份。环境实际schema以 `ci_control.migrations` 的记录及摘要为准。表内保留原始类型、默认、CHECK/FK/唯一表达式，后续ALTER另列，不能跳过补丁把初建字段当当前约束。

官方Auth/Storage等系统schema继续由官方源码维护，此处列产品迁移内声明的表；`journal.ledger`是独立日志数据库的受控结构，不表示它和业务DB混在一个schema隔离。未列出的领域实体见[未来及完整领域模型](domain-model.md)，不可假定已存在。

本次识别 50 张建表声明。

| 表 | 初建SQL |
| --- | --- |
| `core.account` | [0001_identity.sql](../../supabase/migrations/0001_identity.sql) |
| `core.session_registry` | [0001_identity.sql](../../supabase/migrations/0001_identity.sql) |
| `core.admin_grant` | [0001_identity.sql](../../supabase/migrations/0001_identity.sql) |
| `core.stepup_challenge` | [0001_identity.sql](../../supabase/migrations/0001_identity.sql) |
| `core.follow` | [0002_policy_facts.sql](../../supabase/migrations/0002_policy_facts.sql) |
| `core.block` | [0002_policy_facts.sql](../../supabase/migrations/0002_policy_facts.sql) |
| `core.user_preferences` | [0002_policy_facts.sql](../../supabase/migrations/0002_policy_facts.sql) |
| `core.mute_rule` | [0002_policy_facts.sql](../../supabase/migrations/0002_policy_facts.sql) |
| `core.audit_event` | [0003_effects.sql](../../supabase/migrations/0003_effects.sql) |
| `core.operation` | [0003_effects.sql](../../supabase/migrations/0003_effects.sql) |
| `core.outbox` | [0003_effects.sql](../../supabase/migrations/0003_effects.sql) |
| `core.inbox` | [0003_effects.sql](../../supabase/migrations/0003_effects.sql) |
| `core.resource` | [0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql) |
| `core.content_revision` | [0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql) |
| `core.resource_dependency` | [0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql) |
| `core.media_object` | [0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql) |
| `core.media_derivative` | [0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql) |
| `core.deletion` | [0005_obligations.sql](../../supabase/migrations/0005_obligations.sql) |
| `core.dependency_hide` | [0005_obligations.sql](../../supabase/migrations/0005_obligations.sql) |
| `core.retention_record` | [0005_obligations.sql](../../supabase/migrations/0005_obligations.sql) |
| `core.retention_interest` | [0005_obligations.sql](../../supabase/migrations/0005_obligations.sql) |
| `core.security_journal` | [0005_obligations.sql](../../supabase/migrations/0005_obligations.sql) |
| `core.config_definition` | [0006_configuration.sql](../../supabase/migrations/0006_configuration.sql) |
| `core.config_bundle` | [0006_configuration.sql](../../supabase/migrations/0006_configuration.sql) |
| `core.config_activation` | [0006_configuration.sql](../../supabase/migrations/0006_configuration.sql) |
| `core.managed_document` | [0007_documents.sql](../../supabase/migrations/0007_documents.sql) |
| `core.document_revision` | [0007_documents.sql](../../supabase/migrations/0007_documents.sql) |
| `core.document_release` | [0007_documents.sql](../../supabase/migrations/0007_documents.sql) |
| `core.document_receipt` | [0007_documents.sql](../../supabase/migrations/0007_documents.sql) |
| `core.invitation` | [0101_admission_recovery.sql](../../supabase/migrations/0101_admission_recovery.sql) |
| `core.admission` | [0101_admission_recovery.sql](../../supabase/migrations/0101_admission_recovery.sql) |
| `core.recovery_case` | [0101_admission_recovery.sql](../../supabase/migrations/0101_admission_recovery.sql) |
| `core.otp_challenge` | [0107_otp_challenges.sql](../../supabase/migrations/0107_otp_challenges.sql) |
| `core.plugin_installation` | [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql) |
| `core.sanction` | [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql) |
| `core.restore_gate` | [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql) |
| `journal.ledger` | [0011_independent_security_journal.sql](../../supabase/migrations/0011_independent_security_journal.sql) |
| `core.security_checkpoint` | [0011_independent_security_journal.sql](../../supabase/migrations/0011_independent_security_journal.sql) |
| `core.event_delivery` | [0012_reliable_effects.sql](../../supabase/migrations/0012_reliable_effects.sql) |
| `core.config_group_membership` | [0018_configuration_registry.sql](../../supabase/migrations/0018_configuration_registry.sql) |
| `core.public_otp_secret` | [0036_public_otp_broker.sql](../../supabase/migrations/0036_public_otp_broker.sql) |
| `core.public_otp_flow` | [0036_public_otp_broker.sql](../../supabase/migrations/0036_public_otp_broker.sql) |
| `core.admin_bootstrap` | [0038_admin_identity_configuration.sql](../../supabase/migrations/0038_admin_identity_configuration.sql) |
| `core.admin_config_preview` | [0038_admin_identity_configuration.sql](../../supabase/migrations/0038_admin_identity_configuration.sql) |
| `core.admin_config_publication` | [0038_admin_identity_configuration.sql](../../supabase/migrations/0038_admin_identity_configuration.sql) |
| `core.admin_stepup_binding` | [0038_admin_identity_configuration.sql](../../supabase/migrations/0038_admin_identity_configuration.sql) |
| `core.admin_password_identity` | [0040_admin_password_fallback.sql](../../supabase/migrations/0040_admin_password_fallback.sql) |
| `core.admin_password_captcha` | [0040_admin_password_fallback.sql](../../supabase/migrations/0040_admin_password_fallback.sql) |
| `core.admin_password_attempt` | [0040_admin_password_fallback.sql](../../supabase/migrations/0040_admin_password_fallback.sql) |
| `core.admin_password_session` | [0040_admin_password_fallback.sql](../../supabase/migrations/0040_admin_password_fallback.sql) |

## core.account

初建来源：[0001_identity.sql](../../supabase/migrations/0001_identity.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY REFERENCES auth.users(id)` |
| `status` | `status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled'))` |
| `phone_changed_at` | `phone_changed_at timestamptz` |
| `sensitive_until` | `sensitive_until timestamptz` |
| `identity_epoch` | `identity_epoch bigint NOT NULL DEFAULT 1 CHECK (identity_epoch > 0)` |
| `registered_at` | `registered_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

## core.session_registry

初建来源：[0001_identity.sql](../../supabase/migrations/0001_identity.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `session_id` | `session_id uuid NOT NULL UNIQUE REFERENCES auth.sessions(id)` |
| `account_id` | `account_id uuid NOT NULL REFERENCES core.account(id)` |
| `device_label` | `device_label text NOT NULL DEFAULT ''` |
| `trusted_at` | `trusted_at timestamptz` |
| `revoked_at` | `revoked_at timestamptz` |
| `epoch` | `epoch bigint NOT NULL DEFAULT 1 CHECK (epoch > 0)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0044_auth_session_retirement.sql](../../supabase/migrations/0044_auth_session_retirement.sql)：`DROP CONSTRAINT session_registry_session_id_fkey`。

0044最终删除初建的`session_id`外键，以官方Auth删除生命周期的锁/触发器退休核心记录，保留不可变历史与当前拒绝；不是删除核心会话历史。

## core.admin_grant

初建来源：[0001_identity.sql](../../supabase/migrations/0001_identity.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `account_id` | `account_id uuid NOT NULL REFERENCES core.account(id)` |
| `role` | `role text NOT NULL` |
| `operation_scopes` | `operation_scopes text[] NOT NULL` |
| `resource_scope` | `resource_scope uuid[]` |
| `environment` | `environment text NOT NULL` |
| `expires_at` | `expires_at timestamptz` |
| `revoked_at` | `revoked_at timestamptz` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT registered_role CHECK (role IN ('super_admin','content_moderator','community_operator','ai_operator','auditor'))`。
- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT grant_environment CHECK (environment IN ('dev','test','production'))`。
- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT grant_scope_present CHECK (cardinality(operation_scopes)>0)`。

## core.stepup_challenge

初建来源：[0001_identity.sql](../../supabase/migrations/0001_identity.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `account_id` | `account_id uuid NOT NULL REFERENCES core.account(id)` |
| `session_id` | `session_id uuid NOT NULL REFERENCES core.session_registry(session_id)` |
| `action_digest` | `action_digest text NOT NULL` |
| `aal` | `aal text NOT NULL CHECK (aal = 'aal2')` |
| `verified_at` | `verified_at timestamptz NOT NULL` |
| `expires_at` | `expires_at timestamptz NOT NULL CHECK (expires_at > verified_at)` |
| `consumed_at` | `consumed_at timestamptz` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT stepup_binding CHECK (action_digest ~ '^[a-f0-9]{64}$' AND expires_at <= verified_at+interval '5 minutes' AND (consumed_at IS NULL OR consumed_at >= verified_at))`。

## core.follow

初建来源：[0002_policy_facts.sql](../../supabase/migrations/0002_policy_facts.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `follower_id` | `follower_id uuid NOT NULL REFERENCES core.account(id)` |
| `followed_id` | `followed_id uuid NOT NULL REFERENCES core.account(id)` |
| `CHECK` | `CHECK (follower_id <> followed_id)` |
| `state` | `state text NOT NULL CHECK (state IN ('effective','removed','cancelled'))` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

## core.block

初建来源：[0002_policy_facts.sql](../../supabase/migrations/0002_policy_facts.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `blocker_id` | `blocker_id uuid NOT NULL REFERENCES core.account(id)` |
| `blocked_id` | `blocked_id uuid NOT NULL REFERENCES core.account(id)` |
| `CHECK` | `CHECK (blocker_id <> blocked_id)` |
| `active` | `active boolean NOT NULL DEFAULT true` |
| `revoked_at` | `revoked_at timestamptz` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT block_clock CHECK ((active AND revoked_at IS NULL) OR NOT active)`。

## core.user_preferences

初建来源：[0002_policy_facts.sql](../../supabase/migrations/0002_policy_facts.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `account_id` | `account_id uuid NOT NULL UNIQUE REFERENCES core.account(id)` |
| `follow_approval` | `follow_approval boolean NOT NULL DEFAULT false` |
| `dm_policy` | `dm_policy text NOT NULL DEFAULT 'following'` |
| `read_receipt` | `read_receipt boolean NOT NULL DEFAULT false` |
| `typing` | `typing boolean NOT NULL DEFAULT false` |
| `push` | `push boolean NOT NULL DEFAULT true` |
| `notification_categories` | `notification_categories text[] NOT NULL DEFAULT ARRAY[]::text[]` |
| `video_policy` | `video_policy text NOT NULL DEFAULT 'wifi_only' CHECK (video_policy IN ('always','wifi_only','never'))` |
| `preload` | `preload boolean NOT NULL DEFAULT true` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT dm_policy_registered CHECK (dm_policy IN ('everyone','following','none'))`。

## core.mute_rule

初建来源：[0002_policy_facts.sql](../../supabase/migrations/0002_policy_facts.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `owner` | `owner uuid NOT NULL REFERENCES core.account(id)` |
| `kind` | `kind text NOT NULL CHECK (kind IN ('account','keyword','topic'))` |
| `target` | `target text NOT NULL` |
| `active` | `active boolean NOT NULL DEFAULT true` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (owner, kind, target)` |

## core.audit_event

初建来源：[0003_effects.sql](../../supabase/migrations/0003_effects.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `actor` | `actor uuid REFERENCES core.account(id)` |
| `session_id` | `session_id uuid` |
| `operation` | `operation text NOT NULL` |
| `object_ref` | `object_ref uuid` |
| `environment` | `environment text NOT NULL` |
| `plugin` | `plugin text NOT NULL` |
| `reason` | `reason text NOT NULL` |
| `before_digest` | `before_digest text` |
| `after_digest` | `after_digest text` |
| `result` | `result text NOT NULL` |
| `request_id` | `request_id uuid NOT NULL` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |

## core.operation

初建来源：[0003_effects.sql](../../supabase/migrations/0003_effects.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `actor` | `actor uuid NOT NULL REFERENCES core.account(id)` |
| `session_id` | `session_id uuid NOT NULL` |
| `environment` | `environment text NOT NULL` |
| `action` | `action text NOT NULL` |
| `operation_id` | `operation_id uuid NOT NULL` |
| `payload_hash` | `payload_hash text NOT NULL CHECK (payload_hash ~ '^[0-9a-f]{64}$')` |
| `result_ref` | `result_ref uuid` |
| `state` | `state text NOT NULL CHECK (state IN ('pending','succeeded','failed','unknown'))` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (actor, action, operation_id)` |

## core.outbox

初建来源：[0003_effects.sql](../../supabase/migrations/0003_effects.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `event_id` | `event_id uuid NOT NULL UNIQUE` |
| `aggregate_id` | `aggregate_id uuid NOT NULL` |
| `aggregate_version` | `aggregate_version bigint NOT NULL CHECK (aggregate_version > 0)` |
| `owner_plugin` | `owner_plugin text NOT NULL` |
| `lifecycle_epoch` | `lifecycle_epoch bigint NOT NULL CHECK (lifecycle_epoch > 0)` |
| `effect_key` | `effect_key text NOT NULL UNIQUE` |
| `lease` | `lease uuid` |
| `lease_until` | `lease_until timestamptz` |
| `attempt` | `attempt integer NOT NULL DEFAULT 0 CHECK (attempt >= 0)` |
| `result` | `result text` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0012_reliable_effects.sql](../../supabase/migrations/0012_reliable_effects.sql)：`ADD COLUMN event_type text NOT NULL DEFAULT 'access.changed'`。
- [0012_reliable_effects.sql](../../supabase/migrations/0012_reliable_effects.sql)：`ADD COLUMN environment text NOT NULL DEFAULT 'test' CHECK(environment IN ('dev','test','production'))`。
- [0012_reliable_effects.sql](../../supabase/migrations/0012_reliable_effects.sql)：`ADD COLUMN payload jsonb NOT NULL DEFAULT '{"state":"changed"}'::jsonb`。
- [0012_reliable_effects.sql](../../supabase/migrations/0012_reliable_effects.sql)：`ADD COLUMN recipient uuid REFERENCES core.account(id)`。
- [0020_registered_event_types.sql](../../supabase/migrations/0020_registered_event_types.sql)：`ADD CONSTRAINT outbox_event_type CHECK(event_type IN ( 'resource.changed','revision.changed','batch.changed','relation.changed','message.saved','access.changed','request.changed','notification.changed', 'ai.source.changed','index.policy.changed','document.publication.changed','config.activated','plugin.lifecycle.changed','release.changed','purge.changed','service.health.changed'))`。

## core.inbox

初建来源：[0003_effects.sql](../../supabase/migrations/0003_effects.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `consumer` | `consumer text NOT NULL` |
| `effect_key` | `effect_key text NOT NULL` |
| `event_id` | `event_id uuid NOT NULL` |
| `result` | `result text` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (consumer, effect_key)` |

## core.resource

初建来源：[0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `author_id` | `author_id uuid NOT NULL REFERENCES core.account(id)` |
| `kind` | `kind text NOT NULL CHECK (kind IN ('post','comment','repost','quote'))` |
| `visibility` | `visibility text NOT NULL CHECK (visibility IN ('public','followers','self'))` |
| `current_revision_id` | `current_revision_id uuid` |
| `policy_epoch` | `policy_epoch bigint NOT NULL DEFAULT 1 CHECK (policy_epoch > 0)` |
| `publication_state` | `publication_state text NOT NULL DEFAULT 'draft'` |
| `deleted_at` | `deleted_at timestamptz` |
| `moderation_ref` | `moderation_ref uuid` |
| `data_class` | `data_class text NOT NULL DEFAULT 'content'` |
| `root_post` | `root_post uuid REFERENCES core.resource(id)` |
| `thread_id` | `thread_id uuid` |
| `source_id` | `source_id uuid REFERENCES core.resource(id)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql)：`ADD CONSTRAINT current_revision_belongs_to_resource FOREIGN KEY (id, current_revision_id) REFERENCES core.content_revision(resource_id, id)`。
- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT publication_state_registered CHECK (publication_state IN ('draft','pending','published','rejected'))`。

## core.content_revision

初建来源：[0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `resource_id` | `resource_id uuid NOT NULL REFERENCES core.resource(id)` |
| `revision_no` | `revision_no bigint NOT NULL CHECK (revision_no > 0)` |
| `body` | `body text NOT NULL` |
| `tags` | `tags text[] NOT NULL DEFAULT ARRAY[]::text[]` |
| `mentions` | `mentions uuid[] NOT NULL DEFAULT ARRAY[]::uuid[]` |
| `alt_text` | `alt_text text` |
| `author` | `author uuid NOT NULL REFERENCES core.account(id)` |
| `review_state` | `review_state text NOT NULL DEFAULT 'pending'` |
| `submitted_at` | `submitted_at timestamptz` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (resource_id, revision_no)` |
| `UNIQUE` | `UNIQUE (resource_id, id)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT review_state_registered CHECK (review_state IN ('pending','approved','rejected'))`。

## core.resource_dependency

初建来源：[0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `dependent` | `dependent uuid NOT NULL REFERENCES core.resource(id)` |
| `source` | `source uuid NOT NULL REFERENCES core.resource(id)` |
| `CHECK` | `CHECK (dependent <> source)` |
| `kind` | `kind text NOT NULL CHECK (kind IN ('quote','thread_head','comment_post','media','ai'))` |
| `source_revision` | `source_revision uuid` |
| `purposes` | `purposes text[] NOT NULL` |
| `FOREIGN` | `FOREIGN KEY (source, source_revision) REFERENCES core.content_revision(resource_id, id)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (dependent, source, kind)` |

## core.media_object

初建来源：[0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `owner` | `owner uuid NOT NULL REFERENCES core.account(id)` |
| `plugin` | `plugin text NOT NULL` |
| `bucket` | `bucket text NOT NULL` |
| `object_internal_key` | `object_internal_key text NOT NULL` |
| `sha256` | `sha256 text` |
| `detected_mime` | `detected_mime text` |
| `codec` | `codec text` |
| `size_bytes` | `size_bytes bigint NOT NULL CHECK (size_bytes >= 0)` |
| `duration_ms` | `duration_ms bigint CHECK (duration_ms >= 0)` |
| `state` | `state text NOT NULL CHECK (state IN ('allocated','uploading','uploaded','validated','reviewed','bound','failed','quarantined','orphan','cleaned'))` |
| `data_class` | `data_class text NOT NULL` |
| `bound_resource` | `bound_resource uuid REFERENCES core.resource(id)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (bucket, object_internal_key)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT bound_media_resource CHECK (state<>'bound' OR bound_resource IS NOT NULL)`。
- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT media_digest CHECK (sha256 IS NULL OR sha256 ~ '^[a-f0-9]{64}$')`。

## core.media_derivative

初建来源：[0004_resources_media.sql](../../supabase/migrations/0004_resources_media.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `parent_media` | `parent_media uuid NOT NULL REFERENCES core.media_object(id)` |
| `kind` | `kind text NOT NULL CHECK (kind IN ('thumbnail','preview','segment'))` |
| `hash` | `hash text NOT NULL` |
| `size` | `size bigint NOT NULL CHECK (size >= 0)` |
| `state` | `state text NOT NULL` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD COLUMN object_internal_key text`。
- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT derivative_digest CHECK (hash ~ '^[a-f0-9]{64}$')`。
- [0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)：`ADD CONSTRAINT derivative_state CHECK (state IN ('pending','ready','failed','cleaned'))`。
- [0031_media_derivative_kind.sql](../../supabase/migrations/0031_media_derivative_kind.sql)：`ADD CONSTRAINT derivative_kind_registered CHECK (kind IN ('thumbnail','preview','segment'))`。

## core.deletion

初建来源：[0005_obligations.sql](../../supabase/migrations/0005_obligations.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `target` | `target uuid NOT NULL` |
| `actor` | `actor uuid NOT NULL REFERENCES core.account(id)` |
| `kind` | `kind text NOT NULL CHECK (kind IN ('user','moderation','account'))` |
| `deleted_at` | `deleted_at timestamptz NOT NULL` |
| `undo_until` | `undo_until timestamptz` |
| `restore_until` | `restore_until timestamptz` |
| `state` | `state text NOT NULL` |
| `epoch` | `epoch bigint NOT NULL DEFAULT 1 CHECK (epoch > 0)` |
| `CHECK` | `CHECK (undo_until >= deleted_at AND restore_until >= undo_until)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

## core.dependency_hide

初建来源：[0005_obligations.sql](../../supabase/migrations/0005_obligations.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `cause_deletion` | `cause_deletion uuid NOT NULL REFERENCES core.deletion(id)` |
| `affected_resource` | `affected_resource uuid NOT NULL REFERENCES core.resource(id)` |
| `previous_validity` | `previous_validity boolean NOT NULL` |
| `hidden_at` | `hidden_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `UNIQUE` | `UNIQUE (cause_deletion, affected_resource)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

## core.retention_record

初建来源：[0005_obligations.sql](../../supabase/migrations/0005_obligations.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `target` | `target uuid NOT NULL` |
| `storage_ref` | `storage_ref uuid` |
| `class` | `class text NOT NULL` |
| `owner_plugin` | `owner_plugin text NOT NULL` |
| `trigger_at` | `trigger_at timestamptz NOT NULL` |
| `due_at` | `due_at timestamptz NOT NULL CHECK (due_at >= trigger_at)` |
| `rule_version` | `rule_version text NOT NULL` |
| `purge_state` | `purge_state text NOT NULL` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

## core.retention_interest

初建来源：[0005_obligations.sql](../../supabase/migrations/0005_obligations.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `target` | `target uuid NOT NULL` |
| `subject` | `subject uuid REFERENCES core.account(id)` |
| `purpose` | `purpose text NOT NULL` |
| `allowed_scope` | `allowed_scope text[] NOT NULL` |
| `expires_at` | `expires_at timestamptz NOT NULL` |
| `reason` | `reason text NOT NULL` |
| `grant_ref` | `grant_ref uuid` |
| `audit_ref` | `audit_ref uuid REFERENCES core.audit_event(id)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

## core.security_journal

初建来源：[0005_obligations.sql](../../supabase/migrations/0005_obligations.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `seq` | `seq bigint GENERATED ALWAYS AS IDENTITY UNIQUE` |
| `deny_intent_id` | `deny_intent_id uuid NOT NULL` |
| `target` | `target uuid NOT NULL` |
| `subject` | `subject uuid` |
| `action` | `action text NOT NULL` |
| `policy_epoch` | `policy_epoch bigint NOT NULL CHECK (policy_epoch > 0)` |
| `committed_result` | `committed_result text NOT NULL` |
| `timestamp` | `timestamp timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `hash_chain` | `hash_chain text NOT NULL` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0011_independent_security_journal.sql](../../supabase/migrations/0011_independent_security_journal.sql)：`ADD COLUMN archive_seq bigint UNIQUE`。

## core.config_definition

初建来源：[0006_configuration.sql](../../supabase/migrations/0006_configuration.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `key` | `key text NOT NULL UNIQUE` |
| `owner` | `owner text NOT NULL` |
| `schema` | `schema jsonb NOT NULL` |
| `default_value` | `default_value jsonb NOT NULL` |
| `range` | `range jsonb NOT NULL` |
| `scopes` | `scopes text[] NOT NULL` |
| `priority` | `priority integer NOT NULL` |
| `permissions` | `permissions text[] NOT NULL` |
| `dependencies` | `dependencies text[] NOT NULL` |
| `effect_mode` | `effect_mode text NOT NULL` |
| `existing_policy` | `existing_policy text NOT NULL` |
| `evidence_refs` | `evidence_refs text[] NOT NULL` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0018_configuration_registry.sql](../../supabase/migrations/0018_configuration_registry.sql)：`ADD COLUMN description text NOT NULL DEFAULT 'Legacy registered configuration', ADD COLUMN status text NOT NULL DEFAULT 'engineering' CHECK(status IN ('confirmed','engineering','provisional')), ADD COLUMN conflicts text[] NOT NULL DEFAULT ARRAY[]::text[], ADD COLUMN read_permission text NOT NULL DEFAULT 'config.read', ADD COLUMN write_permission text NOT NULL DEFAULT 'config.write', ADD COLUMN sensitive boolean NOT NULL DEFAULT true, ADD COLUMN consumer_ids text[] NOT NULL DEFAULT ARRAY['api']::text[]`。

## core.config_bundle

初建来源：[0006_configuration.sql](../../supabase/migrations/0006_configuration.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `version` | `version text NOT NULL UNIQUE` |
| `scoped_values` | `scoped_values jsonb NOT NULL` |
| `schema_version` | `schema_version integer NOT NULL CHECK (schema_version > 0)` |
| `compat` | `compat jsonb NOT NULL` |
| `state` | `state text NOT NULL CHECK (state IN ('draft','validated','ready','active','rejected'))` |
| `effective_at` | `effective_at timestamptz` |
| `preview_digest` | `preview_digest text NOT NULL` |
| `actor` | `actor uuid REFERENCES core.account(id)` |
| `audit_ref` | `audit_ref uuid REFERENCES core.audit_event(id)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0018_configuration_registry.sql](../../supabase/migrations/0018_configuration_registry.sql)：`ADD COLUMN consumers_ready text[] NOT NULL DEFAULT ARRAY[]::text[]`。

## core.config_activation

初建来源：[0006_configuration.sql](../../supabase/migrations/0006_configuration.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `environment` | `environment text NOT NULL UNIQUE` |
| `active_ptr` | `active_ptr text NOT NULL REFERENCES core.config_bundle(version)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |

## core.managed_document

初建来源：[0007_documents.sql](../../supabase/migrations/0007_documents.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `stable_key` | `stable_key text NOT NULL` |
| `kind` | `kind text NOT NULL CHECK (kind IN ('community_rules','privacy','terms','processing_notice','help'))` |
| `locale` | `locale text NOT NULL` |
| `owner` | `owner uuid NOT NULL REFERENCES core.account(id)` |
| `public_surfaces` | `public_surfaces text[] NOT NULL` |
| `active_release_id` | `active_release_id uuid` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (stable_key, locale)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0007_documents.sql](../../supabase/migrations/0007_documents.sql)：`ADD CONSTRAINT active_release_belongs_to_document FOREIGN KEY (id, active_release_id) REFERENCES core.document_release(document_id, id)`。

## core.document_revision

初建来源：[0007_documents.sql](../../supabase/migrations/0007_documents.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `document_id` | `document_id uuid NOT NULL REFERENCES core.managed_document(id)` |
| `version` | `version bigint NOT NULL CHECK (version > 0)` |
| `title` | `title text NOT NULL` |
| `body` | `body text NOT NULL` |
| `content_digest` | `content_digest text NOT NULL` |
| `linked_release_refs` | `linked_release_refs uuid[] NOT NULL DEFAULT ARRAY[]::uuid[]` |
| `state` | `state text NOT NULL CHECK (state IN ('draft','ready'))` |
| `editor` | `editor uuid NOT NULL REFERENCES core.account(id)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (document_id, version)` |
| `UNIQUE` | `UNIQUE (document_id, id, content_digest)` |

## core.document_release

初建来源：[0007_documents.sql](../../supabase/migrations/0007_documents.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `document_id` | `document_id uuid NOT NULL REFERENCES core.managed_document(id)` |
| `revision_ref` | `revision_ref uuid NOT NULL` |
| `content_digest` | `content_digest text NOT NULL` |
| `scope` | `scope jsonb NOT NULL` |
| `state` | `state text NOT NULL CHECK (state IN ('prepared','published','superseded','withdrawn'))` |
| `publisher` | `publisher uuid NOT NULL REFERENCES core.account(id)` |
| `published_at` | `published_at timestamptz` |
| `confirmation_ref` | `confirmation_ref uuid` |
| `audit_ref` | `audit_ref uuid REFERENCES core.audit_event(id)` |
| `FOREIGN` | `FOREIGN KEY (document_id, revision_ref, content_digest) REFERENCES core.document_revision(document_id, id, content_digest)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `UNIQUE` | `UNIQUE (document_id, id)` |

## core.document_receipt

初建来源：[0007_documents.sql](../../supabase/migrations/0007_documents.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `subject` | `subject uuid NOT NULL` |
| `release_id` | `release_id uuid NOT NULL REFERENCES core.document_release(id)` |
| `revision_digest` | `revision_digest text NOT NULL` |
| `presentation_ref` | `presentation_ref uuid NOT NULL` |
| `purpose` | `purpose text NOT NULL` |
| `decision` | `decision text NOT NULL CHECK (decision IN ('presented','acknowledged','consented','declined'))` |
| `occurred_at` | `occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `request_id` | `request_id uuid NOT NULL` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |

## core.invitation

初建来源：[0101_admission_recovery.sql](../../supabase/migrations/0101_admission_recovery.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `token_hash` | `token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$')` |
| `creator_id` | `creator_id uuid NOT NULL REFERENCES core.account(id)` |
| `expires_at` | `expires_at timestamptz NOT NULL` |
| `state` | `state text NOT NULL DEFAULT 'unused' CHECK (state IN ('unused','used','revoked','expired'))` |
| `used_account_id` | `used_account_id uuid REFERENCES core.account(id)` |
| `used_at` | `used_at timestamptz` |
| `revoke_reason` | `revoke_reason text` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `CHECK` | `CHECK ((state = 'used' AND used_account_id IS NOT NULL AND used_at IS NOT NULL AND used_at < expires_at) OR (state <> 'used' AND used_account_id IS NULL AND used_at IS NULL))` |
| `CHECK` | `CHECK (state <> 'revoked' OR coalesce(length(btrim(revoke_reason)) > 0,false))` |

## core.admission

初建来源：[0101_admission_recovery.sql](../../supabase/migrations/0101_admission_recovery.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `account_id` | `account_id uuid PRIMARY KEY REFERENCES core.account(id)` |
| `invitation_id` | `invitation_id uuid NOT NULL UNIQUE REFERENCES core.invitation(id)` |
| `phone_verified_at` | `phone_verified_at timestamptz NOT NULL` |
| `age_declaration` | `age_declaration jsonb NOT NULL` |
| `terms_version` | `terms_version uuid NOT NULL REFERENCES core.document_release(id)` |
| `terms_receipt_id` | `terms_receipt_id uuid NOT NULL UNIQUE REFERENCES core.document_receipt(id)` |
| `admitted_at` | `admitted_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `CHECK` | `CHECK (phone_verified_at <= admitted_at)` |
| `CHECK` | `CHECK (coalesce(jsonb_typeof(age_declaration) = 'object' AND age_declaration ?& ARRAY['version','declared'] AND age_declaration - ARRAY['version','declared'] = '{}'::jsonb AND age_declaration->'declared' = 'true'::jsonb AND jsonb_typeof(age_declaration->'version') = 'string' AND length(btrim(age_declaration->>'version')) BETWEEN 1 AND 128,false))` |

## core.recovery_case

初建来源：[0101_admission_recovery.sql](../../supabase/migrations/0101_admission_recovery.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `account_ref` | `account_ref uuid REFERENCES core.account(id)` |
| `mode` | `mode text NOT NULL CHECK (mode IN ('trusted','manual','mfa_emergency'))` |
| `state` | `state text NOT NULL DEFAULT 'received' CHECK (state IN ('received','reviewing','approved','rejected','need_evidence'))` |
| `minimal_evidence_ref` | `minimal_evidence_ref uuid` |
| `reviewer` | `reviewer uuid REFERENCES core.account(id)` |
| `result` | `result text` |
| `audit_ref` | `audit_ref uuid REFERENCES core.audit_event(id)` |
| `executed_at` | `executed_at timestamptz` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)` |
| `CHECK` | `CHECK (state NOT IN ('approved','rejected') OR (reviewer IS NOT NULL AND audit_ref IS NOT NULL AND minimal_evidence_ref IS NOT NULL AND coalesce(length(btrim(result)) > 0,false)))` |
| `CHECK` | `CHECK (executed_at IS NULL OR state = 'approved')` |

## core.otp_challenge

初建来源：[0107_otp_challenges.sql](../../supabase/migrations/0107_otp_challenges.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `phone_hash` | `phone_hash text NOT NULL CHECK (phone_hash ~ '^[a-f0-9]{64}$')` |
| `ip_hash` | `ip_hash text NOT NULL CHECK (ip_hash ~ '^[a-f0-9]{64}$')` |
| `purpose` | `purpose text NOT NULL CHECK (purpose IN ('login','register'))` |
| `otp_hash` | `otp_hash text NOT NULL CHECK (otp_hash ~ '^[a-f0-9]{64}$')` |
| `command` | `command uuid NOT NULL` |
| `binding` | `binding jsonb NOT NULL` |
| `state` | `state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','consumed','locked','expired','superseded'))` |
| `attempts` | `attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5)` |
| `consumed_at` | `consumed_at timestamptz` |
| `expires_at` | `expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '5 minutes'` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1` |
| `UNIQUE` | `UNIQUE (phone_hash,command)` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0029_otp_replay_guards.sql](../../supabase/migrations/0029_otp_replay_guards.sql)：`ADD COLUMN environment text CHECK (environment IN ('dev','test','production'))`。
- [0034_otp_configuration.sql](../../supabase/migrations/0034_otp_configuration.sql)：`DROP CONSTRAINT otp_challenge_attempts_check, ALTER COLUMN attempts TYPE bigint, ADD CONSTRAINT otp_challenge_attempts_check CHECK (attempts BETWEEN 0 AND 9007199254740991), ADD COLUMN resend_seconds bigint NOT NULL DEFAULT 60 CHECK (resend_seconds BETWEEN 1 AND 9007199254740991), ADD COLUMN max_failures bigint NOT NULL DEFAULT 5 CHECK (max_failures BETWEEN 1 AND 9007199254740991), ADD COLUMN config_version text`。
- [0035_otp_auth_completion.sql](../../supabase/migrations/0035_otp_auth_completion.sql)：`ADD COLUMN completion_actor uuid, ADD COLUMN completion_session uuid, ADD COLUMN completion_operation uuid, ADD CONSTRAINT otp_completion_binding CHECK ( (completion_actor IS NULL AND completion_session IS NULL AND completion_operation IS NULL) OR (state='consumed' AND completion_actor IS NOT NULL AND completion_session IS NOT NULL AND completion_operation IS NOT NULL))`。

## core.plugin_installation

初建来源：[0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `plugin` | `plugin text NOT NULL` |
| `environment` | `environment text NOT NULL CHECK (environment IN ('dev','test','production'))` |
| `current_version` | `current_version text` |
| `target_version` | `target_version text` |
| `state` | `state text NOT NULL CHECK (state IN ('enabled','draining','disabled','uninstalled','failed'))` |
| `lifecycle_epoch` | `lifecycle_epoch bigint NOT NULL DEFAULT 1 CHECK (lifecycle_epoch>0)` |
| `grants` | `grants text[] NOT NULL DEFAULT ARRAY[]::text[]` |
| `health` | `health text NOT NULL DEFAULT 'unknown'` |
| `history_projection` | `history_projection text NOT NULL DEFAULT 'unavailable'` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1` |
| `UNIQUE(environment,plugin)` | `UNIQUE(environment,plugin)` |

## core.sanction

初建来源：[0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `subject` | `subject uuid REFERENCES core.account(id)` |
| `target` | `target uuid REFERENCES core.resource(id)` |
| `type` | `type text NOT NULL CHECK (type IN ('temporary','permanent','function'))` |
| `functions` | `functions text[] NOT NULL` |
| `starts_at` | `starts_at timestamptz NOT NULL` |
| `ends_at` | `ends_at timestamptz` |
| `reason` | `reason text NOT NULL` |
| `original_decider` | `original_decider uuid REFERENCES core.account(id)` |
| `state` | `state text NOT NULL CHECK (state IN ('active','revoked','expired'))` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1` |
| `CHECK` | `CHECK (subject IS NOT NULL OR target IS NOT NULL)` |
| `CHECK` | `CHECK (ends_at IS NULL OR ends_at>starts_at)` |

## core.restore_gate

初建来源：[0010_foundation_constraints.sql](../../supabase/migrations/0010_foundation_constraints.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `environment` | `environment text PRIMARY KEY CHECK (environment IN ('dev','test','production'))` |
| `state` | `state text NOT NULL CHECK (state IN ('open','closed'))` |
| `required_watermark` | `required_watermark bigint NOT NULL DEFAULT 0` |
| `replayed_seq` | `replayed_seq bigint NOT NULL DEFAULT 0` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |

## journal.ledger

初建来源：[0011_independent_security_journal.sql](../../supabase/migrations/0011_independent_security_journal.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `seq` | `seq bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY` |
| `intent_id` | `intent_id uuid NOT NULL` |
| `kind` | `kind text NOT NULL` |
| `transaction_ref` | `transaction_ref text NOT NULL` |
| `target` | `target uuid NOT NULL` |
| `subject` | `subject uuid` |
| `action` | `action text NOT NULL` |
| `policy_epoch` | `policy_epoch bigint NOT NULL` |
| `payload` | `payload jsonb NOT NULL` |
| `occurred_at` | `occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `previous_hash` | `previous_hash text NOT NULL` |
| `hash_chain` | `hash_chain text NOT NULL` |
| `UNIQUE(intent_id,kind)` | `UNIQUE(intent_id,kind)` |
| `CHECK(kind` | `CHECK(kind IN ('intent','committed','aborted'))` |

## core.security_checkpoint

初建来源：[0011_independent_security_journal.sql](../../supabase/migrations/0011_independent_security_journal.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id boolean PRIMARY KEY DEFAULT true CHECK(id)` |
| `seq` | `seq bigint NOT NULL` |
| `hash_chain` | `hash_chain text NOT NULL` |

## core.event_delivery

初建来源：[0012_reliable_effects.sql](../../supabase/migrations/0012_reliable_effects.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `sequence` | `sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE` |
| `event_id` | `event_id uuid NOT NULL UNIQUE` |
| `event_type` | `event_type text NOT NULL` |
| `aggregate_id` | `aggregate_id uuid NOT NULL` |
| `aggregate_version` | `aggregate_version bigint NOT NULL` |
| `recipient` | `recipient uuid REFERENCES core.account(id)` |
| `environment` | `environment text NOT NULL` |
| `owner_plugin` | `owner_plugin text NOT NULL` |
| `lifecycle_epoch` | `lifecycle_epoch bigint NOT NULL` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |

后续修改（依赖顺序；与初建定义合并理解）：

- [0020_registered_event_types.sql](../../supabase/migrations/0020_registered_event_types.sql)：`ADD CONSTRAINT delivery_event_type CHECK(event_type IN ( 'resource.changed','revision.changed','batch.changed','relation.changed','message.saved','access.changed','request.changed','notification.changed', 'ai.source.changed','index.policy.changed','document.publication.changed','config.activated','plugin.lifecycle.changed','release.changed','purge.changed','service.health.changed'))`。

## core.config_group_membership

初建来源：[0018_configuration_registry.sql](../../supabase/migrations/0018_configuration_registry.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `subject` | `subject uuid NOT NULL REFERENCES core.account(id)` |
| `group_key` | `group_key text NOT NULL` |
| `environment` | `environment text NOT NULL CHECK(environment IN ('dev','test','production'))` |
| `owner` | `owner text NOT NULL` |
| `active` | `active boolean NOT NULL DEFAULT true` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1` |
| `UNIQUE(subject,group_key,environment,owner)` | `UNIQUE(subject,group_key,environment,owner)` |

## core.public_otp_secret

初建来源：[0036_public_otp_broker.sql](../../supabase/migrations/0036_public_otp_broker.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `environment` | `environment text PRIMARY KEY CHECK (environment IN ('dev','test','production'))` |
| `secret` | `secret bytea NOT NULL CHECK (octet_length(secret)=32)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |

## core.public_otp_flow

初建来源：[0036_public_otp_broker.sql](../../supabase/migrations/0036_public_otp_broker.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `challenge_id` | `challenge_id uuid PRIMARY KEY REFERENCES core.otp_challenge(id)` |
| `environment` | `environment text NOT NULL CHECK (environment IN ('dev','test','production'))` |
| `dispatch_lease` | `dispatch_lease uuid NOT NULL UNIQUE DEFAULT gen_random_uuid()` |
| `dispatch_state` | `dispatch_state text NOT NULL DEFAULT 'waiting' CHECK (dispatch_state IN ('waiting','hooked','sending','sent','failed','unknown'))` |
| `hook_user` | `hook_user uuid` |
| `hooked_at` | `hooked_at timestamptz` |
| `phone_cipher` | `phone_cipher bytea` |
| `otp_cipher` | `otp_cipher bytea` |
| `secret_expiry` | `secret_expiry timestamptz NOT NULL` |
| `verify_state` | `verify_state text NOT NULL DEFAULT 'idle' CHECK (verify_state IN ('idle','pending','unknown','failed','completed'))` |
| `verify_operation` | `verify_operation uuid` |
| `verify_lease` | `verify_lease uuid UNIQUE` |
| `verify_payload_hash` | `verify_payload_hash text` |
| `verify_verification` | `verify_verification jsonb` |
| `verify_started_at` | `verify_started_at timestamptz` |
| `verify_failure` | `verify_failure text` |
| `receipt_cipher` | `receipt_cipher bytea` |
| `receipt_expiry` | `receipt_expiry timestamptz` |
| `receipt_token_hash` | `receipt_token_hash text` |
| `receipt_failures` | `receipt_failures integer NOT NULL DEFAULT 0 CHECK (receipt_failures BETWEEN 0 AND 5)` |
| `metadata_expiry` | `metadata_expiry timestamptz NOT NULL DEFAULT clock_timestamp()+interval '30 days'` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `updated_at` | `updated_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `row_version` | `row_version bigint NOT NULL DEFAULT 1` |
| `CHECK` | `CHECK (secret_expiry<=metadata_expiry)` |
| `CHECK` | `CHECK (receipt_expiry IS NULL OR receipt_expiry<=metadata_expiry)` |
| `CHECK` | `CHECK ((verify_state='idle' AND verify_operation IS NULL AND verify_lease IS NULL AND verify_payload_hash IS NULL AND verify_verification IS NULL AND verify_started_at IS NULL) OR (verify_state<>'idle' AND verify_operation IS NOT NULL AND verify_lease IS NOT NULL AND verify_payload_hash IS NOT NULL AND verify_verification IS NOT NULL AND verify_started_at IS NOT NULL))` |

## core.admin_bootstrap

初建来源：[0038_admin_identity_configuration.sql](../../supabase/migrations/0038_admin_identity_configuration.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `environment` | `environment text PRIMARY KEY CHECK (environment IN ('dev','test','production'))` |
| `account_id` | `account_id uuid NOT NULL REFERENCES core.account(id)` |
| `grant_id` | `grant_id uuid NOT NULL REFERENCES core.admin_grant(id)` |
| `closed_at` | `closed_at timestamptz NOT NULL DEFAULT clock_timestamp()` |

## core.admin_config_preview

初建来源：[0038_admin_identity_configuration.sql](../../supabase/migrations/0038_admin_identity_configuration.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `actor` | `actor uuid NOT NULL REFERENCES core.account(id)` |
| `session_id` | `session_id uuid NOT NULL` |
| `environment` | `environment text NOT NULL CHECK (environment IN ('dev','test','production'))` |
| `operation_id` | `operation_id uuid NOT NULL` |
| `base_version` | `base_version text NOT NULL REFERENCES core.config_bundle(version)` |
| `kind` | `kind text NOT NULL CHECK (kind IN ('release','rollback'))` |
| `reason` | `reason text NOT NULL` |
| `rollback_version` | `rollback_version text` |
| `otp_values` | `otp_values jsonb NOT NULL` |
| `changes` | `changes jsonb NOT NULL` |
| `scoped_values` | `scoped_values jsonb NOT NULL` |
| `compat` | `compat jsonb NOT NULL` |
| `consumers_ready` | `consumers_ready text[] NOT NULL` |
| `schema_version` | `schema_version integer NOT NULL` |
| `registry_digest` | `registry_digest text NOT NULL` |
| `input_digest` | `input_digest text NOT NULL` |
| `preview_digest` | `preview_digest text NOT NULL` |
| `action_digest` | `action_digest text NOT NULL UNIQUE` |
| `expires_at` | `expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '5 minutes'` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `UNIQUE(actor,environment,operation_id)` | `UNIQUE(actor,environment,operation_id)` |
| `CHECK` | `CHECK (expires_at<=created_at+interval '5 minutes')` |

## core.admin_config_publication

初建来源：[0038_admin_identity_configuration.sql](../../supabase/migrations/0038_admin_identity_configuration.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `actor` | `actor uuid NOT NULL REFERENCES core.account(id)` |
| `session_id` | `session_id uuid NOT NULL` |
| `environment` | `environment text NOT NULL CHECK (environment IN ('dev','test','production'))` |
| `preview_id` | `preview_id uuid NOT NULL UNIQUE REFERENCES core.admin_config_preview(id)` |
| `operation_id` | `operation_id uuid NOT NULL` |
| `version` | `version text NOT NULL UNIQUE REFERENCES core.config_bundle(version)` |
| `previous_version` | `previous_version text NOT NULL` |
| `kind` | `kind text NOT NULL CHECK (kind IN ('release','rollback'))` |
| `reason` | `reason text NOT NULL` |
| `otp_values` | `otp_values jsonb NOT NULL` |
| `before_values` | `before_values jsonb NOT NULL` |
| `input_digest` | `input_digest text NOT NULL` |
| `receipt` | `receipt jsonb NOT NULL` |
| `effective_at` | `effective_at timestamptz NOT NULL` |
| `UNIQUE(actor,environment,operation_id)` | `UNIQUE(actor,environment,operation_id)` |

## core.admin_stepup_binding

初建来源：[0038_admin_identity_configuration.sql](../../supabase/migrations/0038_admin_identity_configuration.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `auth_challenge_id` | `auth_challenge_id uuid PRIMARY KEY` |
| `stepup_id` | `stepup_id uuid NOT NULL UNIQUE REFERENCES core.stepup_challenge(id)` |
| `actor` | `actor uuid NOT NULL REFERENCES core.account(id)` |
| `session_id` | `session_id uuid NOT NULL` |
| `factor_id` | `factor_id uuid NOT NULL` |
| `preview_id` | `preview_id uuid NOT NULL REFERENCES core.admin_config_preview(id)` |
| `environment` | `environment text NOT NULL` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |

## core.admin_password_identity

初建来源：[0040_admin_password_fallback.sql](../../supabase/migrations/0040_admin_password_fallback.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `environment` | `environment text NOT NULL CHECK (environment IN ('dev','test','production'))` |
| `username` | `username text NOT NULL CHECK (username ~ '^[a-z0-9][a-z0-9_.-]{2,63}$')` |
| `account_id` | `account_id uuid NOT NULL REFERENCES core.account(id)` |
| `credential_version` | `credential_version bigint NOT NULL DEFAULT 1 CHECK (credential_version>0)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `PRIMARY` | `PRIMARY KEY(environment,username)` |
| `UNIQUE(environment,account_id)` | `UNIQUE(environment,account_id)` |

## core.admin_password_captcha

初建来源：[0040_admin_password_fallback.sql](../../supabase/migrations/0040_admin_password_fallback.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY` |
| `environment` | `environment text NOT NULL CHECK (environment IN ('dev','test','production'))` |
| `source_digest` | `source_digest text NOT NULL CHECK (source_digest ~ '^[a-f0-9]{64}$')` |
| `expires_at` | `expires_at timestamptz NOT NULL` |
| `consumed_at` | `consumed_at timestamptz` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `CHECK` | `CHECK (expires_at>created_at AND expires_at<=created_at+interval '3 minutes')` |

## core.admin_password_attempt

初建来源：[0040_admin_password_fallback.sql](../../supabase/migrations/0040_admin_password_fallback.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `id` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `environment` | `environment text NOT NULL` |
| `username_digest` | `username_digest text NOT NULL` |
| `source_digest` | `source_digest text NOT NULL` |
| `account_id` | `account_id uuid REFERENCES core.account(id)` |
| `credential_version` | `credential_version bigint` |
| `captcha_id` | `captcha_id uuid NOT NULL UNIQUE REFERENCES core.admin_password_captcha(id)` |
| `operation_id` | `operation_id uuid NOT NULL` |
| `purpose` | `purpose text NOT NULL CHECK (purpose IN ('login','forgot'))` |
| `state` | `state text NOT NULL CHECK (state IN ('prepared','failed','completed','accepted'))` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |
| `UNIQUE(environment,operation_id)` | `UNIQUE(environment,operation_id)` |

## core.admin_password_session

初建来源：[0040_admin_password_fallback.sql](../../supabase/migrations/0040_admin_password_fallback.sql)。

| 字段/约束 | 原始SQL定义 |
| --- | --- |
| `session_id` | `session_id uuid PRIMARY KEY REFERENCES core.session_registry(session_id)` |
| `account_id` | `account_id uuid NOT NULL REFERENCES core.account(id)` |
| `environment` | `environment text NOT NULL` |
| `credential_version` | `credential_version bigint NOT NULL` |
| `attempt_id` | `attempt_id uuid NOT NULL UNIQUE REFERENCES core.admin_password_attempt(id)` |
| `created_at` | `created_at timestamptz NOT NULL DEFAULT clock_timestamp()` |

## 约束与函数的权威边界

表定义之外还包括trigger、RLS、grants、SECURITY DEFINER函数与当前授权/输出admission锁，它们共同构成真实schema行为。以对应原始SQL为准，类型字典不授权客户端直读表。后续迁移若仅替换函数（如0039/0041/0043），仍须核完整函数最终定义和适用测试，不能从“无新增列”推断行为不变。

迁移只追加不改已应用字节；依赖、环境实际应用状态、恢复和purge责任见[迁移说明](migrations.md)。
