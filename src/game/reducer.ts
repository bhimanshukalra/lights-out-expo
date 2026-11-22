import { DEFAULT_SIZE, generate, isSolved, toggle } from "./logic";
import type { Action, GameState } from "./types";

export function newGame(size: number = DEFAULT_SIZE): GameState {
  const board = generate(size);
  return { size, initial: board, board, moves: 0, solved: false };
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "tap": {
      if (state.solved) return state;
      const board = toggle(state.board, action.row, action.col);
      return {
        ...state,
        board,
        moves: state.moves + 1,
        solved: isSolved(board),
      };
    }
    case "restart":
      return { ...state, board: state.initial, moves: 0, solved: false };
    case "new":
      return newGame(action.size ?? state.size);
  }
}
