# 本机 MongoDB

已安装 MongoDB Community 7.0.43（Apple Silicon 官方压缩包），由 macOS
LaunchAgent 管理，登录后自动启动。本次安装不由 Homebrew 管理。

- 连接串：`mongodb://127.0.0.1:27017/openstock`（已写入被 Git 忽略的 `.env`）
- 配置：`/Users/guanlan/.local/share/tumeistock-mongodb/mongod.conf`
- 数据：`/Users/guanlan/.local/share/tumeistock-mongodb/data`
- 日志：`/Users/guanlan/.local/share/tumeistock-mongodb/log/mongod.log`
- 服务：`/Users/guanlan/Library/LaunchAgents/local.tumeistock.mongodb.plist`

本机开发配置没有启用数据库认证，只监听 `127.0.0.1`。上线时需要另行配置认证、备份和服务器连接地址。

验证连接和 ping：

```sh
npm run test:db
```

查看服务状态：

```sh
launchctl print gui/$(id -u)/local.tumeistock.mongodb
```

停止服务（保留数据）：

```sh
launchctl bootout gui/$(id -u) "$HOME/Library/LaunchAgents/local.tumeistock.mongodb.plist"
```

重新启动已停止的服务：

```sh
launchctl bootstrap gui/$(id -u) "$HOME/Library/LaunchAgents/local.tumeistock.mongodb.plist"
```

## 应用后续配置

依赖已通过 `npm ci` 安装，`BETTER_AUTH_SECRET` 已在本地随机生成并保存到 `.env`。
行情功能还需填写 `FINNHUB_API_KEY`（仅服务器使用）；邮件、AI 和 Kit 凭据已预留空值，
按启用的功能填写，详见 `.env` 注释和 README。Inngest 已配置 `INNGEST_DEV=1`，
需要另外启动本地 Dev Server；上线前移除该设置并配置云端 Event Key 和 Signing Key。
`BETTER_AUTH_URL` 目前为 `http://localhost:3000`，上线后应改成实际站点地址。

现有 Docker Compose 使用独立的 MongoDB 数据卷。如果以后切换到 Docker，需先停止本机数据库
以释放 27017 端口，并调整容器连接串；本机数据不会自动迁移到 Docker。
