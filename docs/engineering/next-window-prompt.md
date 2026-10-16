# 新窗口继续开发提示词

在 C:/Users/by970/Desktop/my-project 的当前分支继续 AgoraWeave 开发。
先读取 AGENTS.md 和 .specify/memory/constitution.md，运行
`pwsh -NoProfile -File tools/dev/sync-governance.ps1 -Verify`，再读取
`docs/engineering/execution-policy.md`、`docs/engineering/current-development-state.md`
及当前切片涉及的规格、任务和源码。以当前文件和实际结果为准。

SP 插件、桥接、强制钩子和纯流程平台已按 ED-23 清理。直接使用现有 SK 资料与 Codex 原生能力，
不要重装 SP／桥接、重建收据认证、重生成 285 个任务或另起执行框架。
已有账号实现保留，AM02 已修复，不重复开发；业务完整任务仍未完成，不能按局部证据全部勾选。

先检查现有账号原型草稿：docs/design/prototype/index.html 及 account-pages.css／js。
参考 UI-SPEC、design-tokens 与原有 v6 原型，完善同一入口中的登录、注册、验证码、会话安全和
恢复申请页面及适用状态，实际打开给我验收。账号草稿尚未获我明确通过；通过后才调整生产页面。
移动端仍用 Expo、React Native、Expo UI，不走移动网站／WebView 路线。

等待原型验收期间，可继续与页面无关且已授权的账号后端缺口，按真实依赖选一个小切片推进。
真实短信接入暂缓，不用合成用例声称真实短信登录完成。现有私有注册／登录绑定、会话撤销／刷新、
操作结果查询、恢复申请能力不等于完整公开 challenge／verify、无登录恢复、补证／审核／恢复执行。

通过 tools/dev/local.ps1 使用 H:/Projects/AgoraWeave/development/workspace；沿用现有唯一开发容器组和数据卷，
私有配置在 .agoraweave/local/dev/runtime。按风险运行目标与直接受影响回归，保留真实失败和未验证项。
普通 JS／TS 复用已安装开发包及 Metro；所有安装包由 GitHub Actions 编译，本机仅下载安装复检。
Android 真机 arm64-v8a，模拟器 x86_64，不新增 32 位构建。规范修改按 AGENTS 同步所有工作树和分支。
若确需子 agent，显式选用 gpt-6.1-sol、gpt-6-sol 或 gpt-5.6-luna 并核对实际模型，不继承或回退到其他模型。

完成一个可验证的小批次，简短报告实际实现、真实测试和剩余项；不以反复整理历史报告代替开发。
