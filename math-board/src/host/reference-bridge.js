import { createReferenceModel } from '../reference/reference-model.js';
import { createToolProjection } from './tool-projection.js';

export const REFERENCE_KEY = 'eduBoardReference';
export const REFERENCE_TOOL = 'math_board_reference';
export const REFERENCE_KIND = 'edu-board-reference';

/** Session-log projection of teacher artifacts only; never reads student canvases. */
export function createReferenceBridge() {
  const M = createReferenceModel();
  return createToolProjection({
    kind: REFERENCE_KIND, tool: REFERENCE_TOOL, payload: 'reference', noun: 'reference',
    validateView: M.validateView, validatePayload: M.validateReference,
  });
}
