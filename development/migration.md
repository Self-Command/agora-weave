# 迁移与成果保留

2026-10-18用户批准落实最后调研版本，保现有成果/原型，迁完删旧spec/plan/tasks/宪法。

迁移前快照：`H:/Projects/AgoraWeave/development/backups/contract-first-20261017/source-before.zip`；
SHA-256清单为同目录 `source-before.json`。共1,080份非忽略文件，包含未提交代码、SQL和测试。
快照不是开发入口，Git历史同时保留旧资料。

| 原材料 | 新承载 |
| --- | --- |
| PRD/需求复核 | 原位置保留，仅修活动入口与退役流程引用 |
| 17旅程、FR/QR、AC和任务内验收义务 | features/coverage，未复制285项任务表 |
| 技术方案、模型、有效领域协议 | architecture、database、contracts、implementation |
| 安全/产品/技术/设计原则 | README、technology、decisions、acceptance、AGENTS |
| 运行、批次和状态 | quickstart、implementation、status；原运行证据保留 |
| 原型HTML/JS/CSS/图片/tokens/批准登记 | docs/design原文件原字节保留 |
| 生产代码、SQL、有效测试 | 原路径保留；本次只加生成类型消费及工具接线 |

## 本次完成结果（2026-10-18）

开发入口、功能规则、架构、数据字典、分工、验收、运行与固定契约已转入development；AGENTS、PRD和设计索引已切换入口。
`.specify/`、`specs/`、`docs/engineering/`已退役移除；业务测试的`*.spec.ts`继续保留。
旧体系26份文件移除均在授权范围内。其余快照文件无意外丢失；SQL、服务端、有效测试、Kiranism来源原件、
原型资源与批准登记逐字节核对无变化。App/后台仅增加生成类型消费和必要适配，没有重画原型或重做已有业务。

工具已实际接通：openapi-typescript生成App/management/core-admin三份类型；Prism提供三个独立HTTP入口；
Specmatic固定OSS镜像，区分mock与real，拒绝planned路由、空执行结果、生产目标与非隔离写操作。
当前消费者已引用生成类型，CI接入契约检查、模拟互通及隔离核心的真实公开读取校验。
所有直接依赖固定版本；已有技术栈不升级，新增工具及完整间接依赖进入根锁文件。

| 实际检查 | 结果与范围 |
| --- | --- |
| OpenAPI解析、示例与生成一致性 | 315个操作、2,443项示例校验通过；三份生成类型与输入摘要一致 |
| Prism与Specmatic互通 | App、management、core-admin均返回200；非法limit返回422；Specmatic对mock执行1项，明确只证明工具互通 |
| Specmatic真实后端 | 复用现有隔离Supabase/core，匿名listLatestPosts、fixture-v1执行1项通过；原active_ptr已恢复，无reset/seed/migrate |
| 防误报/误操作检查 | 陈旧生成文件、planned操作、生产URL、dev写操作均实际拒绝 |
| 端侧与BFF回归 | 对应account/feed客户端及管理BFF既有96项测试通过 |
| 工程检查 | 受影响类型检查与ESLint通过；共享同步回归1项通过；53份Markdown的1,627个本地链接可解析 |
| 独立复检 | 内容迁移与工具契约分别由独立gpt-6.1-sol/high复检；发现的Windows输出目录已修复并定向复核，无剩余确定问题；工具未暴露实际部署型号 |
| 保留核对 | 1,080份快照、26份授权退役，无意外缺失、受保护文件无字节差异 |

结果原件位于`H:/Projects/AgoraWeave/development/reports/api-contracts/`：
`preservation.json`、`document-links.json`、`mock-smoke.json`、`guard-checks/results.json`、`governance-regression.log`，
真实provider结果为`app-1792284480987/result.json`。早期失败日志保留，未混入通过结果；原始provider日志私密保存，CI只上传脱敏摘要。

最终共享文件同批执行`sync-governance.ps1 -AllBranches`及`-Verify`；按当前脚本只传播共享规则/契约/工具，
不传播各分支业务完成状态。本次没有重建安装包、重跑无关业务或设备矩阵，也没有生产操作。
完整产品、真实短信和全部原生账号旅程的未完成边界继续见[status](status.md)，迁移完成不代表这些业务已验收。
