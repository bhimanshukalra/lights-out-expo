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
    await saveSettings({ haptics: false });
    expect(await loadSettings()).toEqual({ haptics: false });
  });

  it("falls back on corrupt data and storage errors", async () => {
    await AsyncStorage.setItem("lightsout:settings", "{nope");
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValue(new Error("x"));
    jest.spyOn(AsyncStorage, "setItem").mockRejectedValue(new Error("x"));
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
    await expect(saveSettings({ haptics: false })).resolves.toBeUndefined();
  });
});
