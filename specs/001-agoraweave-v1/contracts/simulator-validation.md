# 模拟器验收范围（ED-14）

批准依据：[ED-14](../reviews/execution-decisions-2026-10-15.md)。今后只有 GitHub Actions 云端 iOS Simulator／Android Emulator 设备层，不要求未来真机。宪法、产品功能与读屏适配要求仍有效；原生结论必须来自对应原生产物的真实模拟器运行，网页或策略单元不能替代。

| 范围 | 必需证据 |
| --- | --- |
| 平台 | iOS16.4／当前锁定 iOS，Android7/API24／当前锁定 API；记录实际 runtime、SDK、runner image、产物与 SHA，安装／启动／后台恢复实际执行 |
| 无障碍 | 对应原生语义树的名称、角色、状态、顺序、操作；焦点／键盘／IME、大字100%–200%、触区、安全区、主题和错误反馈；支持的系统审计必须实际运行；当前辅助技术能执行时保存导航和输出轨迹 |
| 媒体 | 各合法入口真实播放器状态／帧／静音与开声状态、下载请求／Range／字节、视区／失焦／前后台／取消释放；网络类型、系统省流量与减少动效的控制方式及实际观测均记录，不把注入值写作真实无线电测量 |
| 推送 | 获准真实服务的身份／撤销／幂等和失败集成；平台支持的模拟器接收、锁屏展示、点击跳转、前台重连；模拟注入与真实远端送达分别记录，不互相冒充 |
| 性能 | 只报告实际模拟器和云端环境的数据、规模、负载及分布；不能据此承诺真机启动、能耗或厂商后台表现 |

仅硬件或当前 runtime 不支持的操作单列排除项：物理设备、硬件扬声器听感／蜂窝无线、厂商省电后台和不支持的远端推送／辅助技术链路。每项登记 `applicability=not_applicable`、`decision_ref=ED-14`、平台限制、受影响行为和未验证风险，不产生 passed。可在模拟器执行的已要求行为不得借该规则排除；缺必需结果仍阻塞。

iOS16.4／26.4.1 的 VoiceOver 流程不记为执行成功。Apple 新 `XCUIVoiceOverService` 的 iOS 可用性为27.0，不能套用到本项目当前运行矩阵；API、镜像或版本变化后须先核固定工具与实际能力。最低版本用真实语义／焦点断言，支持 audit 的当前版本另运行 audit；两者都不命名为真实 VoiceOver 用户验收。Android 同样核实际 image 中的辅助服务，不能将 UIAutomator 树命名为已执行 TalkBack。

依据：[Apple 辅助技术测试](https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app)、[VoiceOver UI 测试服务](https://developer.apple.com/documentation/xcuiautomation/xcuivoiceoverservice)、[Apple 自动审计](https://developer.apple.com/documentation/accessibility/performing-accessibility-audits-for-your-app)、[Android 无障碍测试](https://developer.android.com/guide/topics/ui/accessibility/testing)。核验：2026-10-15；Apple 官方 symbol metadata 的 `voiceOverService` iOS introducedAt 为27.0。文档或未来 API 不代实际运行。

清单迁移须保旧清单及摘要，明确物理层被批准撤出和模拟器项的新增／保留；新最终提交完整运行实际必需集合。旧失败和旧审查不改写，旧成功也不证明新版。
