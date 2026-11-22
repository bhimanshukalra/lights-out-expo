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

- [ ] `src/storage/bestScores.ts`: `loadBests` and `saveBest`, failure-safe, keyed by grid size.
- [ ] Load bests on mount. Save when solved and the score is beaten.
- [ ] Show the best score in `Header`.
- [ ] `src/components/WinModal.tsx`: "Solved in X moves", new-best indicator, Play Again. It appears once per win.

**Done when:** best scores survive an app restart and storage errors do not crash the app.

## Phase 4: Animation, haptics, polish (~2-3 hrs)

- [ ] Animated `Tile`: shared `lit` value, `withTiming` 150 ms, `interpolateColor`, spring scale on press.
- [ ] Warm yellow glow for lit tiles, dark gray for off. Check contrast.
- [ ] Ripple stagger on neighbor toggles (20 ms per distance).
- [ ] Haptics on tap and win, wrapped in try/catch, with a persisted settings toggle.
- [ ] Win modal fade and scale animation. Confetti is optional.
- [ ] Verify there are no dropped taps on rapid tapping.

**Done when:** it feels smooth, and it works with haptics off or unavailable.

## Phase 5: Layout robustness (~1 hr)

- [ ] Verify small phones and tablets.
- [ ] Verify landscape, if orientation is unlocked.
- [ ] Verify safe areas.

## Phase 6: Ship prep (~1-2 hrs)

- [ ] App icon, adaptive icon, splash screen, app name.
- [ ] Run the full testing checklist from MVP.md on iOS and Android.
- [ ] Final `npx expo lint`, `npx tsc --noEmit`, `npx expo-doctor`.
- [ ] Optional: `eas build --profile preview`.

## Phase 7: Stretch (pick one after MVP)

Suggested order: grid-size selector, Undo, Hint (GF(2) solver), Timer, Levels, Daily puzzle, Themes and sound.

## Open decisions

1. **Orientation:** portrait-only (simpler) or unlocked?
2. **Web:** support it, or iOS and Android only?
3. **Grid-size selector:** in the MVP or deferred to stretch?

Defaults if undecided: portrait-only, mobile only, selector deferred.
