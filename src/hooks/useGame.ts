import { useCallback, useEffect, useReducer } from "react";

import { DEFAULT_SIZE } from "@/game/logic";
import { newGame, reducer as gameReducer } from "@/game/reducer";
import { hint as findHint } from "@/game/solver";
import type { Action, BestScores, GameState } from "@/game/types";
import { isNewBest, loadBests, saveBest } from "@/storage/bestScores";

export interface LastTap {
  row: number;
  col: number;
}

export interface HookState {
  game: GameState;
  lastTap: LastTap | null; // origin of the latest tap, for the ripple animation
  bests: BestScores;
  newBest: boolean; // the current win set a new best
  hint: LastTap | null; // tile currently highlighted as a hint
  hints: number; // hints taken on this puzzle; any hint disqualifies a best score
}

type HookAction =
  | Action
  | { type: "loaded"; bests: BestScores }
  | { type: "hint" };

export function reducer(state: HookState, action: HookAction): HookState {
  if (action.type === "loaded") {
    // Merge so a win that lands before the load finishes is not overwritten.
    const bests = { ...action.bests };
    for (const [k, v] of Object.entries(state.bests)) {
      if (isNewBest(bests, Number(k), v)) bests[Number(k)] = v;
    }
    return { ...state, bests };
  }

  if (action.type === "hint") {
    if (state.game.solved) return state;
    const h = findHint(state.game.board);
    if (!h) return state;
    const same = state.hint?.row === h.row && state.hint?.col === h.col;
    return { ...state, hint: h, hints: same ? state.hints : state.hints + 1 };
  }

  const game = gameReducer(state.game, action);
  const lastTap =
    action.type === "tap" ? { row: action.row, col: action.col } : null;
  if (game === state.game) return state;

  if (game.solved && !state.game.solved) {
    const beaten =
      state.hints === 0 && isNewBest(state.bests, game.size, game.moves);
    return {
      game,
      lastTap,
      hint: null,
      hints: state.hints,
      newBest: beaten,
      bests: beaten ? { ...state.bests, [game.size]: game.moves } : state.bests,
    };
  }
  return {
    ...state,
    game,
    lastTap,
    hint: null,
    hints: action.type === "new" ? 0 : state.hints,
    newBest: game.solved ? state.newBest : false,
  };
}

export function useGame(size: number = DEFAULT_SIZE) {
  const [{ game, bests, newBest, lastTap, hint, hints }, dispatch] = useReducer(
    reducer,
    size,
    (s): HookState => ({
      game: newGame(s),
      lastTap: null,
      bests: {},
      newBest: false,
      hint: null,
      hints: 0,
    }),
  );

  useEffect(() => {
    let cancelled = false;
    loadBests().then((loaded) => {
      if (!cancelled) dispatch({ type: "loaded", bests: loaded });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist once per record-setting win (saveBest is idempotent).
  const { solved, size: gameSize, moves } = game;
  useEffect(() => {
    if (solved && newBest) void saveBest(gameSize, moves);
  }, [solved, newBest, gameSize, moves]);

  const tap = useCallback(
    (row: number, col: number) => dispatch({ type: "tap", row, col }),
    [],
  );
  const showHint = useCallback(() => dispatch({ type: "hint" }), []);
  const restart = useCallback(() => dispatch({ type: "restart" }), []);
  const startNew = useCallback(
    (nextSize?: number) => dispatch({ type: "new", size: nextSize }),
    [],
  );

  return {
    state: game,
    lastTap,
    hint,
    hinted: hints > 0,
    best: bests[game.size],
    newBest,
    tap,
    showHint,
    restart,
    startNew,
  };
}
