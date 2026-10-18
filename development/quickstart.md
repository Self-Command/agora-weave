# 开发、mock与真实验证

2026-10-18当前执行以[快速开发与人工验收](delivery-mode.md)为准：App/后台用户验收，禁止日常UI复检，仅用户反馈样式/布局后定向检查，三端持续开发及热更新，日常最小工程/后端检查，完整流程最后集中执行。

从[架构](architecture.md)、[固定接口](contracts/README.md)、对应[功能文档](features/)和[实现指南](implementation/README.md)读取本次范围；页面先复用[现有设计来源](ui/pages.md)，App/后台按当前交付方式直接实现后由用户验收。源码留当前工作树，依赖/运行副本/缓存/报告固定`H:/Projects/AgoraWeave/development`。共享DB、运行区、浏览器/设备串行；各端独立mock和类型检查可并行。

## 固定契约的独立开发

OpenAPI采用3.0.3共同子集：`development/contracts/app-api.yaml`、`management-api.yaml`、`core-admin-api.yaml`。只有主控协调改契约；consumer不手改生成文件。以下命令在已安装当前锁定依赖的工作区运行，具体脚本由仓库package.json和工具配置执行：

```powershell
npm run api:generate
npm run api:check
npm run api:mock:app
# 另一独立进程按需要运行：
npm run api:mock:admin
npm run api:mock:core-admin
```

openapi-typescript生成`packages/contracts/src/generated/{app,management,core-admin}.d.ts`；Prism输出模拟响应。App读app契约，后台UI读management，BFF读core-admin。Prism完整base为App `http://127.0.0.1:4010/core/api/v1`、浏览器管理 `http://127.0.0.1:4011/api/management`、BFF core `http://127.0.0.1:4012/core/api/v1`，以命令实际输出与配置为准，mock不获取生产秘密或共享DB身份。mock仅用于端内状态和结构反馈，不算真实API集成。

真实本地测试服务就绪后，以Specmatic检验对应surface中`x-implementation=implemented`的操作：

```powershell
npm run api:verify -- --surface app --base-url <local-test-url> --operations listLatestPosts --filter "STATUS='200'" --anonymous --client-release fixture-v1
npm run api:verify -- --surface admin --base-url <local-test-url>
npm run api:verify -- --surface core-admin --base-url <local-test-url>
```

`<local-test-url>`替换为工具要求的实际测试base URL；不得指向Prism后宣称集成通过，planned路由不能被mock成功算实现。需要登录/MFA/fixture时只用隔离合成身份，按工具支持的鉴权方式提供，不把token/secret放命令日志。结构验证还需业务/API/权限/并发与真实交互证据。

## 复用唯一运行环境

统一入口`tools/dev/local.ps1`读取`infra/development/policy.json`和`infra/ci/toolchain-lock.json`，固定Node22.23.3/npm10.9.9。先实查状态，健康服务复用，缺依赖才显式Install；Install前停止托管Node服务，不自动reset/seed。

```powershell
pwsh -NoProfile -File tools/dev/local.ps1 -Status
pwsh -NoProfile -File tools/dev/local.ps1 -Prepare
# 仅缺失/锁定依赖变化且托管Node服务已停时：
pwsh -NoProfile -File tools/dev/local.ps1 -Install
# 接真实账号/后台时，按需选择服务：
pwsh -NoProfile -File tools/dev/local.ps1 -Up -Services supabase,api,admin,metro
# 新迁移单独明确执行；不与其他DB操作并行：
pwsh -NoProfile -File tools/dev/local.ps1 -Up -Services supabase -Migrate
```

迁移按登记依赖拓扑及已应用摘要核验，不照编号排序、不开重复容器组、不改已应用SQL，见[数据库说明](database/migrations.md)。Prepare/Up/Command会同步唯一H盘源码副本，必须协调资源所有者；独立工作树不会隔离运行区。

api可选服务仅监听`127.0.0.1:4821`，通过原官方内部网关固定core路由；11服务内部网络不映射任意源站。后台默认3000、Metro8081，实际入口每次Status确认，端口可显式参数调整。API/管理秘密由原runtime配置提供，浏览器只持加密cookie。Android需要时`adb reverse tcp:4821 tcp:4821`，结束按需解除。切连接模式先Stop对应admin/metro再Up；Stop api不停止Supabase或删卷。

官方模板预览仅本机127.0.0.1且显式`AGORAWEAVE_ADMIN_TEMPLATE_PREVIEW=1`；这只是完整模板合成数据预览，不代表真实管理资格。真实后台路径包括`/admin/login`、`/admin/mfa`、`/dashboard/identity`、`/dashboard/configuration/otp`，入口存在不等当前服务就绪或全部验收。

## 按影响选择实际检查

```powershell
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('npm','run','ci:discover')
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('node','--experimental-strip-types','tools/ci/core-entry.ts','target','core.auth-otp-policy')
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('npm','run','typecheck','--workspace','apps/mobile')
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('npm','run','typecheck','--workspace','apps/admin')
pwsh -NoProfile -File tools/dev/local.ps1 -Command @('npm','run','lint:strict','--workspace','apps/admin')
```

从当前`ci:discover`/`tools/ci/validation-manifest.json`选择真实目标；上例otp目标仅示例，不能冒充本次全部适用集合。DB/夹具目标串行。`ci:contracts`保既有有效工程/安全测试，`ci:core`执行全部登记集合，按实际阶段/发布需要使用，不因文档编辑重跑无关业务。App/后台可独立typecheck与构建，Next构建使用既有npm workspace脚本；native安装包只Actions编译。

普通JS/TS/Uniwind样式直接Metro更新，后台Next开发服务自动刷新；原生依赖/代码/config plugin/runtime兼容变化才触发已有Actions。Android真机arm64-v8a、模拟器x86_64，无32位。日常由用户验收App/后台，UI角色只在用户报告样式/布局问题后定向检查，平时禁止工作；完整设备流程在功能齐备后集中执行。

## 结果与交付

日常只做可运行增量所需类型/编译/契约检查及必要后端权限、安全、事务/并发/数据完整性验证；不反复跑前端逻辑/UI巡检或完整联调。用户反馈、修复待复查、失败/未执行与实际通过分别记录；完整流程最后集中跑。

完整产品场景见[验收场景](implementation/validation-scenarios.md)，媒体实际下载/策略消费见[媒体指南](implementation/media.md)，当前账号0044/AR05及未完成边界见[账号](implementation/accounts.md)。生产服务独立部署，服务器/域名/短信/正式分发由用户配置；Actions通过不授权生产、费用或高影响数据操作，仍需具体版本/对象/范围确认。
