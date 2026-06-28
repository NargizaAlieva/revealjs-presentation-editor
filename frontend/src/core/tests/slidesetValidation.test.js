import { describe, test, expect } from "vitest";
import {
  validateSlideset,
  isSlidesetValid,
} from "../operations/slidesetValidation";
import { createDefaultPresentation } from "../model/defaultPresentation";

describe("slidesetValidation", () => {
  test("valid default presentation passes validation", () => {
    const presentation = createDefaultPresentation();

    expect(validateSlideset(presentation)).toEqual([]);
    expect(isSlidesetValid(presentation)).toBe(true);
  });

  test("missing presentation object fails validation", () => {
    const errors = validateSlideset(null);

    expect(errors).toContain("Missing presentation object");
  });

  test("missing slideset wrapper fails validation", () => {
    const errors = validateSlideset({});

    expect(errors).toContain("Missing slideset wrapper");
  });

  test("missing layout-id fails validation", () => {
    const presentation = createDefaultPresentation();

    delete presentation.slideset.layouts[0]["layout-id"];

    const errors = validateSlideset(presentation);

    expect(errors).toContain("Layout 1 is missing layout-id");
  });

  test("missing placeholder-id fails validation", () => {
    const presentation = createDefaultPresentation();

    delete presentation.slideset.layouts[0].placeholders[0]["placeholder-id"];

    const errors = validateSlideset(presentation);

    expect(errors).toContain(
      "Layout 1 placeholder 1 is missing placeholder-id"
    );
  });

  test("invalid placeholder width fails validation", () => {
    const presentation = createDefaultPresentation();

    presentation.slideset.layouts[0].placeholders[0].width = "100";

    const errors = validateSlideset(presentation);

    expect(errors).toContain(
      "Layout 1 placeholder 1 width must be numeric"
    );
  });

  test("missing contents.animations fails validation", () => {
    const presentation = createDefaultPresentation();

    delete presentation.slideset.slides[0].contents.animations;

    const errors = validateSlideset(presentation);

    expect(errors).toContain("Slide 1 contents.animations must be an array");
  });

  test("unknown slide layout-id fails validation", () => {
    const presentation = createDefaultPresentation();

    presentation.slideset.slides[0]["layout-id"] = "unknown-layout";

    const errors = validateSlideset(presentation);

    expect(errors).toContain(
      "Slide 1 references unknown layout: unknown-layout"
    );
  });
});