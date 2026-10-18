# 举报、版本审核、处罚申诉与后台身份

对应原旅程US10；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| App举报 / 进度 | createReport / listOwnReports | 帖/评论/账号/DM对象、理由最小证据、operation | pending→reviewing→processed/not_actionable；真实受理才成功，无举报人他案证据泄漏，数量不定违规 |
| 审核决定 / 处罚 / 撤销 | getContentsManagement / getCasesManagement / decideRevisionManagement / createSanctionManagement / revokeSanctionManagement | 当前role/action/resource/env/MFA/必要stepup/理由及revision | 只获审revision切换，function_limit/temporary/permanent独立内容处置/主动删，撤销仅自身当前合法影响 |
| 申诉 / 独立复核 | createAppeal / listOwnAppeals / decideAppealManagement | 本人理由必要材料、不同原decider且有权reviewer | awaiting_independent_review→reviewing→decided，无第二人待复核，原人只补说明，执行失败可查重试 |
| 后台登录 / MFA / 身份 | getSessionManagement / listMfaFactorsManagement / enrollMfaFactorManagement / challengeMfaFactorManagement / verifyMfaFactorManagement | 手机OTP+当前aal2/角色范围，一次受保护TOTP注册 | aal1旧JWT不因DB升级得高权，撤角色过期新请求拒；备用密码不替MFA |
| 初始化 / 角色邀请 / stepup / MFA恢复 | 受保护部署命令（无公开HTTP operationId） / previewRoleGrantManagement / grantRoleManagement / revokeRoleGrantManagement / createStepupManagement / createMfaRecoveryCaseManagement / getMfaRecoveryCaseManagement / decideMfaRecoveryManagement | 保护部署初始化或当前超管、具体动作摘要/理由及一次证明 | 首超管一次关入口，恢复受控核归属非短信即全权，撤旧会话凭据通知，DEC-001适用 |
| 案件证据 / 审计 / 汇总 | readCaseEvidenceManagement / getAuditManagement / getOverviewManagement | 五角色逐资源action最小权、敏感案证授权 | 无任意DM草稿AI或全库导出，真实有效聚合，审计追加不可任改删，日志不带秘密 |
| 正式资料录入/ready/发布撤下/本人动作 | createManagedDocumentManagement / createDocumentRevisionManagement / patchDocumentRevisionManagement / readyDocumentRevisionManagement / previewDocumentReleaseManagement / publishDocumentReleaseManagement / withdrawDocumentReleaseManagement / getCurrentDocuments / getPublishedDocument / recordDocumentReceipt | 规则隐私条款告知help真实正文、CAS/scope/digest/专门权限MFA及必要生产确认 | draft可CAS、ready/release不原地改，原子active，撤下不自动回旧，展示不等同本人同意，注册proof原子绑定 |
| 后台手机号OTP发送/确认/未知/刷新/退出 | createManagementOtpChallenge / verifyManagementOtp / readManagementOtpOperation / refreshManagementSession / logoutManagementSession | 浏览器BFF受保护会话、当前管理用途与CSRF、原验证证明 | 不把App令牌升级后台用途；未知查原请求，刷新与退出BFF清理关联，普通OTP仍须角色和aal2 |
| 后台备用密码/图形验证码/恢复申请 | createManagementPasswordCaptcha / loginManagementPassword / requestManagementPasswordRecovery | 整体默认关闭；仅已配置受控管理账号、真实校验及限流 | 开关关闭明确不可用，密码成功不绕MFA/角色，恢复不授全权；当前未完成真实账号初始化和端到端 |
| 用户搜索/内容/媒体/违规审核入口 | listAccountsManagement / getContentsManagement / getMediaManagement / getCasesManagement / getAppealsManagement | 当前角色、query/filter、最小资源/案件范围 | 每项独立授权与最小投影，媒体预览当前gate；用户列表不是任意私人正文浏览 |
| 话题/公告/置顶精选管理 | getTopicsManagement / createTopicManagement / patchTopicManagement / deleteTopicManagement / listAnnouncementsManagement / createAnnouncementManagement / patchAnnouncementManagement / deleteAnnouncementManagement / getPlacementsManagement / createPlacementManagement / patchPlacementManagement / deletePlacementManagement | 社区运营仅获准action/对象、CAS/operation、理由、目标期限/顺序 | 明确运营标识、期限、真实保存结果；不伪计数不放宽目标资格，公告必要安全类仍核心专权 |

## 输入、权限、事务与异常边界

后台完整Kiranism直接接真实业务，保布局导航主题表格表单，示例认证/数据替换。真实运营总览用户处罚/帖评论投票媒体/举报审核申诉/话题公告精选/违规角色审计配置/插件发布日志恢复开发者支持逐项授权。

超管管理邀请授权敏感系统及插件版/权限/生产确认；内容审核只获准案件必要历史；运营仅话题公告精选汇总无默认处罚；AI运维合格服务指标无原文；审计只读获准日志无修改处罚正文。能开页面不授动作，普通OTP无后台权。

功能限制仅列功能，临时禁发互动并退出推荐热门但合法可读；永久禁发互动并退出正常流搜索推荐、主页直接链占位。解封申诉不恢复主动删/过期请求/取消follow/block。审核故障留pending人工合法处理不自动过。原工程3/7工作日提醒非自动决定驳回或延期，缺第二人不自审。

正式制度由用户/获权责任人提供不模型编造，资料kind/surface/purpose/env专门授权，运营AI运维无自动条款发布权。缺条款仅阻依赖新准入，缺告知/help仅阻对应处理，不强制老用户登录重同意。presented/acknowledged/consented/declined来自真实动作，沉默不等同意。

MFA恢复案件HTTP契约只覆盖仍有另一合格管理员可独立复核的受控流程；仅一位管理员丢失MFA的紧急恢复只能由受保护部署程序办理，没有公开HTTP恢复全权旁路。两种恢复当前都不能由契约存在推断已实现。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

已有真实管理身份/MFA/BFF与OTP配置及正式资料读取/准入证明基础；备用密码UI/adapter默认关闭、完整初始化验收未完成。角色分配/MFA丢失恢复、举报审核处罚申诉、完整资料编辑发布页及真实运营未完成；模板demo不是业务。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [apps/admin/src/features/management/components/login-form.tsx](../../../apps/admin/src/features/management/components/login-form.tsx)
- [apps/admin/src/features/management/components/mfa-form.tsx](../../../apps/admin/src/features/management/components/mfa-form.tsx)
- [apps/admin/src/features/management/components/identity-page.tsx](../../../apps/admin/src/features/management/components/identity-page.tsx)
- [apps/admin/src/features/management/session-context.tsx](../../../apps/admin/src/features/management/session-context.tsx)
- [supabase/functions/core/routes/admin-identity.ts](../../../supabase/functions/core/routes/admin-identity.ts)
- [supabase/functions/core/identity/admin-policy.ts](../../../supabase/functions/core/identity/admin-policy.ts)
- [supabase/functions/core/routes/admin-password.ts](../../../supabase/functions/core/routes/admin-password.ts)
- [supabase/functions/core/documents/read.ts](../../../supabase/functions/core/documents/read.ts)
- [supabase/migrations/0038_admin_identity_configuration.sql](../../../supabase/migrations/0038_admin_identity_configuration.sql)
- [supabase/migrations/0007_documents.sql](../../../supabase/migrations/0007_documents.sql)

## 最小必要验证

1. 五角色×action/resource/env×当前MFA/stepup/冷却，撤权旧JWT拒，案外证据私人原文拒并审计。
2. 举报防重、revision再编辑竞争、处罚撤销只自身影响；申诉无第二合格人保持待复核。
3. 资料CAS/ready不可变/scope摘要权限MFA、撤下无旧版回退；展示同意分离、注册期间版本变重新核。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-095"></a>

- **FR-095**：必须实施必要发布检查及发布后巡检，通过者发布、进一步确认者待审／限制；作者可查看允许说明、编辑、撤回／删除待审内容，待审不进公共信息流、搜索、热门、推荐或普通 AI，编辑不跳复核。（GOV-01；AC-28、AC-37）

<a id="fr-096"></a>

- **FR-096**：必须支持帖子、评论、账号及私信举报，保存对象、理由、必要证据和真实提交结果；状态含待处理、审核中、已处理、不予处理，反馈不暴露举报人、他人证据或内部敏感信息。（GOV-02；AC-28）

<a id="fr-097"></a>

- **FR-097**：治理必须基于证据而非举报数量，可提醒、限传播、删内容、限制功能及封禁并记录原因、人员、时间、对象、依据、结果；高影响自动处置可复核、紧急限制也留记录。垃圾、骚扰、重复发布、异常互动和刷量受控，失败提交不伪报受理，阈值不豁免授权。（GOV-03–04；AC-28、AC-34）

<a id="fr-098"></a>

- **FR-098**：处罚必须分功能限制、临时封禁、永久封禁，与单条处置／主动删除分开。功能限制只停止列明功能；临时禁发与互动、合法内容可读但退出推荐／热门；永久禁发与互动、内容退出正常流／搜索／推荐，主页／直接链接适当占位。各类显示允许原因、范围、时间和申诉，不自动永久删所有对象。（GOV-05、PRD 第 14.2 节；AC-28–29）

<a id="fr-099"></a>

- **FR-099**：处罚到期／撤销必须只恢复该处置实际影响且当前仍合法状态，不恢复主动删除、过期请求、取消关注或拉黑；记录决定与执行、失败可追踪重试，不显示假恢复。（GOV-06；AC-29）

<a id="fr-100"></a>

- **FR-100**：用户必须能提交申诉理由／必要材料并查看状态；最终复核由不同于原处置人的有权人员决定，原处置人仅可补充，无第二合格人员则待复核，审核只访问本案最小证据。（GOV-07；AC-29）

<a id="fr-101"></a>

- **FR-101**：后台必须管理真实运营总览、用户、处罚、帖子／评论／投票、媒体、举报／审核／申诉、话题／公告／推荐位、违规记录、角色、审计、配置及插件发布／日志／恢复／开发者支持，不用示例页替代；超级管理员、内容审核、社区运营、AI 运维、审计只读按角色表分工。（ADM-01、PRD 第 14.3 节；AC-28、AC-30、AC-43–47）

<a id="fr-102"></a>

- **FR-102**：每个后台操作与资源必须单独授权，打开页面不授予所有动作；未授权敏感读取、配置或导出拒绝，未确认业务导出不开放全库导出，授权限适用环境及插件。（ADM-02；AC-30、AC-38、AC-45）

<a id="fr-103"></a>

- **FR-103**：管理员必须手机号验证加额外多因素验证，高权限不能仅凭短信；处罚、敏感查看、获准导出、角色／密钥／安全配置、插件敏感权限、生产确认、额外永久清理等按风险再次验证并填原因，撤权／过期／退出后拒绝后续敏感操作，DEC-001 冷却优先适用。（ADM-03；AC-30、AC-40、AC-45–47）

<a id="fr-104"></a>

- **FR-104**：首位超级管理员必须由部署负责人在受保护一次性初始化建立并关闭入口；后续由有权者邀请／创建授权，普通注册不能成为管理员。（ADM-04；AC-30）

<a id="fr-105"></a>

- **FR-105**：丢失多因素凭据必须受控归属核验、一次性恢复及审计，不仅短信即恢复全权限；多人优先另一超级管理员复核、单人受控紧急恢复，完成撤销旧会话／凭据并通知，不开放可滥用旁路。（ADM-05；AC-30）

<a id="fr-106"></a>

- **FR-106**：必要敏感操作与读取必须留下权威审计，含人员、时间、对象、动作、理由、结果和请求关联；日志受控、无凭据或不必要完整对话，普通修改不能任意篡改审计。（ADM-06；AC-30、AC-40、AC-45）

<a id="fr-107"></a>

- **FR-107**：管理员不得任意读私信；仅具体举报／必要安全事件按最小案件授权及审计读取证据，运营、AI 运维、审计只读和插件角色不因统计／日志获得私人原文，保留证据不恢复普通访问。（ADM-07；AC-21、AC-30）

## US10旅程验收

1. **Given** 内容待审核或举报待受理，**When** 作者／举报人查看，**Then** 只看允许公开的状态和反馈，待审内容不进公共入口；提交失败不显示受理成功。
2. **Given** 大量举报同一对象，**When** 处置，**Then** 不把数量直接当违规结论，决定依据证据并记录；紧急限制也有复核。
3. **Given** 功能限制、临时或永久封禁，**When** 用户阅读或操作，**Then** 执行各自列明效果，提供原因、期限及申诉；处罚和主动删除分别处理。
4. **Given** 原处置人或缺少第二名合格人员，**When** 复核申诉，**Then** 原处置人不能独自最终决定，无第二人则待复核；撤销只恢复该处罚实际影响且仍合法状态。
5. **Given** 角色、MFA 或会话条件不满足，**When** 执行后台高风险操作或敏感读取，**Then** 拒绝并记录适用结果；后台没有任意浏览私信、草稿或 AI 原文的默认能力。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| report/case | reporter、target、reason、minimal_evidence_refs、state、handler、public_feedback | pending→reviewing→processed/not_actionable；举报数量不自动认定，反馈不漏举报人 |
| evidence/grant | case、object_ref、retention、allowed_reviewer/action、reason、expires_at | 最小案授权，敏感读审计；不授普通消息读权 |
| sanction | subject/target、type、functions、starts/ends、reason、original_decider、state | 功能/临时/永久分开，解除仅该处罚影响，不能恢复主动删/请求/关系 |
| appeal | sanction、appellant、statement/media、state、reviewer、decision/execution | awaiting_independent_review→reviewing→decided；最终reviewer≠original_decider，无第二人保持待复核 |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-28 | 举报成功可追踪进度，批量举报不直接认定违规；待审核仅本人管理，编辑需重新审核。功能 / 临时 / 永久处罚效果分别生效，后台处置与理由通知闭环。 | GOV-01–06、ADM-01 |
| AC-29 | 原处理人不能独自复核申诉；无第二人保持待复核。撤销只恢复该处罚影响状态，不复活主动删除、过期请求、取消关注或解除拉黑；失败可追踪。 | GOV-05–07 |
| AC-30 | 普通 OTP 无后台权限；管理员 MFA 服务端强制，五角色逐操作验证。旧会话 / 权限撤销拒绝操作，敏感读取 / 处置有审计，初始化和 MFA 恢复无公开绕过。 | ADM-01–07 |
