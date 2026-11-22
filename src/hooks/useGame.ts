import { useCallback, useEffect, useReducer } from "react";

import { DEFAULT_SIZE } from "@/game/logic";
import { newGame, reducer as gameReducer } from "@/game/reducer";
import type { Action, BestScores, GameState } from "@/game/types";
import { isNewBest, loadBests, saveBest } from "@/storage/bestScores";

export interface HookState {
  game: GameState;
  bests: BestScores;
  newBest: boolean; // the current win set a new best
}

type HookAction = Action | { type: "loaded"; bests: BestScores };

export function reducer(state: HookState, action: HookAction): HookState {
  if (action.type === "loaded") {
    // Merge so a win that lands before the load finishes is not overwritten.
    const bests = { ...action.bests };
    for (const [k, v] of Object.entries(state.bests)) {
      if (isNewBest(bests, Number(k), v)) bests[Number(k)] = v;
    }
    return { ...state, bests };
  }

  const game = gameReducer(state.game, action);
  if (game === state.game) return state;

  if (game.solved && !state.game.solved) {
    const beaten = isNewBest(state.bests, game.size, game.moves);
    return {
      game,
      newBest: beaten,
      bests: beaten ? { ...state.bests, [game.size]: game.moves } : state.bests,
    };
  }
  return { ...state, game, newBest: game.solved ? state.newBest : false };
}

export function useGame(size: number = DEFAULT_SIZE) {
  const [{ game, bests, newBest }, dispatch] = useReducer(
    reducer,
    size,
    (s): HookState => ({ game: newGame(s), bests: {}, newBest: false }),
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
  const restart = useCallback(() => dispatch({ type: "restart" }), []);
  const startNew = useCallback(
    (nextSize?: number) => dispatch({ type: "new", size: nextSize }),
    [],
  );

  return { state: game, best: bests[game.size], newBest, tap, restart, startNew };
}
