import { memo, useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  row: number;
  col: number;
  size: number;
  lit: boolean;
  /** Ripple delay in ms before this tile animates to its new state. */
  delay?: number;
  disabled?: boolean;
  onPress: (row: number, col: number) => void;
}

const GAP = 6;
const OFF = "#2A2A33";
const ON = "#FFC93C";

function TileBase({ row, col, size, lit, delay = 0, disabled, onPress }: Props) {
  const progress = useSharedValue(lit ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.set(withDelay(delay, withTiming(lit ? 1 : 0, { duration: 150 })));
    // `delay` is only meaningful for the change that accompanies it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lit]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [OFF, ON]),
    shadowOpacity: interpolate(progress.get(), [0, 1], [0, 0.8]),
    elevation: interpolate(progress.get(), [0, 1], [0, 8]),
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Row ${row + 1}, column ${col + 1}, ${lit ? "on" : "off"}`}
      disabled={disabled}
      onPressIn={() => {
        scale.set(withSpring(0.9, { stiffness: 400, damping: 18 }));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, { stiffness: 300, damping: 10 }));
      }}
      onPress={() => onPress(row, col)}
      style={{ width: size, height: size, padding: GAP / 2 }}
    >
      <Animated.View style={[styles.tile, animatedStyle]} />
    </Pressable>
  );
}

export const Tile = memo(TileBase);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 10,
    shadowColor: ON,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
  },
});
