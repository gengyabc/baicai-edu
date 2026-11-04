# dsh-edu-learn

共享学习入口与教学底座，配合 `dsh-edu-math-low`、`dsh-edu-chinese-reading` 使用。

## 提供的入口

| 命令 | 作用 |
|---|---|
| `/start` | 选数学/语文，识别或创建学生 |
| `/learn` | 自适应学习主循环 |
| `/feynman` | 费曼模式（原 Pi 的 `/teach`；`/teach` 已被全局技能占用） |
| `/profile` | 查看/修改学生档案 |
| `/save` | 手动保存当前会话 |

## 共享内部技能

- `learn-core`：中文语气、以学生为中心、年级适配、三步确认、引导无响应、结束信号、人格、费曼规则。
- `learn-data`：`outputs/students/` JSON 数据协议、快照、建档、写回、finalize。
- `learn-errors`：错题图片/Markdown 解析、raw 只读、extracted 写入、error_history 更新。

入口 skill 分两档：`start` / `learn` 设置 `disable-model-invocation: true`，只能由用户键入命令发起，不进入模型目录；`feynman` / `profile` / `save` 保留模型入口，支持对话内自动加载（“我来给你讲”“看看我的档案”“保存一下”）。上面 3 个内部 skill 保持模型可加载，只通过 `user-invocable: false` 从 `/` 菜单隐藏。

## 安装

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/learn
```

安装后刷新 Web 会话：`/` 菜单出现 5 个入口命令；模型目录出现 `feynman`、`profile`、`save` 和 15 个内部 skill。输入 `/start` 即可开始。

## 数据目录

所有学生数据在当前工作区的 `outputs/students/`。`outputs/` 是通用输出根目录，后续可扩展其他产物目录。

```
outputs/students/
  session.json
  <student_id>/
    profile.json
    math/...
    chinese/...
```

协议见 `skills/learn-data/SKILL.md`。

## 依赖

- `math-low` 与 `chinese-reading` 的 skill 会按名称加载 `learn-core`、`learn-data`、`learn-errors`。
- 单独安装本包只能使用入口、档案、保存和错题能力，不能进行学科教学。
