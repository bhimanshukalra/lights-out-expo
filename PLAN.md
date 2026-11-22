# Lights Out: Build Plan

Phased breakdown of [MVP.md](MVP.md). The repo is already scaffolded from the Expo Router template (SDK 58), so this plan adapts the guide: the single screen lives at `src/app/index.tsx` instead of `App.tsx`.

## Project notes

- Already installed: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets`.
- Still needed: `expo-haptics`, `@react-native-async-storage/async-storage`, `jest-expo`. Install with `npx expo install <package>`.
- `app.json` currently has `orientation: "portrait"` and `userInterfaceStyle: "automatic"`. The guide wants dark by default.
- Run `npx expo lint` and `npx tsc --noEmit` before marking any phase done.

## Phase 0: Clean the scaffold (~30 min)

- [x] Delete the template demo: `explore.tsx`, `app-tabs*`, `animated-icon*`, `hint-row`, `web-badge`, `collapsible`, and unused assets.
- [x] Make `_layout.tsx` a plain `Stack` or `Slot`, with `index.tsx` as the game screen.
- [x] Set dark mode and the app name in `app.json`.
- [x] Install `expo-haptics`, `async-storage` and `jest-expo`.
- [x] Confirm lint, typecheck and the dev server run.

**Done when:** the app boots to a blank dark screen.

## Phase 1: Game logic, pure and tested (~1 hr)

- [x] `src/game/types.ts`: `Board`, `GameState`, `Action`, `BestScores`.
- [x] `src/game/logic.ts`: `toggle`, `isSolved`, `generate`.
- [x] `src/game/reducer.ts`: `tap`, `restart`, `new` actions.
- [x] Jest tests:
  - [x] Corner, edge and center taps flip 3, 4 and 5 tiles.
  - [x] Tapping the same tile twice returns the original board.
  - [x] `isSolved` is true for an all-off board and false otherwise.
  - [x] `generate` never returns a solved board, and replaying its taps solves it.
  - [x] Moves increment per tap, and reset on restart and new game.
  - [x] Taps are ignored after a win.

**Done when:** `jest` passes.

## Phase 2: Playable board (~2 hrs)

- [x] `src/hooks/useGame.ts`: wraps `useReducer`.
- [x] `src/components/Tile.tsx`: plain `Pressable` with static colors.
- [x] `src/components/Board.tsx`: responsive size, `tile = floor((min(width, height) - padding) / size)`.
- [x] `src/components/Header.tsx`: moves counter, Restart, New Game.
- [x] Wire everything up in `src/app/index.tsx`.

**Done when:** a full game can be played in a simulator and the solved state is detected.

## Phase 3: Persistence and win flow (~2 hrs)

- [x] `src/storage/bestScores.ts`: `loadBests` and `saveBest`, failure-safe, keyed by grid size.
- [x] Load bests on mount. Save when solved and the score is beaten.
- [x] Show the best score in `Header`.
- [x] `src/components/WinModal.tsx`: "Solved in X moves", new-best indicator, Play Again. It appears once per win.

**Done when:** best scores survive an app restart and storage errors do not crash the app.

## Phase 4: Animation, haptics, polish (~2-3 hrs)

- [x] Animated `Tile`: shared `lit` value, `withTiming` 150 ms, `interpolateColor`, spring scale on press.
- [x] Warm yellow glow for lit tiles, dark gray for off. Check contrast.
- [x] Ripple stagger on neighbor toggles (20 ms per distance).
- [x] Haptics on tap and win, wrapped in try/catch, with a persisted settings toggle.
- [x] Win modal fade and scale animation. Confetti is optional.
- [x] Verify there are no dropped taps on rapid tapping.

**Done when:** it feels smooth, and it works with haptics off or unavailable.

## Phase 5: Layout robustness (~1 hr)

- [x] Verify target devices: iPhone 16e and iPhone Duo (open and closed). Tablets are out of scope.
- [x] Landscape: N/A, app is portrait-only (see app.json).
- [x] Verify safe areas.

## Phase 6: Ship prep (~1-2 hrs)

- [x] App icon, adaptive icon, splash screen, app name.
- [ ] Run the full testing checklist from MVP.md on iOS and Android. Logic items are covered by Jest; the win modal, persistence across restart, and Android still need a manual pass.
- [x] Final `npx expo lint`, `npx tsc --noEmit`, `npx expo-doctor`.
- [ ] Optional: `eas build --profile preview`. Needs `ios.bundleIdentifier` and `android.package` set in app.json first.

## Phase 7: Stretch (pick one after MVP)

- [x] Grid-size selector (3x3, 4x4, 5x5, 7x7): chips in the header, last choice persisted, best scores already keyed by size.
- [x] Hint: GF(2) solver finds a shortest solution and the Hint button highlights one tile to tap. A win after a hint does not set a best score.
- [ ] Undo, Timer, Levels, Daily puzzle, Themes and sound.

## Phase 8: Unpredictability that stays solvable (ideas, not started)

Goal: make each puzzle feel less predictable without ever producing an unsolvable board. The invariant behind all of these: every board is made by applying whole taps (in the active tap pattern) to a solved board, so a solution always exists.

- [ ] **Gremlin:** every N moves (or seconds), a random tile is tapped for the player.
  - It must be a full tap, not a single-tile flip. A lone flipped tile can make a 5x5 board unsolvable.
  - The hint re-solves from the new state. Decide whether a gremlin tap counts as a move.
  - Tune the frequency carefully so a surprise tap on a hard board doesn't feel unfair.
- [ ] **Twist per puzzle:** each puzzle uses a different tap pattern: plus, X (diagonals), full row and column, or wrap-around edges.
  - Generalize `toggle` and `generate` to take a pattern, and have the solver build its tap matrix from the same pattern.
  - Show the active pattern to the player (an icon or a short preview), since they must re-learn it each puzzle.
  - Key best scores by size and pattern.
- [ ] **Locked tiles:** a few tiles ignore taps but still toggle when a neighbor is tapped.
  - Scramble from the solved board using only tappable tiles.
  - The solver must treat locked tiles as unavailable taps and can return no solution, so generation has to confirm solvability.
  - Draw locked tiles distinctly.

Suggested order: twist per puzzle, then locked tiles, then gremlin.

## Open decisions

1. **Orientation:** portrait-only (simpler) or unlocked?
2. **Web:** support it, or iOS and Android only?
3. **Grid-size selector:** in the MVP or deferred to stretch?

Defaults if undecided: portrait-only, mobile only, selector deferred.
