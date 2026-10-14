# 执行边界

依据：根 `AGENTS.md`、宪法 v3.0.1、`specs/001-agoraweave-v1/{spec,plan,tasks}.md`、`contracts/cloud-validation.md` 和已确认的 ED-05–12。任务清单是唯一完成契约，现有全部 285 项仍未完成。

## 初始化范围

当前模式为 `bootstrap-authoring`／`bootstrap-only`。在 T027 当前有效的云端 `ci-ready` 出现前，只允许下列初始化内容：

| 路径 | 允许内容 |
| --- | --- |
| `.github/workflows/` | 初始化、测试先行、报告、审查记录校验及验证调度 |
| `tools/ci/`、`tests/{contract,integration,security}/ci/`、`tests/fixtures/bootstrap/` | 工程门禁、采集、发现及拒绝探针；不包含社区业务 |
| `tests/e2e/bootstrap/`、`tests/e2e/{ios,android}/BootstrapShell*` | 无业务壳的真实交互与隔离服务联通 |
| `package.json`、`package-lock.json`、`apps/{mobile,admin,share}/` | 固定官方依赖与无业务客户端壳；不能因路径获准而加入业务 |
| `.gitmodules` | 修复已有 `superpowers-v7` 固定 gitlink 缺失的原始来源元数据；不改版本或技能内容 |
| `supabase/upstream/`、`infra/ci/` | 固定官方 Compose、工具锁、隔离初始化环境与资源准入 |
| `docs/engineering/` | 执行、资源、证据、工具和已确认决定的工程记录 |
| `.specify/extensions.yml`、`.specify/extensions/speckit-superpowers-bridge/` | T023 经云端 Red 后的项目门禁接入；不更改已有决策和规格 |
| `.specify/superpowers-handoff.json`、`.specify/bridge-*`、canonical `tasks.md` | 真实生命周期和有证据的任务进度；raw 状态不充当准入或完成证明 |

路径与内容共同决定范围。`modules/`、业务迁移、业务 API、业务页面及插件实现都不能在初始化阶段进入。原有规划修订属于本次开始时的输入，不据此重新打开已关闭的问题。

## 执行与证据

本地只编辑、阅读文件和报告，执行 Git、GitHub 控制面以及桥接／任务提取元数据操作。禁止本地安装项目依赖、编译、静态检查、测试、运行、模拟器、视觉与交互验收；本机不能充当 runner。

初始化先建立 T002 的最小 Actions 传输、健康与报告通道。该通道的成功仅表示这次采集运行成功；不表示 `ci-ready`、产品通过或任务完成。T008–T012 的工程行为实现前必须在此通道逐行为先取得合格 Red。接口壳只能让测试可调用，不能预先实现目标行为。

Red 必须来自健康前置下的目标缺行为断言，保留原始 failed 状态。编译、导入、网络、凭据和工具故障均不能作为 Red。实现只能在读取因果后开始；Green 使用相同 oracle／fixture 和当前全部激活回归，最终 SHA 再验证。不得缩减集合、删断言、改结果或把 skip／unknown 当作通过。

所有报告关联目标和实际 checkout SHA、run／attempt、环境、工具版本与摘要。公开仓库只出现允许公开的技术索引、纯合成探针和脱敏日志；完整私有证据及 completion record 必须进入受控存储。资源缺失时记录 `unavailable`，保留任务未完成。

业务准入前必须取得同版三端壳、官方 Compose、增量编排非空执行、当前 Codex 代码及实际云端图像审查记录、资源准入与拒绝探针。首张壳截图不作为产品视觉基准；首次产品候选由用户本人确认。

构建／验证成功不授权生产部署、迁移、权限生效、灰度或扩大。新实质冲突遵循宪法九，既定决定不重复询问。
