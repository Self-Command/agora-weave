# 初始化运行事实

本文件仅为公开技术索引，不替代私有原报告、摘要校验、同最终 SHA 门禁或完成记录。全部 canonical 任务仍未完成。

| SHA / run | 实际结果 | 未完成范围 |
| --- | --- | --- |
| b305109 / 38604711695 | dev/test全部11个官方服务健康；额外Storage localhost探针拒绝连接；job失败；清理成功 | 不算Green或ci-ready；改用官方storage主机地址后重跑 |
| 5bd296a / 38605816529 | dev/test完整Compose、DB/Auth/Storage探针和清理成功 | 原生联通、schema/seed、受控完整档案、统一增量编排和门禁仍缺 |
| 7c4f740 / 38606477103 | 云端冻结Playwright1.64.1；既有锁版本未变，只增加三个Playwright包；类型/Web构建和8项真实浏览器探针成功；镜像作业Docker Hub 502失败 | 整个run仍failure；新lock回传提交后须immutable install和受影响集合重跑 |
| 14df8c3 / 38603527452 | Android Release构建成功，571任务；AVD目录不一致导致模拟器未启动；原生job失败。iOS结果尚待实际报告 | 环境错误不算目标行为Red；无Android截图或原生通过结论 |

当前Codex已读取7c4f740的后台/分享各明暗及390/1280宽度的8张全图：标题可读、居中且无裁切。实际导航/刷新/返回结果由Playwright报告支持。记录尚未完成档案摘要和最终版本绑定，不作正式审查通过，不生成产品基准。

重复原生run的取消保留原始cancelled状态，不计通过。后续共享verify调用须重新在最终SHA取得所有适用证据；路径过滤不能充当豁免。
# 2026-10-15 依赖工具冻结及最低 Android 主题调查

`20a513c` 的 Actions run `38635654333` 在真实 Node22.23.3/npm10.9.9 上完成工具依赖冻结，锁摘要为 `8cb3ebedea518954777aee8e24ea04ed7fcdb7ec68399094f9005c048e89651c`。既有 package version 未变，新增81个验证工具及其依赖条目；131项工程断言及类型检查通过。实际 ESLint 首次执行发现8处无用赋值、未使用异常变量及正则写法问题，保留原 JSON；修正后须在新SHA重跑 immutable install、lint和受影响回归。

原生 run `38631669393`／`3726c43d` 的 Android API24 暗色断言实际失败：设备配置符合 dark，但实际背景 RGB 为255,255,255。原始截图、仪器日志和像素记录均保留，不能把配置成功代替视觉成功。[Expo SDK57 SystemUI](https://github.com/expo/expo/blob/sdk-57/packages/expo-system-ui/android/src/main/java/expo/modules/systemui/singletons/SystemUI.kt) 在API<28以省电状态驱动 automatic；[Android7 PowerManager](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-7.0.0_r1/services/core/java/com/android/server/power/PowerManagerService.java) 要求断开充电并观察真实低功耗状态。修正的是 Actions 主题驱动前置，保留 Kotlin 配置／像素 oracle 与应用不变；该驱动前置更正不冒充产品缺陷的合格Red。后续仍须实际 light/dark截图和对应断言全部通过，最低iOS及真实服务联通另验。

`9846f17a`／run38637166465 的134项工程断言全通过，含真实AJV2020-12 schema校验；相同oracle的RS01 Red为e48abb48／run38636744597，健康成功且唯一目标断言失败。`f148b864`／run38637918048 的136项全通过，TP01的原始Red为3cb8ab4e／run38637477965（135pass／1fail）。run38637917885实际认证10条原始TDD链、74项选中断言，coverage仍partial；追加源认证与非空发现历史链时继续认证原ZIP、全部attempt、完整测试和fixture摘要及真实祖先，不把前缀重名的其他用例借入。

e2908de7／run38636632785 的iOS26.4作业在pod install下载固定ReactNative0.86.3发布包时curl56连接重置，尚未构建或执行XCTest，不算行为Red。后续pod依赖安装最多3次，每次原日志保留，失败仍使作业失败；应用和XCTest oracle不变。此前3726c43d的iOS16.4与26.4真实XCTest均明暗各1pass、无error／skip；当前Codex读取对应8张全图，壳标题可读、居中且无裁切，历史SHA不能替代最终SHA验证。

e2908de7／共享run38636632772的API36恢复截图实际是桌面，RGB109,138,198导致保持不变的像素断言失败。原logcat显示21:13:17.366截图、21:13:17.695应用窗口才恢复输入，标题和包的可访问树已先出现。初始化采集增加UiDevice／Instrumentation空闲等待，并按Android测试设置关闭且记录窗口过渡动画，仍验证真实启动、前台、后台恢复、标题和明暗像素，不把采集前置错误计产品Red。业务动画／时延验收不得借用该无业务采集设置。

bcc937cb／run38641395510已认证18条原始TDD链，全部记录通过，coverage仍为partial。后续增加的用例不能借用整个测试文件已改变的旧Red；完整覆盖未认证前不称T017完成。取消的重复初始化run保留cancelled，不算Green。

b5accf02的草稿PR1实际产生同SHA的push及pull_request工程run；共享run38642142644的TDD job以Unique current engineering executor required失败。dc6f82c3／run38642938530在健康传输上138项137pass／1fail，SR01缺按事件／分支唯一选择的行为；当前Codex读取后接入按当前event、branch、SHA、repository及head_repository和固定workflow严格唯一选择，历史原run引用不变。PR原生run38642536672另因未传head SHA而把merge SHA作为目标拒绝，属于采集前置错误，修正传入实际PR head后仍保checkout断言，不算产品Red。

e2908de7／共享run38636632772的报告与私有归档实际失败，原因是原始XCTest结果包的Data/data.0~…==文件名被归档路径字符白名单误拒绝；原iOS16.4 artifact11931165122及日志保留。393dbe25／run38641855492在健康传输上执行137项，136pass／1fail，XA01实际得到blocked而非archive_planned；当前Codex先读取该缺陷Red，再允许原始文件名中的~和=，仍拒绝绝对路径、盘符、反斜杠、空段、dot／dotdot、换行、分号、重复路径、秘密字段及未认证来源。后续用完整原失败run实际归档回读，并在新SHA重跑当前初始化；不删或改名原xcresult文件换绿。

20c15f73／push run38643373417在原SR01 oracle不变的情况下138项全通过；PR工程job也在同SHA成功。push TDD run38643373340实际选择对应push源并认证既有18链，不能借PR的同SHA运行。XA01的137项Green为b5accf02／run38642142333；run38642142466对原失败共享run38636632772的13份完整原artifact实际上传、回读且移除临时密钥，保留原failure。目录追加XA01与SR01两链供Actions再次认证，coverage保持partial；不把追加记录本身称为认证通过。

54b9b8fb／run38644166495实际认证20条原始链。28500c22／push run38645597031在健康传输上139项全通过，类型／lint／冻结镜像检查成功；TO01的原始Red为b01a27bc／run38645359626（138pass／1fail），当前Codex在22:08:30.858236Z读取原失败后才实现安装工具准入。实际PR工具run38645599873保留完整285项映射、首末brief、原ledger／command及同28500c22拒绝完成结果，未勾canonical任务。

TDD完整性审查仍有阻塞：archive的A01–A06、原始bootstrap的BR01–BR07及review-binding的RB01–RB07没有全部取得当前完整测试／fixture摘要下可认证的先行Red链。特别是17b3f3ee的归档Red虽真实失败，但修复与下载读取处于同一次工具调用，不能声称模型先观察Red后实现。原报告、提交及失败保持原样；不补造时间，不降低校验，不把当前Green或追加目录记录作为历史先行Red的替代。完整链认证前T017及ci-ready保持未完成。

18c36eef／共享run38646401455的Web原作业实际16pass，当前Codex读取其16张原始全图；但JSON报告落在配置目录下，未进入上传的web-output，不能据此给原始报告准入通过。[固定Playwright1.64.1源码](https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright/src/reporters/base.ts)确认outputFile按configDir解析。33f7b2af／run38647801188以真实已安装CLI执行原16项发现，健康成功且WR01明确交接文件缺失，139pass／1fail；当前Codex读取后，于22:29:44Z记录因果，再只修正reporter目标路径。fcbdb0fb／run38648045010在原WR01与Web fixture不变时140项全通过，类型／lint／镜像冻结通过，实际浏览器原JSON进入归档目录且16pass、0unexpected／flaky／skipped。发现探针不替代浏览器运行；最终SHA仍重跑所有适用初始化节点，历史TDD缺口和物理／联通资源阻塞保留。


## ED-15 clean rebuild (2026-10-15)

The first trial branch was not accepted as authoritative: it restored implementations during cherry-pick/merge repair and included an invalid ED-14 change detector. Its failures, commits and runs are preserved; cancelled redundant runs are not counted as passes. The clean branch `codex/agoraweave-tdd-rebuild-clean` starts at actual pre-implementation commit `1839242dff1658e6f877f0716ad2313840eb29ed`, where the archive had a stub and report/review modules were absent. Unaffected code and unchanged canonical engineering oracles were restored before Red.

Actual Red `24176df`, run38662544092: all140 assertions executed;115 passed and25 semantic assertions failed,0skipped/cancelled. CurrentCodex separately read every failed block before implementing `9b2ed5a`. Actual Green run38662838190 executed all140 with140passes and0failures/skips/cancellations. The original branch ancestry was merged only after observing that Green, preserving old histories and unaffected source cycles; it does not make legacy unqualified chains compliant. Five new source cycles cover archive A01–A06/XA01, raw report BR01–BR10/TO01 and review RB01–RB07. Final coverage and admission still need actual authenticated journal, final regression, native HTTPS/accessibility results and currentCodex review. No canonical task completion is inferred here.

At `4bb33b2`, journal run38667307643 authenticated every recorded cycle and derived complete coverage of all157 actual final assertions from original TAP bytes. That is engineering TDD coverage only; native runtime, private storage, reviews and readiness remain separate mandatory checks. Subsequent review-arrival assertions require their own new cycle and fresh final coverage.

Review rendezvous Red `1ad14c0`/run38667660482 executed159 assertions:157passed,2failed,0skipped/cancelled; transport health passed. CurrentCodex read both complete failure blocks at01:49:28UTC before implementing `4d90171`. The real filesystem exercises cover delayed publication, stale/partial/empty files, failed transfer and bounded absence. Green `359ae1f`/run38668006219 has159passes,0failures/skips/cancellations, with typecheck and independent lint passed. The first implementation's unsafe-finally lint failure remains preserved. The workflow now waits at most30minutes for exact current-context private records, then performs the existing schema/source/check binding; missing or invalid records still fail, and actual failed prerequisites do not enter the wait.
