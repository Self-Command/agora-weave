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

