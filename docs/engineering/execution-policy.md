# 执行政策（ED-23 现行）

依据宪法 5.2.1 与 [Codex 直接开发决定](codex-direct-development.md)。
Codex 直接依据现有 SK 规格、计划、任务和源码实施。SP、桥接、准入收据、历史红链认证和
重复报告／归档回读编排已移除，不恢复这些入口，也不另建执行框架。

先读当前切片的约束与代码，完成一个可验证的业务批次；按风险运行目标检查及直接受影响回归。
关键权限、安全、数据完整性和缺陷修复必须有有效测试。真实 API／DB／App 结果支持功能结论；
失败、跳过、未执行、取消、超时和环境故障如实记录。完整范围完成才勾任务，285 个 ID 保留。

页面先接入 `docs/design/prototype/index.html` 的现有导航、主题和组件，参考 UI-SPEC 与 token；
用户明确验收该版原型后，再实现原生生产页面。待验收草稿不授实现资格。
移动端继续 Expo、React Native、Expo UI，不改为移动网站或 WebView。

所有 APK／AAB／IPA 编译由 GitHub Actions 执行，本地仅下载安装和复检。
Android 真机包 arm64-v8a，模拟器包 x86_64，不新增 32 位构建。
普通 JS／TS 与样式用已有开发包和 Metro／Fast Refresh；原生依赖／配置变化才按需重建。
Actions 按批次或发布需要运行，等待时继续不受影响的工作；不每次编辑跑完整矩阵。

源码在原工作树，运行入口 `tools/dev/local.ps1` 将工作文件同步到 H 盘运行工作区。
私有服务配置位于该工作区 `.agoraweave/local/{environment}/runtime`；沿用当前唯一开发容器组及数据卷。
设置 `AGORAWEAVE_EXECUTION_SOURCE=local` 与 `AGORAWEAVE_LOCAL_ENVIRONMENT=dev` 后：

```powershell
pwsh -NoProfile -File tools/dev/local.ps1 -Prepare
# 下列 npm 命令在 H:/Projects/AgoraWeave/development/workspace、固定 Node 环境运行
npm run ci:discover
npm run ci:health
npm run ci:migrate
npm run ci:seed
node --experimental-strip-types tools/ci/core-entry.ts target core.auth-recovery-requests
```

`ci:core` 执行当前全部已登记核心用例；日常优先具体 target 或对应 suite。
`ci:contracts` 运行保留的工具安全／隔离测试；`ci:typecheck`、`ci:lint` 按变更选用。
迁移核验已应用文件摘要与显式依赖，不原地改已应用迁移。日志保留实际来源、版本和真实结果。

工程普通可逆选择自主处理。产品范围、技术栈、安全／隐私、费用、不可逆数据或生产操作改变，
按宪法第九条取得具体决定。原型验收遵宪法第六条；规范变更遵 AGENTS 的全分支同步要求。
本次清理完成、复检并交付新窗口提示词后停止，不自行开始新的业务批次。
