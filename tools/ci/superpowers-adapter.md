# 临时适配协议

输入：canonical tasks、宪法、spec、plan 的当前文件与摘要。输出只在操作系统临时目录生成，不放入 `.superpowers/sdd/`；该目录由原生 Superpowers 管理。

每个未勾选且未 deferred 的 T### 对应一个 `### Task N: T###`，保留 canonical 原行及其路径。Expected、接口检查和整体回归要求来自原任务／云端验证契约，不引入第二份设计或任务完成依据。缺少任何 ID、重复映射、版本漂移或提取失败必须阻塞。

当前tooling-bootstrap采集原生提取与远端task-done行为；ED-21允许adapter按任务调用本地开发反馈入口，使用真实local来源、原始命令/退出/报告和提交/差异摘要。不得把本地运行命名为Actions或直接设置有效complete；当前提交的云端独立复验及正式证据门禁仍决定正式任务/阶段完成，raw原生完成不改变canonical tasks。新增来源与入口由T033适配并实测，兼容/远端拒绝在Actions检查点采集；文档不证明迁移已实现。
