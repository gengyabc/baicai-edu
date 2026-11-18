# 开发与验证

[English](development.md) | [中文](development.zh.md)

## 技能源与资源

技能正文在 `skills/`；安装读取 `resources/`，由仓库根目录的 `node scripts/build-resources.mjs` 渲染生成。本包发布 `resources/`，`skills/` 用于阅读与维护。改完技能先跑构建再提交，否则契约测试会报 `resources/` 与源不一致。

`resources/` 是生成物，不要手改。每个资源会把正文引用的参考文件内联进去，所以英语资源里也会带上被引用的 `learn/` 共享参考。

## 验证

```bash
node scripts/check-skills.mjs                      # 技能静态检查：命名、frontmatter、链接、过期命令
node --test scripts/skill-contracts.test.mjs       # 契约：调度、证据、交付、目录键
node scripts/build-resources.mjs                   # 再确认 resources/ 无差异
git diff --check                                   # 空白与换行
```

这些是静态检查，不等于真实对话验证。

## 教学场景

[教学行为对照场景](../tests/teaching-scenarios.md)是需要真实跑一遍的行为清单：先准备有效学生快照，一次只发一条学生消息，检查回复与拟记录的证据。它供人工审阅或模型回放；通过它不代表场景已被自动执行过。

场景按理解与故事、对话与表达、任务词汇与复习分组，相邻两列分别是应观察的行为与失败信号。
