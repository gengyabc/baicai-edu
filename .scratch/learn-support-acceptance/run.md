# 学习支持半自动验收总览

标签：`protocol-walkthrough`（本会话 agent 代教 + 文件差异）  
**不宣称**：DSH Web 卡片/入口、长期成效。

日期：2026-11-09  
执行约定：合成学生 `stu_synth_*`；真实学生目录未读取；`session.json` 已备份至 `session.json.pre-acceptance.bak` 并应在收尾恢复。

## 静态基线

| 命令 | 结果 |
|---|---|
| `node scripts/check-skills.mjs` | 35 skills, 0 errors, 0 warnings |
| `node --test scripts/*.test.mjs` | 82 pass, 1 skip (DSH install), 0 fail |

## 夹具约定

- 学生 id：`stu_synth_<slug>_<4hex>`
- 路径：`outputs/students/<id>/…`、`data/students/<id>/<subject>/raw/`
- 隔离：`DSH_EDU_ACCEPTANCE_ROOT=<dir>` 可把夹具写到别处；默认仓库根
- 场景记录：`scenarios/`
- 生成器：`fixtures/create.mjs`；`node fixtures/create.mjs clean` 只删 `stu_synth_*`

## 矩阵

| ID | learn | feynman | 备注 |
|---|---|---|---|
| S01 | PASS | PASS | 旧档推导 upper_primary，无迁移 |
| S02 | PASS | PASS | 成人 + general_v1 |
| S03 | PASS | PASS | 未知阶段不追问 |
| S04 | PASS | PASS | confidence，保留题目 |
| S05 | PASS | PASS | 短答不触发 support |
| S06 | PASS | PASS | autonomy |
| S07 | PASS | PASS | strategies 单方法 |
| S08 | PASS | PASS | value + 通用 |
| S09 | PASS | PASS | persistence 缩任务 |
| S10 | PASS | PASS | 退休/资深双夹具 |
| S11 | PASS | PASS | activity=support，segments=[] |
| S12 | PASS | PASS | 四镜像 plan，marker 最后 |
| S13 | PASS | PASS | no-op 清 context |
| S14 | PASS | PASS | declined |
| S15 | PASS | PASS | exposure |
| S16 | PASS | PASS | ai_collaboration |
| S17 | PASS | PASS | 支持→教学无假 segment |
| S18 | PASS | PASS | 不热替换 |
| S19 | PASS | PASS | 双 scope_id |
| S20 | PASS | PASS | 跳过推荐 |
| S21 | PASS | PASS | 失败重放后再切换 |
| S22 | PASS | PASS | **真实故障注入** |
| S23 | PASS | PASS | **真实清理失败** |
| S24 | PASS | PASS | correction → superseded |
| S25 | PASS | n/a | 安全；危机细节未入档 |
| S26 | PASS | PASS | 主导者保留 |
| S27 | PASS | PASS | 空/已提交后再存新计划 |
| S28 | PASS | PASS | general_progress 接续 |
| S29 | PASS | PASS | 支持加载失败降级 |

汇总：learn 29/29 PASS；feynman 28/28 PASS（S25 免）；FAIL 0；BLOCKED 0。

## FAIL / BLOCKED

无。

## 诚实边界

- 本跑为协议走查：agent 按技能写盘并断言文件差异，**不是**独立 DSH Web 模型会话录屏。
- Web 卡片点击、`ask_user_question` 渲染、安装后入口仍待运行。
- 长期学习成效未验证。

## 收尾

- [x] 恢复 `session.json` 自备份（见执行末步）
- [x] 更新 `learn/tests/learning-support-scenarios.md` 检查记录
