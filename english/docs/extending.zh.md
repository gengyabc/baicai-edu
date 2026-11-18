# 依赖、学科契约与新增方法

[English](extending.md) | [中文](extending.zh.md)

本包是学科包：只提供英语教学，别无其他。共享入口、会话循环与数据协议来自 `baicai-edu-learn`，它被声明为依赖，安装时一并带入。

## 依赖

缺少 `baicai-edu-learn` 时，共享规则、会话循环与数据协议都不可用，本包单独无法运行。入口负责加载 `learn-core` 与 `learn-data`，并通过 `learn-errors` 处理投放文件；`english-session` 复用这次交接再加载 `english-core`。学生数据按 `learn-data` 的 JSON 协议读写。

本包从不自己调用 `learn-errors`：文件由入口解析一次，教学中途出现的图片、Markdown 或原始扫描请求交回入口。

## 学科契约

`english-core` 里有 `## Subject contract` 小节，共享入口路由到英语时读它。它声明 `supported_stages: lower_primary, upper_primary`（本包适配的表达与流程，不是内容门槛——其他阶段走通用教学）、`subject: english`、教学入口 `english-session`、包名 `baicai-edu-english`。五个契约角色及其归属见[技能与所有权](skills.zh.md)，角色含义本身由 `learn-data` 的学科契约定义。

多年级段学科会拆成多个包、各用不同的技能名；英语是一个包、一套技能名。

## 新增方法

1. 建 `skills/<method-name>/SKILL.md`，设 `user-invocable: false`、不设 `disable-model-invocation`，正文只写理论与做法——不加载兄弟方法、不产自己的 `session_segment`、不写档案。
2. 把它注册进 [english-teaching-core](../skills/english-core/references/english-teaching-core.md) 的唯一方法表，并写清哪个 `target_context.type` 会走到它；选择依据必须只写在这张表里。
3. 方法需要 UI 文案时，在所有语言目录的 `english-core/references/locales/<locale>.json` 里加同一个键。
4. 运行 `node scripts/build-resources.mjs`，让渲染出的 `resources/` 带上新技能。

删方法逆向操作：删目录、删方法表里的那一行、再重建。

## 包结构

```
english/
  package.json
  cordis.patch.yml
  README.md
  docs/                     # 维护者阅读，不随包发布
  skills/
    english-core/SKILL.md + references/ + references/locales/
    english-session/SKILL.md
    <九个方法技能>/SKILL.md
  resources/                # 由 skills/ 生成
  tests/teaching-scenarios.md
```

`docs/` 与 `tests/` 不安装；`package.json` 的 `files` 只发布 `cordis.patch.yml`、`build.json`、`resources`、`skills`、`README.md`、`LICENSE`。因此技能里链到 `docs/` 的链接在安装后是死链，静态检查会直接报错。
