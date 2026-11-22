import { StyleSheet, useWindowDimensions, View } from "react-native";

import type { Board as BoardType } from "@/game/types";
import { Tile } from "./Tile";

interface Props {
  board: BoardType;
  disabled?: boolean;
  onTap: (row: number, col: number) => void;
}

const PADDING = 32;
const MAX_BOARD = 560; // keep tablets from getting enormous tiles
const RESERVED_HEIGHT = 300; // header, buttons and safe-area insets

export function Board({ board, disabled, onTap }: Props) {
  const { width, height } = useWindowDimensions();
  const n = board.length;
  const available = Math.min(
    width - PADDING,
    height - RESERVED_HEIGHT,
    MAX_BOARD,
  );
  const tileSize = Math.floor(available / n);

  return (
    <View style={styles.board}>
      {board.map((cells, r) => (
        <View key={r} style={styles.row}>
          {cells.map((lit, c) => (
            <Tile
              key={c}
              row={r}
              col={c}
              size={tileSize}
              lit={lit}
              disabled={disabled}
              onPress={onTap}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { alignSelf: "center" },
  row: { flexDirection: "row" },
});
