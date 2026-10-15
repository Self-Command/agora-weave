# 原生测量修正

## iOS 文本快照与语义叶节点

原 run 38672314073 的两个 iOS runtime 均实际启动并恢复；原断言把两个同名嵌套 `StaticText` 快照当作两个可访问标题而失败。原失败和界面树保持原状，不把它改记为产品缺陷 Red。

锁定 React Native 0.86.3 的 [Paragraph 实现](https://github.com/facebook/react-native/blob/v0.86.3/packages/react-native/React/Fabric/Mounting/ComponentViews/Text/RCTParagraphComponentView.mm) 将容器的 `isAccessibilityElement` 返回为 NO，并在 `accessibilityElements` 中提供语义元素；[Provider 实现](https://github.com/facebook/react-native/blob/v0.86.3/packages/react-native/React/Fabric/Mounting/ComponentViews/Text/RCTParagraphComponentAccessibilityProvider.mm) 为单段文字生成一个可访问元素。XCTest 快照同时展示带 StaticText trait 的容器及其叶节点。原始树中两者标签与矩形一致。

测量现完整枚举标题快照，仍要求仅一个标题叶节点，并验证每个同名容器的标签及矩形一致；保存原快照数、容器数和实际叶节点数。门禁拒绝计数缺失、非整数、负数、总数不符或多个叶节点。没有把 `.firstMatch` 当作唯一性证明，也没有删除系统审计、大字、布局或实际运行要求。

NA04 的工程门禁 Red 为 2e8dcce / run 38675047627：170 项中169通过，只有缺失快照计数仍被接纳的断言失败；健康传输成功，2026-10-15T03:14:04Z 前已完整读取对应失败及因果。此链验证新增证据门禁；实际客户端测量和完整原生回归仍需当前新 SHA 的 Actions 结果。

该中间断言曾修改既有测试文件；为保持原 HN／NA 链的完整 oracle／fixture 摘要，随后恢复了该文件的原字节，将新增要求放入独立的 `native-measurement-details.spec.ts`。NM01–03 在211c650 / run38675485960实际产生三项语义 Red，原169项通过且传输健康；2026-10-15T03:18:53Z 已完整读取后才实施。中间 NA04 链不代替新的独立链或原生运行。

## Android 桌面与有效文字字号

原 run38673776010 的API36记录 `reported_launcher=com.android.settings`，同时原系统活动报告显示实际HOME为 `com.google.android.apps.nexuslauncher`。桌面检查改用UiAutomation的shell身份调用系统包管理器解析HOME，再核该包确实出现在原生窗口树并成为前台包；不硬编码具体Launcher，不用应用包可见性过滤后的查询结果。

同run的API24大字失败保存了 `base TextView=61px`、`expected=120.75px`、`fontScale=2`，实际截图文字已经放大。锁定版[React Native TextLayoutManager](https://github.com/facebook/react-native/blob/v0.86.3/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/text/TextLayoutManager.kt) 为文字应用 `ReactAbsoluteSizeSpan`，基础Paint不代表每个实际字符的有效字号。测量现复制原Paint，对每个字符应用实际 `MetricAffectingSpan`，逐字符核字号一致并按相同平台SP口径核误差不超过1px，另保留基础字号。普通／200%和明／暗四组、无省略、可视边界、对比度及实际焦点要求全部保留。

51502a6 / run38675713356 的原传输报告为172/172通过；但新增文件未登记，实际目标发现拒绝为 `unmapped_actual_test`，故此轮不是完整Green。补登后须重新验证冻结发现、完整172项、静态检查与各端实际执行。
