import { emptyBoard, toggle } from "@/game/logic";
import type { GameState } from "@/game/types";
import { type HookState, reducer } from "./useGame";

const almostSolved = (): GameState => {
  const board = toggle(emptyBoard(5), 2, 2);
  return { size: 5, initial: board, board, moves: 0, solved: false };
};
const start = (bests = {}): HookState => ({
  game: almostSolved(),
  lastTap: null,
  bests,
  newBest: false,
});
const win = (s: HookState) => reducer(s, { type: "tap", row: 2, col: 2 });

describe("useGame reducer", () => {
  it("records a new best on the first win", () => {
    const s = win(start());
    expect(s.game.solved).toBe(true);
    expect(s.newBest).toBe(true);
    expect(s.bests).toEqual({ 5: 1 });
  });

  it("does not flag a new best when not beaten", () => {
    const s = win(start({ 5: 1 }));
    expect(s.newBest).toBe(false);
    expect(s.bests).toEqual({ 5: 1 });
  });

  it("ignores taps after the win, keeping newBest", () => {
    const s = win(start());
    expect(reducer(s, { type: "tap", row: 0, col: 0 })).toBe(s);
  });

  it("clears newBest on play again and restart", () => {
    const s = win(start());
    expect(reducer(s, { type: "new" }).newBest).toBe(false);
    expect(reducer(s, { type: "restart" }).newBest).toBe(false);
  });

  it("merges loaded bests without losing an earlier win", () => {
    const s = reducer(win(start()), { type: "loaded", bests: { 5: 9, 3: 4 } });
    expect(s.bests).toEqual({ 5: 1, 3: 4 });
  });
});
