# 正式插件 SDK、包与生命周期 v1

工程授权：PRD §21.3/22.2/Q-16。首版完整三端扩展与独立开发工具保留；此契约选声明式前端/独立代码后端为隔离手段，不开放任意客户端JS执行。新增业务逻辑可在正式后端bundle和已有UI/事件契约内独立实现，无需逐插件改核心。契约外新原生/host组件按平台版本变更处理，不能承诺任意插件免重建。

## 包与开发工具

`.awplugin`是有界ZIP，内容为manifest.json、files.sha256、ui/mobile.json、ui/admin.json、server/（冻结Deno代码/依赖）、migrations/（受控结构）、config.schema.json、retention.json、docs/、tests/evidence-refs.json。纯一端包可无其他entrypoint，但正式sample-a三端必需；所有文件和整包SHA-256进入审核，签名来源/邀请身份与具体维护者核。拒绝绝对路径/..//重复条目/符号链接/摘要不符/zip bomb；初始包50MiB、解压200MiB、1000文件、压缩比≤20为统一配置工程保护，可基于测量调但不取消校验。

SDK `@agoraweave/plugin-sdk`1.0.0提供manifest/UI/types、operation/error/event/policy DTO、scope broker客户端和版本化文档。CLI `aw-plugin`按ED-21提供init、validate/package/preview/test的本地高频开发入口与Actions独立复验入口，submit受邀包、evidence读取真实云端结果。云端独立开发预览与正式验证能力继续提供，不强迫开发者先本地启动；本地隔离sandbox结果不代正式跨端/权限/隔离验收。现有CLI/来源适配未实现的部分保留任务，不因契约修改宣称已可调用。

## 三端插槽

| surface/slot | 合法上下文（当前授权DTO） | 支持行为 |
| --- | --- | --- |
| mobile.page/router | route参数、当前能力、主题/config、插件状态 | 声明式独立页面/导航，未知能力不可执行 |
| mobile.navigation/menu | 明确位置/图标名/中文label/visibility predicate | 仅已注册路由/合法动作，不能遮核心安全入口 |
| mobile.profile/detail/comments/feed | 有权profile/resource/comment/feed投影 | 组件组合与受控action，不能拿原始token/隐藏字段 |
| mobile.notifications/settings | 已授权通知/本人非敏感配置 | 注册类别/设置表单，必要核心通知不能抑制 |
| admin.menu/page/dashboard | 当前角色/操作/环境及有限业务DTO | 真后台扩展/表格/详情/表单；菜单不授管理员 |
| admin.operations/config/ai/plugins | 当前获批对应管理能力 | 授权运营工具/配置/MCP管理和生命周期页，无新增任意高权 |
| server.api/event/job | broker绑定用户/环境/plugin/version/epoch、schema payload | 业务handler、受控事件/job、通知申请/迁移；副作用前重核 |

重复slot registration ID/route与核心或别插件冲突拒绝，不静默覆盖；排序priority为注册整数，同值按namespace/id稳定；同区域互斥声明冲突拒包。route为`/extensions/{plugin_id}/{local_route}`，不得注册核心auth/admin路由。第三方共享主体与source refs由原模块投影，不允许拼地址读取原始Storage。

## 声明式 UI 和动作

树节点`{id,type,props,children?,binding?,events?,required_capabilities?}`；schema1.0，最大深度20/1000节点/资源限额。type白名单page/stack/row/text/icon/button/input/toggle/select/list/table/detail/media/notice/dialog；Host在iOS/Android用Expo UI/RN、后台用shadcn同语义适配。props为受审类型，无eval/HTML/script/任意URL/原SQL。binding指注册数据投影字段，media仅resource ref经核心gate。条件为有限比较/all/any/exists，不运行代码；动作仅navigate（注册路由）、read（声明broker endpoint）、submit（注册operation）、confirm（平台对话）。

events载荷必须过JSON Schema，禁覆盖user/env/plugin/permissions；敏感操作调用核心stepup/preview路径，不能插件模拟确认。SDK输出合法current status，所有加载/内容/空/失败/失权/删除/停用/不兼容/提交未知有notice和合法行动。中文label、图片alt、触区、动态字体/焦点/对比/减少动效使用平台语义token，隐藏菜单不能成为授权。数据/事件绑定显示字段均由broker当前投影，插件无核心会话凭据。

## 权限与隔离

permission为版本化注册标识，如`plugin.records.read_own/write_own`、`content.read_current`、`notifications.request`、`ai.tools.register_readonly`；每项声明purpose/data_scope/sensitive，语义审核固定permission registry。包请求不是grant，review/安装grants仍以当前资格检查。AI插件仅只读工具，不因notifications能力让模型发通知。

每插件Deno2.9.6独立容器；非root、只读、有限tmpfs、禁新增capabilities/host socket、seccomp、网络只broker、无service_role/数据库/第三方秘密。scope credential绑定环境/plugin/version/installation epoch/过期，不授用户资格；每call broker同时核用户/资源/原模块接口。runtime冻结依赖，无-A/allow-run/FFI/任意env/fs/net。默认配额见[架构测量参数](../architecture.md)，越限终止/真实失败，核心和其他插件继续；共享基础设施故障如实说明。

数据归属独立schema和最小NOBYPASSRLS非owner运行角色，运行代码通过结构化数据API，不传任意SQL。migration执行器临时角色仅该schema DDL；强制平台owner/current-user策略、禁止跨schema grants/核心RLS/role/TRUNCATE/高权SECURITY DEFINER。数据库扩展/特殊迁移需要平台单独审核摘要/兼容/负向测试，不能在包内自授。共享API由原模块/插件明确受审grant，只返回当前用户有权数据；恢复/日志/事件/搜索/媒体同边界。

## 生命周期契约

registry/version/review/installation/release状态分开。获取/上传只acquired，checks失败checked_failed；安装先明确环境/版本/hash/迁移/权限与当前grant，installed_disabled之后云端验证/构建/生产确认才enabled。开发sandbox运行许可不等测试/生产安装许可。

preview给`operation,plugin/version/digest,environment,dependencies,selected_dependents,inflight,grants_delta,code/config/schema/data_impacts,history_mode,retention,rollback_limits,preview_digest`。有效依赖默认deny；只准执行明确选定且安全通过的联动停用集合，不自动补选，不自动卸载依赖。

disable：原子lifecycle epoch提升/新admission关闭→撤lease/入口/调用/job/event/notification/AI tools→在途副作用与输出重核→有界排空/停止；初始30秒排空工程阈值，未完成terminate并记已提交/未提交/外部unknown。历史经安全projection当前有权只读，缺可靠renderer占位，核心删除/撤权/治理/到期清理不中断。

upgrade：审新hash/权限增量、expand-contract兼容迁移，真实验证后目标替换；失败尽量保安全旧版，部分/不可逆结果真实记录。uninstall撤运行代码/资格，配置/结构/数据独立结果，保原期限；额外永久清理独立preview/超管MFA确认，默认卸载不授。reinstall当前重新审、只恢复仍有效数据/关联，不能复活已删/清/撤权或自动旧敏感grant。恢复不能承诺任意down migration无损。

sample-a为合成本人记录三端完整链路，sample-b为独立数据与受审共享read；Actions验证A不能读B、越用户/环境/DB/Storage/Realtime/job/log/AI/备份路径，以及资源耗尽/停用在途/升级失败/卸载保留/重装不复活。开发者从正式资料独立完成样例且核心源码修改0，为AC-48–50硬验收。
