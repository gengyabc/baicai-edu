# 依赖、学科契约与新增规则

[English](extending.md) | [中文](extending.zh.md)

本包是学科包：只提供语文教学。入口、会话循环与数据协议来自 `baicai-edu-learn`，它在 `dependencies` 里声明，安装时一并带入。

## 依赖

缺少 `baicai-edu-learn` 时，共享规则、会话循环与数据协议都不可用，本包无法单独运行。入口加载 `learn-core` 与 `learn-data`，并让 `learn-errors` 处理投放的文件；`chinese-session` 沿用这次交接并加载 `chinese-core`。学生数据经 `learn-data` 的 JSON 协议读写。

本包从不自己调用 `learn-errors`：文件由入口解析一次，之后出现的图片或 raw 扫描请求交回入口。

`cordis.patch.yml` 只有一行：激活 `baicai-edu-learn` 携带的那一个技能 provider（条目 `edu-skills`），它从各已安装包的 `resources/` 注册全部技能。本包没有插件运行时、也没有自己的工具——全部行为就是 `SKILL.md` 指令加文件读写。

## 学科契约

`chinese-core` 里有 `## Subject contract` 段，共享入口路由到语文时读它。它声明 `supported_stages: lower_primary, upper_primary`（本包适配的表达与流程，不是内容门槛——其他阶段走通用教学）、`subject: chinese`、教学入口 `chinese-session`、包名 `baicai-edu-chinese-reading`。五个角色及其归属见[技能与规则归属](skills.zh.md)；角色本身的含义归 `learn-data` 的学科契约。

语文只用一个包、一套技能名；数学按年级段拆包。两者的对照与共享规则见[学科包](<../../learn/docs/subject-packages.zh.md>)。

## 新增规则或领域

1. 新规则只写进 `skills/chinese-core/references/` 下的一个文件，或扩展现有归属文件（见[技能与规则归属](skills.zh.md)）。已经存在的规则不要在旁边再抄一份。
2. 登记读取位置：按条件读的规则加一行到 `chinese-core` 的读取表；按轮分支的加到所属教学技能；新目标类型加到[语文目标](../skills/chinese-core/references/chinese-target.md)，需要单独分派时再加到 `chinese-session` 的路由表。
3. 守住边界：子技能写读取时用「技能名 + 该技能内的路径」，不写跨包路径，也不自己写学生数据。
4. 跑 `node scripts/build-resources.mjs`，让渲染后的 `resources/` 带上改动。

删规则时反向做一遍：删正文、删读它的那一行，再重新构建。

## 包结构

```
chinese-reading/
  package.json
  cordis.patch.yml
  README.md
  docs/                     # 维护者阅读，不进包
  skills/
    chinese-core/SKILL.md + references/
    chinese-session/SKILL.md
    chinese-reading-session/SKILL.md
    chinese-writing-session/SKILL.md
    chinese-read-write-transfer/SKILL.md
    chinese-generate-tasks/SKILL.md
  resources/                # 由 skills/ 生成
```

`docs/` 不参与安装；`package.json` 的 `files` 发布 `cordis.patch.yml`、`build.json`、`resources`、`skills`、`README.md` 与 `LICENSE`。技能里指向 `docs/` 的链接装好即失效，静态检查会直接拒绝。
