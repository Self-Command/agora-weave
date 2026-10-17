# 原型定位

唯一画面入口是[index.html](index.html)。不要把旧生产UI、基础组件历史预览图或另一个业务状态当作本页设计。
开发前打开任务指定链接实际查看，然后读取本页相关函数、共享CSS、[token](../design-tokens.json)与[UI-SPEC](../UI-SPEC.md)。
账号五页仍为r2待批准稿；本文件不授予生产UI实现资格。基础组件独立预览页已按2026-10-17用户确认删除，组件本身保留。

| 页面ID | 默认画面 | 源码定位 |
| --- | --- | --- |
| account-login | [登录](index.html?page=login&scene=正常&theme=light) | account-pages.js 的 login() |
| account-register | [邀请加入](index.html?page=register&scene=正常&theme=light) | account-pages.js 的 register() |
| account-otp | [验证码](index.html?page=otp&scene=正常&theme=light) | account-pages.js 的 otp() |
| account-security | [账号安全](index.html?page=security&scene=正常&theme=light) | account-pages.js 的 security() |
| account-recovery | [恢复申请](index.html?page=recovery&scene=正常&theme=light) | account-pages.js 的 recovery() |
| v6-home | [首页](index.html?page=home&theme=light) | native-ui-v6.js 的页面路由和相关组件 |
| v6-discover | [发现](index.html?page=discover&theme=light) | 同上 |
| v6-ai | [AI](index.html?page=ai&theme=light) | 同上 |
| v6-messages | [私信](index.html?page=messages&theme=light) | 同上 |
| v6-me | [我的](index.html?page=me&theme=light) | 同上 |

scene使用账号页状态选择器中的精确中文名；theme为light/dark；font=large只用于大字专项。
例如[登录错误/深色](index.html?page=login&scene=校验错误&theme=dark)、[注册条款失败](index.html?page=register&scene=条款加载失败&theme=light)。
刷新会按参数还原指定画面。原account参数兼容，不将输入中的手机号或验证码写进URL。
v6的详情、面板等用现有导航/交互进入，未提供的状态不猜造。画板外壳和假系统栏不是App内容。

每个任务给准确页面、状态、主题和版本，必要时附参考截图与所用组件路径；仍以spec/API定义真实业务。
不要求每页复制一个独立HTML；如后续模块过大，按真实功能拆JS/CSS模块并继续使用这个统一入口，避免同页多份分叉。
