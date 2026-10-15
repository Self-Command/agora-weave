# 验证效率：安全检查点与桥接执行说明

日期：2026-10-15。历史计划基线为`72cb1a23ce0f921949f96f360e87048659376bec`、分支`codex/agoraweave-tdd-rebuild-clean`。用户先批准CI调度、缓存和证据读取优化，随后明确批准[分层开发验证与宪法修订](validation-tiering-decision.md)，允许当前初始化阶段执行并以Draft PR工程移交。以宪法v3.1.0／cloud-validation v1.2及最新真实证据为准；本说明的历史基线和文档更新本身不授开发准入、任务完成或提速结论。

必须读取根`AGENTS.md`、`.specify/memory/constitution.md`、`plan.md` TD-07A/B/C、`tasks.md`、`contracts/cloud-validation.md` §2.2及`release-evidence.md`。既有ED-11–18、最低／当前OS、全部真实云端TDD与同SHA验收保留；ED-14不等待真机，ED-18只限API24实际省电开启／深色截图的系统警示栏。所有项目安装、构建、测试、运行、截图、交互和门禁计算仍仅Actions，本地只编辑、Git／GitHub控制面及读取已验报告。

## 实际运行基线与限制

数据来自`Self-Command/agora-weave`的Actions run／jobs API，于2026-10-15读取。下表run生命周期用`updated_at-created_at`，仅作调度快照；job执行时长用`completed_at-started_at`，runner领取等待用`started_at-created_at`，不能把上游依赖时间或run updated_at当网络传输或精确排队时间。

| SHA／真实运行 | 观察结果 | 时间／数量 |
| --- | --- | --- |
| `18947afc6ba6254425c2285d9aae0d1c2f6a7623`，[独立Native 38690805779](https://github.com/Self-Command/agora-weave/actions/runs/38690805779) | 同次push另启动四个原生矩阵job；读取时iOS两项仍运行，Android两项success，不能宣称整次通过 | API36 06:10:04→06:21:57，11m53s；API24 06:10:04→06:25:08，15m04s；两项runner领取均3s |
| 同SHA，[共享完整链38690805915](https://github.com/Self-Command/agora-weave/actions/runs/38690805915) | 亦启动四个native jobs，后cancelled；报告、审查、归档及gate仍产生真实结果，gate失败 | run 06:10:01→06:19:03，生命周期9m02s；native jobs领取3–9s，执行2m29–2m33s后取消 |
| 同SHA，[CI bootstrap 38690805835](https://github.com/Self-Command/agora-weave/actions/runs/38690805835) | 与完整链都安装／执行工程集合及网页壳；顶层gate失败，不能择其中部分success称就绪 | run生命周期9m15s；freeze job06:10:05→06:11:43，1m38s |
| 同SHA，[独立服务38690805881](https://github.com/Self-Command/agora-weave/actions/runs/38690805881)与[bridge38690805823](https://github.com/Self-Command/agora-weave/actions/runs/38690805823) | 此次push共五个顶层runs；共享链亦调用服务及bridge，需逐输入分配唯一覆盖责任 | 顶层run生命周期分别2m00s、26s；这是启动数量，不能推导为五次等价全量验收 |
| `348e1ac817a369547a531f37c349883d472b39e7`，[完整链38681620881](https://github.com/Self-Command/agora-weave/actions/runs/38681620881) | failure，未通过初始化；可作完整链的历史成本样本，不能代最终证据 | run生命周期33m28s；native iOS16.4 26m01s(success)、iOS26.4 24m04s(failure)、API24 12m56s(failure)、API36 11m57s(success)；native领取2–8s |

独立native `https_required=false`，共享完整链`true`，实际输入尚不相同；这是重叠构建／矩阵启动的证据，不是已经证明可直接互代的验收结果。CI bootstrap与共享链也可能承担不同采集／拒绝责任，必须核check／原报告后合并，不能仅按名称删除。当前工作流同时声明push／pull_request；上述已读取的样本为push，只证明双事件配置风险，没有已核的同SHA push＋PR重复实际次数，下一窗口列全事件后再计数。

已有`collect-evidence.ts`每次调用都列run／attempt／artifact并下载ZIP；`download-source.ts`写`authenticated-downloads/`，未据此直接证明同身份复用已实现。CI bootstrap与共享gate均调用相同类型的原报告下载，存在重复取证路径；实际请求次数、传输字节／时长、缓存命中率没有完整可比历史记录，记unavailable，不以交互工具总耗时冒充网络耗时。父窗口已核历史源ZIP `artifact_id=11948648942`，SHA256 `b4bf60dd8ef65a61c755c7d12e640206a73d1eee8cd88e0fd90e3bd90869a4f4`；原图和失败仍须保留，其他0字节或未完整下载不作为证据。

## 本次已观测样本

以下为当前窗口实际校验并读取的局部证据，不能代最终完整矩阵。SHA均为原报告目标，不能给后续提交授通过。

| 来源 | 已读事实 | 结论限制 |
| --- | --- | --- |
| `396cdb3`，[shared run38724920329](https://github.com/Self-Command/agora-weave/actions/runs/38724920329)，attempt1，artifact `11968341356` | ZIP SHA-256已校验；`journal.json`读取43个cycle／129个phase；129份`source_reuse`均绑定来源身份、archive及raw索引；66次cache_hit，63次实际ZIP下载，共452005字节，累计`transfer_ms=9648.684376` | 计时仅ZIP网络传输，不含API、解析或整体等待；coverage=partial，缺本轮新循环，不算ci-ready |
| `ccf9b30`，[checkset run38726340329](https://github.com/Self-Command/agora-weave/actions/runs/38726340329)，artifact `11968427824` | 已校验读取190／190真实工程用例，0 fail／skip／cancel／todo | 只证明该来源的工程集合，不证明原生／完整验收 |
| lint artifact `11968142906` | 已校验读取98 files、0 error、0 warning | 不代功能／安全／图像或完整Green |
| 旧`bb`功能变更的push＋PR与`cb`后PR样本 | 旧样本曾触发10个顶层runs；后者PR为3个顶层runs | 事件、SHA、集合和运行条件不等价，不能算完整矩阵提速比例 |

原始更早基线的传输缺计时状态保持历史事实；新增样本仅补本次可核测量。最终仍需逐项读取当前目标的真实报告、失败及原图，保留剩余验收缺口。

## 在现有任务内执行

1. 以T001／T002／T021登记当前run／job／check和实际事件、head／merge／checkout、profile／清单、HTTPS／环境／工具链／产物身份。先读取唯一Red和当前必需运行；给独立native、共享链、push／PR明确覆盖责任，只对等价输入合并。保真实保护check；没有保护配置也不因此删除既有真实门禁。
2. 在T008–T012现有测试中先加入新增行为的语义断言，通过T013在Actions取得并实际读取合格Red；调度、分类、取消保护、缓存与artifact复用逐行为建链。已有行为只回归，不挖空实现制造Red。环境、导入或工具错误先修环境，不计Red。
3. 在T014–T023原实现责任内最小修改：共享正式矩阵唯一调用、区分反馈／正式Green／完成意图、保护Red／必要验证／清理的旧run取消、锁／工具链／平台缓存、健康前置后独立job并行、按完整身份／archive及raw摘要复用证据字节与退避轮询。不要新造通用调度平台。未改且已认证的历史行为链按祖先与输入核验，受改行为取得新链。
4. 正式开发S_G运行同Red oracle／fixture、受影响套件和必要回归，依据整个实际diff、依赖、任务／契约与风险冻结集合；未知影响用完整适用集合。反馈不授Green、task done或ci-ready，开发Green也不授正式验收。清单、门禁、依赖、测试及工程行为不按普通文档跳过；取消、失败、跳过、缺失、旧SHA不能充passed。
5. T026前一次整理代码、测试、tasks和工程资料并冻结最终SHA／清单／契约／产物；通过唯一正式执行链取得初始化全部必需证据，保最低／当前OS、真实服务与HTTPS、网页、审查、归档／清理、负向探针。T027按冻结全集等终态并逐一读报告、失败明细及实际原图；已验artifact字节可复用，语义审查及完成判断仍绑定当前目标。
6. 最终审查、completion／ci-readiness及测量写外部私有证据库，不为补记通过再次提交；冻结后任何仓库输入变化按新SHA重新验证。业务TDD可在独立development-ready后按原DAG继续，不等待完整ci-ready；T027与未验任务保持未勾选。基础通道或目标验证受阻暂停依赖部分，其他完整CI缺口并行修复。合并／阶段验收／发行仍须同SHA完整适用证据；当前Draft PR工程移交须列清未决项。

## 实测交付要求

优化前后保存事件、SHA、run／attempt、profile／check_set、平台与环境、冷热缓存及输入摘要。分别报告顶层runs、矩阵jobs、runner排队、依赖等待、执行时长、取消数量与原因、下载请求数／实际字节／传输时长、证据缓存命中和最终必需证据状态；引用原API／日志／报告，取消或不同集合的样本单列。准确说明哪些重复真正消除、最终完整验证是否通过及剩余阻塞。没有同条件优化后数据就说明缺失，不承诺比例，不能把少跑必需项当提速。
