import { Pressable, StyleSheet, Text, View } from "react-native";

import { SIZES } from "@/game/logic";

interface Props {
  moves: number;
  best?: number;
  size: number;
  onSelectSize: (size: number) => void;
  haptics: boolean;
  onToggleHaptics: () => void;
  onHint: () => void;
  onRestart: () => void;
  onNew: () => void;
  /** Tighter spacing for short screens. */
  compact?: boolean;
  /** Header sits beside the board, so it needs no bottom padding. */
  side?: boolean;
}

export function Header({
  moves,
  best,
  size,
  onSelectSize,
  haptics,
  onToggleHaptics,
  onHint,
  onRestart,
  onNew,
  compact,
  side,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        side && styles.containerSide,
      ]}
    >
      <Text style={[styles.title, compact && styles.titleCompact]}>
        Lights Out
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.stats}>
          <Text style={styles.label}>Moves</Text>
          <Text style={[styles.value, compact && styles.valueCompact]}>
            {moves}
          </Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.label}>Best</Text>
          <Text style={[styles.value, compact && styles.valueCompact]}>
            {best ?? "–"}
          </Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <Button label="Restart" onPress={onRestart} />
        <Button label="Hint" onPress={onHint} />
        <Button label="New Game" onPress={onNew} primary />
      </View>
      <View style={styles.sizes}>
        {SIZES.map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${n} by ${n} grid`}
            accessibilityState={{ selected: n === size }}
            onPress={() => n !== size && onSelectSize(n)}
            style={[styles.chip, n === size && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, n === size && styles.chipTextActive]}
            >
              {n}×{n}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: haptics }}
        accessibilityLabel="Haptic feedback"
        onPress={onToggleHaptics}
      >
        <Text style={styles.toggle}>Haptics: {haptics ? "On" : "Off"}</Text>
      </Pressable>
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
  containerCompact: { gap: 10, paddingBottom: 12 },
  containerSide: { paddingBottom: 0 },
  title: { color: "#FFC93C", fontSize: 32, fontWeight: "800" },
  titleCompact: { fontSize: 26 },
  statsRow: { flexDirection: "row", gap: 40 },
  stats: { alignItems: "center" },
  label: { color: "#9A9AA8", fontSize: 14, textTransform: "uppercase" },
  value: { color: "#FFFFFF", fontSize: 40, fontWeight: "700" },
  valueCompact: { fontSize: 30 },
  sizes: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1A1A22",
  },
  chipActive: { backgroundColor: "#FFC93C" },
  chipText: { color: "#9A9AA8", fontSize: 14, fontWeight: "600" },
  chipTextActive: { color: "#0B0B10" },
  toggle: { color: "#9A9AA8", fontSize: 14 },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
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
