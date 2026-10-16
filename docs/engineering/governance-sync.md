# 规范同步基线

现行规范是 ED-22 与宪法5.0.0。规范文件清单见 `tools/dev/governance-sync-manifest.json`。

规范变更必须在同一变更中执行：

```powershell
pwsh -NoProfile -File tools/dev/sync-governance.ps1 -AllBranches
pwsh -NoProfile -File tools/dev/sync-governance.ps1 -Verify
```

同步命令会把规范文件复制到所有已登记 worktree，并为未签出的本地分支创建只含规范变更的同步提交；目标树中的未提交规范文件先备份到 `H:/Projects/AgoraWeave/development/backups/`。同步校验会比较所有 worktree 和本地分支的规范文件 SHA-256，任何漂移都会失败。

`-Publish` 基于每个远端分支原提交叠加规范后普通快进推送，保留远端业务树，不夹带本地业务提交、不强推。删除／重命名按受管目录与目标树差异传播，旧文件先备份；二进制规范附件保持原字节。历史标签与旧提交不改写。

Git传输不可用时可用同仓库GitHub接口：`pwsh -NoProfile -File tools/dev/sync-governance.ps1 -AllBranches -Publish -GitHubApi`。接口发布先逐项校当前规范及未受管业务blob未变，再以原远端提交为父提交快进更新并回读ref；结果存H盘reports/governance-remote-sync.json。

共享Git目录的 `post-commit`／`post-checkout` 钩子在规范提交或切换分支后调用同步，递归同步有显式保护；`tools/dev/local.ps1` 对应的实际开发入口在运行前校验。远端发布与本地来源分别保持各自代码历史，规范相同不能推导源码或测试状态相同。

业务代码、未完成迁移、测试和报告不属于规范同步清单；它们必须保留原事实，不能被同步操作伪装成已完成。历史决定、历史报告和 bridge snapshot 继续保留，但只能作为历史资料读取，不能覆盖现行规则。

`tools/dev/local.ps1` 在执行本地命令前自动运行同步校验。任何 worktree 或分支存在规范漂移时，先修复同步，再开始开发或测试。
