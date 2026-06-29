import { describe, expect, test } from "vitest";
import { updateMasterDimensions } from "../operations/masterOperations";

describe("updateMasterDimensions media scaling", () => {
  test("normalizes legacy negative crop values while resizing a presentation", () => {
    const presentation = {
      slideset: {
        master: {
          "slide-dimensions": { width: 1000, height: 500 },
          elements: { text: [], media: [] },
        },
        layouts: [],
        slides: [{
          contents: {
            text: [],
            media: [{
              id: "image-1",
              "file-link": "image.png",
              position: { x: 100, y: 50 },
              width: 500,
              height: 350,
              "source-width": 400,
              "source-height": 300,
              crop: [-10, -20, 0, 0],
            }],
          },
        }],
      },
    };

    const updated = updateMasterDimensions(
      presentation,
      { width: 1500, height: 750 },
      "2:1",
      "px",
    );
    const media = updated.slideset.slides[0].contents.media[0];

    expect(media.crop).toEqual([0, 0, 0, 0]);
    expect(media.width).toBe(750);
    expect(media.height).toBe(525);
  });
});
