// Browser-only operation goals. Never inspect lengths, angles or mathematical relations.
export function createGeometryPractice(saved = { index: 0, targets: [] }) {
  const steps = ['point', 'segment', 'triangle', 'polygon', 'circle', 'select-one', 'deselect', 'insert', 'complete'];
  if (!Number.isInteger(saved.index) || saved.index < 0 || saved.index >= steps.length
    || !Array.isArray(saved.targets) || saved.targets.length !== Math.min(saved.index, 5)
    || new Set(saved.targets).size !== saved.targets.length
    || !saved.targets.every(id => typeof id === 'string' && id.length > 0)) throw Error('Invalid geometry practice goal');
  let index = saved.index;
  const targets = [...saved.targets];
  const exists = (board, id) => board?.points.some(p => p.id === id) || board?.elements.some(e => e.id === id);
  function snapshot() { return { index, step: steps[index], total: 8, targets: [...targets], completed: index === 8 }; }
  function observe(event) {
    const step = steps[index]; let passed = false;
    if (event.type === 'draw' && event.tool === step && event.before && event.after) {
      const retained = targets.every(id => exists(event.before, id) && exists(event.after, id));
      if (step === 'point') {
        const added = event.after.points.filter(p => !event.before.points.some(q => q.id === p.id));
        passed = added.length === 1 && added[0].kind === 'free';
        if (passed) targets.push(added[0].id);
      } else if (['segment','triangle','polygon','circle'].includes(step)) {
        const added = event.after.elements.filter(e => !event.before.elements.some(old => old.id === e.id));
        const e = added[0];
        passed = retained && added.length === 1 && (step === 'segment'
          ? e.type === 'segment' && e.points.includes(targets[0])
          : step === 'triangle' ? e.type === 'polygon' && e.points.length === 3
            : step === 'polygon' ? e.type === 'polygon' && event.closed === true
              : e.type === 'circle');
        if (passed) targets.push(e.id);
      }
    } else if (event.type === 'select') {
      if (step === 'select-one') passed = event.selection?.length === 1 && event.selection[0] === targets[0];
      if (step === 'deselect') passed = event.selection?.length === 0;
    } else if (step === 'insert' && event.type === 'insert') passed = targets.every(id => exists(event.after,id));
    if (passed) index++;
    return snapshot();
  }
  return { snapshot, observe };
}

// Shared by geometry chapters, not the real draft store. Reject the whole frame on damage.
export function createGeometryPracticeFrames(G) {
  const tools = ['select','point','segment','triangle','polygon','circle','parallelogram','rectangle','text'];
  function empty() { return {board:G.empty(),history:{past:[],future:[]},selection:[],tool:'select',pending:[],construction:[],
    auxiliary:false,grid:false,snap:true,zoom:1,fit:true,scroll:{left:0,top:0}}; }
  function validate(frame) {
    if (!frame || !Array.isArray(frame.history?.past) || !Array.isArray(frame.history?.future)
      || frame.history.past.length > 40 || frame.history.future.length > 40
      || !tools.includes(frame.tool) || !['auxiliary','grid','snap','fit'].every(k=>typeof frame[k] === 'boolean')
      || !Number.isFinite(frame.zoom) || frame.zoom < 1 || frame.zoom > 4
      || !Number.isFinite(frame.scroll?.left) || frame.scroll.left < 0
      || !Number.isFinite(frame.scroll?.top) || frame.scroll.top < 0) throw Error('Invalid geometry practice frame');
    const board = G.validate(frame.board);
    const ids = new Set([...board.points.map(p=>p.id),...board.elements.map(e=>e.id)]);
    const list = (values, check) => Array.isArray(values) && new Set(values).size === values.length && values.every(check);
    if (!list(frame.selection,id=>ids.has(id) || Boolean(G.parseEdgeKey(board,id)))
      || !Array.isArray(frame.pending) || frame.pending.length > 60
      || !frame.pending.every(id=>board.points.some(p=>p.id===id && p.kind==='free'))
      || !list(frame.construction,id=>board.points.some(p=>p.id===id && p.kind==='free'))) throw Error('Invalid geometry practice references');
    return {...frame,board,history:{past:frame.history.past.map(G.validate),future:frame.history.future.map(G.validate)}};
  }
  return {empty,validate};
}

// Extension seam: later chapters receive the same model and complete independent frame.
export function createGeometryBasicsChapter({G,emptyFrame,createGoal}) {
  const steps = ['point','segment','triangle','polygon','circle','select-one','deselect','insert'];
  return {id:'geometry-basics',titleKey:'geometryPracticeBasics',steps,start:()=>emptyFrame(),createGoal,
    skip(goal,frame) {
      // Supply only dependencies for the next task. Programmatic setup is never observed.
      if (goal.index === 0) {
        frame.board = G.reduce(frame.board,{type:'addPoint',x:100,y:100});
        goal.targets.push(frame.board.points.at(-1).id);
      } else if (goal.index < 5) {
        let board = frame.board;
        const add = (x,y) => {board=G.reduce(board,{type:'addPoint',x,y}); return board.points.at(-1).id;};
        const offset = goal.index * 110;
        const points = goal.index === 1 ? [goal.targets[0],add(230,100)]
          : goal.index === 4 ? [add(600,350),add(650,350)]
            : [add(offset,250),add(offset+70,250),add(offset+40,330)];
        board = G.reduce(board,goal.index===4 ? {type:'addElement',elementType:'circle',centerPointId:points[0],radiusPointId:points[1],role:'main'}
          : {type:'addElement',elementType:goal.index===1?'segment':'polygon',points,role:'main'});
        goal.targets.push(board.elements.at(-1).id); frame.board=board;
      }
      frame.pending=[];frame.construction=[];frame.selection=[];frame.tool='select';
      if (goal.index===5) frame.selection=[goal.targets[0]];
      return {goal:{...goal,index:goal.index+1},frame};
    }};
}
