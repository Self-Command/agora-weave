# 技术架构

2026-10-18当前执行以[快速开发与人工验收](delivery-mode.md)为准：App/后台用户验收，取消独立UI复检，三端持续开发及热更新，日常最小工程/后端检查，完整流程最后集中执行。

产品范围以 [PRD](../docs/product/PRD.md) 与 [功能文档](features/) 为准；HTTP 结构由[固定OpenAPI契约](contracts/README.md)中的app、management和core-admin三份YAML固定，跨请求业务约束由领域契约补充。本文说明可复用的技术边界，不作为任务清单或完成证明。

固定技术、官方来源和版本维护入口为[technology](technology.md)，下面只说明各层职责与当前源码定位；固定输入变更统一维护技术文档与实际锁文件。

## 已固定的技术与源码

| 层 | 当前源码与版本依据 | 实现边界 |
| --- | --- | --- |
| App | `apps/mobile/`；Expo、RN、Expo UI、Expo Router及本端React | 原生 iOS/Android；现有免费 Uniwind/Tailwind，常规语义 className，必要原生 props/modifier/动态 style 保留 |
| 后台 | `apps/admin/`；固定Kiranism完整快照、Next/shadcn及本端React | 保留完整官方布局、导航、主题、表格和表单源码，通过现有接口和扩展点接真实业务；模板 Clerk/示例权限不作产品身份 |
| 分享 | `apps/share/`；固定Next/React组合 | 独立只读 audience 与逐路由投影；当前生产呈现已退役，完整分享业务尚未实现 |
| 后端 | `supabase/upstream/docker/` 官方完整 Compose；来源锁见 `infra/ci/` | Auth/Postgres/Storage/Realtime/Edge Runtime 等整套复用，先配置、官方 API、hook 与扩展点，必要补丁最小可追踪 |
| 核心 API | `supabase/functions/core/` | 官方 Edge Runtime 内的业务网关、身份适配、当前授权、媒体/实时/资料读取、配置与管理 API |
| 核心作业 | `services/core-worker/src/` | outbox/inbox、独立安全日志、短期认证回执清理及后续分类保留责任 |
| 共享包 | `packages/contracts,policy,config,design` | 无 React 的 DTO/字符算法/策略/配置；各端保留本端官方依赖，不强统一 React 补丁 |

完整Supabase官方来源、每端版本、工具链与镜像锁定输入见[technology](technology.md)和实际锁文件；固定输入不宣称最新或所有组合已验收。核心扩展解决产品授权、数据与可靠性问题，不能裁掉官方能力后重做认证、对象存储或后台平台。

## 请求、身份与网络

公网仅受控产品 API、后台、分享与获准更新入口。Auth 必需协议经受控代理；数据库、原始 Storage/Realtime/PostgREST/Studio/对象源站内网。移动安全存储 token，后台/分享使用安全 HttpOnly cookie 与写请求同源/CSRF 校验。客户端自报 account、channel、role、插件版本或 native capability 不授资格。

每次操作验证签名、issuer/audience/expiry 和当前 session/account，再检查当前 grant、环境、资源最后通过版、删除/治理、关系/拉黑、依赖与具体用途。主库判授权，最小 grants/RLS 二道保护；不以 JWT 角色快照、replica、签名地址、频道连接或 TTL 正缓存替代当前事实。当前实现入口见 `supabase/functions/core/identity.ts`、`packages/policy/src/` 和迁移内的资格函数。

分享 `share-read` 先核方法/路由/用途白名单，再核资源；本人或管理员也不能用该 audience 读取草稿、收藏、私信、AI、后台和私人 preferences。有权受限分享目标可合法读取并 noindex，匿名元信息不含受限正文。分享播放器仅使用合法平台默认与本页操作，不读写账号偏好。

撤权以主库提交及耐久拒绝事实为线性化点。输出 admission 与撤权采用一致锁顺序，输出前及后续有界单元再次检查；后续新请求/Range/缓存命中/实时事件/AI 输出不能沿用旧许可。媒体 GET/HEAD/Range/条件请求/派生物均过网关，不重定向源站，失权不返回 304。对外 no-store，Next 正文缓存/图像优化和客户端离线旧副本不得旁路。已交付字节无法收回，后续受控输出必须停止。详见 [授权事件契约](contracts/authorization-events.md)。

## 事务、数据与可靠效果

当前 schema 权威是实际环境已应用的原始 SQL、依赖顺序和摘要，不是未来实体表；见 [数据库字典](database/schema.md) 与 [迁移说明](database/migrations.md)。主键稳定 UUID，服务端 UTC 时间，CAS row_version，秘密仅 secret_ref。环境以独立数据库、网络、桶、账号和密钥隔离；不引入 tenant/community/product 编排实体。

操作以主体/环境/动作/operation_id 加 payload hash 幂等，同 ID 异 payload 冲突；unknown 先查询，不能自动再发短信、验证或创建会话。唯一约束、短事务与行锁处理邀请码、用户名、投票、请求与配置竞争。业务提交同时写 outbox，consumer inbox/effect_key 防重复效果，不声称网络 exactly-once。最终副作用前重核当前资格和生命周期租约。

审核绑定 revision_id；当前通过指针只切已审版，串批次全部就绪才原子公开。草稿 CAS 不盲覆盖；评论中间占位、串首帖依赖、引用闭包、独立删除与当次恢复影响集分别建模。无向账号 pair 的私信 pending 唯一，反向并发也最多一请求和一初始消息；合法直接消息不自动合入旧请求，显式接受沿用原 ID/时间/阅读状态，逐参与者消息资格独立。完整后续逻辑设计见 [领域模型](database/domain-model.md)，不代表上述业务均已建表或交付。

## 模块与配置

核心身份、授权、配置、审计、媒体 gate、治理历史义务、保留恢复、插件注册/生命周期和发行安全不能由普通模块开关停用。逻辑模块无需拆独立数据库或新增集群；初期 Postgres 全文/trigram、关系索引、SQL 排名和 outbox 满足既定方案，不预设 Redis/Kafka/搜索或向量集群。

| 模块 | 新业务依赖 | 停用后保留的义务 |
| --- | --- | --- |
| social | 核心 | 关系/拉黑授权事实、安全撤权 |
| content | 核心 | 合法通过版只读、恢复与清理 |
| discussion/interaction | content | 合法回复与占位、原帖依赖、私密必要移除、到期关闭 |
| discovery | content/social | 直接有权路径不获得额外资格，停排名任务不删内容 |
| messaging | social | 逐消息资格、安全通知、证据与清理 |
| ai | content/discussion/discovery | 有权历史来源闭包、撤回与清理 |
| sharing | content/social | 旧链接安全投影/占位、撤权/noindex |

成熟模块目标为默认启用；尚未开放的能力按版本真实不可用。停用有依赖模块默认拒绝，只有明确选定且安全的闭包可联动停用；不等于卸载或数据清理。

配置注册覆盖 key/default/schema/range/scope/修改权/consumer/旧对象策略，global→environment→module/plugin→明确 user_group，冲突无唯一优先级拒发布。完整不可变 bundle 原子切激活指针，需重载消费者就绪才切换；每操作固定兼容 bundle，当前撤权事实独立实时核。期限、锁票和请求终态不因配置回滚复活。每个已开放业务贯通必要后台入口、API、服务/客户端消费与回滚验证，登记本身不算完成。详见 [配置契约](contracts/configuration.md)。

## AI、插件与正式资料

产品 AI/MCP 始终只读，broker 绑定用户/会话/环境，只暴露有界工具白名单，无任意 SQL/网络/写入/管理权。检索、总结、推荐取实际用途交集；受限主动选择与告知不能替代当前读权。答案、标题、历史、复制、流和续问保存并重核传递来源闭包，无法可靠拆分则整条撤回。真实模型准入、tokenizer、预算未就绪时明确不可用；额度预留/结算与未知成本对账独立。详见 [AI 契约](contracts/ai-tools.md)。

第三方插件使用声明式三端 host UI 与每插件独立受限 Deno 2.9.6 容器；不运行任意客户端 JS，不得核心 token/service_role/数据库口令。有限网络只至 capability broker，非 root/只读/配额/无 host socket。运行数据角色非 owner/NOBYPASSRLS，迁移临时角色只限插件 schema，禁止修改核心策略或自授高权。停用提升 epoch、关闭 admission、撤 lease，最终效果重核；卸载与数据清理分开，重装不复活 tombstone 或重算保留时钟。SDK、CLI、正式文档及 sample-a/b 全范围保留，当前尚未完整实现。详见 [插件契约](contracts/plugin-sdk.md)。

规则、条款、隐私、处理告知与帮助使用 managed_document、不可变 revision/release 和必要 receipt；发布/撤下与当前引用保持一致，正式文案由用户提供。展示和明确同意分开，不新增老用户登录或普通公开 AI 逐次强制同意；普通配置字符串不能绕文档发布。作者账号/目标收录策略独立于 AI 用途，取当前公开/通过版/实际展示依赖交集；关闭立即 noindex，异步旧任务不能复活。

## 恢复、交付和可测边界

DB 与 Storage 实体分别备份，安全日志独立于可回退备份；隔离恢复追至最新 security watermark、重放删除/注销/撤权/处罚/隐私/用途并重建派生物，缺日志保持关闭。ED-05 的 RPO≤1小时、RTO≤4小时及90天轮转是待真实测量的恢复目标，不能容许丢失一小时撤权。分类期限与共享保留需求见领域模型。

Actions 编译所有 APK/AAB/IPA；本机仅下载、安装、运行，JS/TS/样式走 Metro，native/config plugin/兼容变化才重建。真实 Android arm64-v8a、模拟器 x86_64，无32位。正式最低/当前 OS 功能与原生行为在 Actions 验证，本地独立 UI 对获批设计或完整模板做单主题整页布局检查；mock、编译、截图不能代业务、原生交互或人的批准。

发行绑定源码、产物/迁移/权限/config/runtime/环境/明确名单摘要，兼容 OTA 只送匹配 native runtime；破坏变化云端重建。每个生产影响动作需当前超管/MFA/动作绑定确认，扩名单重新确认，Actions 通过不自动部署。旧安全核心继续，局部不兼容只禁扩展。详见 [发行契约](contracts/release-evidence.md)。

容量与性能仅测量目标：10k注册/1kDAU/200在线，API P95≤800ms、首屏≤2.5s、私信≤3s、AI首有效≤8s/完成≤30s，未测不写 SLA。测量夹具10k账号/100k帖/300k评论/1m私信/200连接，70%读/20%写/10%媒体，预热5分钟/稳定30分钟，每类≥1000请求、端任务≥100次；记录真实环境/模型/冷热/网络与全部有效尝试的失败、超时、unknown、p50/p95/p99。初始资源4vCPU/8GiB/80GiB及插件0.5CPU/256MiB/PID64/并发8/5秒/临时32MiB/每小时日志1MiB均为测量起点，非生产采购授权。

现有代码和历史通过只证明具体版本与范围。当前账号、后台与访客最新流的源码、0044/AR05增量及真实未完成范围见 [账号实现边界](implementation/accounts.md)；不得由文档迁移推断全产品已完成。
