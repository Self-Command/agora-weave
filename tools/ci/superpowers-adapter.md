# 临时适配协议

输入：canonical tasks、宪法、spec、plan 的当前文件与摘要。输出只在操作系统临时目录生成，不放入 `.superpowers/sdd/`；该目录由原生 Superpowers 管理。

每个未勾选且未 deferred 的 T### 对应一个 `### Task N: T###`，保留 canonical 原行及其路径。Expected、接口检查和整体回归要求来自原任务／云端验证契约，不引入第二份设计或任务完成依据。缺少任何 ID、重复映射、版本漂移或提取失败必须阻塞。

当前 `tooling-bootstrap.yml` 采集原生提取和远端 task-done 行为。有效任务完成必须另外通过当前提交的云端证据门禁；raw 原生完成不改变 canonical tasks。所有实际执行、兼容探针和拒绝结果在 Actions 采集，adapter 退出时清理。
