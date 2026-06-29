import { describe, it, expect } from "vitest";
import {
  updateTextFormatting,
  updateSingleParagraphFormatting,
  updateTextRangeFormatting,
} from "../operations/textOperations";

function makePresentation(paragraphs = []) {
  return {
    slideset: {
      slides: [
        {
          contents: {
            text: [
              {
                id: "el-1",
                paragraphs: paragraphs.length
                  ? paragraphs
                  : [
                      { formatting: { align: "left", size: "24px" }, runs: [{ text: "Hello" }] },
                      { formatting: { align: "left" }, runs: [{ text: "World" }] },
                    ],
              },
            ],
            media: [],
          },
        },
      ],
    },
  };
}

function getEl(presentation) {
  return presentation.slideset.slides[0].contents.text[0];
}

// ---------------------------------------------------------------------------
// updateTextFormatting — whole element
// ---------------------------------------------------------------------------

describe("updateTextFormatting", () => {
  it("applies formatting to all paragraphs", () => {
    const p = makePresentation();
    const updated = updateTextFormatting(p, 0, "el-1", { align: "center" });
    const el = getEl(updated);
    expect(el.paragraphs[0].formatting.align).toBe("center");
    expect(el.paragraphs[1].formatting.align).toBe("center");
  });

  it("removes shared key from runs when set at paragraph level", () => {
    const p = makePresentation([
      { formatting: {}, runs: [{ text: "Hi", formatting: { size: "20px" } }] },
    ]);
    const updated = updateTextFormatting(p, 0, "el-1", { size: "32px" });
    expect(getEl(updated).paragraphs[0].runs[0].formatting.size).toBeUndefined();
  });

  it("increases font size via font-size-delta", () => {
    const p = makePresentation([
      { formatting: { size: "24px" }, runs: [{ text: "Hi", formatting: {} }] },
    ]);
    const updated = updateTextFormatting(p, 0, "el-1", { "font-size-delta": 4 });
    expect(getEl(updated).paragraphs[0].formatting.size).toBe("28px");
  });

  it("does not modify unrelated elements", () => {
    const p = makePresentation();
    const updated = updateTextFormatting(p, 0, "el-99", { align: "center" });
    expect(getEl(updated).paragraphs[0].formatting.align).toBe("left");
  });

  it("returns original presentation for invalid slide index", () => {
    const p = makePresentation();
    const updated = updateTextFormatting(p, 99, "el-1", { align: "center" });
    expect(updated).toBe(p);
  });
});

// ---------------------------------------------------------------------------
// updateSingleParagraphFormatting — one paragraph
// ---------------------------------------------------------------------------

describe("updateSingleParagraphFormatting", () => {
  it("updates only the target paragraph", () => {
    const p = makePresentation();
    const updated = updateSingleParagraphFormatting(p, 0, "el-1", 0, { align: "right" });
    const el = getEl(updated);
    expect(el.paragraphs[0].formatting.align).toBe("right");
    expect(el.paragraphs[1].formatting.align).toBe("left");
  });

  it("merges formatting with existing", () => {
    const p = makePresentation();
    const updated = updateSingleParagraphFormatting(p, 0, "el-1", 0, { color: "#f00" });
    const fmt = getEl(updated).paragraphs[0].formatting;
    expect(fmt.color).toBe("#f00");
    expect(fmt.align).toBe("left");
  });

  it("returns original for invalid slide index", () => {
    const p = makePresentation();
    expect(updateSingleParagraphFormatting(p, 99, "el-1", 0, {})).toBe(p);
  });
});

// ---------------------------------------------------------------------------
// updateTextRangeFormatting — selection range
// ---------------------------------------------------------------------------

describe("updateTextRangeFormatting", () => {
  const makeRangePresentation = () =>
    makePresentation([
      { formatting: { align: "left" }, runs: [{ text: "Hello World" }] },
      { formatting: { align: "left" }, runs: [{ text: "Foo Bar" }] },
      { formatting: { align: "left" }, runs: [{ text: "Baz" }] },
    ]);

  it("applies run-level formatting to selected range", () => {
    const p = makeRangePresentation();
    const updated = updateTextRangeFormatting(p, 0, "el-1", 0, 0, 0, 5, { color: "#f00" });
    const runs = getEl(updated).paragraphs[0].runs;
    const coloredRun = runs.find((r) => r.text === "Hello");
    expect(coloredRun?.formatting?.color).toBe("#f00");
  });

  it("applies paragraph-level formatting to paragraphs in range", () => {
    const p = makeRangePresentation();
    const updated = updateTextRangeFormatting(p, 0, "el-1", 0, 0, 1, 3, { align: "center" });
    const el = getEl(updated);
    expect(el.paragraphs[0].formatting.align).toBe("center");
    expect(el.paragraphs[1].formatting.align).toBe("center");
    expect(el.paragraphs[2].formatting.align).toBe("left");
  });

  it("handles font-size-delta in range formatting", () => {
    const p = makePresentation([
      { formatting: {}, runs: [{ text: "Hi", formatting: { size: "20px" } }] },
    ]);
    const updated = updateTextRangeFormatting(p, 0, "el-1", 0, 0, 0, 2, { "font-size-delta": 4 });
    const run = getEl(updated).paragraphs[0].runs.find((r) => r.text === "Hi");
    expect(run?.formatting?.size).toBe("24px");
  });

  it("skips mixed values", () => {
    const p = makeRangePresentation();
    const original = getEl(p).paragraphs[0].formatting.align;
    const updated = updateTextRangeFormatting(p, 0, "el-1", 0, 0, 0, 5, { align: "mixed" });
    expect(getEl(updated).paragraphs[0].formatting.align).toBe(original);
  });

  it("does not apply paragraph formatting to trailing empty boundary", () => {
    const p = makeRangePresentation();
    const updated = updateTextRangeFormatting(p, 0, "el-1", 0, 0, 1, 0, { align: "center" });
    const el = getEl(updated);
    expect(el.paragraphs[0].formatting.align).toBe("center");
    expect(el.paragraphs[1].formatting.align).toBe("left");
  });
});
