# 几何 tab 隐藏数量画板清空

Type: grilling
Status: resolved

## Question

`math_board_clear` 在几何 tab 打开时应怎样表现？

## Answer

工具平台语义不变：`math_board_clear` 只清数量模式。几何 tab 打开时，界面不显示这条清空请求的任何入口或提示；几何作品保留，数量 tab 下次打开时照旧消费已有请求。低年级自动清板不作用于几何。首版仍不新建 `geometry_board_clear`。
