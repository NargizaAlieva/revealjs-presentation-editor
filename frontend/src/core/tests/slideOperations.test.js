import { describe, it, expect } from "vitest";
import { createDefaultPresentation } from "../model/defaultPresentation";
import {
  addSlide,
  deleteSlide,
  reorderSlides,
  createSlideFromLayout,
} from "../operations/slideOperations";

describe("slide operations", () => {
  it("adds a new slide", () => {
    const presentation = createDefaultPresentation();
    const updated = addSlide(presentation);
    expect(updated.slideset.slides.length).toBe(2);
  });

  it("does not delete the last slide", () => {
    const presentation = createDefaultPresentation();
    const updated = deleteSlide(presentation, 0);
    expect(updated.slideset.slides.length).toBe(1);
  });

  it("deletes a slide when more than one exists", () => {
    const presentation = createDefaultPresentation();
    const withTwo = addSlide(presentation);
    const updated = deleteSlide(withTwo, 1);
    expect(updated.slideset.slides.length).toBe(1);
  });

  it("reorders slides", () => {
    const presentation = createDefaultPresentation();
    const withTwo = addSlide(presentation);

    const firstId = withTwo.slideset.slides[0].contents.text[0].id;
    const secondId = withTwo.slideset.slides[1].contents.text[0].id;

    const updated = reorderSlides(withTwo, 0, 1);

    expect(updated.slideset.slides[0].contents.text[0].id).toBe(secondId);
    expect(updated.slideset.slides[1].contents.text[0].id).toBe(firstId);
  });

  it("createSlideFromLayout uses correct placeholder text for title role", () => {
    const layout = {
      "layout-id": "test-layout",
      placeholders: [
        { "placeholder-id": "title", type: "text", role: "title", position: { x: 0, y: 0 }, width: 800, height: 80 },
      ],
    };
    const slide = createSlideFromLayout(layout, 1);
    const firstRun = slide.contents.text[0].paragraphs[0].runs[0].text;
    expect(firstRun).toBe("Click to edit title");
    expect(firstRun).not.toBe("Click to edit Master title style");
  });

  it("createSlideFromLayout uses correct placeholder text for body role", () => {
    const layout = {
      "layout-id": "test-layout",
      placeholders: [
        { "placeholder-id": "body", type: "text", role: "body", position: { x: 0, y: 100 }, width: 800, height: 400 },
      ],
    };
    const slide = createSlideFromLayout(layout, 1);
    const firstRun = slide.contents.text[0].paragraphs[0].runs[0].text;
    expect(firstRun).toBe("Click to edit text");
  });

  it("createSlideFromLayout respects promptText over role defaults", () => {
    const layout = {
      "layout-id": "test-layout",
      placeholders: [
        { "placeholder-id": "title", type: "text", role: "title", promptText: "Custom prompt", position: { x: 0, y: 0 }, width: 800, height: 80 },
      ],
    };
    const slide = createSlideFromLayout(layout, 1);
    const firstRun = slide.contents.text[0].paragraphs[0].runs[0].text;
    expect(firstRun).toBe("Custom prompt");
  });
});