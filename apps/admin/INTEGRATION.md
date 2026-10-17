# AgoraWeave 后台模板集成

完整来源为 Kiranism/next-shadcn-dashboard-starter 的固定提交
`7705dfc0d13889e45c26a55ad5908da6a7a9a605`，tree
`7ac574a2d4c2145c938e2f4ab5739320d551f7a0`。MIT 许可保留在 LICENSE。
全部 582 个上游文件均保全；逐文件 SHA256 与映射见
`upstream-metadata/source-map.json`。原件优先使用 `original_path`，否则为
`imported_path`。元数据、上游代理指令、钩子和工作流只作来源资料保存，
不覆盖项目治理或执行。未运行上游 cleanup，也未删减表格、表单、图表、
导航、主题、字体、业务样例及其源码。

## 开发入口

依赖由根 npm workspace 的 `package-lock.json` 统一冻结。
上游 `bun.lock` 仅保存原始来源，不建立第二套安装环境。使用项目 H 盘
运行区及固定 Node/npm，通过 `tools/dev/local.ps1 -Up -Services admin` 启动。
开发命令兼容：

```powershell
$env:AGORAWEAVE_ADMIN_TEMPLATE_PREVIEW = '1'
npm run dev --workspace apps/admin -- --hostname 127.0.0.1 --port 3000
```

只有 development、显式开关和 loopback 主机同时满足时才可查看官方合成样例。
开发启动必须绑定 127.0.0.1。生产及未开启预览默认 403；此处尚未连接真实
管理员 HttpOnly 会话、MFA、当前权限或业务 API，不能作为后台功能完成证明。
样例 products/users 的修改仅影响进程内合成数据。

## 最小适配

- providers、sidebar、user-nav、use-nav 和首页重定向采用同一固定提交自带的
  `scripts/cleanup-templates/clerk/` 官方无 Clerk 模板。dashboard 布局保留，
  仅移除 Clerk 身份调用并增加本机合成样例提示。
- Clerk 认证、组织、计费、profile、exclusive、外部 Pokemon 示例和未知路径
  在路由 guard 中拒绝；原件与源码完整保留，不配置 keyless 或外部身份。
- 默认禁止一切真实后台入口。导航可见性只属模板外观，不构成权限。
- 移除活动 Sentry 初始化/传输，以本地无外发适配保留官方错误边界。
  不读取 DSN、不上传源码或私人错误数据。
- package 保持上游无 `type` 字段；仅维护脚本目录声明 CommonJS，避免显式 CommonJS
  阻止 Turbopack 处理 TSX 的 ESM。移除 workspace 安装时的 Husky prepare，
  不覆盖根 hooks 或 React 跨端版本。components CSS 路径修正到官方实际样式入口。
- Oxlint 固定为上游 bun.lock 的 1.65.0，避免 npm 范围解析升级工具后改变固定源码的校验基准。
- 已批准共享 BusinessState 与状态 token 保留；旧单行首页及其布局样式退役。
- Turbopack root 显式指向仓库根，保留官方 bun.lock 来源文件而不将其误判为运行根。
- 原有 16 个 Google 字族改用 `next/font/local` 加载同款本地 WOFF2；保留 Latin 子集、
  原字重/可变范围、normal 样式、CSS 变量和全部主题，不使用系统字体替代。
  字体在 `src/components/themes/fonts/`，包含官方 Google CSS、每族许可证及
  `provenance.json` 的来源 URL、许可仓库固定提交和 SHA256。字体配置原件保留在
  source-map 的 original_path；开发和构建不再向 Google 下载字体。

上游 README 及 AGENTS 等描述仅证明该固定快照的原始内容，不覆盖项目当前规则，
也不表示上游样例已接入 AgoraWeave。后续真实业务按既有任务逐项接入，
仍须真实浏览器视觉、交互及权限复检。
