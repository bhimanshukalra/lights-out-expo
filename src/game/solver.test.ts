import { emptyBoard, generateWithTaps, isSolved, toggle } from "./logic";
import { hint, solve } from "./solver";
import type { Board } from "./types";

const apply = (board: Board, taps: boolean[][]) =>
  taps.reduce(
    (b, row, r) => row.reduce((bb, on, c) => (on ? toggle(bb, r, c) : bb), b),
    board,
  );
const weight = (taps: boolean[][]) => taps.flat().filter(Boolean).length;

describe("solve", () => {
  it("returns no taps for a solved board", () => {
    const taps = solve(emptyBoard(5))!;
    expect(weight(taps)).toBe(0);
    expect(hint(emptyBoard(5))).toBeNull();
  });

  it.each([3, 4, 5, 7])("solves generated %ix%i boards in at most the scramble taps", (size) => {
    for (let i = 0; i < 40; i++) {
      const { board, taps: scramble } = generateWithTaps(size);
      const taps = solve(board)!;
      expect(taps).not.toBeNull();
      expect(isSolved(apply(board, taps))).toBe(true);
      expect(weight(taps)).toBeLessThanOrEqual(scramble.length);
    }
  });

  it("returns a single tap for a single-tap scramble", () => {
    const board = toggle(emptyBoard(5), 2, 2);
    expect(weight(solve(board)!)).toBe(1);
    expect(hint(board)).toEqual({ row: 2, col: 2 });
  });

  it("returns null for an unsolvable board", () => {
    // A single lit corner on a 5x5 board is not reachable by any tap set.
    const board = emptyBoard(5);
    board[0][0] = true;
    expect(solve(board)).toBeNull();
    expect(hint(board)).toBeNull();
  });

  it("a hinted tap always moves toward a solution", () => {
    for (let i = 0; i < 40; i++) {
      let board = generateWithTaps(5).board;
      let steps = 0;
      while (!isSolved(board) && steps < 30) {
        const h = hint(board)!;
        board = toggle(board, h.row, h.col);
        steps++;
      }
      expect(isSolved(board)).toBe(true);
    }
  });
});
