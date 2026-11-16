/** Pure process evidence, separate from board state. The factory can be embedded with toString(). */
export function createBoardTrace(M) {
  const KIND = 'math-board-trace';
  const MAX_BYTES = 65536;
  const FACT_BYTES = 850;
  const types = ['add', 'batch', 'group', 'merge', 'split', 'delete', 'note', 'configure', 'move',
    'undo', 'redo', 'clear', 'import', 'update', 'duplicate'];
  const fields = ['count', 'activeCount', 'removedCount', 'value', 'removedValue', 'groupCount',
    'groupedCount', 'mergedCount', 'objects', 'aliases', 'colors', 'groups', 'note', 'notes',
    'settings.levels', 'settings.defaults', 'settings.shapes', 'movedCount', 'changedCount', 'detailsOmitted'];
  const fail = () => { throw new Error('Invalid math-board trace'); };
  const plain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
    && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
  const keys = (v, names) => {
    if (!plain(v) || Object.keys(v).length !== names.length || names.some((k) => !Object.hasOwn(v, k))) fail();
  };
  const integer = (v) => Number.isSafeInteger(v) && v >= 0;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const bytes = (text) => {
    let size = 0;
    for (const c of text) { const n = c.codePointAt(0); size += n < 128 ? 1 : n < 2048 ? 2 : n < 65536 ? 3 : 4; }
    return size;
  };
  const short = (s, limit = 60) => {
    const chars = [...s];
    return chars.length > limit ? chars.slice(0, limit - 1).join('') + '…' : s;
  };
  const list = (items) => {
    const result = items.slice(0, 5).map((v) => short(v));
    if (items.length > 5) result.push(`… +${items.length - 5}`);
    return result;
  };
  const empty = (priorUnknown = false) => {
    if (typeof priorUnknown !== 'boolean') fail();
    return { kind: KIND, schemaVersion: 1, priorUnknown, totalChanges: 0, omittedChanges: 0, entries: [] };
  };
  const validValue = (field, v) => {
    if (field === 'note') return typeof v === 'string' && [...v].length <= 60;
    if (['objects', 'aliases', 'colors', 'groups', 'notes', 'settings.levels', 'settings.defaults', 'settings.shapes'].includes(field)) {
      return Array.isArray(v) && v.length <= 6 && v.every((s) => typeof s === 'string' && [...s].length <= 60);
    }
    if (['value', 'removedValue'].includes(field) && typeof v === 'string') return /^[1-9][0-9]{15,20}$/.test(v)
      && BigInt(v) > BigInt(Number.MAX_SAFE_INTEGER);
    return integer(v);
  };
  /** Strict validation returns a detached canonical value; malformed persisted data throws. */
  function validate(trace) {
    keys(trace, ['kind', 'schemaVersion', 'priorUnknown', 'totalChanges', 'omittedChanges', 'entries']);
    if (trace.kind !== KIND || trace.schemaVersion !== 1 || typeof trace.priorUnknown !== 'boolean'
      || !integer(trace.totalChanges) || !integer(trace.omittedChanges) || !Array.isArray(trace.entries)
      || trace.entries.length > 60) fail();
    let retained = 0; let previousEnd = 0;
    for (let index = 0; index < trace.entries.length; index++) {
      const entry = trace.entries[index];
      keys(entry, ['seq', 'type', 'origin', 'repeats', 'facts']);
      if (!integer(entry.seq) || entry.seq < 1 || !integer(entry.repeats) || entry.repeats < 1
        || !integer(entry.seq + entry.repeats - 1) || !types.includes(entry.type)
        || !['student', 'system'].includes(entry.origin) || !Array.isArray(entry.facts)
        || entry.facts.length < 1 || entry.facts.length > 20 || bytes(JSON.stringify(entry.facts)) > FACT_BYTES) fail();
      const gap = entry.seq - previousEnd - 1;
      // The sole possible gap is between the retained first twenty and final thirty entries.
      if ((index === 20 && trace.omittedChanges > 0) ? gap !== trace.omittedChanges : gap !== 0) fail();
      const seen = new Set();
      for (const fact of entry.facts) {
        keys(fact, ['field', 'before', 'after']);
        if (!fields.includes(fact.field) || seen.has(fact.field) || !validValue(fact.field, fact.before)
          || !validValue(fact.field, fact.after) || same(fact.before, fact.after)) fail();
        seen.add(fact.field);
      }
      const previous = trace.entries[index - 1];
      if (gap === 0 && previous && previous.type === entry.type && previous.origin === entry.origin
        && same(previous.facts, entry.facts)) fail();
      retained += entry.repeats;
      previousEnd = entry.seq + entry.repeats - 1;
    }
    if (!integer(retained) || retained + trace.omittedChanges !== trace.totalChanges
      || previousEnd !== trace.totalChanges
      || (trace.omittedChanges > 0 && trace.entries.length !== 50)
      || bytes(JSON.stringify(trace)) > MAX_BYTES) fail();
    return JSON.parse(JSON.stringify(trace));
  }
  const normalizeType = (action) => {
    if (!plain(action) || typeof action.type !== 'string') fail();
    const aliases = { groupSelected: 'group', renameGroup: 'group', deleteGroup: 'group',
      moveMany: 'move', arrange: 'move', duplicateSelected: 'duplicate', systemConfigure: 'configure',
      annotate: 'note' };
    const type = aliases[action.type] || action.type;
    if (!types.includes(type)) fail();
    return type;
  };
  const countKinds = (board) => {
    const counts = new Map();
    for (const o of board.objects) {
      const key = `${o.shape}:${o.value}${o.removed ? ':crossed-out' : ''}${o.sources.length ? ':merged' : ''}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return list([...counts].sort(([a], [b]) => a.localeCompare(b)).map(([k, n]) => `${k} ×${n}`));
  };
  const aliasCounts = (board) => {
    const counts = new Map();
    for (const o of board.objects) if (o.alias) counts.set(o.alias, (counts.get(o.alias) || 0) + 1);
    return list([...counts].sort(([a], [b]) => a.localeCompare(b)).map(([k, n]) => `${k} ×${n}`));
  };
  const groupFacts = (board) => list(board.groups.map((g) => {
    const members = board.objects.filter((o) => o.groupId === g.id);
    const value = members.reduce((sum, o) => sum + BigInt(o.value), 0n);
    // Membership composition distinguishes group rewrites that share the same
    // count and total; without it two different regroupings collapse as equal.
    const kinds = new Map();
    for (const o of members) {
      const key = `${o.shape}:${o.value}${o.removed ? ':crossed-out' : ''}`;
      kinds.set(key, (kinds.get(key) || 0) + 1);
    }
    const makeup = [...kinds].sort(([a], [b]) => a.localeCompare(b)).slice(0, 4)
      .map(([key, count]) => `${key}×${count}`).join('+')
      + (kinds.size > 4 ? `+…${kinds.size - 4}` : '');
    return `${g.alias || '(unnamed)'}: ${makeup || 'empty'} / ${value}`;
  }).sort());
  const colorFacts = (board) => {
    const counts = new Map();
    for (const o of board.objects) counts.set(o.color, (counts.get(o.color) || 0) + 1);
    return list([...counts].sort(([a], [b]) => a - b).map(([color, n]) => `${color} ×${n}`));
  };
  const metrics = (board) => {
    const summary = M.summary(board);
    return {
      count: summary.totalCount,
      activeCount: summary.activeCount,
      removedCount: summary.removedCount,
      value: summary.totalValue,
      removedValue: summary.removedValue,
      groupCount: board.groups.length,
      groupedCount: board.objects.filter((o) => o.groupId !== null).length,
      mergedCount: board.objects.filter((o) => o.sources.length > 0).length,
    };
  };
  /** Record one successful user-visible transition; neither inputs nor board history are modified. */
  function record(trace, before, after, action, origin = 'student') {
    const next = validate(trace);
    const type = normalizeType(action);
    if (!['student', 'system'].includes(origin)) fail();
    const a = M.validate(before); const b = M.validate(after);
    if (same(a, b)) {
      if (type === 'import') next.priorUnknown = true;
      return next;
    }
    const facts = [];
    const add = (field, oldValue, newValue) => {
      if (same(oldValue, newValue)) return;
      const fact = { field, before: oldValue, after: newValue };
      // Keep any single list fact small enough to survive the overall facts budget,
      // including settings aliases containing four-byte Unicode characters.
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        let limit = 5;
        const compact = (values) => values.length <= limit ? values
          : [...values.slice(0, limit), `… +${values.length - limit} details`];
        while (bytes(JSON.stringify(fact)) > 600 && limit > 1) {
          limit--;
          fact.before = compact(oldValue); fact.after = compact(newValue);
        }
        if (bytes(JSON.stringify(fact)) > 600) {
          fact.before = fact.before.map((v) => short(v, 24));
          fact.after = fact.after.map((v) => short(v, 24));
        }
      }
      if (!same(fact.before, fact.after)) facts.push(fact);
    };
    const oldMetrics = metrics(a); const newMetrics = metrics(b);
    for (const field of Object.keys(oldMetrics)) add(field, oldMetrics[field], newMetrics[field]);
    const contextualNotes = (board) => list([
      ...board.objects.filter((o) => o.note).map((o) => `${o.shape}:${o.id}: ${short(o.note, 30)}`),
      ...board.groups.filter((g) => g.note).map((g) => `${g.alias || '(unnamed)'}: ${short(g.note, 30)}`),
      ...board.notes.map((note) => `selection ${note.objectIds.length}: ${short(note.text, 30)}`),
    ]);
    add('notes', contextualNotes(a), contextualNotes(b));
    // Long notes show bounded excerpts around the first difference, not an equal prefix.
    if (a.note !== b.note) {
      const oldChars = [...a.note]; const newChars = [...b.note];
      let difference = 0;
      while (difference < Math.min(oldChars.length, newChars.length)
        && oldChars[difference] === newChars[difference]) difference++;
      const start = Math.max(0, difference - 15);
      const excerpt = (chars) => (start ? '…' : '') + short(chars.slice(start).join(''), start ? 59 : 60);
      add('note', excerpt(oldChars), excerpt(newChars));
    }
    // Settings precede optional composition details to retain the principal change.
    add('settings.levels', list(a.settings.levels.map((l) => `${l.value}:${l.color}`)),
      list(b.settings.levels.map((l) => `${l.value}:${l.color}`)));
    add('settings.defaults', list(a.settings.defaults.filter((d, i) => !same(d, b.settings.defaults[i]))
      .map((d) => `${d.shape}:${d.value}:${d.alias}`)),
    list(b.settings.defaults.filter((d, i) => !same(d, a.settings.defaults[i]))
      .map((d) => `${d.shape}:${d.value}:${d.alias}`)));
    add('settings.shapes', list(a.settings.shapes), list(b.settings.shapes));
    add('objects', countKinds(a), countKinds(b));
    add('aliases', aliasCounts(a), aliasCounts(b));
    add('groups', groupFacts(a), groupFacts(b));
    add('colors', colorFacts(a), colorFacts(b));
    const priorObjects = new Map(a.objects.map((o) => [o.id, o]));
    const moved = b.objects.filter((o) => {
      const old = priorObjects.get(o.id);
      return old && (old.x !== o.x || old.y !== o.y);
    }).length;
    if (moved) add('movedCount', 0, moved);
    // Truncated text or equal aggregate compositions can hide a real edit. Do not lose the event.
    if (!facts.length) add('changedCount', 0, 1);
    let omitted = 0;
    while (bytes(JSON.stringify(facts)) > FACT_BYTES - 65) { facts.pop(); omitted++; }
    if (omitted) facts.push({ field: 'detailsOmitted', before: 0, after: omitted });
    if (!Number.isSafeInteger(next.totalChanges + 1)) fail();
    const last = next.entries[next.entries.length - 1];
    next.totalChanges++;
    if (last && last.type === type && last.origin === origin && same(last.facts, facts)) last.repeats++;
    else next.entries.push({ seq: next.totalChanges, type, origin, repeats: 1, facts });
    if (next.entries.length > 60 || (next.omittedChanges > 0 && next.entries.length > 50)) {
      const discarded = next.entries.splice(20, next.entries.length - 50);
      next.omittedChanges += discarded.reduce((n, entry) => n + entry.repeats, 0);
    }
    // An imported final board says nothing about the process which produced it.
    if (type === 'import') next.priorUnknown = true;
    return validate(next);
  }
  const serialize = (trace) => JSON.stringify(validate(trace));
  return { empty, validate, record, serialize };
}
