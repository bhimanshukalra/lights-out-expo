import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Board } from "@/components/Board";
import { Header } from "@/components/Header";
import { useGame } from "@/hooks/useGame";

export default function Index() {
  const { state, tap, restart, startNew } = useGame();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header
          moves={state.moves}
          onRestart={restart}
          onNew={() => startNew()}
        />
        <Board board={state.board} disabled={state.solved} onTap={tap} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B10" },
  content: { flex: 1, justifyContent: "center" },
});
