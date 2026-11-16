/** A teacher geometry figure: one titled board, never a student draft. */
export function createDemoModel(geometry) {
  const own = (value, key) => Object.hasOwn(value, key);
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const exact = (value, keys) => {
    if (!record(value) || keys.some((key) => !own(value, key))
      || Reflect.ownKeys(value).some((key) => !keys.includes(key))) throw Error('Invalid demo fields');
  };
  const text = (value, max) => {
    if (typeof value !== 'string' || [...value].length > max) throw Error('Invalid demo text');
    return value;
  };
  function validateFigure(value) {
    exact(value, ['title', 'description', 'board']);
    const title = text(value.title, 120);
    const description = text(value.description, 1000);
    if (!record(value.board)) throw Error('Invalid demo board');
    if (value.board.note !== '') throw Error('Demo board note must be empty');
    const board = geometry.validate(value.board);
    // A demo figure may be made of writing only: a titled note the student can copy and
    // then edit. A figure with nothing at all is still refused.
    if (board.points.length > 40 || board.elements.length < 1 || board.elements.length > 40) throw Error('Invalid demo shape count');
    return {
      title, description,
      board: {
        ...board,
        points: board.points.map(({ construction, ...rest }) => construction ? { ...rest, construction } : rest),
      },
    };
  }
  function validateView(value) {
    exact(value, ['revision', 'figure']);
    if (!Number.isSafeInteger(value.revision) || value.revision < 0
      || (value.revision === 0 && value.figure !== null)) throw Error('Invalid demo revision');
    return { revision: value.revision, figure: value.figure === null ? null : validateFigure(value.figure) };
  }
  return { validateFigure, validateView };
}
