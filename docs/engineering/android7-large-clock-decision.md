> 历史资料：记录原决定或运行事实。现行入口为 [ED-23 执行政策](execution-policy.md)，本文不再触发旧流程。

# Android 7 200% 字体下系统时钟截断：ED-19 已批准方案 A

> 历史资料：本文保留所记日期／提交的决定、结果或资源事实，不作为当前开发入口。现行执行见宪法5.0.0、[ED-22](business-first-development-decision.md)及[执行政策](execution-policy.md)；旧状态不能推断当前或其他分支已通过。

用户于2026-10-15明确答复“批准此受限系统例外，继续验收”。ED-19仅覆盖下述方案A，不扩大ED-18。实现、云端Red／Green及最终完整重验仍须完成后才能通过阶段一。

## 实际图像与原始记录

当前Codex于2026-10-15读取提交`909ce9b0f31c301cecf3d1f8d164cf1cbd6ea557`的[Actions run38736933035](https://github.com/Self-Command/agora-weave/actions/runs/38736933035)原图。API24 artifact11975006052的ZIP摘要为`5dc19a9df5d248da475f7e11bf235cb32ac8cf1a75d74c76c30747536072aa9b`，与GitHub元数据一致。

- `android-light.png`及`android-dark.png`的系统时钟完整。
- `android-large-light.png`和`android-large-dark.png`的系统时钟下部被系统栏裁掉。两张均为实际系统font_scale=2；该问题不只发生在省电深色。
- large-light原图摘要`e17435b48d541d1533ccb8d03bb8e19d49e3b12665d41bf15ebf24349734d61c`；原生报告中`com.android.systemui/clock`的可见边界为x895/y0/width164/height63，系统栏高63px。
- 应用标题在普通／大字、明／暗四张中均完整可读；API24大字实际有效字号121px，对应期望120.75px。不能用应用标题通过代替系统时钟通过。
- API36 artifact11975076225同run的四张原图中，普通及200%系统时钟均完整；该结果不能替代API24。

固定[AOSP Android7状态栏布局](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-7.0.0_r1/packages/SystemUI/res/layout/status_bar.xml)中系统Clock高度为match_parent，固定[时钟字号](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-7.0.0_r1/packages/SystemUI/res/values/dimens.xml)为14sp。结合实际原图与边界，推断为系统时钟随字体放大但固定栏高不足。普通应用无权重写SystemUI；不能为换绿降低全局大字、隐藏系统栏、改模拟器系统UI或把裁掉的时钟写成完整可读。

## 方案 A：用户已批准

方案A：仅将API24、实际font_scale=2、系统自身Clock在固定状态栏内的已证实截断登记为有用户决定引用的`not_applicable`平台限制；保留浅深两张全幅原图、系统语义／实际缩放／边界及风险，不计为passed。应用内容、系统栏对比度原规则、其他缩放／平台、标题及后续业务大字要求全部保留。不得通过隐藏系统栏、减小全局字体或编辑模拟器获得通过。实现须新云端Red→读取因果→Green，最终SHA完整重验。

未采用的方案B：维持现有完整可读硬门槛，保留此项阶段验收阻塞。改变最低系统支持、应用主题或系统栏显示策略属于另外的实质方案，未获授权。

本问题涉及验收标准，已按`.specify/memory/constitution.md`第九条取得上述明确决定。实现仅按ED-19处理，不自行把本项加入ED-18或扩大ED-14；其他失败继续阻塞。
