# 分类清理、独立保留与安全备份恢复

对应原旅程US17；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 分类义务 / 到期状态 / 重试 | listRetentionObligationsManagement / listRetentionObligationsManagement（清理阶段） / retryPurgeJobManagement | 当前最小管理权、class/trigger/rule_version/due及合法利益 | DB/object/derivative/index/cache各阶段幂等真清，UI隐藏非全部清，责任错误可查 |
| 必要案件日志延期 | previewRetentionExtensionManagement / extendRetentionObligationManagement | 最小案件权、理由责任期限/审计 | 独立retention_interest不授普通/AI，不能无限保原文，保护共同需求/唯一恢复副本 |
| 备份/恢复预览执行/开放 | createBackupManagement / previewRestoreManagement / createRestoreManagement / getRestoreManagement / 恢复worker（在createRestoreManagement获批范围内校验后开放，无独立越权入口） | 隔离DB和Storage实体hash/schema/config/捕获watermark及独立最新账本 | isolated→replay→rebuild→verify→ready→opened，先最新删除撤权处罚隐私用途plugin grant再索引开放，缺水位gap验证失败closed |

## 输入、权限、事务与异常边界

立即业务拒绝与物理清理分事实。副本只为恢复/对方合法DM/具体证据，单方撤权不误删共同对象或让删除方重读；插件缺席核心义务持续，卸载重装不改原trigger/due，额外永久清理独立确认/MFA/DEC-001，原到期不变。

默认：注销账号认证资料/作者内容媒体30天删或不可逆匿名；主动帖评论10秒撤销/30天恢复后清；已送达DM末活动24个月过期且各方权独立；主动删AI30天清/未删12个月无活动过期；AI元数据30天/必要受控原始调试最长7天；证据结案180天/审计1年/OTP安全日志30天。证据延期理由授权责任审计，保留不推迟撤权、不毁唯一副本。

DB/Storage实体与独立安全账本分别加密hash，secret仅ref。备份90天轮转待真实证据，不改fixture时钟冒充历史；业务RPO≤1h/RTO≤4h是原工程目标需完整对象实测，安全拒绝不允许丢1h。恢复先追当前会话角色关系/注销删除处罚AI用途隐私/plugin grant，未知缺日志保持closed；旧索引配置回滚重装不能复活。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

已有保留义务/权益/独立拒绝账本与恢复输出准入、OTP加密临时回执清理；完整分类真清、DB+Storage备份/轮转/恢复编排及后台义务控制台未完成，安全日志测试非完整RPO/RTO达标。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [supabase/migrations/0005_obligations.sql](../../../supabase/migrations/0005_obligations.sql)
- [supabase/migrations/0011_independent_security_journal.sql](../../../supabase/migrations/0011_independent_security_journal.sql)
- [supabase/migrations/0017_output_restore_admission.sql](../../../supabase/migrations/0017_output_restore_admission.sql)
- [supabase/migrations/0022_restore_watermark_guard.sql](../../../supabase/migrations/0022_restore_watermark_guard.sql)
- [services/core-worker/src/security-journal.ts](../../../services/core-worker/src/security-journal.ts)
- [services/core-worker/src/otp-cleanup.ts](../../../services/core-worker/src/otp-cleanup.ts)
- [supabase/functions/core/admission.ts](../../../supabase/functions/core/admission.ts)

## 最小必要验证

1. 各class触发期限两侧、共同利益/唯一恢复副本/最小证据延期，实际各阶段失败重试，插件缺席继续原时钟。
2. 删方DM即时撤与对方合法读实体保留分离，旧URL/重现备份仍拒删方，证据不进公共搜索AI。
3. 旧DB+Storage真恢复先当前watermark，缺日志未知不兼容closed，索引无复活，轮转/RPO/RTO仅实测。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-114"></a>

- **FR-114**：各类业务对象、媒体、索引、缓存、日志和备份必须有分类清理责任、触发／例外、期限与可查结果，失败可追踪重试；UI 消失不证明全部清理，配置不能重新公开已删内容或恢复已撤销访问。（DATA-01；AC-03、AC-32）

<a id="fr-115"></a>

- **FR-115**：必要争议／法定证据必须独立最小授权、理由、期限和责任人，延期及敏感访问审计，不以日志无限保留个人信息；AI 原文不默认长期记录，普通配置不能关闭必要审计，证据不接回普通业务。（DATA-02；AC-21、AC-30、AC-32）

<a id="fr-116"></a>

- **FR-116**：共享私信、恢复副本和证据必须分别管理保留权利；一方删单条即撤其正常资格，对方仍有权时保留必要共同数据，双方均不需要、期限到达或其他适用清理条件满足时进入清理，保留／重现不恢复删除方资格。（DATA-03；AC-21、AC-32）

<a id="fr-117"></a>

- **FR-117**：备份恢复必须在开放读取前重新应用删除、撤权、处罚和有效隐私设置，不复活注销账号、删除内容或撤回 AI 来源；恢复能力与可接受数据损失／恢复时间按相应节点确认并实测，不承诺未经验证恢复。（DATA-04；AC-32）

<a id="fr-118"></a>

- **FR-118**：数据必须执行本规格分类默认期限；插件也登记责任和期限，停卸／升级分别处理代码、配置、结构和数据，不重置原保留时间；插件缺席时核心删除、撤权、证据和到期清理继续，额外主动永久清理另行授权。（DATA-01–04、PRD 第 16 节；AC-32、AC-46）

## US17旅程验收

1. **Given** 删除、撤权或注销已生效，**When** 保留副本尚待清理，**Then** 普通业务仍拒绝访问，清理失败可追踪重试，不把 UI 隐藏称为全部删除。
2. **Given** 私信另一方仍合法需要共享数据或案件需最小证据，**When** 一方删除／注销，**Then** 分别管理合法保留和普通资格，既不误删共同对象，也不恢复删除方访问。
3. **Given** 分类保留到期或授权延期，**When** 清理，**Then** 按有效分类配置执行并记录，延期有理由、责任和审计，插件卸载／重装不重算期限。
4. **Given** 备份、版本或插件恢复，**When** 重新开放读取，**Then** 先应用删除、撤权、处罚与有效隐私设置，不复活注销账号、已删内容、已撤回 AI 来源或未批权限。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| purge_job | record、stage(DB/object/derivative/index/cache)、attempt、result/error、watermark | 全阶段真实结果，无UI隐藏代全部清理；幂等，不误删共享需求 |
| backup_manifest | id、DB/object_digest、captured_at、schema/config、security_watermark、expires_at、encryption_ref | DB和Storage实体分别；轮转90天目标未实测；秘密不输出 |
| restore_run | backup、latest_security_watermark、replayed_seq、state、checks/evidence | isolated→replay→rebuild→verify→ready→opened；缺日志/验证失败保持closed |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-32 | 按第 16 节已确认默认及有效分类配置触发清理并记录结果，备份 90 天目标取得实际轮转证据；10 秒撤销 / 删除后 30 天恢复可用并保留唯一恢复副本。另一方仍有权的私信不因发送方删除 / 注销被误删，证据独立受控、延期有理由 / 授权 / 审计。备份恢复先应用删除 / 撤权 / 处罚 / 隐私设置再开放；调整期限不复活数据或撤销已收回访问，必要审计不能通过普通配置关闭。 | DATA-01–04、AUTH-08–09、DEL-01–04、CFG-07–11 |
