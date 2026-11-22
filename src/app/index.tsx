import { useCallback, useEffect, useState } from "react";
import {
  type LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Board } from "@/components/Board";
import { Header } from "@/components/Header";
import { WinModal } from "@/components/WinModal";
import { useGame } from "@/hooks/useGame";
import { useSettings } from "@/hooks/useSettings";
import { tapHaptic, winHaptic } from "@/lib/haptics";

export default function Index() {
  const {
    state,
    lastTap,
    hint,
    hinted,
    best,
    newBest,
    tap,
    showHint,
    restart,
    startNew,
  } = useGame();
  const { settings, loaded, toggleHaptics, setSize } = useSettings();
  const [area, setArea] = useState({ width: 0, height: 0 });
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Wide windows (a rotated phone, the open Duo) put the controls beside the board.
  const wide = width > height;
  const compact = !wide && height < COMPACT_HEIGHT;
  // Keep the title off the very edge where the system provides no top inset.
  const topPad = Math.max(0, MIN_TOP_PADDING - insets.top);

  const onAreaLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ width, height });
  }, []);

  const onTap = useCallback(
    (row: number, col: number) => {
      tapHaptic();
      tap(row, col);
    },
    [tap],
  );

  // Apply the persisted grid size once it has loaded, if the player hasn't started yet.
  useEffect(() => {
    if (loaded && state.moves === 0 && state.size !== settings.size) {
      startNew(settings.size);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const onSelectSize = useCallback(
    (size: number) => {
      setSize(size);
      startNew(size);
    },
    [setSize, startNew],
  );

  useEffect(() => {
    if (state.solved) winHaptic();
  }, [state.solved]);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.content,
          { paddingTop: topPad },
          wide && styles.contentWide,
        ]}
      >
        <View style={wide ? styles.sidePane : undefined}>
          <Header
            compact={compact}
            side={wide}
            moves={state.moves}
            best={best}
            size={state.size}
            onSelectSize={onSelectSize}
            haptics={settings.haptics}
            onToggleHaptics={toggleHaptics}
            onHint={showHint}
            onRestart={restart}
            onNew={() => startNew()}
          />
        </View>
        <View style={styles.boardArea} onLayout={onAreaLayout}>
          <Board
            board={state.board}
            maxSize={Math.min(area.width, area.height) - BOARD_MARGIN * 2}
            disabled={state.solved}
            lastTap={lastTap}
            hint={hint}
            onTap={onTap}
          />
        </View>
      </View>
      <WinModal
        visible={state.solved}
        moves={state.moves}
        best={best}
        newBest={newBest}
        hinted={hinted}
        onPlayAgain={() => startNew()}
      />
    </SafeAreaView>
  );
}

const BOARD_MARGIN = 16;
const MIN_TOP_PADDING = 16;
const COMPACT_HEIGHT = 700;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B10" },
  content: { flex: 1 },
  contentWide: { flexDirection: "row" },
  sidePane: {
    width: 360,
    maxWidth: "45%",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  boardArea: { flex: 1, alignItems: "center", justifyContent: "center" },
});
