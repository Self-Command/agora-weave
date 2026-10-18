# 账号、后台身份与必要配置的现有实现

这是2026-10-18对当前文件的技术定位与未完成边界。没有运行DB、浏览器或设备；以下源码和测试存在不等于它们在当前提交全部通过。历史结果只证明对应版本，最新整体验证由主控按实际日志更新。

## 可复用的真实路径

| 能力 | 已有源码/测试 | 实现语义 |
| --- | --- | --- |
| 公有OTP及结果恢复 | `supabase/functions/core/routes/public-auth.ts`、`identity/public-input.ts`、`identity/ingress.ts`、`adapters/supabase-phone-auth.ts`、`adapters/aliyun-sms.ts`；迁移0034–0037 | 网关/IP绑定、环境keyed摘要，当前邀请/年龄/正式条款原子准入；官方Auth验证、短期加密回执；unknown只查原operation，不重发/重验 |
| App账号 | `apps/mobile/src/features/account/`内api/controller/session-store/AuthPages/SecurityRecoveryPages | 复用真实API、SecureStore、刷新/撤销/退出与恢复申请；保输入/operation及明确unknown，不恢复假身份 |
| 管理身份/MFA | `routes/admin-identity.ts`、`adapters/supabase-admin-mfa.ts`、`identity/admin-policy.ts`、迁移0038/0044 | 当前环境grant、签名aal2、Auth session/factor/AMR与一次动作stepup；数据库aal升级不能让旧aal1 JWT获得管理资格 |
| 后台/BFF | `apps/admin/src/features/management/`、`src/app/api/management/`、`src/app/admin/`与`src/app/dashboard/{identity,configuration}` | 完整Kiranism中手机号/区号、MFA、真实身份、必要配置；浏览器仅加密HttpOnly cookie，写请求同源JSON及CSRF，刷新后重新核当前管理资格 |
| OTP配置 | `routes/configuration.ts`、`packages/config/src/`、迁移0038/0039 | 六项现有OTP配置完整bundle预览/CAS/stepup/发布/回滚，回滚生成新版本；旧challenge保原期限预算、不清历史限流 |
| 备用密码入口 | `routes/admin-password.ts`、`adapters/supabase-admin-password.ts`、迁移0040/0041/0043；`tests/contract/admin/password-fallback.spec.ts` | 用户名/密码、图形验证码、忘记密码受理入口；默认关闭，未初始化真实账号不宣称可用，受理不等重置成功 |
| 访客最新流 | `routes/discovery.ts`、`routes/discovery-cursor.ts`、迁移0042、`apps/mobile/src/features/feed/` | API/controller存在；生产首页尚未接入，复用已有原型先核具体批准，不能凭controller成功宣称首页完成 |

六项既有工程初值为`auth.otp_lifetime_seconds=300`、`auth.otp_resend_seconds=60`、`auth.otp_max_failures=5`、`auth.otp_phone_hourly=5`、`auth.otp_phone_daily=10`、`auth.otp_ip_hourly=30`。后台`/dashboard/configuration/otp`只管理此集合；其他namespace/consumer和完整外观配置闭环仍分别核实际消费，不因注册就宣称完成。

官方Auth首次手机号TOTP需要内部不可投递标签的适配，不增加产品邮箱身份、邮箱确认或密码注册。MFA二维码有界承接1MiB（SVG768KiB），普通MFA响应仍限64KiB；只凭有email夹具通过不能代真实手机号完整链。bootstrap只给私有运维入口、每环境一次，无公开自授管理员HTTP入口。

## 0044与AR05的当前增量

[`0044_auth_session_retirement.sql`](../../supabase/migrations/0044_auth_session_retirement.sql)适配官方MFA删除旧aal1会话：删除Auth行时退休核心registry，保留不可变会话历史和安全账本；账本失败回滚Auth删除，缺失Auth行永不授权。不得重写0001等已应用SQL。

[`tests/contract/auth/admin-routes.spec.ts`](../../tests/contract/auth/admin-routes.spec.ts)新增AR05，使用第二个真实OTP会话升级官方MFA，检查被删旧Auth会话的registry tombstone与历史不可变性。该目标已发生增量，旧“4项HTTP”或原11目标152/152不覆盖新增用例；当前迁移仓库共56份，也不能再以原55条摘要报告宣称当前状态。此处只核了源码，运行结论必须读取主控本轮实际结果。

## 历史证据定位

私有SQL切片`7cabbe4301094bdbbb06641def67e1e1050479fb`报告在`H:/Projects/AgoraWeave/development/reports/core-accounts-20261017/`；公有切片`1654a216ffa5b599e31127bad9586dab131fd946`在`.../reports/core-accounts-public-20261017/`。账号App/后台合并证据在`H:/Projects/AgoraWeave/development/reports/account-app-admin-20261017/`，其中原失败、修复和窄复验各按真实版本读取，不覆盖失败或转写为当前全通过。仓库已有`tests/contract/admin/management-{boundary,controls,bff-refresh,qr}.spec.ts`、`tests/contract/auth/{mobile-client,refresh,admin-routes}.spec.ts`等有效测试，继续保留。

本次文档迁移没有执行这些测试，不重复发布旧数字。查看实际目标用`ci:discover`和`tools/ci/validation-manifest.json`，按当前影响选目标，DB目标串行。

## 真实未完成边界

真实短信签名/模板/凭据/获准接收对象及到达验证、完整五页原生旅程与全部适用整页验收、分享登录、换号/恢复/注销全链、角色邀请分配、MFA丢失恢复、分类物理清理、备用密码真实初始化及端到端验收、访客生产首页接入、完整配置consumer/外观闭环与生产运行均不能由当前部分实现推断完成。服务器、域名、短信、正式签名/分发由用户配置，缺资源只暂停依赖动作。实际本机BFF/UI/MFA与light布局的最新结果以主控本轮日志为准，页面登记历史导航文案不能覆盖当前源码，也不能自动授新页面批准。
