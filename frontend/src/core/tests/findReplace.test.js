import { describe, expect, test } from "vitest";
import { findMatches } from "../text/findReplace";

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
});
