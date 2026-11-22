import { useCallback, useEffect, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Board } from "@/components/Board";
import { Header } from "@/components/Header";
import { WinModal } from "@/components/WinModal";
import { useGame } from "@/hooks/useGame";
import { useSettings } from "@/hooks/useSettings";
import { tapHaptic, winHaptic } from "@/lib/haptics";

export default function Index() {
  const { state, lastTap, best, newBest, tap, restart, startNew } = useGame();
  const { settings, toggleHaptics } = useSettings();
  const [area, setArea] = useState({ width: 0, height: 0 });

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

  useEffect(() => {
    if (state.solved) winHaptic();
  }, [state.solved]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header
          moves={state.moves}
          best={best}
          haptics={settings.haptics}
          onToggleHaptics={toggleHaptics}
          onRestart={restart}
          onNew={() => startNew()}
        />
        <View style={styles.boardArea} onLayout={onAreaLayout}>
          <Board
            board={state.board}
            maxSize={Math.min(area.width, area.height) - BOARD_MARGIN * 2}
            disabled={state.solved}
            lastTap={lastTap}
            onTap={onTap}
          />
        </View>
      </View>
      <WinModal
        visible={state.solved}
        moves={state.moves}
        best={best}
        newBest={newBest}
        onPlayAgain={() => startNew()}
      />
    </SafeAreaView>
  );
}

const BOARD_MARGIN = 16;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B10" },
  content: { flex: 1 },
  boardArea: { flex: 1, alignItems: "center", justifyContent: "center" },
});
