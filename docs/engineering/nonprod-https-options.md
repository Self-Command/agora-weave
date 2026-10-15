# 非生产 HTTPS 联通方案（ED-16，待批准）

2026-10-15：用户已授权只读调查与准备，尚未批准部署、增加服务商或购买资源。

现有证据服务器约4 GiB内存且已有多组常驻服务；不适合再承载两套Supabase。证据存储继续独立使用；主机、域名及现有服务的详细调查记录只保存在私有审查目录。

## A：Actions临时服务加Cloudflare Quick Tunnels（建议）

- 官方固定Compose仍只在GitHub-hosted Linux runner运行；dev/test分别使用独立网络、卷、合成账号和凭据。iOS/Android仍在Actions对应runner运行。
- 每次验证各启动一个固定版本的cloudflared，指向本次环境的受限HTTP网关，产生两个随机HTTPS地址。只开放本次验证需要的API路由，不暴露Studio、数据库、管理接口、证据文件或生产环境。
- 网关先检查由专用Actions secret与run ID、attempt、目标SHA、环境派生的一次性认证。客户端与网关分别派生，凭据不写artifact、日志、URL或job output。错误身份、环境混用及前一运行的身份均拒绝。
- 原生job与service job并行。service上传只含URL/运行身份/到期时间的就绪描述；原生job通过本run artifact API等待并核对，随后执行真实HTTPS访问、错误凭据拒绝及跨环境拒绝。service等待两个客户端结束标记；不依赖运行尚未结束时不可用的job output。
- 整次验证最长75分钟。service在always清理中停止隧道并移除Compose、卷、网络及临时文件；通过Actions报告确认残留为零。超时、取消、清理失败和结果缺失均阻塞。
- 首轮只验证跨runner的HTTPS/身份/环境隔离；后续产品的Realtime、媒体Range、推送等仍逐项真实验证，不从入口可达推导功能通过。

预算：不购买VPS、域名或付费套餐。当前公开仓库使用标准GitHub-hosted runner免费；Quick Tunnel为免费临时开发通道，不需Cloudflare账号或域名。仅供合成非生产测试，不作生产入口。

边界：Quick Tunnel无可用性保证、最多200并发在途请求且不支持SSE；邮件认证需要交互浏览器，不能用作本方案原生自动化认证。应用层网关认证为必要条件。Cloudflare会处理测试请求流量；若用户不接受新增该服务商，不执行方案A。任何失败都保留真实结果。

批准后由工程完成：核验并固定cloudflared版本/digest、建立最小网关与真实负向测试、在Actions生成并配置专用非生产secret、实现临时入口和清理、取得跨runner证据。用户不需提供密钥或账号。未批准前不安装、不发布入口、不向该服务发送项目流量。

## B：现有服务器增加独立HTTPS中继

业务计算仍在Actions；服务器只增加两个专用TLS虚拟主机与仅限本项目端口的SSH反向转发账号，代理到运行中的Linux runner。需要用户明确扩展ED-12服务器用途并授权两个未占用子域的DNS/TLS配置。需额外核验负载和回收；不复用已有产品虚拟主机。没有新增主机采购，但会占用现有资源并增加运维责任。

## C：独立非生产VPS

可承载长期dev/test，但涉及采购、供应商、地域、配置和月预算；当前不选择，也不引用未经核价的月费区间。

依据（2026-10-15复核）：[GitHub Actions计费](https://docs.github.com/en/billing/concepts/product-billing/github-actions)、[Quick Tunnels限制与生命周期](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)、[Cloudflare Quick Tunnel免费临时入口](https://developers.cloudflare.com/changelog/product/tunnel/)。