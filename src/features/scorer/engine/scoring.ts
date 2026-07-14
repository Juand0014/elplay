import type { BasesState, Game, GamePlay } from "@/types";
import { DEFAULT_GAME_CONFIG, GameStatus, InningHalf, PlayType } from "@/types";

function newId(): string {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function newToken(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

export function createEmptyBases(): BasesState {
  return { first: null, second: null, third: null };
}

export function createGame(input: {
  homeTeamName: string;
  awayTeamName: string;
}): Game {
  const now = new Date().toISOString();
  return {
    id: newId(),
    inviteToken: newToken(),
    homeTeamName: input.homeTeamName.trim(),
    awayTeamName: input.awayTeamName.trim(),
    homeRuns: 0,
    awayRuns: 0,
    inning: 1,
    half: InningHalf.Top,
    outs: 0,
    balls: 0,
    strikes: 0,
    bases: createEmptyBases(),
    runnerJerseyNumber: null,
    status: GameStatus.Live,
    plays: [],
    createdAt: now,
    updatedAt: now,
  };
}

function battingIsAway(half: InningHalf): boolean {
  return half === InningHalf.Top;
}

function appendPlay(
  game: Game,
  playType: PlayType,
  label: string,
  runsScored = 0,
): Game {
  const play: GamePlay = {
    id: `p_${game.plays.length + 1}_${Date.now().toString(36)}`,
    sequence: game.plays.length + 1,
    playType,
    runsScored,
    label,
    createdAt: new Date().toISOString(),
  };
  return {
    ...game,
    plays: [...game.plays, play],
    updatedAt: play.createdAt,
  };
}

function addRuns(game: Game, runs: number): Game {
  if (runs <= 0) return game;
  if (battingIsAway(game.half)) {
    return { ...game, awayRuns: game.awayRuns + runs };
  }
  return { ...game, homeRuns: game.homeRuns + runs };
}

export function setRunner(game: Game, jersey: string | null): Game {
  return {
    ...game,
    runnerJerseyNumber: jersey && jersey.trim() ? jersey.trim() : null,
    updatedAt: new Date().toISOString(),
  };
}

export function setBase(
  game: Game,
  base: keyof BasesState,
  jersey: string | null,
): Game {
  return {
    ...game,
    bases: {
      ...game.bases,
      [base]: jersey && jersey.trim() ? jersey.trim() : null,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function bumpBalls(game: Game): Game {
  if (game.status !== GameStatus.Live) return game;
  const balls = game.balls + 1;
  if (balls >= DEFAULT_GAME_CONFIG.BALLS_FOR_WALK) {
    return recordWalk({ ...game, balls: 0, strikes: 0 });
  }
  return { ...game, balls, updatedAt: new Date().toISOString() };
}

export function bumpStrikes(game: Game): Game {
  if (game.status !== GameStatus.Live) return game;
  const strikes = game.strikes + 1;
  if (strikes >= DEFAULT_GAME_CONFIG.STRIKES_FOR_OUT) {
    return recordOut(
      { ...game, balls: 0, strikes: 0 },
      PlayType.Strikeout,
      "Ponche",
    );
  }
  return { ...game, strikes, updatedAt: new Date().toISOString() };
}

export function recordOut(
  game: Game,
  playType: PlayType = PlayType.Out,
  label = "Out",
): Game {
  if (game.status !== GameStatus.Live) return game;
  const outs = game.outs + 1;
  let next = appendPlay(
    {
      ...game,
      outs,
      balls: 0,
      strikes: 0,
      runnerJerseyNumber: null,
    },
    playType,
    label,
  );
  if (outs >= DEFAULT_GAME_CONFIG.OUTS_PER_INNING) {
    next = advanceHalfInning(next);
  }
  return next;
}

export function recordWalk(game: Game): Game {
  if (game.status !== GameStatus.Live) return game;
  const batter = game.runnerJerseyNumber ?? "BB";
  let runs = 0;
  let bases = { ...game.bases };

  if (bases.first && bases.second && bases.third) {
    runs = 1;
    bases = {
      third: bases.second,
      second: bases.first,
      first: batter,
    };
  } else if (bases.first && bases.second) {
    bases = {
      third: bases.second,
      second: bases.first,
      first: batter,
    };
  } else if (bases.first) {
    bases = {
      ...bases,
      second: bases.first,
      first: batter,
    };
  } else {
    bases = { ...bases, first: batter };
  }

  let next: Game = {
    ...game,
    bases,
    balls: 0,
    strikes: 0,
    runnerJerseyNumber: null,
  };
  next = addRuns(next, runs);
  return appendPlay(next, PlayType.Walk, "Base por bolas", runs);
}

export function recordHit(
  game: Game,
  playType:
    | PlayType.Single
    | PlayType.Double
    | PlayType.Triple
    | PlayType.HomeRun,
): Game {
  if (game.status !== GameStatus.Live) return game;
  const batter = game.runnerJerseyNumber ?? "?";
  let bases = createEmptyBases();
  let runs = 0;

  if (playType === PlayType.HomeRun) {
    runs =
      1 +
      (game.bases.first ? 1 : 0) +
      (game.bases.second ? 1 : 0) +
      (game.bases.third ? 1 : 0);
    bases = createEmptyBases();
  } else if (playType === PlayType.Triple) {
    runs =
      (game.bases.first ? 1 : 0) +
      (game.bases.second ? 1 : 0) +
      (game.bases.third ? 1 : 0);
    bases = { first: null, second: null, third: batter };
  } else if (playType === PlayType.Double) {
    runs = (game.bases.second ? 1 : 0) + (game.bases.third ? 1 : 0);
    bases = {
      first: null,
      second: batter,
      third: game.bases.first,
    };
  } else {
    runs = game.bases.third ? 1 : 0;
    bases = {
      first: batter,
      second: game.bases.first,
      third: game.bases.second,
    };
  }

  let next: Game = {
    ...game,
    bases,
    balls: 0,
    strikes: 0,
    runnerJerseyNumber: null,
  };
  next = addRuns(next, runs);

  const labels = {
    [PlayType.Single]: "Sencillo",
    [PlayType.Double]: "Doble",
    [PlayType.Triple]: "Triple",
    [PlayType.HomeRun]: "Jonrón",
  } as const;

  return appendPlay(next, playType, labels[playType], runs);
}

export function addManualRun(game: Game): Game {
  if (game.status !== GameStatus.Live) return game;
  const next = addRuns(game, 1);
  return appendPlay(next, PlayType.Run, "Carrera", 1);
}

export function advanceHalfInning(game: Game): Game {
  if (game.status !== GameStatus.Live) return game;
  let inning = game.inning;
  let half = game.half;
  if (half === InningHalf.Top) {
    half = InningHalf.Bottom;
  } else {
    half = InningHalf.Top;
    inning += 1;
  }
  const cleared: Game = {
    ...game,
    inning,
    half,
    outs: 0,
    balls: 0,
    strikes: 0,
    bases: createEmptyBases(),
    runnerJerseyNumber: null,
  };
  const halfLabel = half === InningHalf.Top ? "Alta" : "Baja";
  return appendPlay(cleared, PlayType.AdvanceHalf, `${halfLabel} ${inning}`);
}

export function endGame(game: Game): Game {
  return {
    ...game,
    status: GameStatus.Done,
    updatedAt: new Date().toISOString(),
  };
}
