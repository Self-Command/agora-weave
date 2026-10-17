# 批次01：真实账号入口与必要配置

状态：待实施。基于Phase2已有成果，2026-10-17按用户已批准基础运营分期进入US1；本文件描述有界实施，未增加任务或声称测试通过。

## 目标、输入与边界

首先打通可信公有challenge/verify与受控Auth连接，使已有账号r2页面消费真实协议；同步补该链实际使用的配置消费。关联T052/T054/T056/T057/T058/T061/T062及T141–T148当前消费者，管理员身份/MFA后续接T053/T060/T063，完整US1仍含换号/恢复/注销、真实短信及T064验收，不能以此批完成勾整项。

输入：[spec](../spec.md) FR-001–008/130–141、[HTTP契约](../contracts/http-api.md)、[配置契约](../contracts/configuration.md)、[模型](../data-model.md)、[任务](../tasks.md)、[当前状态](../../../docs/engineering/current-development-state.md)。先查当前源码、已有target与运行配置，不重写已有原子准入、刷新/撤销/退出、恢复申请、operation查询与OTP重放保护。

主要现有文件：supabase/functions/core/identity.ts、routes/auth.ts、routes/account-security.ts、documents/read.ts（后三者均位于supabase/functions/core/），packages/config/src/definitions.ts，移动account特性及相关测试；准入/登录/OTP已有0105、0107、0110及0029等迁移。identity/和adapters/子目录是原计划新增定位，当前不存在，不作现有实现。新增短信适配器路径在本批明确后建立。迁移只追加未占用编号，不原地改已应用迁移。公共契约/配置/编号由主agent协调；后台真实设置入口依当前管理权限/MFA完成次序接入，未就绪明确列剩余。

本批不开发内容/关系/AI/插件等后续能力。账号r2批准可复用；未获批新页面/新状态先原型批准。短信签名/模板/凭据/获准接收对象与生产资源由用户搭建，合成适配器不得成为生产旁路或对外成功事实。

## 最小实施顺序与验收

1. 盘点公有challenge/verify路由、可信手机号/IP摘要来源、真实Auth OTP代理与返回契约，明确已有能力和缺口。未知用途/环境、非法输入和未注册方法默认拒绝；不让客户端自报已验证手机号、Auth身份或服务端摘要。
2. 贯通challenge用途/当前条款集合/age版本、过期/重发/错误/限流/消费及重放；注册以真实Auth手机号证明、唯一邀请、18岁主动声明及当前条款明确同意原子准入；已有登录不追加注册同意。并发至多一效果，旧条款、旧challenge与跨环境拒绝，短信失败不返回伪成功。
首登配置边界：当前mobile effectiveConfig要求登录，不开放整条配置鉴权。未登录账号页只消费challenge公开的expires_at/retry_after等契约字段；确需公开的非敏感投影须按既有注册/audience白名单单独定义，不下发手机号/IP限流内部事实、OTP或秘密。

3. 完成真实会话绑定和既有controller消费，unknown用同一operation查询，重复/不同payload冲突如实反馈；刷新/退出/撤销核当前资格，旧JWT后续访问拒绝。不得返回OTP/secret或把受理说恢复成功。
4. 配置贯通下表，服务端权威校验、客户端消费非敏感投影和retry_after等真实字段。管理入口使用正式权限/API；未完成管理身份前不能开放假管理员。高级可视化不前置，当前必要设置/预览/生效/回滚必须在本批交付边界明确落实或列未完成。
5. 后端目标通过后集中接账号r2页面；真实认证可达时做组件触发/原生交互及本地整页设计复检，资源未齐明确未验项。完整任务和真实短信旅程在全部适用要求满足前不勾。

## 当前配置闭环

以下是现有工程初值，不是新增产品参数。先核definitions和0029等当前实现，沿用既有key；缺key才按配置契约注册，不为所有未来模块铺表。

| 行为/初值 | 定义、权限与管理入口 | 消费与验证 |
| --- | --- | --- |
| OTP有效5分钟、重发60秒、错误5次 | auth.otp_lifetime_seconds=300、auth.otp_resend_seconds=60、auth.otp_max_failures=5，既有schema/范围/权限以definitions为准；后台位置/API待真实管理身份就绪后落实，不冒称已有控制台 | challenge服务和真实过期/重发判定消费当前合法值；App只读expires_at/retry_after，测试生效和回滚，不能只登记默认 |
| 手机号5/小时10/日、IP30/小时 | auth.otp_phone_hourly=5、auth.otp_phone_daily=10、auth.otp_ip_hourly=30；沿现有定义核窗口/范围/授权发布与审计，后台入口/API待落实；可信摘要不由客户端替代 | 服务端原子限流、重放/并发，客户端真实等待/错误反馈；改值不清历史消费或绕安全，验证回滚 |
| 已开放UI主题/外观值 | ui.supported_themes=[light,dark]；区分平台支持主题与本人本机选择；当前后台位置/API待落实，不新增任意管理员控制个人偏好 | App语义token/真实状态消费，配置不可用安全回退；必要后台入口/API和前后版本可查 |

上述精确key与默认已登记，允许范围/修改角色引用现有definitions，实施时补实际后台页面/API、服务端/客户端消费路径及版本/生效/回滚结果。登记不等实现；未有运行能力的未来开关不创建，认证/RLS/隔离/审计/只读等核心不变量不可关闭。

## 执行命令与资源

从源码根先读取规范并Verify；主agent集中同步变更。以下为现有入口，执行前核package.json及目标发现；H盘Node和dev环境由local.ps1提供，不伪造Actions身份。共享DB目标串行，主控先确认运行副本/服务所有权。

```powershell
pwsh -NoProfile -File tools/dev/local.ps1 -Status
pwsh -NoProfile -File tools/dev/local.ps1 -Prepare
# 按需要显式 -Up -Services supabase；新增迁移才显式 -Migrate
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('npm','run','ci:discover')
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('node','--experimental-strip-types','tools/ci/core-entry.ts','target','core.auth-otp-policy')
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('node','--experimental-strip-types','tools/ci/core-entry.ts','target','core.auth-registration')
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('node','--experimental-strip-types','tools/ci/core-entry.ts','target','core.auth-concurrency')
```

上述目标已存在，改动后按发现补选会话/刷新/网关/配置和移动受影响target；不因清单示例漏掉新行为。typecheck/lint按改动包执行。Actions verify-increment可按core_targets定向复验，安装包仅原生变化时按现有Actions重建；阶段/发布运行当前适用完整集合，不把目标通过称全产品完成。

## 停止条件与实际记录

安全/权限/事务规则冲突，需费用/生产/高影响数据动作或改变已批准设计时按宪法九取得具体决定，仅暂停依赖项。短信或原型资源未齐时继续独立后端/配置/测试，不制造假session、短信或页面批准。禁止改共享运行区时继续只读/独立源码工作，不能并行争用DB。

本批完成需真实接口/配置消费者、相应测试与原生/本地复检证据及剩余边界清楚；缺真实SMS则明确“实现/隔离测试完成，真实短信旅程未验证”，不勾完整T058/T064。实际命令、源码版本、环境、结果和必要日志路径在此处简记；本轮文档清理未运行本批业务验证。
