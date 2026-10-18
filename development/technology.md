# 固定技术栈与源码复用

以下技术栈固定，不为实现困难另换框架。包声明均固定到迁移前锁文件已解析的版本；本次不升级已有依赖。
实际依赖图以根 `package-lock.json` 为唯一版本来源，运行工具链以 `infra/ci/toolchain-lock.json` 为准。

| 层 | 固定选择 | 完整官方来源与复用方式 |
| --- | --- | --- |
| App | Expo 57.0.28、React Native 0.86.3、React 19.2.3、Expo UI 57.0.23 | Expo官方commit `58da4edafcb043872c3ed9bf8f5957e6544d0a9c`模板及bundledNativeModules；现有Expo Router/SecureStore与原生能力，生产源码在apps/mobile |
| App样式 | 免费Uniwind 1.12.2、Tailwind 4.3.3 | 原生语义className，global.css与packages/design token一致；保必要原生props/modifier/动态style |
| 后台 | Kiranism / Next.js 16.2.12 / React 19.2.4 / shadcn-ui / Tailwind 4.3.3 | [Kiranism源码](https://github.com/Kiranism/next-shadcn-dashboard-starter/tree/7705dfc0d13889e45c26a55ad5908da6a7a9a605)；保完整布局/导航/主题/表格/表单/组件，按官方扩展点接业务 |
| 分享Web | Next.js 16.2.12、React 19.2.4，现有apps/share | 只读分享协议，独立share-read用途，不用后台Cookie或App权限越权 |
| 后端 | Supabase官方self-hosted/v0.8.2 Compose，Postgres/Auth/Storage/Realtime/Edge Runtime | [Supabase源码](https://github.com/supabase/supabase/tree/564eab8ad7840b13324f68b1bfac074ef8d51c21/docker)完整保留于supabase/upstream/docker；项目覆盖在infra和自有core函数 |
| 语言/包管理 | TypeScript；Node 22.23.3 / npm 10.9.9 | 移动TS 6.0.3，后台/分享沿用各包现有锁定TS；不强行跨端改版本，npm workspaces与根锁统一安装 |
| 数据访问 | 官方Auth与Postgres现有接口、core访问网关和版本化SQL | 不自造Auth/Storage/Realtime平台，不用客户端高权直连绕过当前资格 |

后台完整原件及582项摘要映射保存在 `apps/admin/upstream-metadata/source-map.json`，最小适配见
[INTEGRATION](../apps/admin/INTEGRATION.md)。Supabase来源清单为 `infra/ci/supabase-source.json`，服务镜像按
`infra/ci/images.lock.json` 的digest运行，不能把许可证/依赖条目冒充源码复用。上游源码、来源原件和许可不能为迁文档而裁掉。

产品业务代码继续写在现有源码的接口/扩展点上。只有上游确无扩展点且当前需求必须时做最小可追踪补丁，记录原因、上游版本和验证；
不自造另一套平台、UI系统、认证或规格编译器。短信等供应商沿用现有受控适配，未供给真实资源时如实不可用。

App 与后台的 UI 必须先扩展各自共享层，再由页面复用。App 共享层依托 Expo/React Native 现有组件和 `packages/design` token；后台优先使用完整 Kiranism/shadcn 原件，只对产品共性做共享封装。公共框架、按钮、状态、图标和样式不得在各页面维护重复实现。

## 三工具固定搭配

| 工具 | 固定版本 | 在本项目中的职责 |
| --- | --- | --- |
| openapi-typescript | 7.13.0 | 从唯一OpenAPI生成三端编译期类型，现有消费者引用生成输出 |
| Prism CLI | 5.14.2 | 三端独立开发的HTTP模拟；core 5.8.0、http/server 5.12.0固定为Node22兼容组合 |
| Specmatic OSS | 2.55.3，镜像digest固定 | 对真实隔离后端运行契约校验，不启用付费模块 |
| Swagger Parser / AJV | 13.1.0 / 已有8.20.0 | 复用成熟解析和schema校验检查OpenAPI与固定示例，不自己写验证引擎 |

具体输入、镜像digest与端口在 `tools/api/toolchain.json`，npm版本及完整间接依赖在根锁文件。
OpenAPI固定3.0.3共同子集；不追随最新标准升级。Prism 5.16.0要求Node24，本项目未采用，也不为工具升级Node。
运行命令只是一层薄接线，负责调用这些官方工具、区分已实现操作和保存真实结果，不生成业务实现。

## 变更边界

不使用`^`/`~`的直接依赖版本范围，不执行任意latest/npx即时下载；`npm ci`安装已提交锁定输入。
生成文件不手改。冻结版本不是永久不修安全问题；必要升级先给用户具体版本、兼容影响和批准范围，再调整锁与验证。
原生依赖变化才由Actions重建APK/AAB/IPA；常规JS/TS/样式用现有Metro。真机arm64-v8a、模拟器x86_64，无32位。
