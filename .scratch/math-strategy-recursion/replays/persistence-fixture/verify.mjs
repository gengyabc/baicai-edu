// Read-only fixture assertions. This is not a runtime or teaching implementation.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read = n => JSON.parse(readFileSync(new URL(`${n}.json`, import.meta.url)))
let checks=0
const check=(label,fn)=>{fn();checks++;console.log(`PASS ${label}`)}
check('R1/P3 three distinct task positions, stable owner and root scope',()=>{
 const l=read('02-three-level-wait'),p=l.context.learning_plan
 assert.equal(p.frames.length,3);assert.equal(p.active_frame_id,'grouping')
 assert.equal(p.frames.filter(f=>f.status==='active').length,1)
 assert.equal(p.frames[0].task.turn_state.student_response,'我数到第10颗是红，不知道100怎么数。')
 assert.equal(p.frames[1].task.turn_state.student_response,'我把11个放成3堆：4、4、3，所以没有剩下。')
 assert.equal(p.frames[0].task.turn_state.pending_question,'怎样知道第100颗落在每组哪个位置？')
 assert.equal(p.frames[1].task.turn_state.pending_question,'每一组都必须正好3个，分完后哪些算完整组？')
 assert.equal(l.context.scope_id,'scope_cycle_fixture');assert.equal(l.context.teaching.session_skill,'math-high-session')
})
check('R3 self-report does not return or add performance',()=>{const l=read('03-understood-no-return');assert.equal(l.context.learning_plan.active_frame_id,'grouping');assert.equal(l.segments.length,0)})
check('R4/P9 independent new-task action returns only one level with one segment',()=>{
 const l=read('04-one-level-return-authorized');assert.equal(l.context.learning_plan.active_frame_id,'remainder');assert.equal(l.context.learning_plan.frames[0].status,'parked');assert.equal(l.segments.length,1);assert.equal(l.segments[0].ability_evidence[0].frame_id,'grouping');assert.equal(l.context.turn_state.student_response,'我把11个放成3堆：4、4、3，所以没有剩下。')
})
check('P1/P8 owner authorization and snapshot have no fake support event',()=>{const l=read('05-prepared');assert.equal(l.context.learning_plan_authorization.provided_to_student,true);assert.equal(l.context.learning_plan_authorization.owner_session_skill,'math-high-session');assert.equal(l.support_events,undefined);assert.equal(l.finalize_plan.target_files.memory.learning_support_memory.plans.length,0)})
check('P2 synthetic failure trace stops before marker, retry writes marker last',()=>{assert.deepEqual(read('05-failure-trace'),['write profile OK','write memory OK','write milestones OK','INJECTED SYNTHETIC SIGNAL: 本次current_state写入失败 (write intentionally not attempted; not tool exception)']);assert.deepEqual(read('06-retry-trace'),['retry write profile OK','retry write memory OK','retry write milestones OK','retry write current_state OK']);assert.equal(read('05-prepared').segments.length,1)})
check('P4 finalize clears temporary contents, new session resumes parent without evidence replay',()=>{const clean=read('06-clean-after-retry'),r=read('07-restored-parent');assert.equal(clean.context,undefined);assert.equal(clean.finalize_plan,undefined);assert.equal(r.session_id,'sess_fixture_02');assert.equal(r.context.learning_plan.root_scope_id,'scope_cycle_fixture');assert.equal(r.context.scope_id,'scope_cycle_fixture');assert.equal(r.context.teaching.session_skill,'math-high-session');assert.equal(r.context.turn_state.pending_question,'每一组都必须正好3个，分完后哪些算完整组？');assert.equal(r.segments.length,0)})
check('P7 parked plan-only save preserves performance cursor and memory',()=>{const l=read('08-parked-prepared'),f=l.finalize_plan;assert.equal(l.segments.length,0);assert.equal(f.record_kind,'learning_plan');assert.equal(f.final_summary,null);assert.equal(f.target_files.current_state.learning_plan.status,'parked');assert.equal(f.target_files.current_state.active_focus,'完整组');assert.deepEqual(f.target_files.memory,read('05-prepared').finalize_plan.target_files.memory);assert.equal(f.target_files.profile.session_history.length,1)})
check('R7 terminal tombstone, no old frames/materials or long-term mastery inflation',()=>{const c=read('current_state');assert.equal(c.learning_plan.status,'abandoned');assert.equal(c.learning_plan.revision,7);assert.equal(c.learning_plan.frames,undefined);assert.equal(read('session_log').context,undefined);assert.equal(read('profile').session_history.length,1);assert.equal(read('profile').error_history.length,0);assert.deepEqual(read('profile').profile.current_levels,{});assert.deepEqual(read('memory').learning_memory.confirmed_skills,[]);assert.equal(read('milestones').milestones.length,0)})
check('P5 legacy restore remains one task without synthetic parents',()=>{assert.deepEqual(read('10-legacy-restored'),read('10-legacy-single-task'));assert.equal(read('10-legacy-restored').context.learning_plan,undefined)})
console.log(`${checks}/9 fixture assertion groups passed; no host end-to-end claim`)
