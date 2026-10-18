# 完整业务覆盖索引

只定位业务承载，不维护旧285任务状态，不将文档覆盖等同实现。迁移保留PRD v0.10及后续决定、17旅程、173 FR、10 QR、55 AC、19 EC、18 SC、4 AS以及原任务业务数据不变量和媒体/偏好细化。旧spec/plan/tasks/宪法框架退役，PRD、代码、有效测试、原型批准保留。

当前基础运营优先及完整后置范围见[公共规则](features/rules.md)。每功能真实边界来自本轮实际文件检查；历史勾选、路径存在、Phase2报告不能推定完整业务。接口共享OpenAPI唯一，动作表中未登记operationId先协调，不宣称已有API。

## 17个用户旅程

| 原旅程 | 业务承载 | 实际完成边界 |
| --- | --- | --- |
| US1 加入、登录与管理账号 | [account](features/account/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US2 维护资料、关注与内容过滤 | [profile](features/profile/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US3 发布内容、帖子串与私人草稿恢复 | [publishing](features/publishing/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US4 评论、深层回复与单选投票 | [discussions](features/discussions/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US5 编辑、可见范围、删除恢复与媒体撤权 | [content-lifecycle](features/content-lifecycle/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US6 三流、搜索、真实推荐与私密收藏 | [discovery](features/discovery/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US7 陌生请求、正常聊天与逐消息删除 | [messaging](features/messaging/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US8 只读AI、作者用途、可撤回来源与额度 | [ai](features/ai/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US9 只读分享、稳定链接与搜索收录 | [share](features/share/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US10 举报、版本审核、处罚申诉与后台身份 | [moderation](features/moderation/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US11 统一配置的预览、发布、消费与回滚 | [configuration](features/configuration/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US12 正式跨端插件开发工具与隔离调试 | [developer-tools](features/developer-tools/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US13 审核、安装、启停、升卸与插件隔离 | [plugins](features/plugins/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US14 同版验证、生产确认、名单灰度与旧端兼容 | [releases](features/releases/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US15 持久通知、跨端未读与独立故障反馈 | [notifications](features/notifications/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US16 原生状态、无障碍与真实媒体行为 | [native-experience](features/native-experience/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |
| US17 分类清理、独立保留与安全备份恢复 | [data-lifecycle](features/data-lifecycle/README.md) | 见该文件现有代码与未完成段，不由优先级推断已实现 |

## FR逐项承载（173项）

每行定位完整行为，动作/输入/权限/副作用/失败/验证在同一文件。

| 需求 | 具体承载 |
| --- | --- |
| FR-001 | [account](features/account/README.md#fr-001) |
| FR-002 | [account](features/account/README.md#fr-002) |
| FR-003 | [account](features/account/README.md#fr-003) |
| FR-004 | [account](features/account/README.md#fr-004) |
| FR-005 | [account](features/account/README.md#fr-005) |
| FR-006 | [account](features/account/README.md#fr-006) |
| FR-007 | [account](features/account/README.md#fr-007) |
| FR-008 | [account](features/account/README.md#fr-008) |
| FR-009 | [profile](features/profile/README.md#fr-009) |
| FR-010 | [profile](features/profile/README.md#fr-010) |
| FR-011 | [profile](features/profile/README.md#fr-011) |
| FR-012 | [profile](features/profile/README.md#fr-012) |
| FR-013 | [profile](features/profile/README.md#fr-013) |
| FR-014 | [profile](features/profile/README.md#fr-014) |
| FR-015 | [profile](features/profile/README.md#fr-015) |
| FR-016 | [profile](features/profile/README.md#fr-016) |
| FR-017 | [profile](features/profile/README.md#fr-017) |
| FR-018 | [publishing](features/publishing/README.md#fr-018) |
| FR-019 | [publishing](features/publishing/README.md#fr-019) |
| FR-020 | [publishing](features/publishing/README.md#fr-020) |
| FR-021 | [publishing](features/publishing/README.md#fr-021) |
| FR-022 | [publishing](features/publishing/README.md#fr-022) |
| FR-023 | [publishing](features/publishing/README.md#fr-023) |
| FR-024 | [publishing](features/publishing/README.md#fr-024) |
| FR-025 | [publishing](features/publishing/README.md#fr-025) |
| FR-026 | [publishing](features/publishing/README.md#fr-026) |
| FR-027 | [publishing](features/publishing/README.md#fr-027) |
| FR-028 | [discussions](features/discussions/README.md#fr-028) |
| FR-029 | [discussions](features/discussions/README.md#fr-029) |
| FR-030 | [discussions](features/discussions/README.md#fr-030) |
| FR-031 | [discussions](features/discussions/README.md#fr-031) |
| FR-032 | [discussions](features/discussions/README.md#fr-032) |
| FR-033 | [discussions](features/discussions/README.md#fr-033) |
| FR-034 | [discussions](features/discussions/README.md#fr-034) |
| FR-035 | [discussions](features/discussions/README.md#fr-035) |
| FR-036 | [discussions](features/discussions/README.md#fr-036) |
| FR-037 | [discussions](features/discussions/README.md#fr-037) |
| FR-038 | [discussions](features/discussions/README.md#fr-038) |
| FR-039 | [discussions](features/discussions/README.md#fr-039) |
| FR-040 | [discussions](features/discussions/README.md#fr-040) |
| FR-041 | [content-lifecycle](features/content-lifecycle/README.md#fr-041) |
| FR-042 | [content-lifecycle](features/content-lifecycle/README.md#fr-042) |
| FR-043 | [content-lifecycle](features/content-lifecycle/README.md#fr-043) |
| FR-044 | [content-lifecycle](features/content-lifecycle/README.md#fr-044) |
| FR-045 | [content-lifecycle](features/content-lifecycle/README.md#fr-045) |
| FR-046 | [content-lifecycle](features/content-lifecycle/README.md#fr-046) |
| FR-047 | [content-lifecycle](features/content-lifecycle/README.md#fr-047) |
| FR-048 | [content-lifecycle](features/content-lifecycle/README.md#fr-048) |
| FR-049 | [content-lifecycle](features/content-lifecycle/README.md#fr-049) |
| FR-050 | [content-lifecycle](features/content-lifecycle/README.md#fr-050) |
| FR-051 | [content-lifecycle](features/content-lifecycle/README.md#fr-051) |
| FR-052 | [content-lifecycle](features/content-lifecycle/README.md#fr-052) |
| FR-053 | [discovery](features/discovery/README.md#fr-053) |
| FR-054 | [discovery](features/discovery/README.md#fr-054) |
| FR-055 | [discovery](features/discovery/README.md#fr-055) |
| FR-056 | [discovery](features/discovery/README.md#fr-056) |
| FR-057 | [discovery](features/discovery/README.md#fr-057) |
| FR-058 | [discovery](features/discovery/README.md#fr-058) |
| FR-059 | [discovery](features/discovery/README.md#fr-059) |
| FR-060 | [discovery](features/discovery/README.md#fr-060) |
| FR-061 | [messaging](features/messaging/README.md#fr-061) |
| FR-062 | [messaging](features/messaging/README.md#fr-062) |
| FR-063 | [messaging](features/messaging/README.md#fr-063) |
| FR-064 | [messaging](features/messaging/README.md#fr-064) |
| FR-065 | [messaging](features/messaging/README.md#fr-065) |
| FR-066 | [messaging](features/messaging/README.md#fr-066) |
| FR-067 | [messaging](features/messaging/README.md#fr-067) |
| FR-068 | [messaging](features/messaging/README.md#fr-068) |
| FR-069 | [messaging](features/messaging/README.md#fr-069) |
| FR-070 | [messaging](features/messaging/README.md#fr-070) |
| FR-071 | [messaging](features/messaging/README.md#fr-071) |
| FR-072 | [messaging](features/messaging/README.md#fr-072) |
| FR-073 | [ai](features/ai/README.md#fr-073) |
| FR-074 | [ai](features/ai/README.md#fr-074) |
| FR-075 | [ai](features/ai/README.md#fr-075) |
| FR-076 | [ai](features/ai/README.md#fr-076) |
| FR-077 | [ai](features/ai/README.md#fr-077) |
| FR-078 | [ai](features/ai/README.md#fr-078) |
| FR-079 | [ai](features/ai/README.md#fr-079) |
| FR-080 | [ai](features/ai/README.md#fr-080) |
| FR-081 | [ai](features/ai/README.md#fr-081) |
| FR-082 | [ai](features/ai/README.md#fr-082) |
| FR-083 | [ai](features/ai/README.md#fr-083) |
| FR-084 | [ai](features/ai/README.md#fr-084) |
| FR-085 | [ai](features/ai/README.md#fr-085) |
| FR-086 | [ai](features/ai/README.md#fr-086) |
| FR-087 | [ai](features/ai/README.md#fr-087) |
| FR-088 | [ai](features/ai/README.md#fr-088) |
| FR-089 | [ai](features/ai/README.md#fr-089) |
| FR-090 | [share](features/share/README.md#fr-090) |
| FR-091 | [share](features/share/README.md#fr-091) |
| FR-092 | [share](features/share/README.md#fr-092) |
| FR-093 | [share](features/share/README.md#fr-093) |
| FR-094 | [share](features/share/README.md#fr-094) |
| FR-095 | [moderation](features/moderation/README.md#fr-095) |
| FR-096 | [moderation](features/moderation/README.md#fr-096) |
| FR-097 | [moderation](features/moderation/README.md#fr-097) |
| FR-098 | [moderation](features/moderation/README.md#fr-098) |
| FR-099 | [moderation](features/moderation/README.md#fr-099) |
| FR-100 | [moderation](features/moderation/README.md#fr-100) |
| FR-101 | [moderation](features/moderation/README.md#fr-101) |
| FR-102 | [moderation](features/moderation/README.md#fr-102) |
| FR-103 | [moderation](features/moderation/README.md#fr-103) |
| FR-104 | [moderation](features/moderation/README.md#fr-104) |
| FR-105 | [moderation](features/moderation/README.md#fr-105) |
| FR-106 | [moderation](features/moderation/README.md#fr-106) |
| FR-107 | [moderation](features/moderation/README.md#fr-107) |
| FR-108 | [content-lifecycle](features/content-lifecycle/README.md#fr-108) |
| FR-109 | [content-lifecycle](features/content-lifecycle/README.md#fr-109) |
| FR-110 | [content-lifecycle](features/content-lifecycle/README.md#fr-110) |
| FR-111 | [content-lifecycle](features/content-lifecycle/README.md#fr-111) |
| FR-112 | [publishing](features/publishing/README.md#fr-112) |
| FR-113 | [native-experience](features/native-experience/README.md#fr-113) |
| FR-114 | [data-lifecycle](features/data-lifecycle/README.md#fr-114) |
| FR-115 | [data-lifecycle](features/data-lifecycle/README.md#fr-115) |
| FR-116 | [data-lifecycle](features/data-lifecycle/README.md#fr-116) |
| FR-117 | [data-lifecycle](features/data-lifecycle/README.md#fr-117) |
| FR-118 | [data-lifecycle](features/data-lifecycle/README.md#fr-118) |
| FR-119 | [notifications](features/notifications/README.md#fr-119) |
| FR-120 | [notifications](features/notifications/README.md#fr-120) |
| FR-121 | [notifications](features/notifications/README.md#fr-121) |
| FR-122 | [notifications](features/notifications/README.md#fr-122) |
| FR-123 | [notifications](features/notifications/README.md#fr-123) |
| FR-124 | [notifications](features/notifications/README.md#fr-124) |
| FR-125 | [native-experience](features/native-experience/README.md#fr-125) |
| FR-126 | [native-experience](features/native-experience/README.md#fr-126) |
| FR-127 | [native-experience](features/native-experience/README.md#fr-127) |
| FR-128 | [native-experience](features/native-experience/README.md#fr-128) |
| FR-129 | [native-experience](features/native-experience/README.md#fr-129) |
| FR-130 | [configuration](features/configuration/README.md#fr-130) |
| FR-131 | [configuration](features/configuration/README.md#fr-131) |
| FR-132 | [configuration](features/configuration/README.md#fr-132) |
| FR-133 | [configuration](features/configuration/README.md#fr-133) |
| FR-134 | [configuration](features/configuration/README.md#fr-134) |
| FR-135 | [configuration](features/configuration/README.md#fr-135) |
| FR-136 | [configuration](features/configuration/README.md#fr-136) |
| FR-137 | [configuration](features/configuration/README.md#fr-137) |
| FR-138 | [configuration](features/configuration/README.md#fr-138) |
| FR-139 | [configuration](features/configuration/README.md#fr-139) |
| FR-140 | [configuration](features/configuration/README.md#fr-140) |
| FR-141 | [configuration](features/configuration/README.md#fr-141) |
| FR-142 | [developer-tools](features/developer-tools/README.md#fr-142) |
| FR-143 | [plugins](features/plugins/README.md#fr-143) |
| FR-144 | [plugins](features/plugins/README.md#fr-144) |
| FR-145 | [plugins](features/plugins/README.md#fr-145) |
| FR-146 | [plugins](features/plugins/README.md#fr-146) |
| FR-147 | [plugins](features/plugins/README.md#fr-147) |
| FR-148 | [developer-tools](features/developer-tools/README.md#fr-148) |
| FR-149 | [developer-tools](features/developer-tools/README.md#fr-149) |
| FR-150 | [developer-tools](features/developer-tools/README.md#fr-150) |
| FR-151 | [developer-tools](features/developer-tools/README.md#fr-151) |
| FR-152 | [plugins](features/plugins/README.md#fr-152) |
| FR-153 | [plugins](features/plugins/README.md#fr-153) |
| FR-154 | [plugins](features/plugins/README.md#fr-154) |
| FR-155 | [plugins](features/plugins/README.md#fr-155) |
| FR-156 | [plugins](features/plugins/README.md#fr-156) |
| FR-157 | [plugins](features/plugins/README.md#fr-157) |
| FR-158 | [plugins](features/plugins/README.md#fr-158) |
| FR-159 | [plugins](features/plugins/README.md#fr-159) |
| FR-160 | [releases](features/releases/README.md#fr-160) |
| FR-161 | [releases](features/releases/README.md#fr-161) |
| FR-162 | [releases](features/releases/README.md#fr-162) |
| FR-163 | [releases](features/releases/README.md#fr-163) |
| FR-164 | [releases](features/releases/README.md#fr-164) |
| FR-165 | [developer-tools](features/developer-tools/README.md#fr-165) |
| FR-166 | [developer-tools](features/developer-tools/README.md#fr-166) |
| FR-167 | [developer-tools](features/developer-tools/README.md#fr-167) |
| FR-168 | [developer-tools](features/developer-tools/README.md#fr-168) |
| FR-169 | [developer-tools](features/developer-tools/README.md#fr-169) |
| FR-170 | [developer-tools](features/developer-tools/README.md#fr-170) |
| FR-171 | [developer-tools](features/developer-tools/README.md#fr-171) |
| FR-172 | [developer-tools](features/developer-tools/README.md#fr-172) |
| FR-173 | [developer-tools](features/developer-tools/README.md#fr-173) |

## QR逐项承载（10项）

| 需求 | 具体承载 |
| --- | --- |
| QR-001 | [rules](features/rules.md#qr-001) |
| QR-002 | [rules](features/rules.md#qr-002) |
| QR-003 | [rules](features/rules.md#qr-003) |
| QR-004 | [rules](features/rules.md#qr-004) |
| QR-005 | [rules](features/rules.md#qr-005) |
| QR-006 | [rules](features/rules.md#qr-006) |
| QR-007 | [rules](features/rules.md#qr-007) |
| QR-008 | [rules](features/rules.md#qr-008) |
| QR-009 | [rules](features/rules.md#qr-009) |
| QR-010 | [rules](features/rules.md#qr-010) |

## AC完整行为与直接消费者（55项）

主承载保完整原前置操作异常并发直接访问；跨域共同执行，不以摘要缩范围。视觉地点仅依最新授权改本地。

| AC | 完整场景主承载 | 直接业务消费者 / 质量约束 |
| --- | --- | --- |
| AC-01 | [account](features/account/README.md) | [account](features/account/README.md) |
| AC-02 | [account](features/account/README.md) | [account](features/account/README.md) |
| AC-03 | [account](features/account/README.md) | [account](features/account/README.md), [data-lifecycle](features/data-lifecycle/README.md) |
| AC-04 | [profile](features/profile/README.md) | [profile](features/profile/README.md), [content-lifecycle](features/content-lifecycle/README.md), [share](features/share/README.md), [moderation](features/moderation/README.md) |
| AC-05 | [profile](features/profile/README.md) | [profile](features/profile/README.md) |
| AC-06 | [profile](features/profile/README.md) | [profile](features/profile/README.md), [content-lifecycle](features/content-lifecycle/README.md), [ai](features/ai/README.md) |
| AC-07 | [profile](features/profile/README.md) | [profile](features/profile/README.md), [discovery](features/discovery/README.md), [messaging](features/messaging/README.md), [notifications](features/notifications/README.md) |
| AC-08 | [publishing](features/publishing/README.md) | [publishing](features/publishing/README.md), [content-lifecycle](features/content-lifecycle/README.md), [native-experience](features/native-experience/README.md), [configuration](features/configuration/README.md) |
| AC-09 | [publishing](features/publishing/README.md) | [publishing](features/publishing/README.md) |
| AC-10 | [publishing](features/publishing/README.md) | [publishing](features/publishing/README.md), [content-lifecycle](features/content-lifecycle/README.md), [moderation](features/moderation/README.md) |
| AC-11 | [discussions](features/discussions/README.md) | [discussions](features/discussions/README.md), [configuration](features/configuration/README.md) |
| AC-12 | [discussions](features/discussions/README.md) | [discussions](features/discussions/README.md), [content-lifecycle](features/content-lifecycle/README.md), [notifications](features/notifications/README.md) |
| AC-13 | [discussions](features/discussions/README.md) | [discussions](features/discussions/README.md), [content-lifecycle](features/content-lifecycle/README.md) |
| AC-14 | [content-lifecycle](features/content-lifecycle/README.md) | [discussions](features/discussions/README.md), [content-lifecycle](features/content-lifecycle/README.md) |
| AC-15 | [content-lifecycle](features/content-lifecycle/README.md) | [publishing](features/publishing/README.md), [discussions](features/discussions/README.md), [content-lifecycle](features/content-lifecycle/README.md), [share](features/share/README.md) |
| AC-16 | [discovery](features/discovery/README.md) | [publishing](features/publishing/README.md), [content-lifecycle](features/content-lifecycle/README.md), [discovery](features/discovery/README.md) |
| AC-17 | [publishing](features/publishing/README.md) | [account](features/account/README.md), [publishing](features/publishing/README.md), [ai](features/ai/README.md), [content-lifecycle](features/content-lifecycle/README.md) |
| AC-18 | [discovery](features/discovery/README.md) | [discovery](features/discovery/README.md) |
| AC-19 | [messaging](features/messaging/README.md) | [profile](features/profile/README.md), [messaging](features/messaging/README.md), [configuration](features/configuration/README.md) |
| AC-20 | [messaging](features/messaging/README.md) | [publishing](features/publishing/README.md), [messaging](features/messaging/README.md), [notifications](features/notifications/README.md) |
| AC-21 | [messaging](features/messaging/README.md) | [account](features/account/README.md), [messaging](features/messaging/README.md), [moderation](features/moderation/README.md), [data-lifecycle](features/data-lifecycle/README.md) |
| AC-22 | [ai](features/ai/README.md) | [ai](features/ai/README.md) |
| AC-23 | [ai](features/ai/README.md) | [publishing](features/publishing/README.md), [content-lifecycle](features/content-lifecycle/README.md), [ai](features/ai/README.md) |
| AC-24 | [ai](features/ai/README.md) | [ai](features/ai/README.md) |
| AC-25 | [ai](features/ai/README.md) | [content-lifecycle](features/content-lifecycle/README.md), [ai](features/ai/README.md) |
| AC-26 | [ai](features/ai/README.md) | [ai](features/ai/README.md), [data-lifecycle](features/data-lifecycle/README.md), [configuration](features/configuration/README.md) |
| AC-27 | [share](features/share/README.md) | [profile](features/profile/README.md), [content-lifecycle](features/content-lifecycle/README.md), [share](features/share/README.md) |
| AC-28 | [moderation](features/moderation/README.md) | [moderation](features/moderation/README.md) |
| AC-29 | [moderation](features/moderation/README.md) | [content-lifecycle](features/content-lifecycle/README.md), [moderation](features/moderation/README.md) |
| AC-30 | [moderation](features/moderation/README.md) | [messaging](features/messaging/README.md), [ai](features/ai/README.md), [moderation](features/moderation/README.md), [data-lifecycle](features/data-lifecycle/README.md) |
| AC-31 | [content-lifecycle](features/content-lifecycle/README.md) | [content-lifecycle](features/content-lifecycle/README.md), [messaging](features/messaging/README.md), [share](features/share/README.md), [publishing](features/publishing/README.md), [native-experience](features/native-experience/README.md) |
| AC-32 | [data-lifecycle](features/data-lifecycle/README.md) | [account](features/account/README.md), [publishing](features/publishing/README.md), [content-lifecycle](features/content-lifecycle/README.md), [messaging](features/messaging/README.md), [data-lifecycle](features/data-lifecycle/README.md), [configuration](features/configuration/README.md) |
| AC-33 | [notifications](features/notifications/README.md) | [notifications](features/notifications/README.md) |
| AC-34 | [notifications](features/notifications/README.md) | [account](features/account/README.md), [publishing](features/publishing/README.md), [ai](features/ai/README.md), [moderation](features/moderation/README.md), [notifications](features/notifications/README.md) |
| AC-35 | [native-experience](features/native-experience/README.md) | [ai](features/ai/README.md), [publishing](features/publishing/README.md), [native-experience](features/native-experience/README.md), [rules](features/rules.md) |
| AC-36 | [rules](features/rules.md) | [rules](features/rules.md) |
| AC-37 | [content-lifecycle](features/content-lifecycle/README.md) | [profile](features/profile/README.md), [discussions](features/discussions/README.md), [content-lifecycle](features/content-lifecycle/README.md), [ai](features/ai/README.md), [moderation](features/moderation/README.md) |
| AC-38 | [configuration](features/configuration/README.md) | [moderation](features/moderation/README.md), [configuration](features/configuration/README.md), [plugins](features/plugins/README.md) |
| AC-39 | [configuration](features/configuration/README.md) | [publishing](features/publishing/README.md), [ai](features/ai/README.md), [configuration](features/configuration/README.md) |
| AC-40 | [configuration](features/configuration/README.md) | [moderation](features/moderation/README.md), [configuration](features/configuration/README.md) |
| AC-41 | [configuration](features/configuration/README.md) | [discussions](features/discussions/README.md), [messaging](features/messaging/README.md), [data-lifecycle](features/data-lifecycle/README.md), [native-experience](features/native-experience/README.md), [configuration](features/configuration/README.md) |
| AC-42 | [ai](features/ai/README.md) | [ai](features/ai/README.md), [configuration](features/configuration/README.md) |
| AC-43 | [plugins](features/plugins/README.md) | [content-lifecycle](features/content-lifecycle/README.md), [moderation](features/moderation/README.md), [configuration](features/configuration/README.md), [developer-tools](features/developer-tools/README.md), [plugins](features/plugins/README.md) |
| AC-44 | [developer-tools](features/developer-tools/README.md) | [publishing](features/publishing/README.md), [moderation](features/moderation/README.md), [notifications](features/notifications/README.md), [plugins](features/plugins/README.md), [developer-tools](features/developer-tools/README.md) |
| AC-45 | [plugins](features/plugins/README.md) | [moderation](features/moderation/README.md), [plugins](features/plugins/README.md), [developer-tools](features/developer-tools/README.md) |
| AC-46 | [plugins](features/plugins/README.md) | [moderation](features/moderation/README.md), [data-lifecycle](features/data-lifecycle/README.md), [notifications](features/notifications/README.md), [plugins](features/plugins/README.md), [developer-tools](features/developer-tools/README.md) |
| AC-47 | [releases](features/releases/README.md) | [moderation](features/moderation/README.md), [native-experience](features/native-experience/README.md), [configuration](features/configuration/README.md), [developer-tools](features/developer-tools/README.md), [plugins](features/plugins/README.md), [releases](features/releases/README.md) |
| AC-48 | [developer-tools](features/developer-tools/README.md) | [developer-tools](features/developer-tools/README.md), [rules](features/rules.md) |
| AC-49 | [developer-tools](features/developer-tools/README.md) | [plugins](features/plugins/README.md), [releases](features/releases/README.md), [developer-tools](features/developer-tools/README.md), [rules](features/rules.md) |
| AC-50 | [developer-tools](features/developer-tools/README.md) | [content-lifecycle](features/content-lifecycle/README.md), [data-lifecycle](features/data-lifecycle/README.md), [configuration](features/configuration/README.md), [plugins](features/plugins/README.md), [developer-tools](features/developer-tools/README.md) |
| AC-51 | [releases](features/releases/README.md) | [releases](features/releases/README.md), [developer-tools](features/developer-tools/README.md), [rules](features/rules.md) |
| AC-52 | [native-experience](features/native-experience/README.md) | [native-experience](features/native-experience/README.md), [developer-tools](features/developer-tools/README.md), [releases](features/releases/README.md), [rules](features/rules.md) |
| AC-53 | [releases](features/releases/README.md) | [releases](features/releases/README.md), [developer-tools](features/developer-tools/README.md), [rules](features/rules.md) |
| AC-54 | [messaging](features/messaging/README.md) | [profile](features/profile/README.md), [publishing](features/publishing/README.md), [messaging](features/messaging/README.md), [notifications](features/notifications/README.md) |
| AC-55 | [native-experience](features/native-experience/README.md) | [native-experience](features/native-experience/README.md), [configuration](features/configuration/README.md), [developer-tools](features/developer-tools/README.md), [rules](features/rules.md) |

## PRD原需求逐项承接（202项）

完整正文继续见[PRD](../docs/product/PRD.md)，本表指具体业务文件，不作已实现声明。

| PRD需求 | 保留FR/QR关联 | 具体承载 |
| --- | --- | --- |
| TECH-01 | QR-001 | [rules](features/rules.md) |
| TECH-02 | QR-001 | [rules](features/rules.md) |
| TECH-03 | QR-001 | [rules](features/rules.md) |
| TECH-04 | QR-001 | [rules](features/rules.md) |
| TECH-05 | QR-002 | [rules](features/rules.md) |
| AUTH-01 | FR-001 | [account](features/account/README.md) |
| AUTH-02 | FR-002 | [account](features/account/README.md) |
| AUTH-03 | FR-003 | [account](features/account/README.md) |
| AUTH-04 | FR-002–003 | [account](features/account/README.md) |
| AUTH-05 | FR-004 | [account](features/account/README.md) |
| AUTH-06 | FR-005 | [account](features/account/README.md) |
| AUTH-07 | FR-006 | [account](features/account/README.md) |
| AUTH-08 | FR-007 | [account](features/account/README.md) |
| AUTH-09 | FR-007 | [account](features/account/README.md) |
| AUTH-10 | FR-008 | [account](features/account/README.md) |
| PRF-01 | FR-009 | [profile](features/profile/README.md) |
| PRF-02 | FR-010 | [profile](features/profile/README.md) |
| PRF-03 | FR-011 | [profile](features/profile/README.md) |
| SOC-01 | FR-012 | [profile](features/profile/README.md) |
| SOC-02 | FR-012 | [profile](features/profile/README.md) |
| SOC-03 | FR-013 | [profile](features/profile/README.md) |
| SOC-04 | FR-013 | [profile](features/profile/README.md) |
| SOC-05 | FR-014 | [profile](features/profile/README.md) |
| SOC-06 | FR-014 | [profile](features/profile/README.md) |
| SOC-07 | FR-015 | [profile](features/profile/README.md) |
| SOC-08 | FR-016 | [profile](features/profile/README.md) |
| SOC-09 | FR-017 | [profile](features/profile/README.md) |
| SOC-10 | FR-017 | [profile](features/profile/README.md) |
| POST-01 | FR-018 | [publishing](features/publishing/README.md) |
| POST-02 | FR-019 | [publishing](features/publishing/README.md) |
| POST-03 | FR-020 | [publishing](features/publishing/README.md) |
| POST-04 | FR-021 | [publishing](features/publishing/README.md) |
| POST-05 | FR-022 | [publishing](features/publishing/README.md) |
| POST-06 | FR-022 | [publishing](features/publishing/README.md) |
| DRF-01 | FR-023 | [publishing](features/publishing/README.md) |
| DRF-02 | FR-024 | [publishing](features/publishing/README.md) |
| DRF-03 | FR-025 | [publishing](features/publishing/README.md) |
| THR-01 | FR-026 | [publishing](features/publishing/README.md) |
| THR-02 | FR-026 | [publishing](features/publishing/README.md) |
| THR-03 | FR-027 | [publishing](features/publishing/README.md) |
| THR-04 | FR-027 | [publishing](features/publishing/README.md) |
| POL-01 | FR-028 | [discussions](features/discussions/README.md) |
| POL-02 | FR-029 | [discussions](features/discussions/README.md) |
| POL-03 | FR-030 | [discussions](features/discussions/README.md) |
| POL-04 | FR-031 | [discussions](features/discussions/README.md) |
| POL-05 | FR-032 | [discussions](features/discussions/README.md) |
| POL-06 | FR-029、FR-032–033 | [discussions](features/discussions/README.md) |
| POL-07 | FR-033 | [discussions](features/discussions/README.md) |
| CMT-01 | FR-034 | [discussions](features/discussions/README.md) |
| CMT-02 | FR-035 | [discussions](features/discussions/README.md) |
| CMT-03 | FR-036 | [discussions](features/discussions/README.md) |
| CMT-04 | FR-037 | [discussions](features/discussions/README.md) |
| CMT-05 | FR-038 | [discussions](features/discussions/README.md) |
| CMT-06 | FR-038 | [discussions](features/discussions/README.md) |
| CMT-07 | FR-034、FR-039 | [discussions](features/discussions/README.md) |
| CMT-08 | FR-040 | [discussions](features/discussions/README.md) |
| EDIT-01 | FR-041 | [content-lifecycle](features/content-lifecycle/README.md) |
| EDIT-02 | FR-042 | [content-lifecycle](features/content-lifecycle/README.md) |
| EDIT-03 | FR-043 | [content-lifecycle](features/content-lifecycle/README.md) |
| VIS-01 | FR-044、FR-047、FR-052 | [content-lifecycle](features/content-lifecycle/README.md) |
| VIS-02 | FR-045、FR-047、FR-052 | [content-lifecycle](features/content-lifecycle/README.md) |
| VIS-03 | FR-046–047、FR-052 | [content-lifecycle](features/content-lifecycle/README.md) |
| DEL-01 | FR-048、FR-052 | [content-lifecycle](features/content-lifecycle/README.md) |
| DEL-02 | FR-049、FR-052 | [content-lifecycle](features/content-lifecycle/README.md) |
| DEL-03 | FR-050、FR-052 | [content-lifecycle](features/content-lifecycle/README.md) |
| DEL-04 | FR-051–052 | [content-lifecycle](features/content-lifecycle/README.md) |
| INT-01 | FR-053 | [discovery](features/discovery/README.md) |
| INT-02 | FR-054 | [discovery](features/discovery/README.md) |
| INT-03 | FR-055 | [discovery](features/discovery/README.md) |
| FEED-01 | FR-056 | [discovery](features/discovery/README.md) |
| FEED-02 | FR-057 | [discovery](features/discovery/README.md) |
| FEED-03 | FR-058 | [discovery](features/discovery/README.md) |
| SEARCH-01 | FR-059 | [discovery](features/discovery/README.md) |
| SEARCH-02 | FR-060 | [discovery](features/discovery/README.md) |
| SEARCH-03 | FR-060 | [discovery](features/discovery/README.md) |
| SEARCH-04 | FR-060 | [discovery](features/discovery/README.md) |
| DM-01 | FR-061 | [messaging](features/messaging/README.md) |
| DM-02 | FR-062 | [messaging](features/messaging/README.md) |
| DM-03 | FR-063 | [messaging](features/messaging/README.md) |
| DM-04 | FR-064 | [messaging](features/messaging/README.md) |
| DM-05 | FR-065 | [messaging](features/messaging/README.md) |
| DM-06 | FR-066 | [messaging](features/messaging/README.md) |
| DM-12 | FR-067 | [messaging](features/messaging/README.md) |
| DM-07 | FR-068 | [messaging](features/messaging/README.md) |
| DM-08 | FR-069 | [messaging](features/messaging/README.md) |
| DM-09 | FR-070 | [messaging](features/messaging/README.md) |
| DM-10 | FR-071 | [messaging](features/messaging/README.md) |
| DM-11 | FR-072 | [messaging](features/messaging/README.md) |
| AI-01 | FR-073 | [ai](features/ai/README.md) |
| AI-02 | FR-073 | [ai](features/ai/README.md) |
| AI-03 | FR-074 | [ai](features/ai/README.md) |
| AI-04 | FR-075 | [ai](features/ai/README.md) |
| AI-05 | FR-076 | [ai](features/ai/README.md) |
| AI-06 | FR-077 | [ai](features/ai/README.md) |
| AI-07 | FR-075 | [ai](features/ai/README.md) |
| AI-08 | FR-078 | [ai](features/ai/README.md) |
| AI-09 | FR-079 | [ai](features/ai/README.md) |
| AI-10 | FR-080 | [ai](features/ai/README.md) |
| AI-11 | FR-081 | [ai](features/ai/README.md) |
| AI-12 | FR-082 | [ai](features/ai/README.md) |
| AI-13 | FR-083 | [ai](features/ai/README.md) |
| AI-14 | FR-084 | [ai](features/ai/README.md) |
| AI-15 | FR-084 | [ai](features/ai/README.md) |
| AI-16 | FR-085 | [ai](features/ai/README.md) |
| AI-17 | FR-086 | [ai](features/ai/README.md) |
| AI-18 | FR-087 | [ai](features/ai/README.md) |
| AI-19 | FR-088 | [ai](features/ai/README.md) |
| AI-20 | FR-089 | [ai](features/ai/README.md) |
| WEB-01 | FR-090 | [share](features/share/README.md) |
| WEB-02 | FR-091 | [share](features/share/README.md) |
| WEB-03 | FR-092 | [share](features/share/README.md) |
| WEB-04 | FR-093 | [share](features/share/README.md) |
| WEB-05 | FR-093 | [share](features/share/README.md) |
| WEB-06 | FR-094 | [share](features/share/README.md) |
| GOV-01 | FR-095 | [moderation](features/moderation/README.md) |
| GOV-02 | FR-096 | [moderation](features/moderation/README.md) |
| GOV-03 | FR-097 | [moderation](features/moderation/README.md) |
| GOV-04 | FR-097 | [moderation](features/moderation/README.md) |
| GOV-05 | FR-098 | [moderation](features/moderation/README.md) |
| GOV-06 | FR-099 | [moderation](features/moderation/README.md) |
| GOV-07 | FR-100 | [moderation](features/moderation/README.md) |
| ADM-01 | FR-101 | [moderation](features/moderation/README.md) |
| ADM-02 | FR-102 | [moderation](features/moderation/README.md) |
| ADM-03 | FR-103 | [moderation](features/moderation/README.md) |
| ADM-04 | FR-104 | [moderation](features/moderation/README.md) |
| ADM-05 | FR-105 | [moderation](features/moderation/README.md) |
| ADM-06 | FR-106 | [moderation](features/moderation/README.md) |
| ADM-07 | FR-107 | [moderation](features/moderation/README.md) |
| MEDIA-01 | FR-108 | [content-lifecycle](features/content-lifecycle/README.md) |
| MEDIA-02 | FR-109 | [content-lifecycle](features/content-lifecycle/README.md) |
| MEDIA-03 | FR-110 | [content-lifecycle](features/content-lifecycle/README.md) |
| MEDIA-04 | FR-111 | [content-lifecycle](features/content-lifecycle/README.md) |
| MEDIA-05 | FR-112 | [publishing](features/publishing/README.md) |
| MEDIA-06 | FR-113 | [native-experience](features/native-experience/README.md) |
| DATA-01 | FR-114、FR-118 | [data-lifecycle](features/data-lifecycle/README.md) |
| DATA-02 | FR-115、FR-118 | [data-lifecycle](features/data-lifecycle/README.md) |
| DATA-03 | FR-116、FR-118 | [data-lifecycle](features/data-lifecycle/README.md) |
| DATA-04 | FR-117–118 | [data-lifecycle](features/data-lifecycle/README.md) |
| NTF-01 | FR-119 | [notifications](features/notifications/README.md) |
| NTF-02 | FR-120 | [notifications](features/notifications/README.md) |
| NTF-03 | FR-121 | [notifications](features/notifications/README.md) |
| NTF-04 | FR-122 | [notifications](features/notifications/README.md) |
| NTF-05 | FR-123 | [notifications](features/notifications/README.md) |
| FAIL-01 | FR-124 | [notifications](features/notifications/README.md) |
| UX-01 | FR-125 | [native-experience](features/native-experience/README.md) |
| UX-02 | FR-126 | [native-experience](features/native-experience/README.md) |
| UX-03 | FR-126 | [native-experience](features/native-experience/README.md) |
| UX-04 | FR-127 | [native-experience](features/native-experience/README.md) |
| UX-05 | FR-128 | [native-experience](features/native-experience/README.md) |
| UX-06 | FR-128 | [native-experience](features/native-experience/README.md) |
| UX-07 | FR-125 | [native-experience](features/native-experience/README.md) |
| UX-08 | FR-129 | [native-experience](features/native-experience/README.md) |
| CFG-01 | FR-130 | [configuration](features/configuration/README.md) |
| CFG-02 | FR-131 | [configuration](features/configuration/README.md) |
| CFG-03 | FR-132 | [configuration](features/configuration/README.md) |
| CFG-04 | FR-133 | [configuration](features/configuration/README.md) |
| CFG-05 | FR-134 | [configuration](features/configuration/README.md) |
| CFG-06 | FR-135 | [configuration](features/configuration/README.md) |
| CFG-07 | FR-136 | [configuration](features/configuration/README.md) |
| CFG-08 | FR-137 | [configuration](features/configuration/README.md) |
| CFG-09 | FR-138 | [configuration](features/configuration/README.md) |
| CFG-10 | FR-139 | [configuration](features/configuration/README.md) |
| CFG-11 | FR-140 | [configuration](features/configuration/README.md) |
| CFG-12 | FR-141 | [configuration](features/configuration/README.md) |
| CFG-13 | FR-141 | [configuration](features/configuration/README.md) |
| CI-01 | QR-002 | [rules](features/rules.md) |
| CI-02 | QR-003 | [rules](features/rules.md) |
| CI-03 | QR-004 | [rules](features/rules.md) |
| CI-04 | QR-005 | [rules](features/rules.md) |
| CI-05 | QR-006 | [rules](features/rules.md) |
| CI-06 | QR-007 | [rules](features/rules.md) |
| CI-07 | QR-008 | [rules](features/rules.md) |
| CI-08 | QR-009 | [rules](features/rules.md) |
| PLT-01 | FR-142 | [developer-tools](features/developer-tools/README.md) |
| PLT-02 | FR-143 | [plugins](features/plugins/README.md) |
| PLT-03 | FR-144 | [plugins](features/plugins/README.md) |
| PLT-04 | FR-145 | [plugins](features/plugins/README.md) |
| PLT-05 | FR-146 | [plugins](features/plugins/README.md) |
| PLT-06 | FR-147 | [plugins](features/plugins/README.md) |
| EXT-01 | FR-148 | [developer-tools](features/developer-tools/README.md) |
| EXT-02 | FR-149 | [developer-tools](features/developer-tools/README.md) |
| EXT-03 | FR-150 | [developer-tools](features/developer-tools/README.md) |
| EXT-04 | FR-151 | [developer-tools](features/developer-tools/README.md) |
| PLG-01 | FR-152–153 | [plugins](features/plugins/README.md) |
| PLG-02 | FR-154 | [plugins](features/plugins/README.md) |
| PLG-03 | FR-155–156 | [plugins](features/plugins/README.md) |
| PLG-04 | FR-157 | [plugins](features/plugins/README.md) |
| PLG-05 | FR-156、FR-158 | [plugins](features/plugins/README.md) |
| PLG-06 | FR-159 | [plugins](features/plugins/README.md) |
| UPD-01 | FR-160 | [releases](features/releases/README.md) |
| UPD-02 | FR-161 | [releases](features/releases/README.md) |
| UPD-03 | FR-162 | [releases](features/releases/README.md) |
| UPD-04 | FR-163 | [releases](features/releases/README.md) |
| UPD-05 | FR-164 | [releases](features/releases/README.md) |
| DEV-01 | FR-165、FR-169 | [developer-tools](features/developer-tools/README.md) |
| DEV-02 | FR-166、FR-169 | [developer-tools](features/developer-tools/README.md) |
| DEV-03 | FR-167、FR-169 | [developer-tools](features/developer-tools/README.md) |
| DEV-04 | FR-168–169 | [developer-tools](features/developer-tools/README.md) |
| TST-01 | FR-170 | [developer-tools](features/developer-tools/README.md) |
| TST-02 | FR-171 | [developer-tools](features/developer-tools/README.md) |
| TST-03 | FR-172 | [developer-tools](features/developer-tools/README.md) |
| TST-04 | FR-173 | [developer-tools](features/developer-tools/README.md) |

## 控件动作的准确OpenAPI绑定

下表只引用OpenAPI现有operationId，不定义第二套请求/响应。implemented仅代表已存在实现切片，planned明确尚未实现，均不自动表示真实验收通过。CLI/本地导航/链接构造/受控worker内部步骤不伪造HTTP端点。功能动作表说明同端点的action/kind及状态约束。

| 功能 | operationId | 唯一契约 | 实现登记 |
| --- | --- | --- | --- |
| [account](features/account/README.md) | `cancelAccount` | [POST /me/cancellation](contracts/app-api.yaml) | planned |
| [account](features/account/README.md) | `changePhone` | [POST /me/phone-change](contracts/app-api.yaml) | planned |
| [account](features/account/README.md) | `createInvitationManagement` | [POST /admin/invitations](contracts/management-api.yaml) | planned |
| [account](features/account/README.md) | `createOtpChallenge` | [POST /auth/challenges](contracts/app-api.yaml) | implemented |
| [account](features/account/README.md) | `createRecoveryCase` | [POST /recovery-cases](contracts/app-api.yaml) | implemented |
| [account](features/account/README.md) | `getRecoveryCase` | [GET /recovery-cases/{caseId}](contracts/app-api.yaml) | implemented |
| [account](features/account/README.md) | `listDeviceSessions` | [GET /me/sessions](contracts/app-api.yaml) | implemented |
| [account](features/account/README.md) | `logoutAppSession` | [POST /auth/logout](contracts/app-api.yaml) | implemented |
| [account](features/account/README.md) | `previewCancellation` | [POST /me/cancellation/preview](contracts/app-api.yaml) | planned |
| [account](features/account/README.md) | `previewPhoneChange` | [POST /me/phone-change/preview](contracts/app-api.yaml) | planned |
| [account](features/account/README.md) | `readOtpVerificationOperation` | [POST /auth/operations/{operationId}](contracts/app-api.yaml) | implemented |
| [account](features/account/README.md) | `revokeDeviceSession` | [DELETE /me/sessions/{sessionId}](contracts/app-api.yaml) | implemented |
| [account](features/account/README.md) | `revokeInvitationManagement` | [POST /admin/invitations/{invitationId}/revoke](contracts/management-api.yaml) | planned |
| [account](features/account/README.md) | `verifyOtpChallenge` | [POST /auth/verify](contracts/app-api.yaml) | implemented |
| [profile](features/profile/README.md) | `actOnFollowRequest` | [POST /follow-requests/{requestId}/actions](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `deleteMute` | [DELETE /me/mutes](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `getPreferences` | [GET /me/preferences](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `getProfile` | [GET /profiles/{accountId}](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `listFollowRequests` | [GET /me/follow-requests](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `listProfileContents` | [GET /profiles/{accountId}/contents](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `listProfileRelationships` | [GET /profiles/{accountId}/relationships](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `patchPreferences` | [PATCH /me/preferences](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `putBlock` | [PUT /me/blocks/{accountId}](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `putFollow` | [PUT /me/follows/{accountId}](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `putMute` | [PUT /me/mutes](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `removeBlock` | [DELETE /me/blocks/{accountId}](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `removeFollow` | [DELETE /me/follows/{accountId}](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `removeFollower` | [DELETE /me/followers/{accountId}](contracts/app-api.yaml) | planned |
| [profile](features/profile/README.md) | `updateProfile` | [PATCH /me/profile](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `appendThreadBatch` | [POST /threads/{threadId}/batches](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `completeUpload` | [POST /uploads/{uploadId}/complete](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `createDraft` | [POST /me/drafts](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `createPost` | [POST /posts](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `createThread` | [POST /threads](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `createUpload` | [POST /uploads](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `deleteDraft` | [DELETE /me/drafts/{draftId}](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `getAppOperation` | [GET /operations/{operationId}](contracts/app-api.yaml) | implemented |
| [publishing](features/publishing/README.md) | `getDraft` | [GET /me/drafts/{draftId}](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `getThread` | [GET /threads/{threadId}](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `listDrafts` | [GET /me/drafts](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `listOwnedContents` | [GET /me/contents](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `patchDraft` | [PATCH /me/drafts/{draftId}](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `putUploadPart` | [PUT /uploads/{uploadId}/parts/{part}](contracts/app-api.yaml) | planned |
| [publishing](features/publishing/README.md) | `searchCommunity` | [GET /search](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `castPollVote` | [POST /polls/{pollId}/votes](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `correctPoll` | [POST /polls/{pollId}/corrections](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `createComment` | [POST /posts/{postId}/comments](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `deleteComment` | [DELETE /comments/{commentId}](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `endPoll` | [POST /polls/{pollId}/end](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `getPollResults` | [GET /polls/{pollId}/results](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `listComments` | [GET /posts/{postId}/comments](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `patchComment` | [PATCH /comments/{commentId}](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `patchPoll` | [PATCH /polls/{pollId}](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `patchReplyPolicy` | [PATCH /posts/{postId}/reply-policy](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `putResourceLike` | [PUT /resources/{resourceId}/likes](contracts/app-api.yaml) | planned |
| [discussions](features/discussions/README.md) | `removeResourceLike` | [DELETE /resources/{resourceId}/likes](contracts/app-api.yaml) | planned |
| [content-lifecycle](features/content-lifecycle/README.md) | `deleteResource` | [POST /resources/{resourceId}/deletion](contracts/app-api.yaml) | planned |
| [content-lifecycle](features/content-lifecycle/README.md) | `getMediaBytes` | [GET /media/{mediaId}](contracts/app-api.yaml) | implemented |
| [content-lifecycle](features/content-lifecycle/README.md) | `getPost` | [GET /posts/{postId}](contracts/app-api.yaml) | implemented |
| [content-lifecycle](features/content-lifecycle/README.md) | `headMediaBytes` | [HEAD /media/{mediaId}](contracts/app-api.yaml) | implemented |
| [content-lifecycle](features/content-lifecycle/README.md) | `listPostRevisions` | [GET /posts/{postId}/revisions](contracts/app-api.yaml) | planned |
| [content-lifecycle](features/content-lifecycle/README.md) | `listRecentlyDeleted` | [GET /me/recently-deleted](contracts/app-api.yaml) | planned |
| [content-lifecycle](features/content-lifecycle/README.md) | `patchPost` | [PATCH /posts/{postId}](contracts/app-api.yaml) | planned |
| [content-lifecycle](features/content-lifecycle/README.md) | `patchPostVisibility` | [PATCH /posts/{postId}/visibility](contracts/app-api.yaml) | planned |
| [content-lifecycle](features/content-lifecycle/README.md) | `restoreResource` | [POST /deletions/{deletionId}/restore](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `clearSearchHistory` | [DELETE /me/search-history](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `createPlacementManagement` | [POST /admin/placements](contracts/management-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `createPost` | [POST /posts](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `deleteBookmark` | [DELETE /me/bookmarks/{postId}](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `deletePlacementManagement` | [DELETE /admin/placements/{itemId}](contracts/management-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `getDiscovery` | [GET /discover](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `getInterests` | [GET /me/interests](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `getPlacementsManagement` | [GET /admin/placements](contracts/management-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `listBookmarks` | [GET /me/bookmarks](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `listInteractions` | [GET /resources/{resourceId}/interactions](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `listLatestPosts` | [GET /feeds/latest](contracts/app-api.yaml) | implemented |
| [discovery](features/discovery/README.md) | `listPersonalFeed` | [GET /feeds/{kind}](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `listSearchHistory` | [GET /me/search-history](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `patchInterests` | [PATCH /me/interests](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `patchPlacementManagement` | [PATCH /admin/placements/{itemId}](contracts/management-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `putBookmark` | [PUT /me/bookmarks/{postId}](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `putPostRepost` | [PUT /posts/{postId}/reposts](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `putResourceLike` | [PUT /resources/{resourceId}/likes](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `removePostRepost` | [DELETE /posts/{postId}/reposts](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `removeResourceLike` | [DELETE /resources/{resourceId}/likes](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `searchCommunity` | [GET /search](contracts/app-api.yaml) | planned |
| [discovery](features/discovery/README.md) | `suggestSearch` | [GET /search/suggestions](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `actOnDmRequest` | [POST /dm/requests/{requestId}/actions](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `createDmRequest` | [POST /dm/requests](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `getAppOperation` | [GET /operations/{operationId}](contracts/app-api.yaml) | implemented |
| [messaging](features/messaging/README.md) | `getDmEligibility` | [GET /dm/eligibility/{recipientId}](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `hideConversationListing` | [DELETE /dm/conversations/{conversationId}/listing](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `listDmConversations` | [GET /dm/conversations](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `listDmMessages` | [GET /dm/conversations/{conversationId}/messages](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `listDmRequests` | [GET /dm/requests](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `patchPreferences` | [PATCH /me/preferences](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `recordConversationRead` | [POST /dm/conversations/{conversationId}/read](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `revokeOwnMessageAccess` | [DELETE /dm/messages/{messageId}/access](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `sendDmMessage` | [POST /dm/messages](contracts/app-api.yaml) | planned |
| [messaging](features/messaging/README.md) | `signalTyping` | [POST /dm/conversations/{conversationId}/typing](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `copyAiAnswer` | [POST /ai/answers/{answerId}/copy](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `createAiConversation` | [POST /ai/conversations](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `createAiRequest` | [POST /ai/requests](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `deleteAiConversation` | [DELETE /ai/conversations/{conversationId}](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `getAiConversation` | [GET /ai/conversations/{conversationId}](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `getAiRequest` | [GET /ai/requests/{requestId}](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `getAiUsage` | [GET /ai/usage](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `getAuthorAiUsePolicy` | [GET /me/ai-use-policy](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `getConfigurationDefinitionsManagement` | [GET /admin/configuration/definitions](contracts/management-api.yaml) | planned |
| [ai](features/ai/README.md) | `getResourceAiUsePolicy` | [GET /resources/{resourceId}/ai-use-policy](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `listAiConversations` | [GET /ai/conversations](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `listAiModels` | [GET /ai/models](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `patchAuthorAiUsePolicy` | [PATCH /me/ai-use-policy](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `patchResourceAiUsePolicy` | [PATCH /resources/{resourceId}/ai-use-policy](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `previewConfigurationManagement` | [POST /admin/configuration/previews](contracts/management-api.yaml) | planned |
| [ai](features/ai/README.md) | `publishConfigurationManagement` | [POST /admin/configuration/releases](contracts/management-api.yaml) | planned |
| [ai](features/ai/README.md) | `renameAiConversation` | [PATCH /ai/conversations/{conversationId}](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `retryAiRequest` | [POST /ai/requests/{requestId}/retry](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `stopAiRequest` | [POST /ai/requests/{requestId}/stop](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `streamAiRequest` | [GET /ai/requests/{requestId}/stream](contracts/app-api.yaml) | planned |
| [ai](features/ai/README.md) | `submitAiFeedback` | [POST /ai/answers/{answerId}/feedback](contracts/app-api.yaml) | planned |
| [share](features/share/README.md) | `createOtpChallenge` | [POST /auth/challenges](contracts/app-api.yaml) | implemented |
| [share](features/share/README.md) | `getAuthorIndexPolicy` | [GET /me/search-indexing](contracts/app-api.yaml) | planned |
| [share](features/share/README.md) | `getEffectiveConfiguration` | [GET /config/effective](contracts/app-api.yaml) | implemented |
| [share](features/share/README.md) | `getMediaBytes` | [GET /media/{mediaId}](contracts/app-api.yaml) | implemented |
| [share](features/share/README.md) | `getPost` | [GET /posts/{postId}](contracts/app-api.yaml) | implemented |
| [share](features/share/README.md) | `getProfile` | [GET /profiles/{accountId}](contracts/app-api.yaml) | planned |
| [share](features/share/README.md) | `getTargetIndexPolicy` | [GET /resources/{resourceId}/search-indexing](contracts/app-api.yaml) | planned |
| [share](features/share/README.md) | `getThread` | [GET /threads/{threadId}](contracts/app-api.yaml) | planned |
| [share](features/share/README.md) | `headMediaBytes` | [HEAD /media/{mediaId}](contracts/app-api.yaml) | implemented |
| [share](features/share/README.md) | `logoutAppSession` | [POST /auth/logout](contracts/app-api.yaml) | implemented |
| [share](features/share/README.md) | `patchAuthorIndexPolicy` | [PATCH /me/search-indexing](contracts/app-api.yaml) | planned |
| [share](features/share/README.md) | `patchTargetIndexPolicy` | [PATCH /resources/{resourceId}/search-indexing](contracts/app-api.yaml) | planned |
| [share](features/share/README.md) | `refreshAppSession` | [POST /auth/refresh](contracts/app-api.yaml) | implemented |
| [share](features/share/README.md) | `verifyOtpChallenge` | [POST /auth/verify](contracts/app-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `challengeMfaFactorManagement` | [POST /admin/mfa/challenges](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `createAnnouncementManagement` | [POST /admin/announcements](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `createAppeal` | [POST /appeals](contracts/app-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `createDocumentRevisionManagement` | [POST /admin/documents/{documentId}/revisions](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `createManagedDocumentManagement` | [POST /admin/documents](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `createManagementOtpChallenge` | [POST /auth/challenges](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `createManagementPasswordCaptcha` | [POST /auth/password/captcha](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `createMfaRecoveryCaseManagement` | [POST /admin/mfa-recovery-cases](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `createPlacementManagement` | [POST /admin/placements](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `createReport` | [POST /reports](contracts/app-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `createSanctionManagement` | [POST /admin/sanctions](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `createStepupManagement` | [POST /admin/stepup](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `createTopicManagement` | [POST /admin/topics](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `decideAppealManagement` | [POST /admin/appeals/{appealId}/decision](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `decideMfaRecoveryManagement` | [POST /admin/mfa-recovery-cases/{caseId}/decisions](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `decideRevisionManagement` | [POST /admin/revisions/{revisionId}/decision](contracts/management-api.yaml) | implemented; isolated DB verification, human UI review pending |
| [moderation](features/moderation/README.md) | `deleteAnnouncementManagement` | [DELETE /admin/announcements/{itemId}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `deletePlacementManagement` | [DELETE /admin/placements/{itemId}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `deleteTopicManagement` | [DELETE /admin/topics/{itemId}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `enrollMfaFactorManagement` | [POST /admin/mfa/factors](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `getAppealsManagement` | [GET /admin/appeals](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `getAuditManagement` | [GET /admin/audit](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `getCasesManagement` | [GET /admin/cases](contracts/management-api.yaml) | implemented read-only; human UI review pending |
| [moderation](features/moderation/README.md) | `getContentsManagement` | [GET /admin/contents](contracts/management-api.yaml) | implemented; human UI review pending |
| [moderation](features/moderation/README.md) | `previewRevisionDecisionManagement` | [POST /admin/revisions/{revisionId}/decision-previews](contracts/management-api.yaml) | implemented; isolated DB verification, human UI review pending |
| [moderation](features/moderation/README.md) | `getCurrentDocuments` | [GET /documents/current](contracts/app-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `getMediaManagement` | [GET /admin/media](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `getMfaRecoveryCaseManagement` | [GET /admin/mfa-recovery-cases/{caseId}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `getOverviewManagement` | [GET /admin/overview](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `getPlacementsManagement` | [GET /admin/placements](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `getPublishedDocument` | [GET /documents/{documentId}/releases/{releaseId}](contracts/app-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `getSessionManagement` | [GET /admin/session](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `getTopicsManagement` | [GET /admin/topics](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `grantRoleManagement` | [POST /admin/roles](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `listAccountsManagement` | [GET /admin/accounts](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `listAnnouncementsManagement` | [GET /admin/announcements](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `listMfaFactorsManagement` | [GET /admin/mfa/factors](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `listOwnAppeals` | [GET /appeals](contracts/app-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `listOwnReports` | [GET /me/reports](contracts/app-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `loginManagementPassword` | [POST /auth/password](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `logoutManagementSession` | [POST /auth/logout](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `patchAnnouncementManagement` | [PATCH /admin/announcements/{itemId}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `patchDocumentRevisionManagement` | [PATCH /admin/document-revisions/{revisionId}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `patchPlacementManagement` | [PATCH /admin/placements/{itemId}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `patchTopicManagement` | [PATCH /admin/topics/{itemId}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `previewDocumentReleaseManagement` | [POST /admin/documents/{documentId}/release-previews](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `previewRoleGrantManagement` | [POST /admin/roles/preview](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `publishDocumentReleaseManagement` | [POST /admin/documents/{documentId}/releases](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `readCaseEvidenceManagement` | [GET /admin/cases/{caseId}/evidence/{evidenceRef}](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `readManagementOtpOperation` | [POST /auth/operations/{operationId}](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `readyDocumentRevisionManagement` | [POST /admin/document-revisions/{revisionId}/ready](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `recordDocumentReceipt` | [POST /me/document-receipts](contracts/app-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `refreshManagementSession` | [POST /auth/refresh](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `requestManagementPasswordRecovery` | [POST /auth/password/forgot](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `revokeRoleGrantManagement` | [POST /admin/roles/{grantId}/revoke](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `revokeSanctionManagement` | [POST /admin/sanctions/{sanctionId}/revoke](contracts/management-api.yaml) | planned |
| [moderation](features/moderation/README.md) | `verifyManagementOtp` | [POST /auth/verify](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `verifyMfaFactorManagement` | [POST /admin/mfa/verify](contracts/management-api.yaml) | implemented |
| [moderation](features/moderation/README.md) | `withdrawDocumentReleaseManagement` | [POST /admin/document-releases/{releaseId}/withdrawals](contracts/management-api.yaml) | planned |
| [configuration](features/configuration/README.md) | `getConfigurationDefinitionsManagement` | [GET /admin/configuration/definitions](contracts/management-api.yaml) | planned |
| [configuration](features/configuration/README.md) | `getEffectiveConfiguration` | [GET /config/effective](contracts/app-api.yaml) | implemented |
| [configuration](features/configuration/README.md) | `getOperationManagement` | [GET /operations/{operationId}](contracts/management-api.yaml) | implemented |
| [configuration](features/configuration/README.md) | `getOtpConfigurationManagement` | [GET /admin/config/definitions](contracts/management-api.yaml) | implemented |
| [configuration](features/configuration/README.md) | `previewConfigurationManagement` | [POST /admin/configuration/previews](contracts/management-api.yaml) | planned |
| [configuration](features/configuration/README.md) | `previewOtpConfigurationManagement` | [POST /admin/config/previews](contracts/management-api.yaml) | implemented |
| [configuration](features/configuration/README.md) | `publishConfigurationManagement` | [POST /admin/configuration/releases](contracts/management-api.yaml) | planned |
| [configuration](features/configuration/README.md) | `publishOtpConfigurationManagement` | [POST /admin/config/releases](contracts/management-api.yaml) | implemented |
| [configuration](features/configuration/README.md) | `rollbackConfigurationManagement` | [POST /admin/configuration/rollbacks](contracts/management-api.yaml) | planned |
| [configuration](features/configuration/README.md) | `rollbackOtpConfigurationManagement` | [POST /admin/config/rollbacks](contracts/management-api.yaml) | implemented |
| [developer-tools](features/developer-tools/README.md) | `createDeveloperSandbox` | [POST /developer/sandboxes](contracts/app-api.yaml) | planned |
| [developer-tools](features/developer-tools/README.md) | `executePluginAction` | [POST /plugins/{pluginId}/actions/{action}](contracts/app-api.yaml) | planned |
| [developer-tools](features/developer-tools/README.md) | `getSandboxEvidence` | [GET /developer/sandboxes/{sandboxId}/evidence](contracts/app-api.yaml) | planned |
| [developer-tools](features/developer-tools/README.md) | `listDeveloperPackages` | [GET /developer/plugin-packages](contracts/app-api.yaml) | planned |
| [developer-tools](features/developer-tools/README.md) | `listExtensions` | [GET /extensions](contracts/app-api.yaml) | planned |
| [developer-tools](features/developer-tools/README.md) | `submitPluginPackage` | [POST /developer/plugin-packages](contracts/app-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `changePluginLifecycleManagement` | [POST /admin/plugin-installations/actions](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `confirmPluginDataPurgeManagement` | [POST /admin/plugin-data/purge-confirmations](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `getAuditManagement` | [GET /admin/audit](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `getHealthManagement` | [GET /admin/health](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `grantPluginPermissionsManagement` | [POST /admin/plugins/{pluginId}/permission-grants](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `inviteDeveloperManagement` | [POST /admin/developers/invitations](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `listPluginVersionsManagement` | [GET /admin/plugins/{pluginId}/versions](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `previewPluginDataPurgeManagement` | [POST /admin/plugin-data/purge-previews](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `previewPluginLifecycleManagement` | [POST /admin/plugin-installations/previews](contracts/management-api.yaml) | planned |
| [plugins](features/plugins/README.md) | `reviewPluginManagement` | [POST /admin/plugins/{pluginId}/reviews](contracts/management-api.yaml) | planned |
| [releases](features/releases/README.md) | `confirmReleaseExpansionManagement` | [POST /admin/releases/expand-confirmations](contracts/management-api.yaml) | planned |
| [releases](features/releases/README.md) | `confirmReleaseManagement` | [POST /admin/releases/confirmations](contracts/management-api.yaml) | planned |
| [releases](features/releases/README.md) | `getClientCompatibility` | [GET /client/compatibility](contracts/app-api.yaml) | planned |
| [releases](features/releases/README.md) | `getReleaseEvidenceManagement` | [GET /admin/releases/{releaseId}/evidence](contracts/management-api.yaml) | planned |
| [releases](features/releases/README.md) | `getReleaseManagement` | [GET /admin/releases/{releaseId}](contracts/management-api.yaml) | planned |
| [releases](features/releases/README.md) | `previewReleaseManagement` | [POST /admin/releases/previews](contracts/management-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `getAppOperation` | [GET /operations/{operationId}](contracts/app-api.yaml) | implemented |
| [notifications](features/notifications/README.md) | `getHealthManagement` | [GET /admin/health](contracts/management-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `getPost` | [GET /posts/{postId}](contracts/app-api.yaml) | implemented |
| [notifications](features/notifications/README.md) | `getPreferences` | [GET /me/preferences](contracts/app-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `getProjectedEvents` | [GET /events](contracts/app-api.yaml) | implemented |
| [notifications](features/notifications/README.md) | `getServiceAvailability` | [GET /status](contracts/app-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `getThread` | [GET /threads/{threadId}](contracts/app-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `listNotifications` | [GET /notifications](contracts/app-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `patchPreferences` | [PATCH /me/preferences](contracts/app-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `readNotifications` | [POST /notifications/read](contracts/app-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `registerPushDevice` | [POST /me/push-devices](contracts/app-api.yaml) | planned |
| [notifications](features/notifications/README.md) | `revokePushDevice` | [DELETE /me/push-devices/{deviceId}](contracts/app-api.yaml) | planned |
| [native-experience](features/native-experience/README.md) | `getAppOperation` | [GET /operations/{operationId}](contracts/app-api.yaml) | implemented |
| [native-experience](features/native-experience/README.md) | `getMediaBytes` | [GET /media/{mediaId}](contracts/app-api.yaml) | implemented |
| [native-experience](features/native-experience/README.md) | `getPreferences` | [GET /me/preferences](contracts/app-api.yaml) | planned |
| [native-experience](features/native-experience/README.md) | `headMediaBytes` | [HEAD /media/{mediaId}](contracts/app-api.yaml) | implemented |
| [native-experience](features/native-experience/README.md) | `patchPreferences` | [PATCH /me/preferences](contracts/app-api.yaml) | planned |
| [data-lifecycle](features/data-lifecycle/README.md) | `createBackupManagement` | [POST /admin/backups](contracts/management-api.yaml) | planned |
| [data-lifecycle](features/data-lifecycle/README.md) | `createRestoreManagement` | [POST /admin/restores](contracts/management-api.yaml) | planned |
| [data-lifecycle](features/data-lifecycle/README.md) | `extendRetentionObligationManagement` | [POST /admin/retention/obligations/{obligationId}/extensions](contracts/management-api.yaml) | planned |
| [data-lifecycle](features/data-lifecycle/README.md) | `getRestoreManagement` | [GET /admin/restores/{restoreId}](contracts/management-api.yaml) | planned |
| [data-lifecycle](features/data-lifecycle/README.md) | `listRetentionObligationsManagement` | [GET /admin/retention/obligations](contracts/management-api.yaml) | planned |
| [data-lifecycle](features/data-lifecycle/README.md) | `previewRestoreManagement` | [POST /admin/restores/previews](contracts/management-api.yaml) | planned |
| [data-lifecycle](features/data-lifecycle/README.md) | `previewRetentionExtensionManagement` | [POST /admin/retention/obligations/{obligationId}/extension-previews](contracts/management-api.yaml) | planned |
| [data-lifecycle](features/data-lifecycle/README.md) | `retryPurgeJobManagement` | [POST /admin/purge-jobs/{jobId}/retry](contracts/management-api.yaml) | planned |

## 补充场景与迁移检查

| 对象 | 实际承载与验证义务 |
| --- | --- |
| EC-01 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-02 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-03 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-04 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-05 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-06 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-07 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-08 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-09 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-10 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-11 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-12 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-13 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-14 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-15 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-16 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-17 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-18 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| EC-19 | [公共规则跨功能边界](features/rules.md#跨功能边界场景)，按该行涉及功能执行完整并发/失权/故障断言 |
| SC-001 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-002 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-003 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-004 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-005 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-006 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-007 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-008 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-009 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-010 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-011 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-012 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-013 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-014 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-015 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-016 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-017 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| SC-018 | [公共规则可验证产品结果](features/rules.md#可验证产品结果)，对应US主功能及AC所有消费者共同满足 |
| AS-01 | [补充边界](features/rules.md#补充边界验收)；[publishing](features/publishing/README.md), [discussions](features/discussions/README.md), [messaging](features/messaging/README.md) |
| AS-02 | [补充边界](features/rules.md#补充边界验收)；[messaging](features/messaging/README.md) |
| AS-03 | [补充边界](features/rules.md#补充边界验收)；[account](features/account/README.md), [moderation](features/moderation/README.md), [plugins](features/plugins/README.md), [releases](features/releases/README.md), [data-lifecycle](features/data-lifecycle/README.md) |
| AS-04 | [补充边界](features/rules.md#补充边界验收)；[configuration](features/configuration/README.md) |
| I3本人偏好GET/PATCH | [profile](features/profile/README.md)：仅列字段部分更新/未列保留、CAS/operation、异payload409、PUT405/Allow、非法值原子拒绝，App实际请求/路由注册与契约同源 |
| ED-10/I4/V12B分享零私人偏好 | [share](features/share/README.md)：匿名/登录固定合法平台默认与页内状态；App相反值不影响；私人/me/config/SSR/hydration/cache/media/auth无读写泄漏，页内控件操作后账号DB版本不变 |
| V19A/G1全媒体消费者 | [native-experience](features/native-experience/README.md)逐入口类型/网络/系统/视区/声音/preload/帧与字节；发布预览详情、主页、流搜索收藏、评论GIF、私信GIF、分享、后台、插件Host、配置变更各功能最小验证；评论私信无视频 |
| C1无向pair竞争 | [messaging](features/messaging/README.md)：A→B/B→A创建、接受/过期/直接send固定pair，一pending/initial/会话及未读提醒去重 |
| I1/I2真实调用与依赖 | 契约→实际授权/业务/DB→实际控件/原生输入→持久可观察结果；按直接依赖集成，三端可从固定契约独立开发，不恢复旧串行DAG门禁 |
| 正式资料与本人同意 | [moderation](features/moderation/README.md)CAS/不可变revision/release/scope/digest/发布撤下与本人动作proof；[account](features/account/README.md)原子准入，[ai](features/ai/README.md)告知及帮助来源 |
| 分类与安全恢复 | [data-lifecycle](features/data-lifecycle/README.md)所有期限/合法利益/分阶段真清/独立最新拒绝水位先重放，各业务/插件真实消费 |

旧任务只用于一次性防漏：T001–T051持续有效核心与质量归公共规则及现有代码，退役桥接/收据/红链不恢复；T052–T274的17旅程业务归上述功能；T275–T285完整产品/跨域/性能/真实版本证据与未完成边界归rules、releases及各功能最小验证。原任务必要数据字段与不变量已按业务迁入功能及rules，不复制checkbox、不新排程。

本轮只做文档及静态语义/链接/数量核对，未运行DB、设备、产品构建或功能测试，不将迁移称产品通过。
