# 开发与验证

[English](development.md) | [中文](development.zh.md)

## 技能正文与 resources

技能正文在 `skills/`；安装时读的是仓库根目录 `scripts/build-resources.mjs` 由它渲染出的 `resources/`（本包发布内容含 `resources/`，`skills/` 供阅读与维护）。改完技能先跑 `node scripts/build-resources.mjs` 再提交，否则 `publish.mjs check` 与契约测试会报 `resources/` 与源码不一致。

`resources/` 是生成物，不要手改。`package.json` 的 `files` 只发布运行所需（`cordis.patch.yml`、`skill-provider.mjs`、`lib`、`build.json`、`resources`、`skills`、`README.md`、`LICENSE`），本 `docs/` 与 `tests/` 只在仓库内阅读。

## 验证

```bash
node scripts/check-skills.mjs
node --test scripts/*.test.mjs
```

这些是静态检查，不替代真实对话验证；需要实际运行的行为清单见[对话验收场景](acceptance-scenarios.zh.md)。
