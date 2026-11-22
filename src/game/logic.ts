import type { Board } from "./types";

const DIRS = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const DEFAULT_SIZE = 5;

export function emptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<boolean>(size).fill(false));
}

export function toggle(board: Board, r: number, c: number): Board {
  const n = board.length;
  const next = board.map((row) => [...row]);
  for (const [dr, dc] of DIRS) {
    const rr = r + dr;
    const cc = c + dc;
    if (rr >= 0 && rr < n && cc >= 0 && cc < n) next[rr][cc] = !next[rr][cc];
  }
  return next;
}

export const isSolved = (board: Board) =>
  board.every((row) => row.every((on) => !on));

export interface Generated {
  board: Board;
  taps: [number, number][];
}

/**
 * Builds a solvable puzzle by applying `taps` distinct random taps to a solved
 * board. Returns the tap set too, so tests (and later, hints) can replay it.
 * Retries if the result happens to be solved (taps can cancel out).
 */
export function generateWithTaps(
  size: number,
  taps = size * 2,
  random: () => number = Math.random,
): Generated {
  const count = Math.min(taps, size * size);
  for (;;) {
    let board = emptyBoard(size);
    const used = new Set<string>();
    const tapList: [number, number][] = [];
    while (used.size < count) {
      const r = Math.floor(random() * size);
      const c = Math.floor(random() * size);
      const key = `${r},${c}`;
      if (used.has(key)) continue; // tapping twice cancels out
      used.add(key);
      tapList.push([r, c]);
      board = toggle(board, r, c);
    }
    if (!isSolved(board)) return { board, taps: tapList };
  }
}

export const generate = (
  size: number,
  taps?: number,
  random?: () => number,
): Board => generateWithTaps(size, taps, random).board;
