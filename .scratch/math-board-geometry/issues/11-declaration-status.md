# 声明不一致不再作为状态

Type: grilling
Status: resolved

## Question

学生声明与画面不一致时，快照里还留 `condition_mismatch` 吗？

## Answer

不保留。几何首版没有声明对象，也没有关系对象，因此没有“不一致”这个状态可落。学生声明的条件只写在说明里；判断是否成立由程序判定（构造运算）负责，首版程序也不做额外判定。重新启用 `condition_mismatch` 需要先恢复声明的数据结构和程序判定，不在首版。

## Comments

- 本轮 Q17（正方形识别）取消：由 `06-programs-decide.md` 取代。
