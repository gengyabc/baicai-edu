# 数学画板工具调用排障

2026-11-14。对应现象：数学教学已加载共享画板规则，但没有真实调用，先承诺绘图，再把绘图要求推回给学生。

## 分层归属

- 两个年级段的 core 负责触发共享协议，不各维护一套调用格式。
- [math-common](../math-common/skills/math-common/SKILL.md) 持有共同的表征归属、工具分流和调用示例；它只提供规则，加载技能不等于注册工具。
- [math-board](../math-board/index.js) 在宿主注册工具及会话投影；模型以当轮可调用工具目录为准。`geometry_board_draw` 是工具，`eduBoardGeometryDemo` 是投影键，不是工具别名。
- 教师演示与学生未提交草稿分开。教师可以画已知条件；学生是否复制、是否提交是学生自己的动作。

## 已证实的缺口

1. **技能接线与示例**：原本两个 core 都提到几何绘图工具，所以不是完全“不知道画板”；但缺少明确的“你替我画／图没显示”分支，以及完整、可验证的直接调用示例。共享接口还要求每次只读一个契约，与教师几何同时需要表征规则和工具格式矛盾。
2. **服务依赖**：原插件顶层 `inject` 数组中的四项都是 Cordis 的必需服务，不是可选服务。真实加载器下，缺任一项都会让整个插件停在 pending；原测试忽略传入的 host 模式，始终提供全部服务，掩盖了此缺陷。
3. **安装闭包**：安装器只在本地模式遍历 `file:` 依赖，但当前 manifests 使用发布版本范围；registry 模式完全不展开。于是单独装低年级时没有显式选择共享技能和画板 bundle。已改为两种模式都按 manifest 展开必需的同仓库 bundle，高年级画板仍可选。
4. **当轮可见性**：旧模型轮次的可调用工具目录没有画板工具；后续工具更新后出现了四个工具。仅凭聊天记录无法进一步证明旧轮次究竟由哪个运行时条件造成，不能把发现的服务缺失缺陷冒充该历史实例的唯一根因。

## 修复与检查

- 两个 core 直接到共享 Tool Dispatch；[共享画板协议](../math-common/skills/math-common/references/board-contract.md) 给出 get → 实时 revision → show 的完整矩形示例，并区分调用记录、浏览器显示、学生复制与学生表现。
- 教师图恢复不改数学任务，不制造表现记录，不借工具限制要求学生必须自己画；投影名、脚本或生成的 JSON 文件都不是实际放图调用。
- 宿主入口无顶层必需服务，通过子注入分别管理会话投影、工具、命令与提示词的生命周期。服务晚到或替换时自动恢复；工具注册表更换不重挂投影。

验证入口：

```bash
node --test scripts/representation-contracts.test.mjs
node --test math-board/tool-schema.test.js
node --test scripts/board-boot.test.mjs
node --test scripts/skill-contracts.test.mjs scripts/check-skills.test.mjs
node scripts/check-skills.mjs
```

其中共享 JSON 示例既通过真实请求校验器，也通过注册后的工具执行与投影回放。启动测试使用真实 Cordis Loader 和 DSH ToolsService，覆盖缺服务、晚到、服务替换与卸载。合并执行画板、几何、启动、技能协议、安装器与检查器测试：429 项通过、0 失败；43 个技能检查为 0 错误、0 警告。安装器另实跑 dry-run，确认低年级两种模式包含 learn → math-common → math-board → math-primary-low，高年级仍不隐式包含画板。未实际修改 profile 或执行安装。

本会话真实执行过 `geometry_board_draw`：get 返回 revision 0 / figure null，随后 show 提交 5×5、3×7 已知条件图，返回 recorded / revision 1。此结果证明当前会话的教师图记录链路可用，**不证明浏览器已目视显示，也不等于两个年级段的新上下文模型回放通过**。

## 生效边界

共享技能的本地链接可在后续重新加载时读到新内容；已经加载的旧上下文不会自动重写。宿主插件生命周期代码需要按 DSH 的插件重载或重启流程生效；本轮没有替换服务器或更改用户 profile。此修改不涉及客户端绘图包，未声称浏览器 HMR 或页面已验收。高年级画板仍为可选依赖，不通过技能文本偷偷安装或启用插件。
