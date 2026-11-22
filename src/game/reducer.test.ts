import { isSolved, toggle } from "./logic";
import { newGame, reducer } from "./reducer";
import type { GameState } from "./types";

const almostSolved = (): GameState => {
  const board = toggle(Array.from({ length: 5 }, () => Array(5).fill(false)), 2, 2);
  return { size: 5, initial: board, board, moves: 0, solved: false };
};

describe("reducer", () => {
  it("starts unsolved with zero moves", () => {
    const s = newGame();
    expect(s.moves).toBe(0);
    expect(s.solved).toBe(false);
    expect(isSolved(s.board)).toBe(false);
  });

  it("increments moves on each tap", () => {
    let s = newGame();
    s = reducer(s, { type: "tap", row: 0, col: 0 });
    s = reducer(s, { type: "tap", row: 1, col: 1 });
    expect(s.moves).toBe(2);
  });

  it("detects a win and ignores taps afterwards", () => {
    let s = reducer(almostSolved(), { type: "tap", row: 2, col: 2 });
    expect(s.solved).toBe(true);
    const after = reducer(s, { type: "tap", row: 0, col: 0 });
    expect(after).toBe(s);
    expect(after.moves).toBe(1);
  });

  it("restart restores the initial board and resets moves", () => {
    let s = newGame();
    const initial = s.initial;
    s = reducer(s, { type: "tap", row: 0, col: 0 });
    s = reducer(s, { type: "restart" });
    expect(s.board).toEqual(initial);
    expect(s.moves).toBe(0);
    expect(s.solved).toBe(false);
  });

  it("restart after a win allows play again", () => {
    let s = reducer(almostSolved(), { type: "tap", row: 2, col: 2 });
    s = reducer(s, { type: "restart" });
    expect(s.solved).toBe(false);
    expect(reducer(s, { type: "tap", row: 0, col: 0 }).moves).toBe(1);
  });

  it("new resets moves and honours size, defaulting to the current one", () => {
    let s = reducer(newGame(5), { type: "tap", row: 0, col: 0 });
    s = reducer(s, { type: "new" });
    expect(s.moves).toBe(0);
    expect(s.size).toBe(5);
    expect(reducer(s, { type: "new", size: 3 }).board).toHaveLength(3);
  });
});
