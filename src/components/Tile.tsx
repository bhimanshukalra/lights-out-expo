import { memo } from "react";
import { Pressable, StyleSheet } from "react-native";

interface Props {
  row: number;
  col: number;
  size: number;
  lit: boolean;
  disabled?: boolean;
  onPress: (row: number, col: number) => void;
}

const GAP = 6;

function TileBase({ row, col, size, lit, disabled, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Row ${row + 1}, column ${col + 1}, ${lit ? "on" : "off"}`}
      disabled={disabled}
      onPress={() => onPress(row, col)}
      style={[
        styles.tile,
        { width: size - GAP, height: size - GAP, margin: GAP / 2 },
        lit ? styles.lit : styles.off,
      ]}
    />
  );
}

export const Tile = memo(TileBase);

const styles = StyleSheet.create({
  tile: { borderRadius: 10 },
  lit: { backgroundColor: "#FFC93C" },
  off: { backgroundColor: "#2A2A33" },
});
