# 当前原生执行器核验

本项目保持 Spec Kit 1.0.12、Superpowers 7.0.0 与已安装桥接，不升级技能。canonical `specs/001-agoraweave-v1/tasks.md` 是唯一任务契约；临时 adapter 只提取未勾选任务，使用原始任务行和一一对应的 Task N 标题，并引用宪法、规格与计划。

`.github/workflows/tooling-bootstrap.yml` 仅在 GitHub-hosted Actions 验证固定 gitlink、全部任务提取、Expected／接口／整体回归字段和真实 `task-done` 调用。原生 ledger 的 complete 行保留为原始工具结果；它不能替代有效证据，也不勾选 canonical 任务。当前云端拒绝探针还需实际结果读取，不能把这份文档当作兼容通过。

实际项目验证命令须调度并读取 Actions，按同 SHA 的必需集合核验。历史测试成功、原生 exit 0、raw handoff complete 与静态元数据都不授予有效 complete。临时 adapter 在云端探针退出时清理；未就绪的物理通道继续阻塞初始化准入。
