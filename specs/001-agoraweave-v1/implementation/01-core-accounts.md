# 批次01：真实账号入口与必要配置

状态：实施中，原账号 App 接入与后台真实身份/MFA/必要 OTP 配置两批合并收尾。关联 T052–T064、T141–T148；285 个任务仍为 51 项勾选、234 项未完成，局部实现和隔离验证不勾完整任务。本轮运行时源码尚未提交，最终源码摘要及提交由主控核对后补记。

## 目标、输入与范围

输入：[spec](../spec.md)、[plan](../plan.md)、[HTTP契约](../contracts/http-api.md)、[配置契约](../contracts/configuration.md)、[模型](../data-model.md)、[任务](../tasks.md)及[执行政策](../../../docs/engineering/execution-policy.md)。复用已有 OTP、原子准入、会话、恢复申请及 operation 查询，不重生成规格或任务。

本批范围为现有 App 账号 controller/API/控件、完整 Kiranism 下的 `admin/login`、`admin/mfa`、`dashboard/identity`、`dashboard/configuration/otp` 与服务端 BFF，core 管理身份/配置路由、官方 Auth TOTP 适配及追加迁移。账号 r2 已批设计沿用，不重画；后台直接使用完整 Kiranism 现有 UI，无需另画原型。每次分派前主控亲核原型、实现、任务、依赖和授权，仅派缺失增量。

已实现公有 `POST /auth/challenges`、`POST /auth/verify` 与同验证 body 的 `POST /auth/operations/{id}`：当前邀请/年龄/条款绑定、受信网关/IP、环境 keyed 摘要、官方 Auth Hook 与阿里云单次发送、真实 Auth 验证、短期加密回执及独立过期密文清理。unknown 只查原操作，不自动再次发送或验证；撤销后不返回原令牌。不开放匿名配置 snapshot 或客户端自报身份/摘要。

本轮 App 接入保留原验证输入与 operation；后台手机号登录新增国家区号 Select 与本国号码输入，MFA、管理账号和六项 OTP 配置接真实接口。新签名 aal2、当前 Auth session/factor/AMR、管理 grant 和动作绑定 stepup 共同约束配置预览、发布、CAS 与回滚；旧 aal1 JWT 不因数据库升级获得管理资格。令牌保留在 BFF 服务端加密 cookie，写接口核同源，必要密码入口另核服务端 HMAC。

用户名密码、图形验证码、忘记密码入口 UI 已接现有官方模板，备用登录整体仍默认关闭；尚未完成端到端验收及初始化真实用户名密码，不表示已有可用账号。忘记密码仅申请受理，不能写成密码已重置。

## 配置消费与生效边界

沿用六个既有工程初值：`auth.otp_lifetime_seconds=300`、`auth.otp_resend_seconds=60`、`auth.otp_max_failures=5`、`auth.otp_phone_hourly=5`、`auth.otp_phone_daily=10`、`auth.otp_ip_hourly=30`。类型、范围、修改权沿 definitions/registry；后台入口为 `dashboard/configuration/otp`，API 为 `/admin/config/definitions`、`previews`、`releases`、`rollbacks` 与 `/admin/stepup`，详见现有 HTTP 契约。

0034 复用官方 `pg_jsonschema` 校验完整活动 bundle/registry，私有消费六值；challenge 固化期限、冷却、错误预算和版本，当前发送配额继续统计历史，生效/回滚不清消耗或复活终态。0035 原子准入核真实手机号、challenge 后建立的 OTP session/AMR；准入失败回滚正确验证码消费，错误尝试仍保留。0036/0037 提供公有 broker/Hook 与回执。客户端只消费合法字段及真实 expires_at/retry_after；`ui.supported_themes` 的登记不等于全部外观配置闭环，个人偏好及核心安全不变量不作任意管理开关。

## 实际执行与证据

历史私有 SQL 切片源码 `7cabbe4301094bdbbb06641def67e1e1050479fb`：8 目标 78/78、工程契约 57/57，证据位于 `H:/Projects/AgoraWeave/development/reports/core-accounts-20261017/`。公有后端切片 `1654a216ffa5b599e31127bad9586dab131fd946`：11 目标 124/124、工程契约 57/57，证据位于 `H:/Projects/AgoraWeave/development/reports/core-accounts-public-20261017/`。历史报告仅证明各自所记源码；原失败、实际命令和摘要保留在原目录，不以旧 HEAD 代替当前验证。

本轮证据集中在 `H:/Projects/AgoraWeave/development/reports/account-app-admin-20261017/`。继续复用唯一 dev 组与原数据卷，0038–0043 均显式追加；最近迁移核验为追加 1 条 0043、核原 54 条，总 55 条摘要匹配，未 reset/seed。0043 修复 0041 手机号 regex，不改已应用迁移。Node 固定 22.23.3、官方 Auth 固定 2.196.0，本轮无本机原生构建或生产应用。

以下原两批 11 个目标由主控经 `local.ps1 -Command` 串行执行 `node --experimental-strip-types tools/ci/core-entry.ts target <id>`，实际 152/152：

| 目标 | 实际通过 |
| --- | --- |
| core.admin-identity | 10/10 |
| core.admin-otp-configuration | 14/14 |
| core.admin-routes | 4/4 |
| core.admin-management-boundary | 39/39 |
| core.admin-mfa-adapter | 12/12 |
| core.auth-mobile-client | 51/51 |
| core.design-components | 9/9 |
| core.auth-refresh | 2/2 |
| core.auth-session-commands | 3/3 |
| core.effective-configuration | 4/4 |
| core.auth-operation-results | 4/4 |

工程检查 68/68、tools/mobile/admin TypeScript 与 admin oxlint 已通过。password adapter 的 TypeScript/ESLint 初次失败已修正，窄复验待主控补结果，暂不记通过。真实官方 Auth/TOTP、管理配置发布、operation 及撤销的 4 项 HTTP 验证通过；本机 BFF/UI 完整链与剩余 light 布局复检正在执行，待主控补结果，不能由上述 SQL/HTTP 通过推断 UI 验收。

官方 TOTP 探测已证明当前镜像真实生成二维码并在同 session 升级签名 aal2/totp AMR；二维码响应约 463037 bytes，enroll 有界承接 1 MiB、SVG 768 KiB，其他 MFA 响应仍限 64 KiB。空 email 手机号用户的官方 enroll 失败已实际发现，兼容处理与手机账号完整链须以主控后续结果为准，不能用有 email 夹具冒称通过。所有失败和修正均保原始证据，不删除有效测试。

访客公开最新流 API/controller 已写，纯移动客户端 6/6 单独记录，不计入原批 152 项；尚未接生产首页。重复 guest 原型已删除；继续前先审现有首页原型与批准记录，复用已批设计，不再次重画。

## 后续验收与停止边界

先完成 password adapter 窄复验、本机 BFF/UI 完整链及当前稳定版本 light 布局复检，核实际命令、源码摘要、最终提交与受影响项；独立 UI 角色仅查布局样式，单主题、不查功能交互或重复 dark，功能交互仍由业务、组件及原生验证完成。主控集中治理同步与提交。

真实 SMS 签名、模板、凭据、获准接收对象、服务器、域名与正式分发由用户搭建；默认公有发送关闭，隔离模拟供应商接受不等真实短信到达。原两批实现/隔离验证收尾之外，完整五页原生/视觉旅程、换号/恢复/注销、角色邀请分配、MFA 丢失恢复、分享登录、分类物理清理及生产仍未完成。备用用户名密码初始化及端到端验收未完成；访客生产首页接入属后续增量。

范围/技术栈/安全隐私改变、费用、高影响数据或生产操作按宪法九取得具体决定，仅暂停依赖动作；普通可逆实现按现有授权继续。完整任务满足前不勾 T052–T064 或 T141–T148 整项。
