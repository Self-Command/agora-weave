# 发布、兼容与真实验证（ED-23现行）

依据宪法5.2.1及[ED-23](../../../docs/engineering/codex-direct-development.md)。日常开发按实际目标与直接受影响回归验证；Actions按可用业务切片或发布需要复验，历史红链／准入收据／重复认证／归档回读不是任务进展或交接前置。

## 不可变发行与生产确认

release manifest含`release_id,commit_sha,core/admin/share/mobile/plugin artifact digests,config_version,contract/sdk/ui/native_runtime/native_fingerprint,permission_delta,migration_digests,environment,cohort_version/members_digest,required_evidence_ids,validation_profile/check_set_hash,design_input_digests/baseline_approval_refs,ai_review_refs,completion_record_ref,old_client_matrix,health_observation,rollback_limits`；hash整个规范化manifest为plan_digest。任何字段变化视新计划，不能换同标签包。

阶段`prepared→cloud_verified→awaiting_confirmation→approved→deploying→canary_observing→awaiting_expansion_confirmation→expanded`，fail/interrupted/rollback_pending/recovered为独立事实。检查通过不等批准，安装不等启用，部署提交不等渠道完成。

确认记录含plan_digest/scope_digest/approver/session/verified_aal2/stepup_id/理由/confirmed_at/expires_at；初始15分钟单次租约为工程参数。superadmin当前身份、近期动作绑定挑战、DEC-001、所有必需证据与具体作用范围再次核。首版任何生产部署/迁移/权限/版本生效均在匹配确认后；名单扩大新的scope摘要重新确认，旧确认不能复用。实际长期生产独立服务器，Actions不常驻托管。

Actions OIDC部署broker验证issuer/audience、实际repository_id/owner_id/ref/workflow_sha/environment/run/attempt与允许workflow、发行摘要，交换短时动作限定能力；GitHub身份不等产品superadmin授权。审批摘要／角色／会话／MFA失效则拒，操作完成消耗租约并审计。禁止包脚本在验证阶段拿生产secret/迁移权。Environment protection为附加锁，私库套餐不支持reviewer或attest时仍保平台门禁，不默认采购套餐。

## 更新和兼容

| 类型 | 生效路径 | 安全条件 |
| --- | --- | --- |
| 现有runtime配置 | 完整bundle切换 | 已支持consumer/权限/预览/兼容，生产确认适用 |
| backend/admin/schema | Actions测试/构建/受控部署迁移 | 同digest、expand-contract、当前权限、预先生产确认 |
| 兼容移动更新 | 自托管Updates v1/签名，明确runtime | native指纹兼容，渠道许可、发行/名单资格，非任意JS插件热加载 |
| native/不兼容 | Actions重建原生/签名/渠道发布 | 未兼容端不下发代码/动作，实际渠道状态可查 |

混合变更按最高实际要求。服务端取client-release登记×已审插件×当前安装×明确cohort×用户资源权限，客户端自报字段无授权效力。名单是明确account IDs/hash版本，不能百分比rollout替换；名单外获取descriptor/新代码/能力均拒。旧版安全兼容功能继续，局部不兼容仅禁扩展并提供更新去向；核心无法安全兼容才全App强更，原因/有效更新/安全申诉指引保持可达。回滚新发行继续当前安全账本，不能复活已删/撤权或未审权限，不承诺无损down migration。

## 日常结果与任务进展

保留真实运行结果、必要命令／环境和失败日志；实际实现及对应有效测试支持任务进展，局部范围和未决项分列。关键权限、安全、数据完整性及缺陷修复必须有有效测试。逐行为TDD由执行者判断，不因缺少历史证明重做正常代码。仅规范、checkbox或交接记录变化，不重复执行不受影响的业务验证。

本地、Actions和历史报告标明各自来源与适用版本；未执行、失败、取消、跳过、超时及环境不可用不得说成通过。交接文字或单个 run 图标不代产品结果。

## 正式产品验收与发行

保留PRD和spec规定的完整功能、权限安全、跨端、最低／当前受支持系统、真实交互与图像等正式验收范围。实际发行使用匹配提交、产物、配置和环境的真实结果，不能验证一个包后无记录更换另一个包。必要代码／视觉审查和用户具体基准确认保留；没有产品候选时不制造批准。

报告仅含必要合成数据和授权状态，秘密与无关私人内容不进日志；必要发行资料按用途受控保存，敏感资料遵更短期限。旧归档平台已移除；服务器仍非 runner，必要发行资料按实际用途保留。

## 历史格式

旧收据、TDD 认证及桥接格式只在 Git 历史中保留，不是现行消费者或任务前置。
