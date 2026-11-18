# 开发与验证

[English](development.md) | [中文](development.zh.md)

## 技能源与 `resources/`

规则文本在 `skills/math-common/references/`，安装时读的是由仓库根 `node scripts/build-resources.mjs` 从它渲染出的 `resources/`。改完参考文件要跑一次构建并提交重新生成的 `resources/`，否则契约测试会报两边不一致。`resources/` 是生成物：不要手改。

本包同时渲染 `learn/` 与 `english/` 的技能资源，因为年级段包的数学分支可能引用它们。

## 验证

```bash
node scripts/check-skills.mjs                 # 静态技能检查：命名、frontmatter、链接、过期命令
node --test scripts/*.test.mjs                # 契约：所有权、调度、证据、目录键
node scripts/build-resources.mjs              # 再确认 resources/ 无 diff
git diff --check                              # 空白与换行
```

静态检查不替代对话验证。

## 场景

[math-common/tests/teaching-scenarios.md](../tests/teaching-scenarios.md) 是需要真人跑一遍的共同行为清单：准备有效学生快照，一次只发一条学生消息，判断回复与它会记录的证据。读取层场景在 [learn/tests/image-reading-scenarios.md](../../learn/tests/image-reading-scenarios.md)。两份文件都由人或模型回放阅读；通过某个场景不等于它已被执行过。

这些文档不需要测试豁免：`check-skills.mjs` 本就把 `docs` 视为不随包发布，所以成对文档可以直接链接具体参考文件，`files` 清单也保持不变——`docs/` 与 `tests/` 只留在仓库里是有意的：它们承载维护者材料，不是安装的规则。

README 与本目录遵循[文档布局](<../../docs/agents/doc-layout.md>)。
