# 开发与验证

[English](development.md) | [中文](development.zh.md)

## 技能来源与 resources

技能文本在 `skills/`；安装读的是由仓库根目录 `node scripts/build-resources.mjs` 从它渲染出的 `resources/`。本包发布 `resources/`，`skills/` 供阅读与维护。改完技能要在提交前跑一次构建，否则契约测试会报 `resources/` 与来源不一致。

`resources/` 是生成物：不要手改。每个 resource 会把它引用的 reference 内联进来，所以语文 resource 也带着它引用的 `learn/` 共享文件。

## 验证

```bash
node scripts/check-skills.mjs                      # 技能静态检查：名称、frontmatter、链接、过期命令
node --test scripts/skill-contracts.test.mjs       # 契约：路由、证据、交付、档案字段
node scripts/build-resources.mjs                   # 再确认 resources/ 无 diff
git diff --check                                   # 空白与换行
```

覆盖本包的契约测试检查：子技能从 `chinese-core` 继承开始门槛与共用读取、经验桥接只能经内部动作表进入、一项状态/闸门/文件交接只有一个归属，以及每个技能仍显式写明自己的 `session_segment` 字段。这些都是静态检查，不能替代真实对话验证。

## 修改文档

`docs/` 是维护者阅读材料，不参与安装。每一页与它的中文对照保持相同行数，且每条规则只留一份权威文本：本目录只做摘要并指向拥有它的技能文件。README 与 docs 的拆分规范见[文档布局](<../../docs/agents/doc-layout.md>)。
