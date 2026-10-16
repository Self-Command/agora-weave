> 历史资料：记录原决定或运行事实。现行入口为 [ED-23 执行政策](execution-policy.md)，本文不再触发旧流程。

# Android 7 系统省电警示色：ED-18 已批准方案 A

> 历史资料：本文保留所记日期／提交的决定、结果或资源事实，不作为当前开发入口。现行执行见宪法5.0.0、[ED-22](business-first-development-decision.md)及[执行政策](execution-policy.md)；旧状态不能推断当前或其他分支已通过。

用户明确答复“批准方案 A，继续完成阶段验收”，见 ED-18。该批准仅覆盖下述限定例外；实现及完整云端复验尚未完成，Phase 1 尚未取得 ci-ready。

## 已读取的实际证据

- 目标提交：`348e1ac817a369547a531f37c349883d472b39e7`。
- GitHub Actions run `38681620881`，API24 job `116248266213`，原始 artifact `11949082185`；下载 ZIP 的 SHA-256 与 GitHub 元数据一致：`347351766c527d798201791c42a13747f2e37e0cd872265e685ba8449fb07033`。
- API24 light 的安装、启动、后台恢复、标题语义／焦点／字体／安全区及 HTTPS 检查已执行；系统时钟实际像素对比度 `5.74183648145415`。
- API24 dark 在相同前置完成后，系统时钟实际对比度 `3.0798041132994367`，在 Kotlin 原断言 `>=4.5` 失败。原始仪器日志、系统电源转储和全幅截图已读取，不能记为通过。电源转储明确记录 `mLowPowerModeEnabled=true`，截图中系统栏为橙色，应用正文为深色且标题可读。
- API36 同提交 job `116248266264` 已成功；artifact `11948564479` 原 ZIP 摘要已验证。它不替代 API24 结果。

## 平台因果

固定 [Expo SDK57 SystemUI 源码](https://github.com/expo/expo/blob/sdk-57/packages/expo-system-ui/android/src/main/java/expo/modules/systemui/singletons/SystemUI.kt) 在 Android API<28 将 automatic 映射为 `MODE_NIGHT_AUTO_BATTERY`。固定 [Android 7.0 源码](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-7.0.0_r1/packages/SystemUI/src/com/android/systemui/statusbar/phone/PhoneStatusBar.java) 的 `checkBarMode` 在省电状态强制 `MODE_WARNING`。本次实际电源状态、截图和像素结果与该路径一致；普通应用的状态栏前景设置不能取消这一系统警示状态。

## 方案 A：只登记系统强制色的受限例外（ED-18 已批准）

保留 Android7 最低支持、Expo automatic 行为、所有应用内容的可读性与原生验证。仅把 API24、省电已实际开启、dark 捕获中的系统自有警示栏登记为 `not_applicable`，同时保存实测对比度、完整系统栏原图、原生边界、电源转储及未验证风险；不得将 3.08 写成满足4.5或一般性 passed。

实现时新增独立云端 Red 断言及准入规则：例外必须具有新的用户决定引用、准确 API24 身份、实际省电开启证据、实际 dark 状态、实测像素与原图绑定；light、API36、缺证据、普通应用区域或错误原因一律不能使用。原 SC01 的 API36 oracle 不变；原 API24 失败及旧 run 不改写。Kotlin 仍实际测量并保存该系统栏，应用标题等原断言不变。最终新 SHA 重跑全部必需集合并由当前 Codex 读取原始证据和图像后才做阶段准入。

受限风险：Android7 省电系统警示栏的时钟对比度低于4.5；这是明确保留的操作系统行为，不承诺应用可以修正系统实现。该例外不适用于后续业务控件、其他版本、未知失败或自动豁免。

## 方案 B：维持系统栏4.5硬门槛

保持现有失败与 ci-ready 阻塞。若要改变 Android7 的 automatic 主题策略、增加应用主题控制或变更最低系统支持，须另审具体产品方案；当前没有授权实施这些行为变化。不能为换绿隐藏系统栏、修改模拟器系统颜色或伪造 dark 状态。

## 决策约束

宪法第九条要求涉及实际行为或验收标准的实质性冲突等待用户明确决定。用户批准前相关测试及门禁保持不变；批准后按ED-18实施并完整重验。SC02在c943e260/run38690425924取得健康174项中唯一语义Red，当前Codex于2026-10-15T06:07:36Z完整读取后才实施18947af。其工程Green实际174/174、无失败／取消／跳过／todo，lint90文件无错误或警告；工程Green不代替最终原生完整验收或任务完成。
