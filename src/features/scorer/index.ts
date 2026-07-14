import {
  addManualRun,
  advanceHalfInning,
  bumpBalls,
  bumpStrikes,
  createEmptyBases,
  createGame,
  endGame,
  recordHit,
  recordOut,
  recordWalk,
  setBase,
  setRunner,
} from './engine/scoring';
export { useScorerStore } from './store/scorer.store';

export const scorerEngine = {
  createGame,
  createEmptyBases,
  setRunner,
  setBase,
  bumpBalls,
  bumpStrikes,
  recordOut,
  recordWalk,
  recordHit,
  addManualRun,
  advanceHalfInning,
  endGame,
};
