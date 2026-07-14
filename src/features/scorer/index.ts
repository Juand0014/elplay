import {
  addManualRun,
  advanceHalfInning,
  bumpBalls,
  bumpStrikes,
  claimTemporaryScorer,
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
export { subscribeScorerSync } from './sync/scorer-broadcast';

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
  claimTemporaryScorer,
};
