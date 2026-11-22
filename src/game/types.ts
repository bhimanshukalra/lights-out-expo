export type Board = boolean[][]; // true = light on

export interface GameState {
  size: number; // grid dimension, e.g. 5
  initial: Board; // for "restart this puzzle"
  board: Board;
  moves: number;
  solved: boolean;
}

export type BestScores = Record<number, number>; // size -> fewest moves

export type Action =
  | { type: "tap"; row: number; col: number }
  | { type: "restart" }
  | { type: "new"; size?: number };
