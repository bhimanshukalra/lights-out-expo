import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BestScores } from "@/game/types";

const KEY = "lightsout:best";

export const isNewBest = (bests: BestScores, size: number, moves: number) =>
  bests[size] === undefined || moves < bests[size];

function sanitize(value: unknown): BestScores {
  const result: BestScores = {};
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "number" && Number.isFinite(v) && v > 0) {
        result[Number(k)] = v;
      }
    }
  }
  return result;
}

export async function loadBests(): Promise<BestScores> {
  try {
    return sanitize(JSON.parse((await AsyncStorage.getItem(KEY)) ?? "{}"));
  } catch {
    return {};
  }
}

/** Saves `moves` if it beats the stored best. Returns true when it did. Never throws. */
export async function saveBest(size: number, moves: number): Promise<boolean> {
  try {
    const bests = await loadBests();
    if (!isNewBest(bests, size, moves)) return false;
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...bests, [size]: moves }));
    return true;
  } catch {
    return false;
  }
}
