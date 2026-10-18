# 后台独立开发

先读本次[功能](../coverage.md)、management/core-admin OpenAPI、[UI来源](../ui/README.md)与[技术栈](../technology.md)。
直接在完整Kiranism源码里接业务，保留现有布局、导航、主题、表格、表单和组件，不再另画一套后台原型。

浏览器只调固定 `/api/management/*` BFF，使用management生成类型；BFF到后端使用core-admin生成类型。
浏览器是加密HttpOnly Cookie加同源CSRF，服务端才持官方Auth令牌；不共用App的Bearer存储，也不向浏览器投影令牌。
当前角色/MFA重新核验，不能从模板预览/客户端role获得管理资格。

`api:mock:admin`供浏览器端开发，`api:mock:core-admin`供BFF独立开发；各自明确模拟边界后切真实core。
App页面无需先完成。新增业务复用现有management客户端与BFF，必要状态/错误/未知结果按契约落实。
合并可运行增量时做必要编译/类型检查；UI、交互及前端逻辑交用户在根人工验收.md验收。仅用户反馈样式/布局问题后允许UI角色定向检查，平时禁止工作；不新增重复前端测试。
