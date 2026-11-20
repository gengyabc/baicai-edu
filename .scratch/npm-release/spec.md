# npm 发布：从暂存到上线

本目录记录 2026-11-18 首版发布的实际状态，以及首版之后仍然开着的那一件事。

## 已经完成（不可回退的事实）

- 七个包已于 `2026-11-18` 发布到 npm，`latest` 均为真实版本（不是 `0.0.0-stage`）：
  - `baicai-edu-learn` / `-math` / `-math-primary-low` / `-math-primary-high` / `-chinese-reading` / `-english` → `0.1.0`
  - `baicai-edu-math-board` → `0.6.0`
- 作者字段 `gengyabc (https://github.com/gengyabc)`、maintainer 邮箱均为该账号。
- 发布方式已从 `npm publish` 改为 `npm stage publish` + `approve`：npm 对新包名直发返回 `E_STAGE_REQUIRED`，且正在收回「跳过 2FA 的 token」的直发权限。脚本 `scripts/publish.mjs` 已按两步式改造（`publish` 暂存、`approve` 上线，npm < 11.15 直接拒绝）。
- 发布后验收：隔离 `DSH_HOME` 中用 `dsh plugin --profile web add baicai-edu-math-primary-low` 真装成功，闭包 4 个包自动补齐，注册 20 个技能，技能资源引用全部解析。
  （2026-11-20 更正：这条只证明 pnpm 下载了闭包。DSH 只启用命令行上列出的那个 bundle，所以该命令实际只注册 `math-low-*`；`learn-*` 与 `math-common` 要注册必须把四个包名写进同一条命令。以各包 README 的 Install 段为准，见 `math-primary-low/README.md`、`math-primary-high/README.md`。）
- 文档已同步：根 `README.md`、`docs/installation.md` 不再说「尚未发布 / 只能走 checkout」；`docs/publishing.md` 记录了两步式流程、npm 版本下限、`0.0.0-stage` 占位语义、`//` 前缀的认证坑，以及「`dsh.profile.bundles` 只含命令行上那个包」这条实测结论。
- git：`ca49106 release: publish the seven packages to npm at 0.1.0`，tag `v0.1.0`；随后 `24fdafb docs: give every package a changelog and ship it`。

## 仍然开着的问题

六份 `CHANGELOG.md` 是发布之后才写的（提交 `24fdafb`），所以**已经发出去的 0.1.0 tarball 里没有它们**，npm 包页面上看不到。`math-board` 不受影响：它在 0.6.0 发布时就已经带 `CHANGELOG.md`。

让它们出现在包页面需要一次 `0.1.1`。见 [issues/01](issues/01-publish-0-1-1-with-changelogs.md)。

## 为什么这条不写进 docs/

`docs/publishing.md` 只放**不会过期**的流程知识：两步式发布、版本下限、认证要求、验收口径。而「0.1.1 还没发」是一次性的待办，写进维护文档会在发完之后变成又一条过期说明——本次发布正是踩过这个坑（math-board 的 CHANGELOG 曾写着「尚未发布到任何 registry」，发布后就错了）。待办放在这里，发完删掉即可。
