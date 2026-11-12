# Issue 04 — 逻辑约束交付与分层验收

日期：2026-11-12。分支 `implement/math-logical`；固定旧侧 `6a8fae10fe9757f04d504b92e506422c9829d1b3`。实现范围为现有高年级 core → 方法索引 → [逻辑约束补充](<../../math-primary-high/skills/math-high-core/references/logical-constraints.md>)，无新 Skill、调度节点、数据字段或长期障碍枚举。未安装或更改运行中 profile。

## 已执行：静态与有限数学核验

接缝由父代理确认：现有教学入口的多轮回放是主要行为边界；现有契约测试只守卫条件可达及协议复用，有限枚举只核验教师案例，不用准确话术断言充当教学测试。

| 命令 | 实际结果与范围 |
|---|---|
| `node --test --test-name-pattern='logical constraints are conditionally reachable' scripts/skill-contracts.test.mjs`（实现前） | RED：1 failed；core 没有候选约束入口，入口行为空。退出码1；预期失败，不是测试环境故障。 |
| 同上（实现后） | GREEN：1 passed；core→索引→reference 及权威协议指针可达。不证明实际模型会按规则教学。 |
| `node scripts/check-skills.mjs` | 43 skills，0 errors，0 warnings。 |
| `node .scratch/math-strategy-extension/logical-case-validation.mjs` | PASS；穷举27个三角色三色赋值，其中6个互异排列。原题唯一 `(blue,green,red)`；LB1恰三解；LB2无解；去掉互异约束后4解；局部允许的A绿在原题没有完整扩展。 |
| `node --check scripts/skill-contracts.test.mjs` | PASS，MJS语法检查。 |
| `node --check .scratch/math-strategy-extension/logical-case-validation.mjs` | PASS，MJS语法检查。 |
| `node --test scripts/*.test.mjs` | 161 tests：160 passed，0 failed，1 skipped（real DSH install integration未启用）。完整仓库脚本测试，不宣称跑过真实安装集成。 |
| `git diff --check` | PASS；最终暂存后再次检查，覆盖新增文件。 |

本变更无 TypeScript；高年级包没有 typecheck script，未虚构 typecheck 通过，以两份 MJS 的 `node --check` 记录实际检查。有限枚举工具见[可重复核验脚本](<logical-case-validation.mjs>)。它不是生产求解器，也没有模拟教师或学生回复。人工审阅覆盖候选穷尽、各原条件代回、唯一性与存在性分开、直接矛盾证明，以及换名/换值的同构近迁移。

## 未执行：实际模型与真实学习效果

| 验收层/场景 | 状态 | 缺口 |
|---|---|---|
| L0 旧/新多轮 | 未测试 | 不知道先看哪里 → 实际组织选择 → 后续回应；没有实际输出历史。 |
| L1 旧/新多轮 | 未测试 | 只漏用互异 → 实际局部修复 → 后续回应；没有实际输出历史。 |
| L2 旧/新多轮 | 未测试 | 正确结果 → 实际唯一性决策 → 后续回应；没有实际输出历史。 |
| LB1/LB2 模型边界 | 未测试 | 数学三解/无解已核验，但模型是否拒绝强造唯一尚未观察。 |
| S1–S6 实际交互 | 未测试 | 递归工具子任务、两层保存恢复/单次消费、同题知情全解、教师归因与退出；仅现有契约回归通过，不是本专题行为通过。 |
| 真实学生学习效果 | 未测试 | 无真实学生观察，不读写任何真实档案。 |

具体限制：本子会话可用工具没有教学模型多轮 replay API，且 runtime 明确禁止在此深度再启子代理；父代理确认也无已配置的教学 replay API。未尝试用普通子代理编写成功轨迹，未访问真实学生数据，未将新规则装到共享运行 profile。提供方/模型/参数、完整历史、状态保存结果均无可报告的实际回放值。未来须固定旧侧与实现提交，按 stage-2 acceptance 运行实际入口对照并保存真实分叉；本记录不替代这些验收。

## Code review

已加载 `code-review` 和 `writing-for-agents`。本地按 Standards / Spec 两轴检查，独立并行子审查由父代理在提交后执行（本层 delegation remaining=0，不能声称完成了本层并行审查）。固定基准如上；提交后由父代理使用 `git diff 6a8fae1...HEAD` 与 `git log 6a8fae1..HEAD --oneline` 审阅。

### Standards（本地）

依据 AGENTS、技能自包含规则、domain 规则、ADR-0001/0003 以及 writing-for-agents。无新增外部运行依赖或独立教学循环；局部 reference 与条件入口共置，保留枚举/证明/递归/全解/segment 唯一权威来源。仅提交本票文件，不修改或暂存用户的词汇表/方法说明基线。无发现需修复的硬规范问题或实质 smell。

### Spec（本地）

静态实现涵盖对象/取值/互异/量词、未探索与排除区别、逐条件存在核验及穷尽唯一性、三解/无解、局部接续、递归/全解/退出与归因边界。无额外生产范围。

**未关闭验收项：** 票04要求的L0–L2旧新多轮和LB1–LB2实际行为，以及工具/保存恢复交互没有执行证据。因此仅交付实现与静态/数学核验，整票不标完成、不报全验收通过。独立审查结果及必要修复在父代理反馈后追加。

### 父层独立双轴审查与复验（2026-11-12）

父代理在本子会话无下级委派权限的条件下，启动独立审查代理 `26886bdc` 与 `130ed70b`；固定审查范围为 `6a8fae10fe9757f04d504b92e506422c9829d1b3...1144e78b2025e469e81c7f9efb1af37fecdfc0e7`。

- **Standards：** 0项规范违规，0项实质 smell。
- **Spec：** 0项源码缺陷或越界；1项已披露的行为验收缺口：票04第15行、stage-2 acceptance第9行及stage-2 spec第119行要求的L0–L2旧新多轮、LB1–LB2边界及S1–S6恢复/选择等仍未执行。该缺口保留，不按源码缺陷修复，不标整票完成。
- **修复：** 无源码修复要求；本追加仅记录独立审查与复验结果。
- **父层复验（父代理反馈）：** `node scripts/check-skills.mjs` 为43技能、0错误、0警告；`node --test scripts/*.test.mjs` 为160通过、1跳过、0失败。

独立审查和父层复验没有提供新的实际教学轨迹、保存恢复输出或真实学生观察；上一节各项未测试状态不变。保持原分支和基准，不合并或变基外部主分支后续提交。

## 用户基线保护

实现前读过并将两份用户快照及原始diff保存到 worktree 内的 `logical-baseline/`（不提交）。用 `cmp` 确认 GLOSSARY 与方法说明仍逐字等于该基线；未对两文件作本票改动、不将其差异加入提交。其他未跟踪规格与issues不暂存。

## 整合合入（票 13）

2026-11-12：本分支已由主会话按批次合入 `main`（合并提交 `777b489`；后端 `check-skills` 43 skills、0 错误，脚本测试见[整合验收](../integration-acceptance.md) §1）。以上是该 worktree 的局部结果与规则快照；合入后源码在公共入口生效，但行为多轮、保存恢复与真实学习效果仍未测试。
