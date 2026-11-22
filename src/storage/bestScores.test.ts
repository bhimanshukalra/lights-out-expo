import AsyncStorage from "@react-native-async-storage/async-storage";

import { isNewBest, loadBests, saveBest } from "./bestScores";

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe("bestScores", () => {
  it("starts empty", async () => {
    expect(await loadBests()).toEqual({});
  });

  it("saves the first score for a size", async () => {
    expect(await saveBest(5, 12)).toBe(true);
    expect(await loadBests()).toEqual({ 5: 12 });
  });

  it("only updates when beaten", async () => {
    await saveBest(5, 12);
    expect(await saveBest(5, 15)).toBe(false);
    expect(await saveBest(5, 12)).toBe(false);
    expect(await loadBests()).toEqual({ 5: 12 });
    expect(await saveBest(5, 9)).toBe(true);
    expect(await loadBests()).toEqual({ 5: 9 });
  });

  it("keeps sizes independent", async () => {
    await saveBest(5, 12);
    await saveBest(3, 4);
    expect(await loadBests()).toEqual({ 5: 12, 3: 4 });
  });

  it("survives corrupt stored data", async () => {
    await AsyncStorage.setItem("lightsout:best", "{not json");
    expect(await loadBests()).toEqual({});
    await AsyncStorage.setItem("lightsout:best", JSON.stringify({ 5: "x", 3: 4 }));
    expect(await loadBests()).toEqual({ 3: 4 });
  });

  it("does not throw when storage fails", async () => {
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValue(new Error("boom"));
    jest.spyOn(AsyncStorage, "setItem").mockRejectedValue(new Error("boom"));
    expect(await loadBests()).toEqual({});
    expect(await saveBest(5, 3)).toBe(false);
  });

  it("isNewBest handles missing entries", () => {
    expect(isNewBest({}, 5, 10)).toBe(true);
    expect(isNewBest({ 5: 10 }, 5, 10)).toBe(false);
  });
});
