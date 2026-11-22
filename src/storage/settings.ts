import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_SIZE, SIZES } from "@/game/logic";

const KEY = "lightsout:settings";

export interface Settings {
  haptics: boolean;
  size: number; // last chosen grid size
}

export const DEFAULT_SETTINGS: Settings = { haptics: true, size: DEFAULT_SIZE };

export async function loadSettings(): Promise<Settings> {
  try {
    const parsed = JSON.parse((await AsyncStorage.getItem(KEY)) ?? "{}");
    return {
      haptics:
        typeof parsed?.haptics === "boolean"
          ? parsed.haptics
          : DEFAULT_SETTINGS.haptics,
      size: (SIZES as readonly number[]).includes(parsed?.size)
        ? parsed.size
        : DEFAULT_SETTINGS.size,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch {}
}
