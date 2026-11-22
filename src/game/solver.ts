import type { Board } from "./types";

/**
 * Solves a Lights Out board by Gaussian elimination over GF(2).
 *
 * Returns a matrix of tiles to tap (order does not matter, each tile at most
 * once) with the fewest taps, or null if the board has no solution. An already
 * solved board returns an all-false matrix.
 */
export function solve(board: Board): boolean[][] | null {
  const n = board.length;
  const N = n * n;
  const idx = (r: number, c: number) => r * n + c;

  // Row i is the equation for cell i: sum of taps that toggle i = its state.
  const rows: Uint8Array[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const row = new Uint8Array(N + 1);
      for (const [dr, dc] of [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && rr < n && cc >= 0 && cc < n) row[idx(rr, cc)] = 1;
      }
      row[N] = board[r][c] ? 1 : 0;
      rows.push(row);
    }
  }

  // Reduce to row echelon form.
  const pivotCols: number[] = [];
  let rank = 0;
  for (let col = 0; col < N && rank < N; col++) {
    let sel = -1;
    for (let i = rank; i < N; i++) {
      if (rows[i][col]) {
        sel = i;
        break;
      }
    }
    if (sel < 0) continue;
    [rows[rank], rows[sel]] = [rows[sel], rows[rank]];
    for (let i = 0; i < N; i++) {
      if (i !== rank && rows[i][col]) {
        for (let j = col; j <= N; j++) rows[i][j] ^= rows[rank][j];
      }
    }
    pivotCols.push(col);
    rank++;
  }

  // A zero row with a 1 on the right means no solution.
  for (let i = rank; i < N; i++) if (rows[i][N]) return null;

  const pivotSet = new Set(pivotCols);
  const free: number[] = [];
  for (let col = 0; col < N; col++) if (!pivotSet.has(col)) free.push(col);

  // Particular solution (free variables = 0).
  const base = new Uint8Array(N);
  pivotCols.forEach((col, k) => {
    base[col] = rows[k][N];
  });

  // Null-space basis: one vector per free variable.
  const basis = free.map((f) => {
    const v = new Uint8Array(N);
    v[f] = 1;
    pivotCols.forEach((col, k) => {
      v[col] = rows[k][f];
    });
    return v;
  });

  // Pick the combination with the fewest taps. The null space is tiny for the
  // sizes we support (at most 2^4 combinations for 4x4).
  let best: Uint8Array = base;
  let bestWeight = base.reduce((a, b) => a + b, 0);
  const combos = 1 << Math.min(basis.length, 12);
  for (let mask = 1; mask < combos; mask++) {
    const x = Uint8Array.from(base);
    for (let b = 0; b < basis.length; b++) {
      if ((mask >> b) & 1) for (let j = 0; j < N; j++) x[j] ^= basis[b][j];
    }
    const w = x.reduce((a, v) => a + v, 0);
    if (w < bestWeight) {
      best = x;
      bestWeight = w;
    }
  }

  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => best[idx(r, c)] === 1),
  );
}

/** The first tile (row-major) of a shortest solution, or null if solved/unsolvable. */
export function hint(board: Board): { row: number; col: number } | null {
  const taps = solve(board);
  if (!taps) return null;
  for (let r = 0; r < taps.length; r++) {
    for (let c = 0; c < taps.length; c++) {
      if (taps[r][c]) return { row: r, col: c };
    }
  }
  return null;
}
