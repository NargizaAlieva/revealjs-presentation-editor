import { describe, it, expect } from "vitest";
import { addFontEntry, removePresentationFont } from "../operations/fontOperations";
import { getAvailableFonts, DEFAULT_FONTS } from "../model/fontConfig";

function makePresentation(fonts = []) {
  return { slideset: { fonts } };
}

describe("addFontEntry", () => {
  it("adds a font entry to an empty list", () => {
    const p = makePresentation();
    const updated = addFontEntry(p, { "font-id": "MyFont", "font-file": "indexeddb://key1" });
    expect(updated.slideset.fonts).toHaveLength(1);
    expect(updated.slideset.fonts[0]["font-id"]).toBe("MyFont");
  });

  it("does not add duplicate font-id", () => {
    const p = makePresentation([{ "font-id": "MyFont", "font-file": "indexeddb://key1" }]);
    const updated = addFontEntry(p, { "font-id": "MyFont", "font-file": "indexeddb://key2" });
    expect(updated.slideset.fonts).toHaveLength(1);
  });

  it("adds multiple distinct fonts", () => {
    let p = makePresentation();
    p = addFontEntry(p, { "font-id": "Font A", "font-file": "indexeddb://a" });
    p = addFontEntry(p, { "font-id": "Font B", "font-file": "indexeddb://b" });
    expect(p.slideset.fonts).toHaveLength(2);
  });

  it("does not mutate original presentation", () => {
    const p = makePresentation();
    addFontEntry(p, { "font-id": "X", "font-file": "indexeddb://x" });
    expect(p.slideset.fonts).toHaveLength(0);
  });
});

describe("removePresentationFont", () => {
  it("removes font by id", () => {
    const p = makePresentation([
      { "font-id": "Font A", "font-file": "indexeddb://a" },
      { "font-id": "Font B", "font-file": "indexeddb://b" },
    ]);
    const updated = removePresentationFont(p, "Font A");
    expect(updated.slideset.fonts).toHaveLength(1);
    expect(updated.slideset.fonts[0]["font-id"]).toBe("Font B");
  });

  it("returns same list when font-id not found", () => {
    const p = makePresentation([{ "font-id": "Font A", "font-file": "indexeddb://a" }]);
    const updated = removePresentationFont(p, "NonExistent");
    expect(updated.slideset.fonts).toHaveLength(1);
  });

  it("handles empty font list", () => {
    const p = makePresentation([]);
    const updated = removePresentationFont(p, "Font A");
    expect(updated.slideset.fonts).toHaveLength(0);
  });
});

describe("getAvailableFonts", () => {
  it("returns default fonts when presentation has none", () => {
    const p = makePresentation([]);
    const fonts = getAvailableFonts(p);
    expect(fonts).toEqual(DEFAULT_FONTS);
  });

  it("places presentation fonts before defaults", () => {
    const p = makePresentation([{ "font-id": "MyFont", "font-file": "indexeddb://x" }]);
    const fonts = getAvailableFonts(p);
    expect(fonts[0]).toBe("MyFont");
  });

  it("does not duplicate fonts that overlap with defaults", () => {
    const p = makePresentation([{ "font-id": "Arial", "font-file": "" }]);
    const fonts = getAvailableFonts(p);
    const arialCount = fonts.filter((f) => f === "Arial").length;
    expect(arialCount).toBe(1);
  });

  it("handles null presentation gracefully", () => {
    const fonts = getAvailableFonts(null);
    expect(fonts).toEqual(DEFAULT_FONTS);
  });
});
