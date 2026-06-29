import { describe, expect, test } from "vitest";
import { findMatches, applyReplacement, applyAllReplacements, batchReplaceAll } from "../text/findReplace";

const slides = [
  {
    contents: {
      text: [
        {
          id: "text-1",
          paragraphs: [
            {
              runs: [{ text: "Prof profile PROF professor" }],
            },
          ],
        },
      ],
    },
  },
];

describe("findMatches", () => {
  test("finds text without matching case by default", () => {
    expect(findMatches(slides, "prof")).toHaveLength(4);
  });

  test("can match case", () => {
    expect(findMatches(slides, "Prof", { matchCase: true })).toHaveLength(1);
    expect(findMatches(slides, "PROF", { matchCase: true })).toHaveLength(1);
  });

  test("can find whole words only", () => {
    expect(findMatches(slides, "prof", { wholeWords: true })).toHaveLength(2);
  });

  test("returns empty array for empty query", () => {
    expect(findMatches(slides, "")).toHaveLength(0);
    expect(findMatches(slides, "   ")).toHaveLength(0);
  });
});

describe("applyReplacement", () => {
  test("replaces matched range with replacement string", () => {
    const result = applyReplacement("Hello World", { start: 6, end: 11 }, "Earth");
    expect(result).toBe("Hello Earth");
  });

  test("replaces at start of string", () => {
    const result = applyReplacement("Hello World", { start: 0, end: 5 }, "Hi");
    expect(result).toBe("Hi World");
  });

  test("replaces at end of string", () => {
    const result = applyReplacement("Hello World", { start: 6, end: 11 }, "");
    expect(result).toBe("Hello ");
  });

  test("can replace with empty string (delete)", () => {
    const result = applyReplacement("abcdef", { start: 2, end: 4 }, "");
    expect(result).toBe("abef");
  });
});

describe("applyAllReplacements", () => {
  test("replaces a single match", () => {
    const matches = [{ start: 0, end: 3 }];
    expect(applyAllReplacements(matches, "cat and cat", "dog")).toBe("dog and cat");
  });

  test("replaces multiple matches in the same run (right-to-left)", () => {
    const matches = [{ start: 0, end: 3 }, { start: 8, end: 11 }];
    expect(applyAllReplacements(matches, "cat and cat", "dog")).toBe("dog and dog");
  });

  test("applies matches in right-to-left order so earlier positions stay valid", () => {
    // Pass matches in wrong order (left first) — function must sort them right-to-left
    const matches = [{ start: 0, end: 3 }, { start: 8, end: 11 }];
    const result = applyAllReplacements(matches, "cat and cat", "dog");
    expect(result).toBe("dog and dog");
  });

  test("does not mutate the original matches array", () => {
    const matches = [{ start: 0, end: 3 }];
    const copy = [...matches];
    applyAllReplacements(matches, "cat", "dog");
    expect(matches).toEqual(copy);
  });
});

describe("batchReplaceAll", () => {
  const makeSlides = () => [
    {
      contents: {
        text: [
          {
            id: "el-1",
            paragraphs: [
              { runs: [{ text: "the cat sat" }, { text: "the cat" }] },
            ],
          },
        ],
      },
    },
  ];

  test("returns one operation per run with matches", () => {
    const testSlides = makeSlides();
    const matches = findMatches(testSlides, "cat");
    const ops = batchReplaceAll(matches, testSlides, "dog");
    expect(ops).toHaveLength(2);
  });

  test("operation contains correct slideIndex, elementId, paragraphIdx, runIdx", () => {
    const testSlides = makeSlides();
    const matches = findMatches(testSlides, "cat");
    const ops = batchReplaceAll(matches, testSlides, "dog");
    const op = ops.find((o) => o.runIdx === 0);
    expect(op.slideIndex).toBe(0);
    expect(op.elementId).toBe("el-1");
    expect(op.paragraphIdx).toBe(0);
  });

  test("newText has replacement applied", () => {
    const testSlides = makeSlides();
    const matches = findMatches(testSlides, "cat");
    const ops = batchReplaceAll(matches, testSlides, "dog");
    const op = ops.find((o) => o.runIdx === 0);
    expect(op.newText).toBe("the dog sat");
  });

  test("returns empty array when no matches", () => {
    const testSlides = makeSlides();
    const ops = batchReplaceAll([], testSlides, "dog");
    expect(ops).toHaveLength(0);
  });

  test("groups multiple matches in same run into one operation", () => {
    const testSlides = [
      {
        contents: {
          text: [
            { id: "el-1", paragraphs: [{ runs: [{ text: "cat cat cat" }] }] },
          ],
        },
      },
    ];
    const matches = findMatches(testSlides, "cat");
    const ops = batchReplaceAll(matches, testSlides, "dog");
    expect(ops).toHaveLength(1);
    expect(ops[0].newText).toBe("dog dog dog");
  });
});
