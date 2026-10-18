# 具体页面、状态与批准来源

2026-10-18用户改为App/后台先开发、热更新后亲自验收，禁止日常UI复检，仅用户报告样式/布局问题后启动定向检查；以下是历史批准来源快照，不再阻塞App/后台缺失页开发。新页实际验收统一登记根`人工验收.md`，不补造本登记中的历史批准。

2026-10-18静态读取[page-registry.json](../../docs/design/page-registry.json)及[原型定位](../../docs/design/prototype/README.md)。下面准确转录页面ID、状态、版本、批准和源码入口，不修改原登记或原型；实际批准权威仍为原人类决定与登记绑定。历史navigation/implementation可能落后源码，必须与当前实现核对，不能以历史文案否认现有代码或以代码存在补授批准。

账号r2五页均为用户2026-10-17原生卡片明确批准，覆盖以下选择器全部状态及light/dark，设计摘要 `221146cc64b55c33d23c8c42d34f2c7935d6cf641f6597d56c33cf7f2b88b0c4`。这授按稿实现资格，不是当前完整原生旅程或实现视觉验收。

| 页面ID | 精确状态 | 版本/批准 | 原型与生产入口 |
| --- | --- | --- | --- |
| `account-login` | 正常、校验错误、服务不可用、请求过频、处理中 | `account-r2` / `approved` / 2026-10-17 user | [原型](../../docs/design/prototype/index.html?page=login&scene=正常&theme=light)；[`apps/mobile/app/(auth)/index.tsx`](../../apps/mobile/app/%28auth%29/index.tsx) |
| `account-register` | 正常、校验错误、邀请码无效、条款加载中、条款加载失败、条款已更新、服务不可用、处理中 | `account-r2` / `approved` / 2026-10-17 user | [原型](../../docs/design/prototype/index.html?page=register&scene=正常&theme=light)；[`apps/mobile/app/(auth)/index.tsx`](../../apps/mobile/app/%28auth%29/index.tsx) |
| `account-otp` | 正常、验证码错误、验证码过期、错误次数用尽、重发倒计时、请求过频、条款已更新、服务不可用、验证中 | `account-r2` / `approved` / 2026-10-17 user | [原型](../../docs/design/prototype/index.html?page=otp&scene=正常&theme=light)；[`apps/mobile/app/(auth)/index.tsx`](../../apps/mobile/app/%28auth%29/index.tsx) |
| `account-security` | 正常、加载中、网络失败、仅当前设备、撤销中、结果未确认、撤销完成、会话失效 | `account-r2` / `approved` / 2026-10-17 user | [原型](../../docs/design/prototype/index.html?page=security&scene=正常&theme=light)；[`apps/mobile/app/(auth)/index.tsx`](../../apps/mobile/app/%28auth%29/index.tsx) |
| `account-recovery` | 正常、可信资格不足、保护期、提交中、服务不可用、结果未确认、已受理、核验中、需补证、已拒绝、已批准待执行、会话失效 | `account-r2` / `approved` / 2026-10-17 user | [原型](../../docs/design/prototype/index.html?page=recovery&scene=正常&theme=light)；[`apps/mobile/app/(auth)/index.tsx`](../../apps/mobile/app/%28auth%29/index.tsx) |

scene取上述精确中文状态，theme为light/dark；font=large仅大字专项。验证码/手机号等真实用户输入不进入URL。账号源为`docs/design/prototype/account-pages.{js,css}`，共用样式与页面路由仍以原文件为准。生产入口由同一AccountEntry/controller状态切换，五页共用路由不表示只需验一页。

## 其他已登记来源

| ID | 状态/主题 | 版本与批准 | 当前入口与适用边界 |
| --- | --- | --- | --- |
| `phase2-shared-components` | normal、loading、empty、error、forbidden、unavailable、pending、incompatible / light、dark | `phase2-components-preview-2026-10-16` / approved / 2026-10-16 | [`apps/mobile/src/components/Screen.tsx`](../../apps/mobile/src/components/Screen.tsx)；仅组件批准，不授整页；无产品演示页 |
| `admin-official-template` | template-baseline / light、dark | `Kiranism-7705dfc0d13889e45c26a55ad5908da6a7a9a605` / approved-from-user-directive / 2026-10-17 | [`apps/admin/src/app/page.tsx`](../../apps/admin/src/app/page.tsx)；官方完整模板政策批准，非真实业务/实现验收；真实管理源码已增量接入，旧导航“尚未接入”不作当前事实 |
| `share-reading` | readable、restricted、deleted、unavailable / light、dark | `share-page-unapproved` / pending / 未批准 | [`apps/share/src/app/page.tsx`](../../apps/share/src/app/page.tsx)；pending；旧呈现退役，框架入口不可算真实分享页 |

基础组件摘要`c3d3526b64162663f00c5bbf61f7c9ceee29f6f5f6449b14998cccf6f0fd33d1`，用户2026-10-16明确批准仅该预览组件。后台官方版本为`Kiranism-7705dfc0d13889e45c26a55ad5908da6a7a9a605`，用户2026-10-17 ED-24指令批准完整模板基准，摘要`da6cb6abe55c8c35d6469f748bbf68e2cdbf28857cd5855b498f61b1a4b85696`。分享版本`share-page-unapproved`、approval=pending，不补造人类批准。

## 现有v6入口与未登记边界

| 原型入口 | 已有源 | 批准处理 |
| --- | --- | --- |
| [v6-home 首页](../../docs/design/prototype/index.html?page=home&theme=light) | `native-ui-v6.js`与共用CSS | 保留已接受风格与原稿；当前page-registry无该ID的精确整页/状态/版本批准绑定，历史无独立整页批准绑定；当前范围内按原稿/文档直接开发，实际效果由用户验收，不补造历史批准 |
| [v6-discover 发现](../../docs/design/prototype/index.html?page=discover&theme=light) | `native-ui-v6.js`与共用CSS | 保留已接受风格与原稿；当前page-registry无该ID的精确整页/状态/版本批准绑定，历史无独立整页批准绑定；当前范围内按原稿/文档直接开发，实际效果由用户验收，不补造历史批准 |
| [v6-ai AI](../../docs/design/prototype/index.html?page=ai&theme=light) | `native-ui-v6.js`与共用CSS | 保留已接受风格与原稿；当前page-registry无该ID的精确整页/状态/版本批准绑定，历史无独立整页批准绑定；当前范围内按原稿/文档直接开发，实际效果由用户验收，不补造历史批准 |
| [v6-messages 私信](../../docs/design/prototype/index.html?page=messages&theme=light) | `native-ui-v6.js`与共用CSS | 保留已接受风格与原稿；当前page-registry无该ID的精确整页/状态/版本批准绑定，历史无独立整页批准绑定；当前范围内按原稿/文档直接开发，实际效果由用户验收，不补造历史批准 |
| [v6-me 我的](../../docs/design/prototype/index.html?page=me&theme=light) | `native-ui-v6.js`与共用CSS | 保留已接受风格与原稿；当前page-registry无该ID的精确整页/状态/版本批准绑定，历史无独立整页批准绑定；当前范围内按原稿/文档直接开发，实际效果由用户验收，不补造历史批准 |

v6详情/面板沿已有导航进入，未提供状态不猜造。已有原型入口不表示所有后续页面均未设计，先查看再补缺；风格认可也不自动覆盖新增生产页。原型虚构数据、计数、AI回答、客户端内存权限与假系统栏不能覆盖当前PRD和安全规则。

## 交付给开发与复检

每次交接给页面/状态、现有原型源、生产入口与可测依赖；App/后台缺失页按当前快速开发决定直接实现并待用户验收。主控只向人工验收.md追加可测入口与修复说明；用户原文及复查结论不得覆盖。UI角色仅用户反馈样式/布局问题后检查对应页面/状态，平时禁止工作。
