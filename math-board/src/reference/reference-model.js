/** Readonly teacher artifacts. This factory is self-contained for client inlining. */
export function createReferenceModel() {
  const own = (value, key) => Object.hasOwn(value, key);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const exact = (value, keys) => {
    if (!record(value) || keys.some(key => !own(value, key))
      || Reflect.ownKeys(value).some(key => !keys.includes(key))) throw Error('Invalid reference fields');
  };
  const text = (value, max) => {
    if (typeof value !== 'string' || value.length > max) throw Error('Invalid reference text');
    return value;
  };
  const number = (value, min, max) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw Error('Invalid reference bounds');
    return value;
  };
  function validateReference(value) {
    exact(value, ['title', 'description', 'width', 'height', 'shapes']);
    const title = text(value.title, 120), description = text(value.description, 1000);
    const width = number(value.width, 100, 1200), height = number(value.height, 100, 800);
    if (!Array.isArray(value.shapes) || value.shapes.length < 1 || value.shapes.length > 40) throw Error('Invalid reference shape count');
    const shapes = Array.from(value.shapes, shape => {
      if (!record(shape)) throw Error('Invalid reference shape');
      if (shape.type === 'rect') {
        exact(shape, ['type', 'x', 'y', 'width', 'height']);
        const x = number(shape.x, 0, width), y = number(shape.y, 0, height);
        const w = number(shape.width, 0, width - x), h = number(shape.height, 0, height - y);
        if (w === 0 || h === 0) throw Error('Reference extent must be positive');
        return { type: 'rect', x, y, width: w, height: h };
      }
      if (shape.type === 'line') {
        exact(shape, ['type', 'x1', 'y1', 'x2', 'y2']);
        return { type: 'line', x1: number(shape.x1, 0, width), y1: number(shape.y1, 0, height),
          x2: number(shape.x2, 0, width), y2: number(shape.y2, 0, height) };
      }
      if (shape.type === 'circle') {
        exact(shape, ['type', 'cx', 'cy', 'r']);
        const cx = number(shape.cx, 0, width), cy = number(shape.cy, 0, height);
        const r = number(shape.r, 0, Math.min(cx, cy, width - cx, height - cy));
        if (r === 0) throw Error('Reference extent must be positive');
        return { type: 'circle', cx, cy, r };
      }
      if (shape.type === 'text') {
        exact(shape, ['type', 'x', 'y', 'text']);
        // Text is data, never markup, links, or SVG instructions.
        return { type: 'text', x: number(shape.x, 0, width), y: number(shape.y, 0, height), text: text(shape.text, 120) };
      }
      throw Error('Invalid reference shape type');
    });
    return { title, description, width, height, shapes };
  }
  function validateView(value) {
    exact(value, ['revision', 'reference']);
    if (!Number.isSafeInteger(value.revision) || value.revision < 0
      || (value.revision === 0 && value.reference !== null)) throw Error('Invalid reference revision');
    return { revision: value.revision, reference: value.reference === null ? null : validateReference(value.reference) };
  }
  return { validateReference, validateView };
}
