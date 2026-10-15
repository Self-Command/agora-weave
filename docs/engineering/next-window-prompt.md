# 新窗口续接提示词

**ED-20 当前范围（优先于本文历史全平台收口说明）**：用户要求阶段一按Android可开发条件完成并同步tasks；当前不做iOS验证，后续跨平台再执行。先取得当前foundation的真实development-ready后进入原Phase2/Android业务DAG；全平台ci-ready、产品验收、合并及生产批准仍未取得。见 [Android优先决定](android-first-development-decision.md)。

在 `C:\Users\by970\.codex\worktrees\tdd-rebuild\my-project` 继续 `codex/agoraweave-tdd-rebuild-clean`，PR 为 https://github.com/Self-Command/agora-weave/pull/2 。先核对 Git HEAD、分支和工作区；不要在桌面主工作树的旧分支继续，也不要覆盖当前检查点。

调用本工作树的 `$speckit-superpowers-bridge`（sk-sp-br），先读取并遵守 `AGENTS.md`、`.specify/memory/constitution.md` v3.1.0、现有 spec/plan/tasks、`docs/engineering/validation-tiering-decision.md`、`execution-policy.md`、`bridge-next-window.md`、`validation-efficiency.md` 和 cloud-validation/release-evidence 契约。必要时直接读取本工作树 `.agents/skills/speckit-superpowers-bridge/SKILL.md`，不要让桌面旧检查点的技能文案覆盖本分支的新宪法和已批准决定。

用户已明确批准：逐行为云端 Red→校验并阅读因果→实现→同 oracle/fixture Green，运行受影响套件及必要回归；基础安装／构建、非空测试通道及所需隔离服务真实健康并取得独立 development-ready 后，可按原 DAG 继续 Foundational／业务 TDD；不影响目标行为的完整 CI 证据问题并行闭合。未知影响保守完整验证，安全未知、基础不健康或目标结果不可认证时暂停依赖部分。

本次为工程交接和 Draft PR，完整 T027 ci-ready、阶段验收、可合并或 feature complete 不能从开发准入推导。合并、阶段验收或发行前仍须同一最终 SHA 的全部适用验证，含最低／当前 iOS 与 Android、权限安全、真实交互、当前代码及实际原图审查。保留 ED-11–18，API24 例外不得扩大；285 个 canonical 任务仍未验收勾选，不重新生成任务或改原故事依赖，不补造历史证据。

1. 从 PR 当前 HEAD 的 Actions 查询并下载校验最新原报告，分别确认工程 Green、五项基础 development-readiness、bridge admission 和完整正式 gate 的实际状态。最近T033工程接线链为Red `f78c3a6`／run38735498157（208执行、205通过、CW01–03三项语义失败）→Green `09fe5bd`／run38736021015（同文件208/208）；已登记source catalog。最终HEAD的回归／journal和基础准入另核，不把该子集当完整T033。不要用旧 SHA 的全绿图标、caller flags 或 ready 元数据代替准入。已有原失败／未完成项保持原状；不重造已正确行为的 Red。
2. 核对开发源 run/attempt、事件、checkout、原报告、源与目标祖先及完整 foundation 摘要。工作流、门禁、治理契约、依赖／工具链、官方服务、工作区构建配置或 submodule 输入漂移时重新核基础证据。按真实 before_implement receipt 恢复桥接生命周期；business start 使用确切模式、转换及 development 源，不绕过 mandatory reader。
3. 按原 tasks 的依赖推进 T028–T033 等共享核心准备；目标接口／迁移／夹具和真实非空套件接入后才做 T034 等业务 Red。完整初始化采集、TDD journal、审查／归档缺口可并行闭合，但不虚报或勾选未验任务。
4. 全部项目安装、构建、测试、运行、截图和交互采集仅通过 GitHub Actions；本地只编辑、Git、控制面、元数据以及下载／阅读已验报告。保留唯一未读 Red、当前必需验证及清理归档，不自动取消这些运行。
5. 正式验收前一次整理全部仓库输入，使用 completion 意图冻结最终 SHA。逐一读取所有必需报告、失败详情与实际图像，最终审查、读取及 completion 记录写受控外部私有证据库，不为补写通过再提交导致循环验收。未取得完整证据就保留 Draft 和未完成状态。

不要调用 `speckit.implement`，不要为这个活跃 Spec Kit 功能另行 brainstorming／writing-plans。已有用户批准不重复索要；新实质冲突按宪法第九条处理。完成一个具体工程批次后报告实际改动、云端证据、未决项，并维持干净 Git 检查点。
