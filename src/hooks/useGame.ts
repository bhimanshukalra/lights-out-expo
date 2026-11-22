import { useCallback, useReducer } from "react";

import { DEFAULT_SIZE } from "@/game/logic";
import { newGame, reducer } from "@/game/reducer";

export function useGame(size: number = DEFAULT_SIZE) {
  const [state, dispatch] = useReducer(reducer, size, newGame);

  const tap = useCallback(
    (row: number, col: number) => dispatch({ type: "tap", row, col }),
    [],
  );
  const restart = useCallback(() => dispatch({ type: "restart" }), []);
  const startNew = useCallback(
    (nextSize?: number) => dispatch({ type: "new", size: nextSize }),
    [],
  );

  return { state, tap, restart, startNew };
}
