import { emptyBoard, generate, generateWithTaps, isSolved, toggle } from "./logic";

const count = (b: boolean[][]) => b.flat().filter(Boolean).length;

describe("toggle", () => {
  const empty = emptyBoard(5);

  it.each([
    ["corner", 0, 0, 3],
    ["edge", 0, 2, 4],
    ["center", 2, 2, 5],
  ])("flips the right number of tiles on a %s tap", (_n, r, c, expected) => {
    expect(count(toggle(empty, r, c))).toBe(expected);
  });

  it("does not mutate the input board", () => {
    toggle(empty, 2, 2);
    expect(count(empty)).toBe(0);
  });

  it("returns the original board when the same tap is applied twice", () => {
    const board = generate(5);
    expect(toggle(toggle(board, 1, 3), 1, 3)).toEqual(board);
  });
});

describe("isSolved", () => {
  it("is true for an all-off board", () => {
    expect(isSolved(emptyBoard(5))).toBe(true);
  });

  it("is false when any light is on", () => {
    expect(isSolved(toggle(emptyBoard(5), 4, 4))).toBe(false);
  });
});

describe("generate", () => {
  it.each([3, 4, 5, 7])("is never already solved (size %i)", (size) => {
    for (let i = 0; i < 200; i++) {
      expect(isSolved(generate(size))).toBe(false);
    }
  });

  it("is solved by replaying its tap set", () => {
    for (let i = 0; i < 100; i++) {
      const { board, taps } = generateWithTaps(5);
      const solved = taps.reduce((b, [r, c]) => toggle(b, r, c), board);
      expect(isSolved(solved)).toBe(true);
    }
  });

  it("retries when the taps cancel out to a solved board", () => {
    // These 8 taps on a 4x4 board cancel out exactly, so the first attempt is solved.
    const cancelling = [[0,1],[0,2],[0,3],[1,0],[1,2],[2,0],[2,1],[3,0]];
    const second = [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3]];
    const seq = [...cancelling, ...second].flatMap(([r, c]) => [(r + 0.5) / 4, (c + 0.5) / 4]);
    let i = 0;
    const random = () => seq[i++];

    expect(isSolved(cancelling.reduce((b, [r, c]) => toggle(b, r, c), emptyBoard(4)))).toBe(true);

    const { board, taps } = generateWithTaps(4, 8, random);
    expect(isSolved(board)).toBe(false);
    expect(taps).toEqual(second);
  });
});
