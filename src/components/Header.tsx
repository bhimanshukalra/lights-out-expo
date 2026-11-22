import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  moves: number;
  best?: number;
  onRestart: () => void;
  onNew: () => void;
}

export function Header({ moves, best, onRestart, onNew }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lights Out</Text>
      <View style={styles.statsRow}>
        <View style={styles.stats}>
          <Text style={styles.label}>Moves</Text>
          <Text style={styles.value}>{moves}</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.label}>Best</Text>
          <Text style={styles.value}>{best ?? "–"}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <Button label="Restart" onPress={onRestart} />
        <Button label="New Game" onPress={onNew} primary />
      </View>
    </View>
  );
}

function Button({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary && styles.buttonPrimary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, primary && styles.buttonTextPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 16, paddingBottom: 24 },
  title: { color: "#FFC93C", fontSize: 32, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 40 },
  stats: { alignItems: "center" },
  label: { color: "#9A9AA8", fontSize: 14, textTransform: "uppercase" },
  value: { color: "#FFFFFF", fontSize: 40, fontWeight: "700" },
  buttons: { flexDirection: "row", gap: 12 },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2A2A33",
  },
  buttonPrimary: { backgroundColor: "#FFC93C" },
  pressed: { opacity: 0.7 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  buttonTextPrimary: { color: "#0B0B10" },
});
