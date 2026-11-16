import { createDemoModel } from '../teacher-demo/demo-model.js';
import { createToolProjection } from './tool-projection.js';

export const DEMO_KEY = 'eduBoardGeometryDemo';
export const DEMO_TOOL = 'geometry_board_draw';
export const DEMO_KIND = 'edu-board-geometry-demo';

/** Session-log projection of the teacher geometry figure only; never reads a student canvas. */
export function createGeometryDemoBridge(geometry) {
  const M = createDemoModel(geometry);
  return createToolProjection({
    kind: DEMO_KIND, tool: DEMO_TOOL, payload: 'figure', noun: 'geometry demo',
    validateView: M.validateView, validatePayload: M.validateFigure,
  });
}
