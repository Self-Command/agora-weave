# 原生测量修正

## iOS 文本快照与语义叶节点

原 run 38672314073 的两个 iOS runtime 均实际启动并恢复；原断言把两个同名嵌套 `StaticText` 快照当作两个可访问标题而失败。原失败和界面树保持原状，不把它改记为产品缺陷 Red。

锁定 React Native 0.86.3 的 [Paragraph 实现](https://github.com/facebook/react-native/blob/v0.86.3/packages/react-native/React/Fabric/Mounting/ComponentViews/Text/RCTParagraphComponentView.mm) 将容器的 `isAccessibilityElement` 返回为 NO，并在 `accessibilityElements` 中提供语义元素；[Provider 实现](https://github.com/facebook/react-native/blob/v0.86.3/packages/react-native/React/Fabric/Mounting/ComponentViews/Text/RCTParagraphComponentAccessibilityProvider.mm) 为单段文字生成一个可访问元素。XCTest 快照同时展示带 StaticText trait 的容器及其叶节点。原始树中两者标签与矩形一致。

测量现完整枚举标题快照，仍要求仅一个标题叶节点，并验证每个同名容器的标签及矩形一致；保存原快照数、容器数和实际叶节点数。门禁拒绝计数缺失、非整数、负数、总数不符或多个叶节点。没有把 `.firstMatch` 当作唯一性证明，也没有删除系统审计、大字、布局或实际运行要求。

NA04 的工程门禁 Red 为 2e8dcce / run 38675047627：170 项中169通过，只有缺失快照计数仍被接纳的断言失败；健康传输成功，2026-10-15T03:14:04Z 前已完整读取对应失败及因果。此链验证新增证据门禁；实际客户端测量和完整原生回归仍需当前新 SHA 的 Actions 结果。
