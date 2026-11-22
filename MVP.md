# Lights Out: React Native (Expo) Build Guide

## Overview

Lights Out is a single-player puzzle. A grid of tiles (default 5x5) starts with some lights on. Tapping a tile toggles it and its up, down, left and right neighbors. You win when every light is off. This guide builds a polished, offline, single-device version in under one day with Expo only (no native modules to eject).

## Tech stack

- Expo (managed workflow, latest SDK) and TypeScript: `npx create-expo-app lights-out -t expo-template-blank-typescript`
- `react-native-reanimated`: tile flip/scale animations (`npx expo install react-native-reanimated`)
- `@react-native-async-storage/async-storage`: persist best scores (`npx expo install @react-native-async-storage/async-storage`)
- `expo-haptics` (optional): light tap feedback (`npx expo install expo-haptics`)
- State: plain React hooks (`useReducer`); no extra state library needed.

## Game rules

1. The board is an N x N grid; each tile is on (lit) or off.
2. Tapping a tile flips it and its orthogonal neighbors (edges have fewer neighbors).
3. The puzzle is solved when all tiles are off.
4. Score = number of moves; lower is better. Best score is stored per grid size.
5. Every generated puzzle is guaranteed solvable.

## Screens and components

Keep it to one main screen plus a small win overlay; no navigation library needed.

```
App.tsx
src/
  components/
    Board.tsx        // lays out the grid, handles sizing
    Tile.tsx         // animated pressable tile
    Header.tsx       // moves, best score, new game / reset buttons
    WinModal.tsx     // "Solved in X moves" + play again
  game/
    logic.ts         // pure functions: toggle, isSolved, generate
    types.ts
  storage/
    bestScores.ts    // AsyncStorage load/save
  hooks/
    useGame.ts       // reducer + side effects (haptics, storage)
```

## State model

```ts
export type Board = boolean[][]; // true = light on

export interface GameState {
  size: number;          // grid dimension, e.g. 5
  initial: Board;        // for "restart this puzzle"
  board: Board;
  moves: number;
  solved: boolean;
}

export type BestScores = Record<number, number>; // size -> fewest moves

export type Action =
  | { type: 'tap'; row: number; col: number }
  | { type: 'restart' }
  | { type: 'new'; size?: number };
```

## Core logic

All logic lives in pure functions in `game/logic.ts` so it is easy to unit test.

```ts
const DIRS = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];

export function toggle(board: Board, r: number, c: number): Board {
  const n = board.length;
  const next = board.map(row => [...row]);
  for (const [dr, dc] of DIRS) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < n && cc >= 0 && cc < n) next[rr][cc] = !next[rr][cc];
  }
  return next;
}

export const isSolved = (board: Board) => board.every(row => row.every(on => !on));
```

Guaranteed-solvable generation: start from a solved (all off) board and apply random taps. Because each tap is its own inverse, repeating those same taps solves the board.

```ts
export function generate(size: number, taps = size * 2): Board {
  let board: Board = Array.from({ length: size }, () => Array(size).fill(false));
  const used = new Set<string>();
  while (used.size < taps) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    const key = `${r},${c}`;
    if (used.has(key)) continue; // tapping twice cancels out, so use distinct tiles
    used.add(key);
    board = toggle(board, r, c);
  }
  return isSolved(board) ? generate(size, taps) : board; // avoid an already-solved start
}
```

Reducer sketch:

```ts
case 'tap': {
  if (state.solved) return state;
  const board = toggle(state.board, action.row, action.col);
  return { ...state, board, moves: state.moves + 1, solved: isSolved(board) };
}
```

Best score: on `solved`, compare `moves` to `bests[size]`; if lower (or absent), save.

```ts
const KEY = 'lightsout:best';
export async function loadBests(): Promise<BestScores> {
  try { return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}'); } catch { return {}; }
}
export async function saveBest(size: number, moves: number) {
  const bests = await loadBests();
  if (bests[size] === undefined || moves < bests[size]) {
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...bests, [size]: moves }));
  }
}
```

## Animations and polish

- Tile: use `useSharedValue` for `lit` (0 or 1) and `withTiming(lit, { duration: 150 })`; derive background color with `interpolateColor` and a slight `scale` bounce via `withSpring` on press.
- Neighbor toggles animate together; add a tiny stagger (20 ms per distance) for a ripple feel.
- Haptics: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on tap, `notificationAsync(Success)` on win. Wrap in try/catch and make it a settings toggle.
- Lit tiles: warm yellow with soft glow (`shadowColor`/`elevation`); off tiles: dark gray. Check contrast.
- Size the board from `useWindowDimensions()`: `tile = Math.floor((min(width, height) - padding) / size)`.
- Win modal: fade/scale in; confetti is optional.
- Support dark background by default; set `userInterfaceStyle: "dark"` in `app.json`.

## One-day timeline

**Morning (3 to 4 hours): logic and a playable board**
- Scaffold the Expo TS app, install dependencies, confirm it runs in Expo Go.
- Write `types.ts` and `logic.ts` with Jest tests for `toggle`, `isSolved`, `generate`.
- Build `Board` and `Tile` with plain colors; wire up `useReducer`; show the move counter.

**Afternoon (3 to 4 hours): persistence, polish, win flow**
- Add `bestScores.ts` and show best score in `Header`.
- Add restart and new game buttons, plus the `WinModal`.
- Add reanimated tile animations and haptics.
- Responsive sizing for phones and tablets.

**Evening (2 hours): finish and ship**
- Run the testing checklist below on iOS and Android.
- Add app icon and splash screen, set the name in `app.json`.
- Optional: `eas build` for a preview build, or share via Expo Go.
- Pick one stretch idea if time remains.

## Stretch ideas

- Levels: curated puzzles with a fixed number of scramble taps, increasing with level.
- Undo: keep a `history: Board[]` stack in state; pop on undo.
- Hint: compute a solution with Gaussian elimination over GF(2) and highlight one tile to tap.
- Timer: track elapsed seconds; store best time next to best moves.
- Grid size options: 3x3, 4x4, 5x5, 7x7 selector; best scores are already keyed by size.
- Themes, sound effects, daily puzzle seeded by date, share result as text.

## Testing checklist

- [ ] `toggle` on corner, edge, and center tiles flips 3, 4, and 5 tiles respectively.
- [ ] Applying the same tap twice returns the original board.
- [ ] `isSolved` is true for an all-off board and false otherwise.
- [ ] `generate` never returns an already-solved board; replaying its tap set solves it.
- [ ] Moves counter increments per tap and resets on restart and new game.
- [ ] Taps are ignored after a win.
- [ ] Best score updates only when beaten and persists after an app restart.
- [ ] Storage failures (cleared data, errors) do not crash the app.
- [ ] Animations stay smooth on a low-end Android device; no dropped taps on rapid tapping.
- [ ] Layout is correct in portrait and landscape, small phones, and tablets.
- [ ] Haptics can be disabled and the app works where haptics are unavailable.
- [ ] Win modal appears once, and "play again" starts a fresh, unsolved board.
