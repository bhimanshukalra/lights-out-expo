import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

interface Props {
  visible: boolean;
  moves: number;
  best?: number;
  newBest: boolean;
  onPlayAgain: () => void;
}

export function WinModal({ visible, moves, best, newBest, onPlayAgain }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onPlayAgain}
    >
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.card}>
          <Text style={styles.title}>Lights out!</Text>
          <Text style={styles.body}>
            Solved in {moves} {moves === 1 ? "move" : "moves"}
          </Text>
          {newBest ? (
            <Text style={styles.best}>New best!</Text>
          ) : best !== undefined ? (
            <Text style={styles.sub}>Best: {best}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={onPlayAgain}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 12,
    padding: 28,
    borderRadius: 20,
    backgroundColor: "#1A1A22",
  },
  title: { color: "#FFC93C", fontSize: 30, fontWeight: "800" },
  body: { color: "#FFFFFF", fontSize: 18 },
  best: { color: "#FFC93C", fontSize: 18, fontWeight: "700" },
  sub: { color: "#9A9AA8", fontSize: 16 },
  button: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFC93C",
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: "#0B0B10", fontSize: 17, fontWeight: "700" },
});
