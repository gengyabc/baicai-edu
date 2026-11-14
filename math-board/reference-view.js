// A teacher-authored reference, never an editable board or part of an answer.
// Dependencies are explicit because build.mjs embeds this factory with toString().
export function createTeacherReferenceView(React, t, model) {
  const h = React.createElement;
  return function TeacherReference({ view, sessionId }) {
    const [collapsedRevision, setCollapsedRevision] = React.useState(null);
    let reference;
    try { reference = model.validateView(view).reference; } catch { return null; }
    if (!reference) return null;
    const collapsed = collapsedRevision === view.revision;
    const id = `eb-teacher-reference-${sessionId}-${view.revision}`;
    const shape = (item, index) => {
      const common = { key: index, fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
      switch (item.type) {
        case 'rect': return h('rect', { ...common, x: item.x, y: item.y, width: item.width, height: item.height });
        case 'line': return h('line', { ...common, x1: item.x1, y1: item.y1, x2: item.x2, y2: item.y2 });
        case 'circle': return h('circle', { ...common, cx: item.cx, cy: item.cy, r: item.r });
        case 'text': return h('text', { key: index, x: item.x, y: item.y, fill: 'currentColor', fontSize: 16 }, item.text);
        default: return null;
      }
    };
    return h('section', {
      className: 'eb-teacher-reference', 'aria-label': t('teacherReference'),
      // Native scrolling/buttons still work, but board shortcuts must not edit a
      // retained student selection while focus is in this read-only reference.
      onKeyDown: event => event.stopPropagation(),
    },
      h('div', { className: 'eb-teacher-reference-head' },
        h('strong', null, t('teacherReference')),
        h('span', { className: 'eb-teacher-reference-title' }, reference.title),
        h('button', {
          type: 'button', 'aria-expanded': !collapsed, 'aria-controls': id,
          onClick: () => setCollapsedRevision(collapsed ? null : view.revision),
        }, collapsed ? t('teacherReferenceShow') : t('teacherReferenceHide'))),
      h('p', { className: 'eb-teacher-reference-hint' }, t('teacherReferenceHint')),
      !collapsed && h('div', { id, className: 'eb-teacher-reference-body' },
        h('p', null, reference.description),
        h('div', { className: 'eb-teacher-diagram', tabIndex: 0, role: 'region', 'aria-label': t('teacherReferenceScroll') },
          h('svg', {
            role: 'img', 'aria-labelledby': `${id}-title ${id}-description`,
            viewBox: `0 0 ${reference.width} ${reference.height}`, width: reference.width, height: reference.height,
          }, h('title', { id: `${id}-title` }, reference.title),
          h('desc', { id: `${id}-description` }, reference.description), reference.shapes.map(shape)))));
  };
}
