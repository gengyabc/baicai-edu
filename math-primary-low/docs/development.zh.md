# 开发与验证

[English](development.md) | [中文](development.zh.md)

## 技能源与 `resources/`

技能文本在 `skills/`，安装时读的是由仓库根 `node scripts/build-resources.mjs` 从它渲染出的 `resources/`。本包提交 `resources/`，`skills/` 供阅读与维护。改完技能要先跑构建再提交，否则契约测试会报 `resources/` 与源不一致。不要手改 `resources/`：一份生成资源会把引用的参考文件内联进来，包括本带指向的共享 `math-common` 与 `learn/` 参考。

## 验证

```bash
node scripts/check-skills.mjs                  # 静态技能检查：命名、frontmatter、链接、过期命令
node --test scripts/skill-contracts.test.mjs   # 契约：调度、证据、画板授权、目录键
node scripts/build-resources.mjs               # 再确认 resources/ 无 diff
git diff --check                               # 空白与换行
```

这些是静态检查，不替代真实对话。

## 教学场景

[教学场景](../tests/teaching-scenarios.md) 是需要真人跑一遍的行为清单：准备有效学生快照，一次只发一条学生消息，判断回复与它会记录的证据。它由人或模型回放阅读；通过某个场景不等于它已被执行。

`baicai-edu-math` 里的共享契约一改，两个年级段包共同与差异的场景都要回放；共同场景在 [math-common/tests/teaching-scenarios.md](../../math-common/tests/teaching-scenarios.md)。

## 这些文档

`docs/` 是维护者阅读材料，不参与安装，所以成对文档可以直接链接具体参考文件而不需要检查豁免。每一页与它的中文对照保持相同行数，每条规则只留一份权威文本：本目录做摘要并指向拥有它的技能文件。布局遵循[文档布局](<../../docs/agents/doc-layout.md>)。
