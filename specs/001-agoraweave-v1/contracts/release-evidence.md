# 发布、指定名单、兼容与证据 v2

2026-10-16现行分工依据[ED-21](../../../docs/engineering/local-cloud-responsibility-decision.md)及宪法4.0.0。本地真实开发反馈/TDD与Actions独立复验分开记录；下文正式发行证据仍只接收真实Actions来源，本地通过不能替代正式验收。T051完整共享核心收口保留，但不再是每个故事开始实现的无条件依赖。

## ED-20 工程初始化收口

2026-10-15 最新执行决定 ED-20：用户明确要求先按 Android 可开发条件收口 Phase1、完成任务清单并进入正式开发；当前不做 iOS 验证，后续跨平台阶段再验证。Phase1 的完成口径改为真实 development-ready 与已实现工程能力可供 Android 业务 TDD，T026/T027 的原完整跨平台正式验收前置后置。详见 [Android 优先与阶段一收口决定](../../../docs/engineering/android-first-development-decision.md)。该决定不设置全平台 ci-ready、feature complete、合并或生产批准；Android 当前业务行为仍须目标云端 Red/Green、必要回归及其正式产品验收。

此后正文中完整发行/正式ci-readiness的同版证据规则保持；当前Phase1完成另记 `android-development-preparation`，以当前真实development-ready原报告为依据，不写成全平台ci-ready或formal product completion。iOS验证在当前开发阶段后置，既有未执行/失败/取消状态保留。

## 不可变发行与生产确认

release manifest含`release_id,commit_sha,core/admin/share/mobile/plugin artifact digests,config_version,contract/sdk/ui/native_runtime/native_fingerprint,permission_delta,migration_digests,environment,cohort_version/members_digest,required_evidence_ids,validation_profile/check_set_hash,design_input_digests/baseline_approval_refs,tdd_cycle_refs,ai_review_refs,completion_record_ref,old_client_matrix,health_observation,rollback_limits`；hash整个规范化manifest为plan_digest。任何字段变化视新计划，不能换同标签包。

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

## 同版证据格式

index字段：`schema_version,release_id,plan_digest,commit_sha/checkout_sha/event_ref,run_id,run_attempt,workflow_sha,environment/config,runner_image/tool_versions,artifact_id,raw_artifact_sha256,archive_digest,component/runtime/plugin_versions,validation_profile,check_set_hash,required_case_set,cases[{id,requirements,applicability,applicability_reason,activation_node,mandatory,status,duration_ms,report_refs,screenshot_refs/diff_refs,interaction_refs,error}],tdd_cycle_refs,design_input_digests,baseline_candidate/approval_refs,ai_code_review_ref,ai_visual_review_ref,review_disposition_refs,completion_record_ref,started/finished_at,archive_location/expiry/access_policy`。

status仅passed/failed/skipped/cancelled/timed_out/missing/unavailable/unknown；mandatory只有真实passed且版本/产物/配置/环境一致才可聚合passed。if条件跳过必需用例仍不通过。attestation仅构建来源，不代测试/安全结论。无文件报告上传error，失败同样保报告；签名后的实际交付包另有digest与适用验收，不能仅测未签版本后无记录改包。

`applicability`是清单适用性而非测试状态，required／not_yet_applicable／not_applicable必须附阶段和理由。bootstrap中未实现业务不算通过或抵扣首版；full-release所有首版适用必需项须实际passed。Red目标的原failed状态保留，预期失败确认只进入TDD链，不能充当发行Green。

验证效率修订沿[cloud-validation §2.2](cloud-validation.md)追加工程关联：`validation_intent=feedback/green/completion`、`canonical_execution_ref,event_name,pr_head_sha,pr_merge_sha,deduplication_inputs_digest,cancellation/superseded_refs,cache_key/input_digest/hit/validation,artifact_reuse_receipt_refs,measurement_refs`。去重／缓存只复用等价执行或已验字节，不转移批准与完成结论；feedback不能满足Green／ci-ready／complete。不同事件被测tree或HTTPS／配置不等价时不能共用，取消／失败／跳过／缺失／旧SHA仍保原状态并拒绝。

按宪法v3.1.0及[分层验证批准](../../../docs/engineering/validation-tiering-decision.md)，独立`development_readiness`只证明基础构建／非空测试／所需隔离服务健康及目标原报告认证，允许业务TDD；不设置`ci_ready=true`，不能满足formal complete。
开发Green记录实际变更范围、依赖/风险依据、`affected_check_set`和必要回归，使用同Red oracle/fixture；未知影响完整核验。开发源可为真实本地运行，标`source=local`并绑定提交/工作区快照、工具环境/命令/原始退出/报告与先后顺序；不伪填Actions run或artifact。功能检查点独立复现必要Red、运行候选Green及受影响回归，正式completion仍只接受完整适用Actions证据。
开发中未执行的完整平台／采集／审查项保持原状态，不能写passed或改适用性；合并、阶段验收交付及发行仍执行同最终SHA全部适用集合和当前代码／实际图像审查。

`artifact_reuse_receipt`至少含repository／run／attempt／artifact ID、target与checkout SHA、workflow／环境身份、期望及实测原archive摘要、逐文件raw索引摘要、取得／复核／读取时间及实际read_by。命中须重新校来源及当前可访问性／过期状态，重算字节摘要；缓存不是passed证据，不继承旧SHA语义审查。全部必需报告、失败明细和实际图像仍须读取，缺收据、损坏、跨attempt／SHA、漏图或不可读均阻塞。

`validation_measurement`记录优化前后SHA／run／attempt／事件／意图／profile／check_set／平台环境／冷热条件、顶层run数与矩阵job数、job created／started／completed时间、依赖就绪时间、排队与执行时长、取消原因、下载请求／实际字节／传输时长及缓存命中。保存原API／报告引用；run updated_at只作快照，不冒充精确job或网络计时。集合／环境不同、取消样本及未终态不可当等价完整验收对比；缺历史传输计时记unavailable，不给推测提速比例。

### 开发验证关联记录

以下是私有工程证据格式，不新增产品界面／业务数据，不手填进原生handoff固定字段；原生桥接写入会重建字段，项目侧记录独立存储并由未来门禁核验。具体顺序与验收见[cloud-validation](cloud-validation.md)。

| 记录 | 必需关联与语义 |
| --- | --- |
| development_readiness | 认证源run／attempt、源与目标SHA／checkout／事件、非空基础构建／测试／所需服务原报告、清单及稳定foundation摘要、祖先关系；工具／工作流／治理／冻结依赖／环境变化须重核，用于准入business-increment开发，并作为ED-20 Phase1工程收口依据，不授产品完整验收 |
| local_development_readiness（ED-21待T033适配） | 明确source=local、真实提交/可重现差异快照、固定工具/服务环境摘要、非空命令/退出/原报告、当前切片直接依赖与安全核验；只授开发反馈，不伪填Actions身份，不能满足云端完成 |
| ci_readiness | 初始化最终SHA、契约／清单／toolchain摘要、真实服务／网页／双端壳／采集／审查／拒绝探针报告及资源准入；未适用业务单列，不授feature完成 |
| tdd_cycle | 目标行为/需求/case、真实source、S_R/S_G/final_sha或可重现本地快照、测试/夹具/oracle/环境摘要、原始命令/退出/报告、Red因果读取及先于实现顺序、Green/回归和Actions检查点复现引用；新增来源消费器仍须实测 |
| baseline_candidate／approval | 设计输入摘要、实际捕获SHA、各端页面状态／设备字体配置、截图／参考／差异／交互／AI报告；具体候选摘要的有权确认和范围，不自动批准 |
| ai_review | 类型code／visual、current／base SHA、输入／图像／报告摘要、工具／模型精确ID、prompt／schema版本、request／run／attempt／用量、覆盖／findings／unknown；真实模型调用 |
| review_disposition | finding与文件／页面／区域／需求／证据、处置人／理由、修复SHA、当前重审／回归或可核验独立反证；decision_required尚未处理阻塞 |
| completion_record | feature／task／mode、当前SHA／contract_hash／check_set_hash、有效全部run／attempt／产物／报告摘要、read_by／read_at／summary／unresolved_items、门禁结论；新提交失效 |

GitHub允许skipped／neutral或条件跳过的job满足某些平台状态规则，本项目聚合必须另外按真实用例／原报告判断。完整枚举当前SHA对应任务／阶段的全部必需结果，等待终态并下载校验／读取报告后，才允许任务勾选、handoff complete或验收完成报告；一个run成功、开发准入、review已请求、checkbox齐全或模型自评均不足。当前Codex审查记录缺失／空或截断／漏范围、首次基准未确认、报告缺失／无法读取、SHA或产物不符均拒绝。Draft PR或继续开发的工程移交可列真实开发证据与未决验收项，不能表述为正式通过、可合并或已发行。

最终完整验证前一次整理实现、测试、canonical任务与工程文档并冻结受验SHA；最终completion record及读取／测量补记写外部私有证据库，不为记录通过再产生新提交。此后任何仓库改动，包括任务清单、依赖、门禁与相关工程条款，都按新SHA重新核必需验证，不因称作“文档”沿用旧SHA完成。任务勾选只表达已有证据支持的进度，尚待最终验收的任务保持未完成；外部completion record不得伪造勾选或扩大完成范围。

正式证据分类归档于有权私有存储，测试90天、正式发行初始1年，敏感内容遵更短业务期限/脱敏；价格/存储Q-03/16准入。run URL和artifact默认保留不永久；不得把真实手机号/私信/草稿/AI完整原文写长存报告。引用合成fixture标识、必要授权日志/状态/截图即可。收到旧版结果必须重新验证实际发行，不手改index抹失败。

## 验证条件

Actions覆盖四类/混合变更、同包更换攻击、无超级管理员确认、DEC-001冷却、审批后权限/范围变更、名单内外、扩灰无确认、native不兼容、旧端核心安全/不安全、失败/中断/重试、迁移部分/不可逆、回滚复活攻击及证据缺失。任何未确认生产影响或名单外能力成功为缺陷；不在本轮执行这些操作。

初始化／门禁另验证零用例、尚未存在的业务脚本、必需skip／neutral、前置失败导致聚合未执行、queued／超时／取消、只等一个run、旧SHA／PR merge误配／错误artifact、清单缩减、未读报告、Red环境错误／oracle换绿、AI假报告／漏图／秘密泄露、基准自批／自动重拍和直接旧脚本设complete等拒绝案例。full-release读取所有必需最终报告，不用bootstrap探针替业务验收。

按ED-11/12/21，开发审查由当前Codex记录执行者、会话、SHA、来源及实际输入摘要、覆盖/findings/处置。正式审查由Actions校绑定；正式执行/采集及完成门禁在Actions。本地开发记录独立保存且排除秘密，正式引用由Actions认证并归档。私有原件存用户服务器，受限身份/目录、校上传与回读摘要及分类保留；服务器不作runner。独立开发审查API凭据要求取消，产品AI凭据不变。
