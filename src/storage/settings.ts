import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lightsout:settings";

export interface Settings {
  haptics: boolean;
}

export const DEFAULT_SETTINGS: Settings = { haptics: true };

export async function loadSettings(): Promise<Settings> {
  try {
    const parsed = JSON.parse((await AsyncStorage.getItem(KEY)) ?? "{}");
    return {
      haptics:
        typeof parsed?.haptics === "boolean"
          ? parsed.haptics
          : DEFAULT_SETTINGS.haptics,
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
