/** Pure, dependency-free structured drawing model. Factory is embedded in the browser bundle. */
export function createBoardModel() {
  // Library order is stable: schemaVersion 2 boards used the first ten names.
  const shapes = ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond', 'heart', 'oval', 'cat', 'dog',
    'car', 'person', 'apple', 'fish', 'rocket', 'flower', 'butterfly', 'house', 'icecream'];
  const legacyShapes = shapes.slice(0, 10);
  // The default toolbox follows the original ten shapes: eight basic geometry
  // patterns plus cat and dog. Saved boards keep their own `settings.shapes`.
  const defaultVisible = [...legacyShapes];
  const palette = ['#4CAF50', '#42A5F5', '#AB47BC', '#26A69A', '#FF7043', '#F4511E', '#E53935', '#D81B60', '#8E24AA'];
  const oldValues = [1, 10, 100, 1000, 10000];
  const fail = (message) => { throw new Error(message); };
  const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
    && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
  const keys = (v, required, optional = []) => {
    if (!record(v) || required.some((k) => !Object.hasOwn(v, k))
      || Object.keys(v).some((k) => !required.includes(k) && !optional.includes(k))) fail('Invalid fields');
  };
  const text = (v, max) => typeof v === 'string' && [...v].length <= max;
  const idValid = (v) => text(v, 100) && v.trim().length > 0;
  const positive = (v) => Number.isSafeInteger(v) && v > 0;
  const validColor = (v) => Number.isInteger(v) && v >= 0 && v < palette.length;
  const customColorIndex = palette.length;
  const clamp = (v, min, max) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) fail('Invalid coordinate');
    return Math.max(min, Math.min(max, v));
  };
  const defaultSettings = () => ({
    levels: oldValues.map((value, color) => ({ value, color })),
    defaults: shapes.map((shape) => ({ shape, value: 1, alias: '' })),
    shapes: [...defaultVisible],
  });
  function validateSettings(settings) {
    keys(settings, ['levels', 'defaults'], ['shapes']);
    if (!Array.isArray(settings.levels) || settings.levels.length < 1 || settings.levels.length > 20
      || !Array.isArray(settings.defaults)) fail('Invalid settings');
    // A missing `shapes` list is the schemaVersion 2 settings shape: its ten pattern
    // defaults are accepted once and padded with the newer patterns.
    const legacy = !Object.hasOwn(settings, 'shapes');
    const expected = legacy ? legacyShapes : shapes;
    if (settings.defaults.length !== expected.length) fail('Invalid settings');
    const values = new Set();
    const levels = settings.levels.map((level) => {
      keys(level, ['value', 'color']);
      if (!positive(level.value) || !validColor(level.color) || values.has(level.value)) fail('Invalid level');
      values.add(level.value);
      return { value: level.value, color: level.color };
    });
    const entries = new Map();
    for (const entry of settings.defaults) {
      keys(entry, ['shape', 'value', 'alias']);
      if (!expected.includes(entry.shape) || entries.has(entry.shape) || !values.has(entry.value)
        || !text(entry.alias, 30)) fail('Invalid shape default');
      entries.set(entry.shape, { shape: entry.shape, value: entry.value, alias: entry.alias });
    }
    if (entries.size !== expected.length) fail('Invalid shape default');
    const fallback = values.has(1) ? 1 : levels[0].value;
    const defaults = shapes.map((shape) => entries.get(shape) || { shape, value: fallback, alias: '' });
    let visible;
    if (legacy) visible = [...legacyShapes];
    else {
      if (!Array.isArray(settings.shapes) || settings.shapes.length < 1 || settings.shapes.length > shapes.length
        || new Set(settings.shapes).size !== settings.shapes.length
        || settings.shapes.some((shape) => !shapes.includes(shape))) fail('Invalid visible shapes');
      visible = [...settings.shapes];
    }
    return { levels, defaults, shapes: visible };
  }
  const empty = () => ({ schemaVersion: 3, settings: defaultSettings(), objects: [], groups: [], note: '' });
  const cloneObject = (o) => ({ id: o.id, shape: o.shape, value: o.value, color: o.color, alias: o.alias,
    x: o.x, y: o.y, groupId: o.groupId, removed: o.removed, sources: o.sources.map(cloneObject) });
  const sameData = (a, b) => {
    if (a === b) return true;
    if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => sameData(v, b[i]));
    return record(a) && record(b) && Object.keys(a).length === Object.keys(b).length
      && Object.keys(a).every((k) => Object.hasOwn(b, k) && sameData(a[k], b[k]));
  };
  // Exact large aggregates are decimal strings; ordinary quantities remain numbers.
  const exact = (v) => v <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(v) : v.toString();
  // Per-group shape, value and merge counts. Unlike `summary`, this keeps each
  // group's makeup; coordinates and ids stay out. It is not written into the composer.
  const digest = (board) => {
    const canonical = validate(board);
    const groups = canonical.groups.map((g) => ({ id: g.id, alias: g.alias, items: [], count: 0, total: 0n }));
    const byGroup = new Map(groups.map((g) => [g.id, g]));
    const ungrouped = { items: [], count: 0, total: 0n };
    const removed = { items: [], count: 0, total: 0n };
    const addTo = (bucket, o) => {
      bucket.count++; bucket.total += BigInt(o.value);
      const merged = o.sources.length;
      let item = bucket.items.find((entry) => entry.shape === o.shape && entry.value === o.value
        && entry.alias === o.alias && entry.merged === merged);
      if (!item) { item = { shape: o.shape, value: o.value, alias: o.alias, merged, count: 0, total: 0n }; bucket.items.push(item); }
      item.count++; item.total += BigInt(o.value);
    };
    for (const o of canonical.objects) {
      if (o.removed) { addTo(removed, o); continue; }
      addTo(o.groupId === null ? ungrouped : byGroup.get(o.groupId), o);
    }
    const finish = (bucket) => ({
      ...bucket, total: exact(bucket.total),
      items: bucket.items.map((item) => ({ ...item, total: exact(item.total) })),
    });
    return {
      groups: groups.filter((g) => g.count > 0).map(finish),
      ungrouped: finish(ungrouped),
      removed: finish(removed),
    };
  };
  const summarize = (board) => {
    const result = { totalCount: board.objects.length, activeCount: 0, totalValue: 0n, removedCount: 0, removedValue: 0n,
      groups: board.groups.map(({ id, alias }) => ({ id, alias, count: 0, value: 0n })), ungrouped: { count: 0, value: 0n } };
    const groups = new Map(result.groups.map((g) => [g.id, g]));
    for (const o of board.objects) {
      if (o.removed) { result.removedCount++; result.removedValue += BigInt(o.value); continue; }
      result.activeCount++; result.totalValue += BigInt(o.value);
      const target = o.groupId === null ? result.ungrouped : groups.get(o.groupId);
      target.count++; target.value += BigInt(o.value);
    }
    result.totalValue = exact(result.totalValue); result.removedValue = exact(result.removedValue);
    for (const g of result.groups) g.value = exact(g.value);
    result.ungrouped.value = exact(result.ungrouped.value);
    return result;
  };
  function checkEnvelope(input, canonical) {
    if (Object.hasOwn(input, 'kind') || Object.hasOwn(input, 'summary')) {
      if (input.kind !== 'math-board' || !Object.hasOwn(input, 'summary') || !sameData(input.summary, summarize(canonical))) fail('Invalid export envelope');
    }
  }
  function migrateV1(input) {
    keys(input, ['schemaVersion', 'operation', 'objects', 'groups', 'note'], ['kind', 'summary']);
    if (!['add', 'subtract', 'multiply', 'divide'].includes(input.operation) || !text(input.note, 500)
      || !Array.isArray(input.groups) || input.groups.length > 12 || !Array.isArray(input.objects) || input.objects.length > 200) fail('Invalid legacy board');
    const canonical = empty(); canonical.note = input.note;
    canonical.settings.shapes = legacyShapes.slice(0, 3);
    canonical.groups = input.groups.map((g) => { keys(g, ['id', 'alias']); return { id: g.id, alias: g.alias }; });
    canonical.objects = input.objects.map((o) => {
      keys(o, ['id', 'shape', 'value', 'alias', 'x', 'y', 'groupId', 'removed']);
      if (!legacyShapes.slice(0, 3).includes(o.shape) || !oldValues.includes(o.value)) fail('Invalid legacy object');
      return { ...o, color: oldValues.indexOf(o.value), sources: [] };
    });
    const valid = validate(canonical);
    checkEnvelope(input, valid);
    return valid;
  }
  /** Return detached canonical v3 state; validated v1/v2 states/exports migrate transparently. */
  function validate(input) {
    if (record(input) && input.schemaVersion === 1) return migrateV1(input);
    if (record(input) && input.schemaVersion === 2) {
      keys(input, ['schemaVersion', 'settings', 'objects', 'groups', 'note'], ['kind', 'summary']);
      // v2 settings kept the ten original pattern defaults and no visible list.
      input = { ...input, schemaVersion: 3, settings: validateSettings(input.settings) };
    }
    keys(input, ['schemaVersion', 'settings', 'objects', 'groups', 'note'], ['kind', 'summary']);
    if (input.schemaVersion !== 3 || !text(input.note, 500) || !Array.isArray(input.objects) || input.objects.length > 200
      || !Array.isArray(input.groups) || input.groups.length > 12) fail('Invalid board');
    const settings = validateSettings(input.settings);
    const ids = new Set(); const groupIds = new Set();
    const groups = input.groups.map((g) => {
      keys(g, ['id', 'alias']);
      if (!idValid(g.id) || ids.has(g.id) || !text(g.alias, 30)) fail('Invalid group');
      ids.add(g.id); groupIds.add(g.id); return { id: g.id, alias: g.alias };
    });
    let nodes = 0;
    const ancestors = new Set();
    function object(o, depth, live) {
      if (depth > 8 || ++nodes > 2000 || ancestors.has(o)) fail('Provenance limit exceeded');
      keys(o, ['id', 'shape', 'value', 'color', 'alias', 'x', 'y', 'groupId', 'removed', 'sources']);
      if (!idValid(o.id) || (live && ids.has(o.id)) || !shapes.includes(o.shape) || !positive(o.value) || !(validColor(o.color) || o.color === customColorIndex)
        || !text(o.alias, 30) || typeof o.removed !== 'boolean' || typeof o.x !== 'number' || !Number.isFinite(o.x) || o.x < 30 || o.x > 770
        || typeof o.y !== 'number' || !Number.isFinite(o.y) || o.y < 30 || o.y > 330
        || (o.groupId !== null && (!idValid(o.groupId) || (live && !groupIds.has(o.groupId))))
        || !Array.isArray(o.sources) || o.sources.length > 200 || o.sources.length === 1) fail('Invalid object');
      if (live) ids.add(o.id);
      ancestors.add(o);
      const sources = o.sources.map((source) => object(source, depth + 1, false));
      ancestors.delete(o);
      if (sources.length) {
        const sum = sources.reduce((n, source) => n + BigInt(source.value), 0n);
        if (sum !== BigInt(o.value) || sources.some((s) => s.shape !== o.shape || s.value !== sources[0].value || s.removed)
          || new Set(sources.map((s) => s.id)).size !== sources.length) fail('Invalid merge provenance');
      }
      return { id: o.id, shape: o.shape, value: o.value, color: o.color, alias: o.alias, x: o.x, y: o.y,
        groupId: o.groupId, removed: o.removed, sources };
    }
    const board = { schemaVersion: 3, settings, objects: input.objects.map((o) => object(o, 0, true)), groups, note: input.note };
    checkEnvelope(input, board);
    return board;
  }
  const summary = (board) => summarize(validate(board));
  function nextId(board, prefix) {
    let max = 0;
    const inspect = (id) => {
      const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
      if (match) { const n = Number(match[1]); if (!Number.isSafeInteger(n)) fail('ID sequence exhausted'); max = Math.max(max, n); }
    };
    const visit = (o) => { inspect(o.id); if (o.groupId !== null) inspect(o.groupId); o.sources.forEach(visit); };
    board.groups.forEach((g) => inspect(g.id)); board.objects.forEach(visit);
    if (!Number.isSafeInteger(max + 1)) fail('ID sequence exhausted');
    return `${prefix}-${max + 1}`;
  }
  const grid = Array.from({ length: 207 }, (_, i) => i).sort((a, b) => {
    const sparse = (i) => i % 23 % 2 === 0 && Math.floor(i / 23) % 2 === 0;
    return Number(sparse(b)) - Number(sparse(a));
  }).map((i) => ({ x: 30 + (i % 23) * (740 / 22), y: 30 + Math.floor(i / 23) * 37.5 }));
  function freePosition(objects) {
    const slot = grid.find((p) => objects.every((o) => Math.hypot(o.x - p.x, o.y - p.y) >= 30));
    if (!slot) fail('No free grid position; arrange all objects first');
    return slot;
  }
  function membersOf(board, ids, allowEmpty = false) {
    if (!Array.isArray(ids) || (!allowEmpty && !ids.length) || ids.length > 200 || new Set(ids).size !== ids.length
      || ids.some((id) => typeof id !== 'string')) fail('Select distinct objects');
    return ids.map((id) => board.objects.find((o) => o.id === id) || fail('Unknown object'));
  }
  function candidate(board, ids) {
    let members;
    try { members = membersOf(board, ids); } catch (e) { return { allowed: false, reason: e.message }; }
    if (members.length < 2) return { allowed: false, reason: 'Select at least two objects' };
    const first = members[0];
    if (members.some((o) => o.removed)) return { allowed: false, reason: 'Restore crossed-out objects before merging' };
    if (members.some((o) => o.shape !== first.shape || o.value !== first.value || o.alias !== first.alias || o.groupId !== first.groupId)) {
      return { allowed: false, reason: 'Merge requires the same shape, value, name and group' };
    }
    const total = BigInt(first.value) * BigInt(members.length);
    if (total > BigInt(Number.MAX_SAFE_INTEGER)) return { allowed: false, reason: 'Merged value exceeds safe integer range' };
    const value = Number(total); const level = board.settings.levels.find((l) => l.value === value);

    const depth = (o) => o.sources.length ? 1 + Math.max(...o.sources.map(depth)) : 0;
    if (members.some((o) => depth(o) >= 8)) return { allowed: false, reason: 'Provenance depth limit exceeded' };
    // Merging adds one tree node while preserving all selected history.
    const count = (o) => 1 + o.sources.reduce((n, s) => n + count(s), 0);
    if (board.objects.reduce((n, o) => n + count(o), 0) >= 2000) return { allowed: false, reason: 'Provenance node limit exceeded' };
    return { allowed: true, reason: '', value, color: level ? level.color : customColorIndex };
  }
  const mergeCandidate = (board, ids) => candidate(validate(board), ids);
  function reduce(board, action) {
    const next = validate(board);
    if (!record(action) || typeof action.type !== 'string') fail('Invalid action');
    if (action.type === 'batch') {
      const pending = [action]; const steps = []; let count = -1;
      while (pending.length) {
        const step = pending.pop();
        if (++count > 250 || !record(step) || typeof step.type !== 'string') fail('Invalid batch or action limit exceeded');
        if (step.type === 'batch') {
          if (!Array.isArray(step.actions) || step.actions.length > 250) fail('Invalid batch');
          for (let i = step.actions.length - 1; i >= 0; i--) pending.push(step.actions[i]);
        } else steps.push(step);
      }
      return steps.reduce((state, step) => reduce(state, step), next);
    }
    const objectById = (id) => next.objects.find((o) => o.id === id) || fail('Unknown object');
    const groupById = (id) => next.groups.find((g) => g.id === id) || fail('Unknown group');
    const aliasValid = (alias) => { if (!text(alias, 30)) fail('Alias exceeds 30 characters'); };
    switch (action.type) {
      case 'add': {
        const { shape, count = 1 } = action;
        const defaults = next.settings.defaults.find((d) => d.shape === shape);
        const value = Object.hasOwn(action, 'value') ? action.value : defaults?.value;
        const level = next.settings.levels.find((l) => l.value === value);
        if (!defaults || !level || !Number.isInteger(count) || count < 1 || count > 100 || next.objects.length + count > 200) fail('Invalid add or object limit exceeded');
        const dropped = Object.hasOwn(action, 'x') || Object.hasOwn(action, 'y');
        const point = dropped ? { x: clamp(action.x, 30, 770), y: clamp(action.y, 30, 330) } : null;
        for (let i = 0; i < count; i++) next.objects.push({ id: nextId(next, 'object'), shape, value, color: level.color,
          alias: defaults.alias, ...(i === 0 && point ? point : freePosition(next.objects)), groupId: null, removed: false, sources: [] });
        break;
      }
      case 'update': {
        const o = objectById(action.id); keys(action.patch, [], ['alias', 'x', 'y', 'removed']);
        const patch = { ...action.patch };
        if (Object.hasOwn(patch, 'alias')) { if (o.groupId !== null) fail('Rename the group, not its members'); aliasValid(patch.alias); }
        if (Object.hasOwn(patch, 'x')) patch.x = clamp(patch.x, 30, 770);
        if (Object.hasOwn(patch, 'y')) patch.y = clamp(patch.y, 30, 330);
        if (Object.hasOwn(patch, 'removed') && typeof patch.removed !== 'boolean') fail('Invalid removed flag');
        Object.assign(o, patch); break;
      }
      case 'moveMany': {
        const members = membersOf(next, action.ids);
        if (typeof action.dx !== 'number' || !Number.isFinite(action.dx) || typeof action.dy !== 'number' || !Number.isFinite(action.dy)) fail('Invalid movement delta');
        const dx = clamp(action.dx, 30 - Math.min(...members.map((o) => o.x)), 770 - Math.max(...members.map((o) => o.x)));
        const dy = clamp(action.dy, 30 - Math.min(...members.map((o) => o.y)), 330 - Math.max(...members.map((o) => o.y)));
        for (const o of members) { o.x += dx; o.y += dy; } break;
      }
      case 'arrange': {
        const members = Object.hasOwn(action, 'ids') ? membersOf(next, action.ids, true) : next.objects;
        const ids = new Set(members.map((o) => o.id)); const occupied = next.objects.filter((o) => !ids.has(o.id));
        const rank = new Map(next.groups.map((g, i) => [g.id, i]));
        const ordered = next.objects.filter((o) => ids.has(o.id)).sort((a, b) =>
          (rank.get(a.groupId) ?? next.groups.length) - (rank.get(b.groupId) ?? next.groups.length));
        for (const o of ordered) { Object.assign(o, freePosition(occupied)); occupied.push(o); } break;
      }
      case 'groupSelected': {
        const members = membersOf(next, action.ids); const alias = action.alias ?? ''; aliasValid(alias);
        const id = nextId(next, 'group'); const touched = new Set(members.map((o) => o.groupId).filter((v) => v !== null));
        next.groups = next.groups.filter((g) => !touched.has(g.id));
        if (next.groups.length >= 12) fail('Group limit exceeded');
        for (const o of next.objects) if (touched.has(o.groupId)) o.groupId = null;
        next.groups.push({ id, alias }); for (const o of members) o.groupId = id; break;
      }
      case 'renameGroup': aliasValid(action.alias); groupById(action.id).alias = action.alias; break;
      case 'deleteGroup': {
        groupById(action.id); next.groups = next.groups.filter((g) => g.id !== action.id);
        for (const o of next.objects) if (o.groupId === action.id) o.groupId = null; break;
      }
      case 'delete': {
        objectById(action.id); next.objects = next.objects.filter((o) => o.id !== action.id);
        const occupied = new Set(next.objects.map((o) => o.groupId).filter((id) => id !== null));
        next.groups = next.groups.filter((g) => occupied.has(g.id)); break;
      }
      case 'duplicateSelected': {
        const members = membersOf(next, action.ids);
        if (next.objects.length + members.length > 200) fail('Object limit exceeded');
        const ids = new Set(action.ids); const groupMap = new Map();
        for (const g of next.groups.slice()) {
          const original = next.objects.filter((o) => o.groupId === g.id);
          if (original.length && original.every((o) => ids.has(o.id))) {
            if (next.groups.length >= 12) fail('Group limit exceeded');
            const cloned = { id: nextId(next, 'group'), alias: g.alias }; next.groups.push(cloned); groupMap.set(g.id, cloned.id);
          }
        }
        for (const member of members) next.objects.push({ ...cloneObject(member), id: nextId(next, 'object'),
          groupId: groupMap.get(member.groupId) ?? null, ...freePosition(next.objects) });
        break;
      }
      case 'merge': {
        const info = candidate(next, action.ids); if (!info.allowed) fail(info.reason);
        const members = membersOf(next, action.ids); const first = members[0]; const ids = new Set(action.ids);
        const merged = { ...cloneObject(first), id: nextId(next, 'object'), value: info.value, color: info.color, sources: members.map(cloneObject) };
        const index = next.objects.findIndex((o) => o.id === first.id);
        const before = next.objects.slice(0, index).filter((o) => !ids.has(o.id));
        const after = next.objects.slice(index).filter((o) => !ids.has(o.id));
        next.objects = [...before, merged, ...after]; break;
      }
      case 'split': {
        const parent = objectById(action.id);
        if (parent.value <= 1 || parent.removed) fail('Select an active object greater than one');
        const lower = Math.max(1, ...next.settings.levels.filter((l) => l.value < parent.value).map((l) => l.value));
        const count = Math.floor(parent.value / lower);
        const remainder = parent.value % lower;
        if (next.objects.length - 1 + count + Number(remainder > 0) > 200) fail('Object limit exceeded');
        const values = [...Array(count).fill(lower), ...(remainder ? [remainder] : [])];
        const allocator = { ...next, objects: next.objects.slice() };
        next.objects = next.objects.filter((o) => o.id !== parent.id);
        const reusable = parent.sources.length === values.length && parent.sources.every((s, i) => s.value === values[i]);
        const used = new Set([...next.objects, ...next.groups].map((o) => o.id));
        for (const [i, value] of values.entries()) {
          const level = next.settings.levels.find((l) => l.value === value);
          const restored = { ...cloneObject(parent), id: nextId(allocator, 'object'), value,
            color: level ? level.color : customColorIndex, sources: [], ...freePosition(next.objects) };
          if (reusable) {
            const source = cloneObject(parent.sources[i]);
            if (used.has(source.id)) source.id = restored.id;
            Object.assign(restored, source, { groupId: parent.groupId, x: restored.x, y: restored.y });
          }
          used.add(restored.id);
          next.objects.push(restored); allocator.objects.push(restored);
        }
        break;
      }
      case 'configure': {
        const settings = validateSettings(action.settings);
        if (!['future', 'existing'].includes(action.scope)) fail('Choose future or existing settings scope');
        next.settings = settings;
        // A colour means "this level" for an unmerged shape. A merged shape keeps the
        // value and colour recorded at merge time, including when that value is still a level.
        const levelOf = (value) => settings.levels.find((l) => l.value === value);
        for (const o of next.objects) if (!o.sources.length) {
          const level = levelOf(o.value);
          if (level) o.color = level.color;
        }
        if (action.scope === 'existing') for (const o of next.objects) if (!o.sources.length) {
          const defaults = settings.defaults.find((d) => d.shape === o.shape);
          o.value = defaults.value; o.color = levelOf(defaults.value).color;
        }
        break;
      }
      case 'note': if (!text(action.value, 500)) fail('Note exceeds 500 characters'); next.note = action.value; break;
      default: fail('Unknown action');
    }
    return validate(next);
  }
  const serialize = (board) => { const canonical = validate(board); return JSON.stringify({ kind: 'math-board', ...canonical, summary: summarize(canonical) }); };
  const color = (index) => { if (index === customColorIndex) return '#78909C'; if (!validColor(index)) fail('Invalid color index'); return palette[index]; };
  return { empty, defaultSettings, validateSettings, validate, reduce, summary, digest, serialize, color, mergeCandidate,
    shapes: [...shapes], defaultVisibleShapes: [...defaultVisible] };
}
