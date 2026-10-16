# UI 设计资料与草稿归档

本目录记录 PRD 阶段已接受的 v6 UI 草稿，以及 2026-10-14 用户要求补齐的视觉风格、UI 规格和需求 / 验收追溯。文件属于设计输入，不是 Expo、后台或 Supabase 的产品实现。

2026-10-16 用户决定：所有页面先补入同一 HTML 原型入口供本人验收，通过后再开发生产页面。
新增账号草稿通过入口的“页面”和“状态”选择器查看，当前标为待验收；不表示生产页面已修正。
移动生产端继续使用 Expo／React Native／Expo UI，HTML 原型不作为移动网站产品路线。

| 文件 | 用途 |
|---|---|
| [UI-SPEC.md](UI-SPEC.md) | 页面结构、视觉风格、组件状态、交互、原生适配及 PRD / 验收映射 |
| [design-tokens.json](design-tokens.json) | 从 v6 CSS 提取的颜色和尺寸记录；供方案 / 实现转换，不是运行时配置文件 |
| [prototype/index.html](prototype/index.html) | 保留原有页面与可点击概念交互的归档入口 |
| [prototype/native-ui-v6.css](prototype/native-ui-v6.css) | 草稿样式原文件，包含后续覆盖规则 |
| [prototype/native-ui-v6.js](prototype/native-ui-v6.js) | 草稿交互原文件，使用虚构数据与内存状态 |
| [prototype/account-pages.css](prototype/account-pages.css) / [account-pages.js](prototype/account-pages.js) | 沿用 v6 风格的账号页面及状态草稿，待用户验收；独立扩展以保留 v6 CSS / JS 原字节 |
| [../product/PRD.md](../product/PRD.md) | 有效业务、权限、范围、视觉需求与正式验收来源 |

## 来源与归档处理

原入口：`.superpowers/brainstorm/686-1791866721/content/native-social-layout-complete-v6.html`。原 CSS / JS 同目录。原本依赖视觉预览服务器的 `/files/` 路径，现改为同目录相对路径，不依赖临时服务地址。CSS 与 JS 按原字节复制。

入口 HTML 最初只调整资源路径、归档标记、业务规则提示及已删除 `x/` 目录的来源说明；2026-10-16 追加统一页面／状态导航及账号原型扩展资源。原 v6 CSS / JS 保持原字节，既有页面、配色和交互保留。Linear 链接仍作为历史设计来源链接，不从该网页新增规则。

| 原文件 | SHA-256 |
|---|---|
| 原 HTML | `3D81228A139D5E3C9B09326EF71B7D819409B2E9DB2C08CF9DA2F2CEA9546924` |
| 原 CSS | `A48E121BAEFB4A797F6FE865358E3F12F5CEB7049A822A0FC66C1EAF0571FDDC` |
| 原 JS | `C54527F501DB5019BA567FF3AB39DFBE3A16B5F2F2E2BAAF0FDB279835D05057` |

这些设计文件纳入 Git；归档目录的 `.gitattributes` 禁止 Git 自动转换原 CSS / JS 的换行，确保记录哈希在提交和检出后仍对应原字节。`.superpowers/` 继续作为本地预览 / 会话目录被忽略。原 `x/` 截图已按用户要求删除，不重新创建，也不作为读取设计资料的前提。

## 草稿的使用方式

打开入口可查看手机画板；顶部页面选择器在窄屏同样可用，左侧保留原页面按钮，顶部切换浅／深主题。账号草稿可查看登录、邀请加入、验证码、账号安全与恢复申请，状态选择器覆盖适用错误、加载、空与失效状态；交互只使用合成数据，不发送短信或提交真实申请。产品实际验证遵守现行 execution-policy；安装包由 Actions 编译，本地可运行目标测试与已安装开发包。

草稿依赖同目录的 CSS 与 JS，无字体、图片、CDN 或业务接口依赖；图标为内联 SVG，头像 / 媒体为虚构视觉示例。这里不要求启动本地产品、安装依赖或接入服务。

## 文件的效力与已知差异

有效顺序：PRD 最新业务 / 权限规则 → PRD 视觉规则及 UI-SPEC 补全 → token 提取值 → 历史交互演示。颜色、结构和相对层级是设计输入；原生安全区、字体缩放和触控要求优先于草稿的固定像素。

草稿早于 S14 / S21 等后续决策，不能据其示例文案把已经确定的期限改回待定、把请求 / 关注自动合并，或授予真实认证、AI 附件 / 语音 / 外联网能力。UI-SPEC 第 10 节登记了这些差异。草稿不能替代完整状态覆盖、生产授权逻辑或 Actions 实际验收证据。

此轮归档和记录保留既有设计；后续若改变页面结构、语义颜色、字号层级或组件状态，须同步 PRD 关联、UI-SPEC、token 和视觉参考版本，留下原因与对应验收记录。
