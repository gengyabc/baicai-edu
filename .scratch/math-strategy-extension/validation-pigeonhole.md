# 05 抽屉与保底存在性：实施核验

日期：2026-11-12。分支：`implement/math-pigeonhole`。起点：`6a8fae10fe9757f04d504b92e506422c9829d1b3`。仅修改本 worktree，未合并、安装或修改真实学生数据。

## 范围与源码结果

- [本票](<issues/05-pigeonhole-existence.md>)；[阶段2规格 §5](<stage-2-spec.md#5-抽屉与存在性>)；[验收 H/HB](<stage-2-acceptance.md>)。
- core 条件 → 现有方法索引 → 新增 `pigeonhole-existence.md`；不增加 Skill、leaf、数据字段或其他 band 行为。
- 专题给出类别覆盖/不重复、容量反证、下界/紧性/实际计数/具体识别区分；H0–H2桥接、13/25/12教师核验与HB3数据限制。
- 证明、先修和全解门引用原权威规则；专题不复制调度或状态协议。学生已有分类/计算优先保留；名称不是论证。

## 执行记录：静态 / 契约（通过）

已确认接缝沿总spec Testing Decisions：既有技能静态/契约入口，仅验证架构边界，不宣称测试提示语教学效果。

1. 红：`node --test --test-name-pattern='pigeonhole existence' scripts/skill-contracts.test.mjs`，退出1，新guard在core缺少分类容量入口处失败（`assert.ok(row?.includes(...))`）。
2. 加入core/索引/专题后同命令：1/1通过，退出0。
3. `node --check scripts/skill-contracts.test.mjs`：通过。本仓库无根package.json/TypeScript typecheck任务；变更为Markdown及JS静态guard，未声称执行不存在的typecheck。
4. `node scripts/check-skills.mjs`：43 skills，0 errors，0 warnings，退出0。
5. `node --test scripts/*.test.mjs`：161 tests，160 pass，0 fail，1 skip，退出0。跳过项为真实DSH安装集成测试；未把skip算通过。
6. `node --test scripts/math-strategy-recursion.test.mjs scripts/prerequisite-plan.test.mjs scripts/learning-persistence.test.mjs`：13/13通过，退出0。覆盖既有单层返回、回答归属、快照恢复、放弃目标不复活等**文本契约**，不是本次抽屉教学的实际保存恢复。
7. `git diff --check`：通过；提交前另检查新增文档行尾空白。两份用户已有修改的文件与进入时保存的基线 `cmp` 一致，均不暂存。

完整套件当次结果摘要：

```text
43 skills checked, 0 errors, 0 warnings
ℹ tests 161
ℹ pass 160
ℹ fail 0
ℹ skipped 1
```

## 数学核验：有限枚举与人工论证（通过，仅案例层）

执行 Node `assert/strict` 的12维分配枚举（每月从0到cap）：cap=1遍历4096种向量，最大总数12；cap=2遍历531441种向量，最大总数24。独立预期分别固定为12/24，未用待验证除法公式生成预期。

```js
for (const [cap, expectedCount, expectedMax] of [[1,4096,12],[2,531441,24]]) {
  let count=0, max=0;
  function visit(month,total) {
    if(month===12) { count++; max=Math.max(max,total); return; }
    for(let n=0;n<=cap;n++) visit(month+1,total+n);
  }
  visit(0,0);
  assert.equal(count,expectedCount); assert.equal(max,expectedMax);
}
```

另断言 `[2,1×11]`总13/最大2，`[3,2×11]`总25/最大3，`[1×12]`总12/最大1，`[13,0×11]`总13/最大13；全部通过、退出0。前两者验证紧性见证，第三个反驳12人保证重合，第四个反驳13人实际恰好2。

人工审阅一般理由：每个人恰在一月；全月各≤1/≤2分别给总≤12/≤24，与13/25矛盾。紧性见证仅用于否定更强保证，未冒充所有分配的证明。真实名单和月份不能由总数推出。有限枚举不替代学生的一般理由，也不是教学回放。

## code-review（本地双轴）

已加载 `code-review`。基准固定为上述起点；检查tracked diff及新增专题全文。Standards来源：AGENTS、skill-self-contained、issue-tracker及writing-for-agents；未发现额外CODING_STANDARDS/CONTRIBUTING文件。

- **Standards：**本地未发现需修复项。材料按条件披露、无外部URL、无新Skill或长期枚举；测试复用静态边界，无新框架。Fowler气味基线未发现实质新增抽象/重复逻辑。
- **Spec：**源码覆盖容量、精确性、识别、桥接及知情全解边界；行为验收仍不完整，见下表。未将实现完成写成整票验收完成。
- 本agent子代理额度为0，无法按skill自行并行双子代理；以上仅本地自查。父层随后执行了下列独立双轴审查。

### 父层独立审查（2026-11-12）

固定审查范围：`6a8fae10fe9757f04d504b92e506422c9829d1b3...6397a391585bb27d89aad7b9c6e3853f224456e6`。父agent已加载code-review，并使用独立审查代理 `709063dc` 与 `3ce526f2` 分别执行双轴；以下为父层返回的结论。

- **Standards：0问题。** 未发现文档标准或气味基线问题。
- **Spec：0源码缺陷/范围问题；1项验收覆盖缺口。** 阶段2规格第119行、票第15–17行要求的H0–H2旧/新多轮、HB边界及恢复/退出实际回放未执行。该缺口已经披露，仍待执行，不因源码审查合格而关闭。
- 无源码修复要求；本次只追加审查记录，不改变下表未测试状态。独立审查是源码/规格审查，不是行为回放或真实学习效果验收。

## 未执行门（全部保持未测试）

| 层次/场景 | 状态与限制 |
|---|---|
| H0/H1/H2 各一组旧/新多轮模型对照 | 未测试。本agent无可用独立模型调用工具；目录搜索只有既有Markdown回放记录，无可执行模型回放runner。不能以手写预期回复或本轮文档生成充当实际轨迹。 |
| HB1/HB2/HB3 实际教学回复 | 未测试。仅数学及源码审阅通过；没有实际学生/模型历史、pending或segment输出。 |
| S1–S6 实际交互、全解选择、拒绝/退出 | 未测试。本次仅运行现有退出/恢复契约，未生成新的模型历史。 |
| 本专题隔离学生四文件保存/恢复 | 未测试。无实际写入轨迹、快照或状态断言；不复用前票通过结论。 |
| 真实DSH安装/Web集成 | 未测试；全套安装集成项skip。 |
| 真实学生独立解释/迁移/学习效果 | 未观察；合成或静态结果均不能证明真实学习成效。 |

后续在可用模型/宿主环境固定旧新规则快照、提供方/模型/参数和完整历史，执行H0–H2、HB1–HB3及代表性S场景，并用隔离虚构学生留状态和保存轨迹后，才能关闭剩余验收项。

## 整合合入（票 13）

2026-11-12：本分支已由主会话按批次合入 `main`（合并提交 `19f4e14`；后端 `check-skills` 43 skills、0 错误，脚本测试见[整合验收](../integration-acceptance.md) §1）。以上是该 worktree 的局部结果与规则快照；合入后源码在公共入口生效，但行为多轮、保存恢复与真实学习效果仍未测试。
