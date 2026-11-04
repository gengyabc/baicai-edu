# Targeted Practice Rules

## Purpose

基于错题分析和学生水平生成针对性练习。

## Input

- 学生档案：`outputs/students/<student_id>/<subject>/profile.json`
- 错题分析：`outputs/students/<student_id>/<subject>/extracted/<error_file>.md`
- 学习水平：`profile.current_levels`

## Output

按层次生成的练习题目。

## Practice Layers

### Layer 1: 诊断性练习

目的：确认错误模式

特点：
- 同类型题目，不同数字
- 观察学生是否重复相同错误
- 数量：1-2 题

### Layer 2: 对比性练习

目的：凸显错误原因

特点：
- 展示正确做法和错误做法
- 让学生判断哪个对，并解释原因
- 数量：1 题

### Layer 3: 变式练习

目的：稳定正确策略

特点：
- 换情境/换数字
- 保持知识点相同
- 数量：2-3 题

### Layer 4: 连接练习

目的：巩固理解，建立联系

特点：
- 把薄弱点与已掌握的知识建立联系
- 从情境到抽象，或从抽象到情境
- 数量：1-2 题

## Generation Logic

错误类型 + 学生水平 + 学生偏好 → 练习层次和内容

按错误类型：计算错误、概念混淆、过程遗漏各有不同策略
按学生水平：direct_modeling需更多情境，flexible_relational可用更大数字
按学生偏好：story_context/visual/direct_calculation分别匹配不同题型

## Constraints

- 不一次性给所有层次
- 根据学生表现调整
- 保持题目数量适中（每层 1-3 题）
- 语言符合学生年级特点
