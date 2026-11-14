# 数学表征支架：实现与验证

日期：2026-11-14。

## 决策依据

见[研究核查](<math-representation-scaffolding-research.md>)。研究支持按目标与相关知识选择、教授和调整表征，不足以证明教师先画或学生先画普遍最优。只读教师区及其布局是产品设计推论，不是已证实的学习效果。

## 已实现

- 两个数学 band 的核心条件表及题目设计都可按需抵达共享[表征归属与渐隐契约](<../math-common/skills/math-common/references/representation-contract.md>)；不增加教学技能、模式或学生档案字段。
- 分开选择教师供图、学生构图、部分支持；保留被测关键推断；区分减少教师代做与撤去图示本身。学生可以继续用图，也可用纸笔、口述或算式。
- 新工具 `math_board_reference` 使用 `get` / `show` / `hide` 和修订号管理独立教师参考。只允许有界矩形、线段、圆和纯文本；不接受任意SVG、HTML、图片图元或学生快照。
- 新投影 `eduBoardReference` 仅含最新教师作品。严格匹配已记录的工具调用与成功结果；拒绝过期、伪造、不匹配或失败结果；隔离会话并限制待结算调用数量。
- 算数、几何两页均在题目参考下显示独立只读区，提供收起、可滚动查看及文本替代。参考区键盘事件不会误触学生画布删除/撤销。
- 教师参考不进入学生草稿、撤销/重做、修改记录、导出、输入框或回答附件；不自动打开工作台，不清板，不改变两种学生快照格式或几何判定限制。
- 任务结束、换题或独立测查前隐藏/替换教师参考由教学规则管理；不是自动内容识别，也不会随题目文字选择器回放旧图。学生画布沿用原授权规则。

## 自动验证

已执行：

```bash
node math-board/build.mjs
node --check math-board/client.js
node scripts/check-skills.mjs
node --test math-board/*.test.js math-board/geometry/model.test.js scripts/skill-contracts.test.mjs scripts/representation-contracts.test.mjs
git diff --check
```

结果：43项技能静态检查，0错误、0警告；376项测试全部通过；生成客户端语法及空白检查通过。

新增测试覆盖有界数据验证、纯文本安全、工具配对与并发/修订、生成包工厂、两页教师区显示/收起/替换/隐藏、键盘隔离、学生草稿与提交附件不受影响，以及契约入口与归因边界。

[共享语义场景](<../math-common/tests/teaching-scenarios.md>)新增R01–R08，是待回放清单，**未执行模型行为评测或学生学习效果实验**；静态测试不是教育效果验证。

## 真实界面与部署限制

现有GUI `http://127.0.0.1:3080` 的只读HTTP探测返回401，需要已认证浏览器会话；本次没有完成真实页面刷新后的视觉/交互验收。不读取认证令牌，不启动替代服务器。

源码与生成客户端已更新，但本次没有改动运行中的profile或重启Host；未核实同一checkout下的Web构建watcher，因而不承诺自动热更新。需要按[安装文档](<installation.md>)在实际profile更新/重载插件后，刷新原页面核验：教师图展示及收起、窄屏滚动、两种学生提交不带教师图、参考区Delete/Backspace/Ctrl或Cmd+Z不改变学生草稿。

本次未提交Git；保留了工作区原有未提交更改，未修改学生数据。
