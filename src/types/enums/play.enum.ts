/** Types of plays the scorer can record (MVP subset). */
export enum PlayType {
  Single = '1B',
  Double = '2B',
  Triple = '3B',
  HomeRun = 'HR',
  Walk = 'BB',
  Strikeout = 'K',
  Out = 'OUT',
  Run = 'RUN',
  AdvanceHalf = 'HALF',
}

export enum BaseSlot {
  First = 'first',
  Second = 'second',
  Third = 'third',
}
