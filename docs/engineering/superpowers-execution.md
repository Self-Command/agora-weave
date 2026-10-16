# 当前原生执行器核验

本项目保持 Spec Kit 1.0.12、Superpowers 7.0.0 与已安装桥接，不升级技能。canonical `specs/001-agoraweave-v1/tasks.md` 是唯一任务契约；临时 adapter 只提取未勾选任务，使用原始任务行和一一对应的 Task N 标题，并引用宪法、规格与计划。

`.github/workflows/tooling-bootstrap.yml` 仅在 GitHub-hosted Actions 验证固定 gitlink、全部任务提取、Expected／接口／整体回归字段和真实 `task-done` 调用。原生 ledger 的 complete 行保留为原始工具结果；它不能替代有效证据，也不勾选 canonical 任务。`28500c22` 的 run38645599873 已实际保留完整285项映射、首末brief、原ledger／command与同SHA有效完成拒绝；新版本仍须重跑。后续已完成任务退出adapter后，剩余任务使用连续原生序号，canonical ID保持不变。文档本身不授予兼容或完成状态。

现行[ED-21](local-cloud-responsibility-decision.md)及宪法4.0.0允许本地真实开发测试/构建/调试，adapter按原任务标清本地开发命令和Actions独立复验/正式验收命令。本地Red先于实现、Green同oracle/fixture，记录实际环境、提交/差异及原报告；云端检查点独立复现必要Red和候选Green。历史测试、原生exit0、raw handoff或静态元数据不授有效complete；正式完成仍核同最终SHA全部适用Actions证据。

现有脚本的来源schema、runner-only入口和bridge准入尚需T033迁移并实测，不因文档更新授予可用结论，也不伪造GitHub变量绕过。沿既有接口最小适配、不升级技能或另造调度平台。当前切片直接依赖就绪后可本地开发，T051为完整核心收口；正式最低/当前OS及语义/媒体/辅助技术责任按simulator-validation保留，iOS当前按ED-20后置。
