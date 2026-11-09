# 跨科目标交接

只由共享生命周期执行；推荐只返回授权目标，不写 session 身份。跨科选择与显式跨科目标都使用本协议。真实目标身份与教学解析按 `references/teaching-resolver.md`，保存仍仅走 Finalize。所有路径从当前学生和合法 subject id 推导，不接受日志中的任意文件路径，不搬移旧日志或证据。

## 准备与激活

1. 在旧科目日志的 recommendation 中先持久化 selected_id；显式跨科目标也建立同形的已选交接对象。增加 `transition`，包含 from_subject、from_session_id、to_subject、to_scope_id、to_session_id、selected_id。目标 focus、target_context 与 teaching 留在对应候选中。to_session_id 在此生成并检查不与目标现存日志身份冲突，重试不重新生成。任何写入失败 STOP，旧身份不动。
2. 先完成旧主题 Finalize（含已请求计划），保留已选 recommendation 与 transition；旧科目 current_state 的 marker 必须匹配 from_session_id。源只有临时状态且无可提交内容时，生命周期完成 no-op 清理，但保留该已选交接，并在 transition 写 `source_closed: true` 作为不产生长期证据的关闭确认。确认写入失败仍 STOP。
3. 写 session.json 的新 subject/scope_id/teaching，同时保留 `pending_transition`，值为上述 transition 及同一 student_id。写入成功不表示已开始新教学。失败保留源日志可重试。
4. 读取目标科目日志。若已有不同未完成会话，停止询问接续/保存方式，不覆盖、不混并。目标日志缺失时按 to_session_id 建立新日志，初始化缺失目标档案但保留已有文件；将已授权目标、材料引用、mode、scope_id、teaching 写入新 context 成功后才能教学。失败保留 pending_transition，不生成题目或声称切换完成。
5. 目标 context 成功且身份与 transition 完全一致后，清源日志 recommendation，再移除 session.pending_transition；任一清理失败均只重试清理，不另建任务。源已清而指针未清时，以匹配的目标 context 证明已交接，不要求凭空重建候选。

## 恢复优先级

Read Snapshot 在目标初始化与普通日志恢复之前检查 pending_transition：

- 危机/明确结束仍优先；结束可完成已请求保存及交接清理，但不开始目标教学。仅保存请求不自动开课。
- 指针中的 student_id 必须等于当前学生，各 subject/session/scope id 语法合法；先定向读取源日志/marker验证原授权及旧主题关闭，再读取目标日志，不扫描其他科目。
- 新 context 已与 to_session_id/to_scope_id/候选目标匹配时只补清理；源候选已清除的重复恢复也以该匹配 context 为依据。
- 新 context 未完成时，源日志中的 selected_id、transition 与指针必须相符，且旧主题已提交或 source_closed 为 true，才按第 4 步继续。不猜旧选项，不改变已准备的目标身份。
- 源缺失、授权不符、目标已有不同未完成身份或人工修改冲突时停止澄清；保留指针与可恢复记录，不静默覆盖或从新科目默认历史另起目标。
- 只有完成授权新 context 才消费跨科选择；没有 pending_transition 的旧 session 按原协议恢复。
