import { describe, test, expect } from "vitest";
import {
  serializePresentation,
  deserializePresentation,
} from "../persistence/serializationOperations";
import { validateSlideset } from "../operations/slidesetValidation";
import { createDefaultPresentation } from "../model/defaultPresentation";

describe("serializationOperations", () => {
  test("serializes presentation to JSON string", () => {
    const presentation = createDefaultPresentation();

    const json = serializePresentation(presentation);

    expect(typeof json).toBe("string");
    expect(json).toContain("slideset");
  });

  test("deserializes valid presentation without errors", () => {
    const presentation = createDefaultPresentation();
    const json = serializePresentation(presentation);

    const result = deserializePresentation(json);

    expect(result).not.toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.errors).toEqual([]);
    expect(result.data.slideset.layouts.length).toBeGreaterThan(0);
    expect(result.data.slideset.slides.length).toBeGreaterThan(0);
  });

  test("round trip preserves valid presentation structure", () => {
    const original = createDefaultPresentation();

    const json = serializePresentation(original);
    const result = deserializePresentation(json);

    expect(result).not.toBeNull();

    const validationErrors = validateSlideset(result.data);

    expect(validationErrors).toEqual([]);
    expect(result.data.slideset.layouts.length).toBeGreaterThan(0);
    expect(result.data.slideset.slides.length).toBeGreaterThan(0);
  });

  test("returns null data for invalid JSON", () => {
    const result = deserializePresentation("{ invalid json }");

    expect(result.data).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("keeps validation errors for invalid presentation", () => {
    const invalidPresentation = {
      slideset: {
        filename: "broken.json",
        master: {
          "slide-dimensions": { width: 1280, height: 720 },
          "color-theme": [],
        },
        layouts: [],
        slides: [
          {
            title: { content: "Broken Slide" },
            "layout-id": "missing-layout",
            contents: {
              text: [],
              media: [],
              shapes: [],
              tables: [],
              groups: [],
              animations: [],
            },
          },
        ],
      },
    };

    const json = serializePresentation(invalidPresentation);
    const result = deserializePresentation(json);

    expect(result).not.toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain(
      "Slide 1 references unknown layout: missing-layout"
    );
  });
});