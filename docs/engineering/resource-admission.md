# 资源准入台账

遵循 ED-07 和 [ED-11／ED-12](../../specs/001-agoraweave-v1/reviews/execution-decisions-2026-10-15.md)。供给不等于验证通过，不提交密钥、私人连接信息、真实用户或生产资料。

| 资源 | 已知事实 | 用途／最小权限 | 状态和节点 |
| --- | --- | --- | --- |
| GitHub 仓库 | Self-Command/agora-weave为public；当前身份可读写代码及workflow；main无既有保护 | 标准GitHub-hosted runner；验证默认contents:read，原报告下载另限actions:read | 固定Node传输run38593132574成功；30项证据断言run38593654084真实Red，尚非ci-ready |
| 私有GitHub归档 | 用户要求新建agora-weave-evidence；run38594494161因账单未启动 | ED-12随后改用用户服务器，停止依赖该私有Actions通道 | 历史仓库保留，无定时任务；不提高预算 |
| 服务器私有证据 | 用户提供管理SSH密钥路径并授权直接配置；受信主机认证成功，可用约23GB | 独立agora-evidence SFTP账号、/srv/agoraweave-evidence chroot，无shell／转发，禁止客户端删除／改名／改元数据；管理密钥不交CI | 专用上传密钥、主机和公钥pin已放repository Actions secrets；run38642142466实际上传并回读原失败run38636632772的13份完整artifact，保留原failure；每个最终run仍须独立归档校验 |
| 证据保留 | ordinary90天、formal365天、sensitive最长7天；索引更早expire_at由独立分钟级清理遵守 | 仅专用证据根，删除事件／错误写系统日志；更短业务分类优先 | run38631031319实际验证回读、写后拒绝覆盖、原字节不变、较早敏感到期删除及临时凭据清理；完整原ZIP归档逐run校验，不能据此推断全部T015完成 |
| 当前Codex审查 | 用户明确确认ED-11，当前会话分别审代码和Actions实际图像／报告 | 受控记录SHA、输入／图像摘要、覆盖／findings／处置，Actions校绑定 | 无额外审查API Key要求；缺实际图像或无法判断仍阻塞 |
| 隔离Compose凭据 | CI_DEV_SUPABASE_ENV／CI_TEST_SUPABASE_ENV 已分别供给随机秘密；不复用生产 | T004：不同 runner／Compose 网络／存储／账号／秘密，禁公开服务端口及短信邮件副作用 | run38605816529在5bd296a上dev/test全部11服务、DB/Auth/Storage探针及清理真实成功；壳联通／统一编排未完成，仍非ci-ready |
| 原生设备 | ED-14已取代ED-13，今后只用GitHub-hosted模拟器 | T007/T025/T272：最低iOS16.4/Android7和当前OS各自实际原生产物；语义/焦点/键盘/媒体/适用辅助技术按simulator-validation契约，硬件排除明示风险不计passed | run38648396184的4组模拟器启动/恢复已实际成功；新版SHA须重验；新增无障碍证据尚缺，物理设备不再是必需资源 |
| 跨runner原生服务联通 | ED-17明确批准Actions内Cloudflare临时HTTPS和一次性网关，只传合成非生产数据，无采购；证据服务器角色不变 | 原生SDK实际访问独立dev/test健康路由，核匿名401、跨环境401及私有路径404；每次入口随run/attempt/SHA绑定并清理 | 固定cloudflared2026.10.0及摘要，专用secret已配置；run38664125035的iOS16.4/26.4及Android24原生作业成功，Android36失败，整轮不通过；新完整矩阵及清理仍在执行，最终SHA重新验真 |
| 首次视觉基准 | 用户本人为确认人 | 当前真实产品候选摘要、覆盖、Codex审查及交互证据形成后确认 | 尚无候选，不预批，不用壳作基准 |
| 阿里云短信／产品AI／审核／推送 | 仍按既定故事准入 | 相应测试前索取专用测试身份、模板、获准对象及政策资料 | 尚未到业务节点 |

没有购买、提高收费额度或使用生产身份。服务器仅保存证据，项目验证继续只在GitHub Actions。上传job仅处理经校验原报告，不运行受审仓库脚本。
