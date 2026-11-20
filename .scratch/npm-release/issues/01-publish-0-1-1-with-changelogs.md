# 01: 用 0.1.1 把 CHANGELOG 发到 npm

**What to build:** 把六个技能包的版本从 `0.1.0` 升到 `0.1.1`，用两步式流程（`publish` 暂存 → `approve` 上线）发布，使 npm 包页面上出现各自的 `CHANGELOG.md`。这一步没有代码改动，只有版本号与发布动作。

**Blocked by:** None。

**Status:** ready-for-agent

## 背景

六份 `CHANGELOG.md` 在提交 `24fdafb` 才加入，早于该提交发布的 `0.1.0` tarball 里不含这些文件；`math-board` 0.6.0 已经带了，不需要重发。详见 [spec](../spec.md)。

## 前置条件

- **npm CLI ≥ 11.15**：`npm stage` 从这版才有，`node scripts/publish.mjs publish` 会在上传前拒绝更老的版本。本机当前是 `11.12.1`，需先 `npm i -g npm@latest`。
- **可用凭据**：`~/.npmrc` 里要有 `//registry.npmjs.org/:_authToken=…`（开头必须两个斜杠）。上一个 token 已撤销，需要重新 `npm login --registry=https://registry.npmjs.org/` 或新建 token。
- **批准需要真人 2FA**：账号是 `auth-and-writes`，`approve` 一定会要一次性密码，绕不过去。可以给 agent 提供 `NPM_OTP`，或由本人到 npmjs.com 的 Staged Packages 页面批量批准。

## 验收条件

- [ ] 六个包的 `version` 升到 `0.1.1`；`math-board` 保持 `0.6.0` 不动。
- [ ] 依赖范围不变：`^0.1.0` 接受 `0.1.1`，所以 `math-primary-low` / `math-primary-high` / `math-common` / `chinese-reading` / `english` 里的 `baicai-edu-learn: ^0.1.0` 等不需要改；`math-board: ^0.6.0` 也不动。
- [ ] `node scripts/publish.mjs check` 为绿；`node --test scripts/*.test.mjs` 全过。
- [ ] `publish` 打印出六个 stage id；`approve` 后 `npm view <包名> version` 返回 `0.1.1`，且 `npm view <包名> dist.tarball` 下来的 tarball 里 `CHANGELOG.md` 存在。
- [ ] 七个包的 `latest` 全部是真实版本，不再是 `0.0.0-stage`。
- [ ] `math-board` 的 `latest` 仍是 `0.6.0`（未被误发新版本）。
- [ ] 打 tag `v0.1.1`，并确认工作区干净。
- [ ] 发布后仍做一次隔离 `DSH_HOME` 安装验收：`dsh plugin --profile web add baicai-edu-math-primary-low` 装到 0.1.1，闭包与技能数（低年级 20 个）不变。
  - 2026-11-20 补：验收命令要写成 `add baicai-edu-learn baicai-edu-math baicai-edu-math-board baicai-edu-math-primary-low`。只写包名时 pnpm 会下载闭包，但 DSH 只启用被列出的那一个，注册不到 20 个技能。

## 边界

只做版本号与发布，不改包内容、不改技能正文、不放宽 `engines.dsh` 区间。不要为「让 CHANGELOG 出现在页面上」而 `--force` 重发 0.1.0（npm 不允许覆盖已发布版本），也不要 unpublish 已发布的 0.1.0——接收方可能已经装了它。

## Comments

- 2026-11-18：本票由首版发布会话开出。用户决定本次不发，留到下次有实质改动时一起发；若届时有功能改动，`0.1.1` 的 CHANGELOG 条目应把该改动写在其 `Unreleased` 位置之后，而不是只写「补 CHANGELOG」。
