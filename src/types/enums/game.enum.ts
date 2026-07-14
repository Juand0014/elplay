/** Lifecycle status of a game */
export enum GameStatus {
  Pending = 'pending',
  Live = 'live',
  Done = 'done',
  Knockout = 'ko',
}

/** Official vs practice contexts */
export enum GameType {
  League = 'league',
  Tournament = 'tournament',
  Internal = 'internal',
}

/** Half-inning */
export enum InningHalf {
  Top = 'top',
  Bottom = 'bottom',
}
