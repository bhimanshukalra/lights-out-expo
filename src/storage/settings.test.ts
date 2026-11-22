import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./settings";

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe("settings", () => {
  it("defaults to haptics on", async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("round-trips", async () => {
    await saveSettings({ haptics: false, size: 4 });
    expect(await loadSettings()).toEqual({ haptics: false, size: 4 });
  });

  it("ignores an unsupported size", async () => {
    await AsyncStorage.setItem(
      "lightsout:settings",
      JSON.stringify({ haptics: false, size: 6 }),
    );
    expect(await loadSettings()).toEqual({ haptics: false, size: 5 });
  });

  it("falls back on corrupt data and storage errors", async () => {
    await AsyncStorage.setItem("lightsout:settings", "{nope");
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValue(new Error("x"));
    jest.spyOn(AsyncStorage, "setItem").mockRejectedValue(new Error("x"));
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
    await expect(saveSettings({ haptics: false, size: 4 })).resolves.toBeUndefined();
  });
});
