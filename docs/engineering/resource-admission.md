# 资源准入台账

遵循 ED-07 和 [ED-11／ED-12](../../specs/001-agoraweave-v1/reviews/execution-decisions-2026-10-15.md)。供给不等于验证通过，不提交密钥、私人连接信息、真实用户或生产资料。

| 资源 | 已知事实 | 用途／最小权限 | 状态和节点 |
| --- | --- | --- | --- |
| GitHub 仓库 | Self-Command/agora-weave为public；当前身份可读写代码及workflow；main无既有保护 | 标准GitHub-hosted runner；验证默认contents:read，原报告下载另限actions:read | 固定Node传输run38593132574成功；30项证据断言run38593654084真实Red，尚非ci-ready |
| 私有GitHub归档 | 用户要求新建agora-weave-evidence；run38594494161因账单未启动 | ED-12随后改用用户服务器，停止依赖该私有Actions通道 | 历史仓库保留，无定时任务；不提高预算 |
| 服务器私有证据 | 用户提供管理SSH密钥路径并授权直接配置；受信主机认证成功，可用约23GB | 独立agora-evidence SFTP账号、/srv/agoraweave-evidence chroot，无shell／转发，禁止客户端删除／改名／改元数据；管理密钥不交CI | 专用上传密钥、主机和公钥pin已放repository Actions secrets；待Actions真实上传／回读校验，不先称归档通过 |
| 证据保留 | ordinary90天、formal365天、sensitive最长7天分类与独立每日清理已配置 | 仅专用证据根，删除事件／错误写系统日志；更短业务分类优先 | T015仍须云端拒绝／清理探针、完整索引和不可覆盖控制；最小传输不等完整归档实现 |
| 当前Codex审查 | 用户明确确认ED-11，当前会话分别审代码和Actions实际图像／报告 | 受控记录SHA、输入／图像摘要、覆盖／findings／处置，Actions校绑定 | 无额外审查API Key要求；缺实际图像或无法判断仍阻塞 |
| 隔离Compose凭据 | CI_DEV_SUPABASE_ENV／CI_TEST_SUPABASE_ENV 已分别供给随机秘密；不复用生产 | T004：不同 runner／Compose 网络／存储／账号／秘密，禁公开服务端口及短信邮件副作用 | run38604711695全部11服务健康，但额外Storage探针地址错误导致job失败，修复后须重跑；仍非ci-ready |
| 原生设备 | ED-13确认暂无物理设备服务账号；继续GitHub-hosted模拟器 | T007/T025：macos-26实际存在Xcode26.4.1；加速Android模拟器、最低OS及原生联通须实际验证；物理VoiceOver/TalkBack／媒体／推送另验 | 物理设备验收blocked／unavailable，不计passed；不依赖物理云的CI与隔离环境继续 |
| 首次视觉基准 | 用户本人为确认人 | 当前真实产品候选摘要、覆盖、Codex审查及交互证据形成后确认 | 尚无候选，不预批，不用壳作基准 |
| 阿里云短信／产品AI／审核／推送 | 仍按既定故事准入 | 相应测试前索取专用测试身份、模板、获准对象及政策资料 | 尚未到业务节点 |

没有购买、提高收费额度或使用生产身份。服务器仅保存证据，项目验证继续只在GitHub Actions。上传job仅处理经校验原报告，不运行受审仓库脚本。
