# 加入、登录与管理账号

对应原旅程US1；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 登录发送验证码 / 注册继续 | createOtpChallenge | 未登录/待准入、手机号、purpose；新用户邀请/当前条款集合 | 规范化手机号、服务端频率次数/异常限制，challenge绑定用途/条款；短信失败不消耗邀请，不返回OTP |
| OTP确认 / 未知结果重查 | verifyOtpChallenge / readOtpVerificationOperation | challenge_id/otp/operation_id；注册age声明版本/document_set_digest/明确同意 | 邀请单次兑换、准入、实际条款证明原子提交；已有账号不重新兑码；同验证证明POST查原operation，不能裸ID泄令牌 |
| 安全会话列表 / 撤销 / 退出 | listDeviceSessions / revokeDeviceSession / logoutAppSession | 本人当前会话，撤销base_version/operation_id | Auth有效会话及核心当前撤销事实双核，旧JWT不继续读；退出清安全存储、受限cache/URL/本人关联，丢响应查原结果 |
| 换号预览 / 确认 | previewPhoneChange / changePhone | 本人当前验证、新号与原号证明或受控恢复、明确确认 | 权威完成时间写sensitive_until、安全事件并撤其他会话；发送SMS成功不等换号完成 |
| 恢复提交 / 状态 | createRecoveryCase / getRecoveryCase | 当前接口必须App Bearer、trusted/manual模式与operation、最小材料；无会话人工入口未交付 | received→reviewing→need_evidence/approved/rejected，提交不等已恢复；不能把需登录接口冒充无可信会话的公开恢复协议，查询不泄他人账号 |
| 注销影响确认 / 提交 | previewCancellation / cancelAccount | 本人必要验证、明确注销确认、operation_id | 立即拒登录及内容普通输出；移除关注/互动/收藏/AI与索引义务，对方合法DM及去身份票独立，排队不等物理清理 |
| 后台邀请码创建 / 撤销 | createInvitationManagement / revokeInvitationManagement | 当前超管/MFA/理由、期限 | unused→used/revoked/expired；同码并发只一次准入，used不重新分配，创建使用原因审计 |

## 输入、权限、事务与异常边界

国内裸号可补+86、去空格括号连字符，最终E.164服务端校验。初始OTP300秒/60秒重发/5次失败、手机号5每小时10每日/IP30每小时是工程初值，不冒充用户原始指定。短信失败保输入合法重试，不绕验证；有效会话无须再验证的功能继续。

18岁主动声明不等年龄已核验；条款展示、明确同意、年龄版本分别持久化，原子注册绑定实际release。DEC-001见公共规则，所有session/plugin入口统一；必要恢复不凭公开资料或客户端声明，不保证无法证明归属者找回。

账号r2五页/选择器已有具体批准，精确版查page-registry；不推定新增换号/注销整页也获批准。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

已有公开challenge/verify、官方Auth/SMS适配、原子准入、证明查询、会话及恢复controller/五页接入。真实SMS、完整五页原生旅程、换号/恢复执行/注销、邀请角色及分类物理清理仍未完成；申请/状态读取不证明恢复可执行。当前`/recovery-cases`要求App Bearer，无原手机号且无可信会话的人工申请入口/归属核验协议尚未交付，不能由已有manual枚举推断匿名恢复可用。后台密码备用默认关闭，真实账号初始化与端到端未完成，普通产品仍手机号OTP。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [supabase/functions/core/routes/public-auth.ts](../../../supabase/functions/core/routes/public-auth.ts)
- [supabase/functions/core/routes/auth.ts](../../../supabase/functions/core/routes/auth.ts)
- [supabase/functions/core/routes/account-security.ts](../../../supabase/functions/core/routes/account-security.ts)
- [supabase/functions/core/routes/recovery.ts](../../../supabase/functions/core/routes/recovery.ts)
- [supabase/functions/core/routes/operations.ts](../../../supabase/functions/core/routes/operations.ts)
- [apps/mobile/src/features/account/api.ts](../../../apps/mobile/src/features/account/api.ts)
- [apps/mobile/src/features/account/AuthPages.tsx](../../../apps/mobile/src/features/account/AuthPages.tsx)
- [apps/mobile/src/features/account/SecurityRecoveryPages.tsx](../../../apps/mobile/src/features/account/SecurityRecoveryPages.tsx)
- [supabase/migrations/0036_public_otp_broker.sql](../../../supabase/migrations/0036_public_otp_broker.sql)
- [supabase/migrations/0105_registration_admission.sql](../../../supabase/migrations/0105_registration_admission.sql)

## 最小必要验证

1. 缺邀请/OTP/年龄或条款证明不准入，同码两并发至多一成功，失败无半同意记录。
2. 过期/重发/猜码/短信超时与异purpose拒，未知沿同operation及原证明查询，仅本人原回执。
3. 撤销/退出/换号/注销后旧JWT直接API/媒体拒；T、24h前、恰到期逐禁操作测试，退出举报申诉不被冷却。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-001"></a>

- **FR-001**：必须仅以手机号和短信一次性验证码提供首版注册／登录，支持重发、有效期、次数与频率限制及异常防护；不提供邮箱登录或密码找回。（AUTH-01；AC-01–02）

<a id="fr-002"></a>

- **FR-002**：内测注册必须同时满足有效邀请、手机验证及主动声明已满 18 岁；已有账号登录不重新要求邀请码，普通注册不取得后台身份；资格声明不得标为真实年龄核验。（AUTH-02、AUTH-04；AC-01–02）

<a id="fr-003"></a>

- **FR-003**：仅超级管理员可创建、发放、撤销邀请码，登记创建者、到期、使用账号／时间、状态及原因；初始每码一次成功使用，同码并发不得授予多个资格，已用码不得重新分配，尝试与生成受限流。（AUTH-03–04；AC-01–02）

<a id="fr-004"></a>

- **FR-004**：用户必须能查看、撤销会话和退出；撤销、换号、注销及权限变化后旧会话的后续受保护访问按当前资格拒绝，退出清理应用管理的受限缓存与本人登录关联。（AUTH-05；AC-03）

<a id="fr-005"></a>

- **FR-005**：换号必须验证当前账号及新号，能用原号时验证原号与新号，记录并通知安全事件、撤销其他会话；成功时起连续 24 小时执行 DEC-001 的完整操作限制，并显示可知解除时间，不因再次验证或其他入口提前解除。（AUTH-06；AC-03；DEC-001）

<a id="fr-006"></a>

- **FR-006**：无原号时必须区分可信会话恢复和无可信会话的受控人工申请，不凭公开资料或客户端声明恢复，不保证无法证明归属的账号找回；换号限制期内必要恢复走受控人工流程。（AUTH-07；AC-03；DEC-001）

<a id="fr-007"></a>

- **FR-007**：注销必须明确确认并进行必要身份验证，立即禁止登录与关联内容正常展示；移除个人关注、点赞、收藏、AI 会话及索引，本人转发／引用停止展示，计数按有效记录更新；投票可去身份聚合，对方仍有权私信独立保留并将发送者显示为无主页链接的已注销账号。（AUTH-08–09；AC-03、AC-21、AC-32）

<a id="fr-008"></a>

- **FR-008**：短信故障必须提供失败、重试或受控恢复状态，不跳过验证码；有效会话无需重新验证的功能可继续，失败不伪报成功。（AUTH-10；AC-02–03、AC-34）

## US1旅程验收

1. **Given** 内测新用户没有有效邀请码、未验证手机号或未声明满 18 岁，**When** 提交注册，**Then** 注册不完成，失败原因及合法重试入口明确；年龄声明不显示为已核验年龄。
2. **Given** 两个用户并发兑换同一有效邀请码，**When** 分别完成注册请求，**Then** 至多一个成功使用资格，邀请码不能代替验证码；已有账号登录不需再次兑换新码。
3. **Given** 用户撤销会话、退出、换号或注销，**When** 旧会话再次请求受保护数据或敏感操作，**Then** 按当前资格拒绝；不能仅依赖客户端状态变化。
4. **Given** 用户已成功换号，**When** 24 小时内执行再次换号、主动注销或本规格列明的后台高风险变更，**Then** 拒绝并提示剩余限制时间；退出、撤销会话、举报、申诉及其他仍合法功能可用。
5. **Given** 用户失去原手机号，**When** 申请账号恢复，**Then** 按可信会话或受控人工流程核验，不凭公开资料直接恢复；短信故障不跳过验证。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| admission | account_id、invitation_id、phone_verified_at、age_declaration、terms_version→document_release、terms_receipt_id、admitted_at | 新注册三条件同时成立；条款关联实际发布版本及本人明确同意记录；未准入Auth主体不成为社区账号；主动声明不冒称年龄核验 |
| invitation | token_hash、creator_id、expires_at、state、used_account_id/used_at、revoke_reason | unused→used或revoked/expired；锁定单次兑换，used不能再分配 |
| recovery_case | account_ref、mode(trusted/manual/mfa_emergency)、state、minimal_evidence_ref、reviewer、result、audit_ref | received→reviewing→approved/rejected/need_evidence；受控一次执行，核验不足不保证成功 |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-01 | 邀请内测中无效 / 过期 / 撤销 / 已用码不能注册；同码并发仅一成功兑换，不能代替 OTP；已有账号不以新码登录。 | AUTH-01–04 |
| AC-02 | 重发 / 猜码 / 恶意注册触发服务端限制；短信故障无验证旁路。封闭内测未主动声明已满 18 岁不完成注册，不把声明视为年龄证明。 | AUTH-01–04、AUTH-10 |
| AC-03 | A 撤销另一会话、退出、换号或注销后，旧会话敏感调用失败；换号验证 / 恢复不可凭公开资料；注销清理可追踪失败重试。 | AUTH-05–10、DATA-01–04 |
