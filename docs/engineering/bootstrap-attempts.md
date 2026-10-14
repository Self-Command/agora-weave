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
