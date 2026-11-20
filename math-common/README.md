# baicai-edu-math 白菜数学契约

[English](#english) | [中文](#中文)

## English

The shared contract package of the two primary math bands: one copy of the math rules that would otherwise be written twice — student-authored problems, practice evidence, the math-board protocol and handwriting/image reading — so the same entry cannot behave in opposite ways in grades 1–3 and 4–6. It registers one internal skill, `math-common` (`user-invocable: false`); it has no teaching entry, no band session and is never a teaching-resolver candidate.

### Entries

None of its own. The bands load these files by name from the branch that needs them, and no command reaches this package directly.

### Install

`math-primary-low` and `math-primary-high` each declare it as a dependency, so installing a band brings it in once. From the registry that download is not an activation: name `baicai-edu-math` in the same `dsh plugin --profile web add` call as the band. On its own it teaches nothing and is useful only when debugging the load chain:

```bash
node scripts/install.mjs math-common --profile web
```

When it worked, the model catalog lists the `math-common` skill and `/` shows no new command. Unified entry, re-install and manual-disable behavior: [installation guide](<https://github.com/gengyabc/baicai-edu/blob/main/docs/installation.md>).

### What is irreversible

Nothing of its own: it writes no student data and ships no board or tool. The cost is a stale contract — a shared file changed without replaying both bands leaves a session on a rule nobody verified.

### Where the data lives

This package holds no state. Student data, records and finalize belong to `baicai-edu-learn`.

### Further reading

| To learn about | Go to |
|---|---|
| Which file owns which contract, how a band reaches it, what it may never contain | [Shared contracts](docs/contracts.md) |
| Rebuilding `resources/`, checks and scenario replay | [Development and validation](docs/development.md) |

## 中文

两个小学数学年级段包共享的数学契约包：学生编题、练习证据、画板协议与手写读取这些会被写两遍的数学规则只在这里存一份，同一入口就不会在 1–3 年级和 4–6 年级产生相反行为。它只注册一个内部技能 `math-common`（`user-invocable: false`），没有教学入口、没有年级段包的会话，也不参与教学选型。

### 入口

本包没有自己的入口。两个年级段包在出现对应分支时按名加载这些文件，没有任何命令直接进入本包。

### 安装

`math-primary-low` 与 `math-primary-high` 都把本包声明为依赖，装任一年级段包都会把它一并装上。从 registry 装时，下载不等于启用：请在带年级段包的那条 `dsh plugin --profile web add` 里把 `baicai-edu-math` 一起写出来。单独安装本包没有教学入口，只在调试加载链路时使用：

```bash
node scripts/install.mjs math-common --profile web
```

装好后模型目录里能看到 `math-common` 技能，`/` 菜单不新增命令。统一入口、重复安装与手动禁用见[统一安装说明](<https://github.com/gengyabc/baicai-edu/blob/main/docs/installation.md>)。

### 不可逆的部分

本包自身没有不可逆的操作：它不写学生数据，也不带画板或工具。真正的代价是过期契约——改了共享文件却没有回放两个年级段包，会让会话停在没人验证过的规则上。

### 数据放在哪

本包不持有状态。学生数据、学习记录与收尾保存（finalize）都归 `baicai-edu-learn`。

### 深入阅读

| 想了解 | 位置 |
|---|---|
| 哪条契约归哪个文件、年级段包如何读到它、共享文本不能写什么 | [共享契约](docs/contracts.zh.md) |
| 重建 `resources/`、检查与场景回放 | [开发与验证](docs/development.zh.md) |
