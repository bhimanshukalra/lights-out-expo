import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Board } from "@/components/Board";
import { Header } from "@/components/Header";
import { WinModal } from "@/components/WinModal";
import { useGame } from "@/hooks/useGame";

export default function Index() {
  const { state, best, newBest, tap, restart, startNew } = useGame();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header
          moves={state.moves}
          best={best}
          onRestart={restart}
          onNew={() => startNew()}
        />
        <Board board={state.board} disabled={state.solved} onTap={tap} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B10" },
  content: { flex: 1, justifyContent: "center" },
});
