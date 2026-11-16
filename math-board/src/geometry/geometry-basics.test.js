import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames } from './geometry-basics.js';
import { createGeometryModel } from './model.js';
import { createPracticeProgress } from '../shell/practice-progress.js';
const G = createGeometryModel();
test('geometry basics accepts committed editor deltas, not tools, previews, failures or restored objects', () => {
  const goal = createGeometryPractice();
  const empty = G.empty();
  const point = G.reduce(empty, {type:'addPoint', x:100,y:100});
  goal.observe({type:'tool',tool:'point',before:empty,after:point});
  goal.observe({type:'draw',tool:'segment',before:empty,after:point});
  assert.equal(goal.snapshot().step, 'point');
  goal.observe({type:'draw',tool:'point',before:empty,after:point});
  assert.equal(goal.snapshot().step, 'segment');
  goal.observe({type:'draw',tool:'segment',before:point,after:point});
  assert.equal(goal.snapshot().step, 'segment');
  let board = G.reduce(point,{type:'addPoint',x:240,y:100});
  const segment = G.reduce(board,{type:'addElement',elementType:'segment',points:board.points.map(p=>p.id),role:'main'});
  goal.observe({type:'draw',tool:'segment',before:board,after:segment});
  assert.equal(goal.snapshot().step,'triangle');
  goal.observe({type:'draw',tool:'triangle',before:board,after:segment});
  assert.equal(goal.snapshot().step,'triangle');
  board = G.reduce(segment,{type:'addPoint',x:180,y:240});
  const triangle = G.reduce(board,{type:'addElement',elementType:'polygon',points:board.points.map(p=>p.id),role:'main'});
  goal.observe({type:'draw',tool:'triangle',before:board,after:triangle});
  assert.equal(goal.snapshot().step,'polygon');
  goal.observe({type:'draw',tool:'polygon',before:triangle,after:triangle});
  assert.equal(goal.snapshot().step,'polygon');
});
test('geometry chapter skips dependencies without credit and restores exact goal/frame pairs for supplement', () => {
  const frames = createGeometryPracticeFrames(G);
  const chapter = createGeometryBasicsChapter({G,emptyFrame:frames.empty,createGoal:createGeometryPractice});
  const storage = new Map(); const adapter = {getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
  let progress = createPracticeProgress({mode:'geometry',chapters:[chapter],storage:adapter,validateFrame:frames.validate});
  progress.enter();
  const skipped = progress.skip();
  assert.equal(skipped.goal.step,'segment');
  assert.equal(skipped.frame.board.points.length,1);
  assert.equal(skipped.chapters[0].states[0],'skipped');
  progress.retryStep(0);
  progress = createPracticeProgress({mode:'geometry',chapters:[chapter],storage:adapter,validateFrame:frames.validate});
  const resumed = progress.enter();
  assert.equal(resumed.goal.step,'point');
  const after = G.reduce(resumed.frame.board,{type:'addPoint',x:100,y:100});
  const returned = progress.observe({type:'draw',tool:'point',before:resumed.frame.board,after},{...resumed.frame,board:after});
  assert.deepEqual(returned.frame,skipped.frame);
  assert.equal(returned.goal.step,'segment');
  assert.equal(returned.supplementing,false);
});
test('geometry basics cannot pass on tool clicks, a lone point, an open outline, a single centre or the wrong shape type', () => {
  const goal = createGeometryPractice();
  const empty = G.empty();
  const one = G.reduce(empty, {type:'addPoint', x:100, y:100});
  const two = G.reduce(one, {type:'addPoint', x:240, y:100});
  const three = G.reduce(two, {type:'addPoint', x:180, y:240});
  const segment = G.reduce(two, {type:'addElement', elementType:'segment', points:['p-1','p-2'], role:'main'});
  // G01: no tool choice, whatever its name, is a placed point.
  for (const tool of ['select','point','segment','triangle','polygon','circle']) {
    goal.observe({type:'draw', tool, before:empty, after:empty});
  }
  goal.observe({type:'draw', tool:'point', before:empty, after:one});
  assert.equal(goal.snapshot().step, 'segment');
  assert.deepEqual(goal.snapshot().targets, ['p-1']);
  // An operation belonging to a later step does not advance this one.
  goal.observe({type:'draw', tool:'circle', before:empty, after:G.reduce(empty, {type:'addPoint', x:600, y:350})});
  assert.equal(goal.snapshot().step, 'segment');
  // G02: the first click only adds one endpoint: no segment, no advance, no rewritten target.
  goal.observe({type:'draw', tool:'segment', before:one, after:two});
  assert.equal(goal.snapshot().step, 'segment');
  assert.deepEqual(goal.snapshot().targets, ['p-1']);
  // A line that does not reach the student's own first point is not the requested line.
  const four = G.reduce(three, {type:'addPoint', x:520, y:100});
  const stray = G.reduce(four, {type:'addElement', elementType:'segment', points:['p-3','p-4'], role:'main'});
  goal.observe({type:'draw', tool:'segment', before:four, after:stray});
  assert.equal(goal.snapshot().step, 'segment');
  goal.observe({type:'draw', tool:'segment', before:two, after:segment});
  assert.equal(goal.snapshot().step, 'triangle');
  assert.deepEqual(goal.snapshot().targets, ['p-1','e-1']);
  // G03: a triangle must be a three-point polygon, not a circle or a segment of any shape.
  goal.observe({type:'draw', tool:'triangle', before:segment,
    after:G.reduce(segment, {type:'addElement', elementType:'circle', centerPointId:'p-1', radiusPointId:'p-2', role:'main'})});
  assert.equal(goal.snapshot().step, 'triangle');
  const threeWithSegment = G.reduce(three, {type:'addElement', elementType:'segment', points:['p-1','p-2'], role:'main'});
  const triangle = G.reduce(threeWithSegment, {type:'addElement', elementType:'polygon', points:['p-1','p-2','p-3'], role:'main'});
  goal.observe({type:'draw', tool:'triangle', before:threeWithSegment, after:triangle});
  assert.equal(goal.snapshot().step, 'polygon');
  // G04: an unfinished run leaves points and an open preview, never the closed object.
  const runOne = G.reduce(triangle, {type:'addPoint', x:350, y:100});
  goal.observe({type:'draw', tool:'polygon', before:triangle, after:runOne});
  assert.equal(goal.snapshot().step, 'polygon');
  const runTwo = G.reduce(runOne, {type:'addPoint', x:480, y:100});
  goal.observe({type:'draw', tool:'polygon', before:runOne, after:runTwo});
  assert.equal(goal.snapshot().step, 'polygon');
  // A polygon committed without the closure signal is not the closed ring the step asks for.
  const runThree = G.reduce(runTwo, {type:'addPoint', x:420, y:220});
  const unclosed = G.reduce(runThree, {type:'addElement', elementType:'polygon', points:['p-4','p-5','p-6'], role:'main'});
  goal.observe({type:'draw', tool:'polygon', before:runThree, after:unclosed});
  assert.equal(goal.snapshot().step, 'polygon');
  const closed = G.reduce(unclosed, {type:'addElement', elementType:'polygon', points:['p-4','p-5','p-6'], role:'main'});
  goal.observe({type:'draw', tool:'polygon', before:unclosed, after:closed, closed:true});
  assert.equal(goal.snapshot().step, 'circle');
  // G05: one centre is a free point; a circle needs both its centre and its rim point.
  const centre = G.reduce(closed, {type:'addPoint', x:620, y:350});
  goal.observe({type:'draw', tool:'circle', before:closed, after:centre});
  assert.equal(goal.snapshot().step, 'circle');
  goal.observe({type:'draw', tool:'circle', before:closed,
    after:G.reduce(closed, {type:'addElement', elementType:'segment', points:['p-1','p-2'], role:'main'})});
  assert.equal(goal.snapshot().step, 'circle');
  const rim = G.reduce(centre, {type:'addPoint', x:690, y:350});
  const rimOnly = G.reduce(rim, {type:'addPoint', x:700, y:360});
  goal.observe({type:'draw', tool:'circle', before:rim, after:rimOnly});
  assert.equal(goal.snapshot().step, 'circle');
  const circle = G.reduce(rim, {type:'addElement', elementType:'circle', centerPointId:'p-7', radiusPointId:'p-8', role:'main'});
  goal.observe({type:'draw', tool:'circle', before:rim, after:circle});
  assert.equal(goal.snapshot().step, 'select-one');
  assert.equal(goal.snapshot().total, 8);
});
test('geometry basics keeps every earlier target through the whole run and ends only on completion', () => {
  const goal = createGeometryPractice();
  const snap = () => goal.snapshot();
  assert.deepEqual(snap().targets, []);
  assert.equal(snap().completed, false);
  assert.equal(snap().step, 'point');
  assert.equal(snap().total, 8);
  let board = G.reduce(G.empty(), {type:'addPoint', x:100, y:100});
  assert.equal(snap().step, 'point');
  goal.observe({type:'draw', tool:'point', before:G.empty(), after:board});
  assert.deepEqual(snap().targets, ['p-1']);
  assert.equal(snap().step, 'segment');
  const beforeSegment = board;
  board = G.reduce(board, {type:'addPoint', x:240, y:100});
  board = G.reduce(board, {type:'addElement', elementType:'segment', points:['p-1','p-2'], role:'main'});
  goal.observe({type:'draw', tool:'segment', before:beforeSegment, after:board});
  assert.deepEqual(snap().targets, ['p-1','e-1']);
  assert.equal(snap().step, 'triangle');
  // A step whose earlier point was deleted cannot pass; the run is not silently repaired.
  const trimmed = G.reduce(board, {type:'delete', ids:['p-1']});
  const extra = G.reduce(trimmed, {type:'addPoint', x:180, y:240});
  // Labels are never recycled, so after the deletion the clicks add p-3 and p-4.
  assert.deepEqual(extra.points.map((p) => p.id), ['p-2','p-3'], 'the first click adds the next free id');
  const extraThree = G.reduce(extra, {type:'addPoint', x:520, y:100});
  const extraBoard = G.reduce(extraThree, {type:'addElement', elementType:'polygon', points:['p-2','p-3','p-4'], role:'main'});
  goal.observe({type:'draw', tool:'triangle', before:trimmed, after:extraBoard});
  assert.equal(snap().step, 'triangle');
  assert.equal(snap().completed, false);
  assert.ok(snap().targets.includes('p-1'), 'the deleted earlier point stays named as a dependency');
});
test('geometry chapter can be skipped end to end and still reload from saved progress', () => {
  const frames = createGeometryPracticeFrames(G);
  const chapter = createGeometryBasicsChapter({G,emptyFrame:frames.empty,createGoal:createGeometryPractice});
  let goal = chapter.createGoal(), frame = chapter.start(), next;
  for (let index = 0; index < 8; index++) {
    next = chapter.skip(goal.snapshot(), frame);
    goal = chapter.createGoal(next.goal);
    frame = next.frame;
  }
  const saved = goal.snapshot();
  assert.equal(saved.completed, true);
  assert.equal(saved.total, 8);
  // A skipped run supplies one dependency per step and never duplicates a target.
  assert.equal(new Set(saved.targets).size, saved.targets.length);
  assert.equal(frames.validate(frame).board.points.length > 0, true);
  // The saved goal is read back by the same validator the resume path uses.
  assert.equal(createGeometryPractice(JSON.parse(JSON.stringify(saved))).snapshot().index, 8);
});
