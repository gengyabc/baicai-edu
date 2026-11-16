// Operation goals only, never mathematical correctness. Embedded by build.mjs.
// Feed committed user operations, not host updates, restoration or previews.
export function createQuantityPractice() {
  const steps = ['add', 'move', 'add-second', 'select-one', 'select-many', 'deselect', 'insert', 'complete'];
  let index = 0;
  const targets = [];
  function snapshot() { return { step: steps[index], index, total: steps.length - 1, targets: [...targets], completed: steps[index] === 'complete' }; }
  function observe(event) {
    const step = steps[index];
    let passed = false;
    if ((step === 'add' || step === 'add-second') && event.type === 'add' && event.before && event.after) {
      const ids = new Set(event.before.objects.map((o) => o.id));
      const added = event.after.objects.filter((o) => !ids.has(o.id));
      passed = added.length === 1 && !targets.includes(added[0].id)
        && targets.every((id) => event.before.objects.some((o) => o.id === id)
          && event.after.objects.some((o) => o.id === id));
      if (passed) targets.push(added[0].id);
    } else if (step === 'move' && event.type === 'move' && event.submitted) {
      const before = event.before?.objects.find((o) => o.id === targets[0]);
      const after = event.after?.objects.find((o) => o.id === targets[0]);
      passed = Boolean(before && after && (before.x !== after.x || before.y !== after.y));
    } else if (event.type === 'select') {
      const ids = event.selection || [];
      if (step === 'select-one') passed = ids.length === 1 && ids[0] === targets[0];
      if (step === 'select-many') passed = ids.length === 2 && targets.every((id) => ids.includes(id));
      if (step === 'deselect') passed = ids.length === 0;
    } else if (step === 'insert' && event.type === 'insert') {
      passed = targets.every((id) => event.after?.objects.some((o) => o.id === id));
    }
    if (passed) index++;
    return snapshot();
  }
  return { snapshot, observe };
}
