import { describe, test, expect } from "vitest";
import { propagateLayoutChanges } from "../operations/layoutOperations";

describe("layoutOperations", () => {
  const createPresentation = () => ({
    slideset: {
      layouts: [
        {
          "layout-id": "layout-1",
          placeholders: [
            {
              "placeholder-id": "title",
              position: { x: 10, y: 20 },
              width: 300,
              height: 80,
            },
            {
              "placeholder-id": "image",
              position: { x: 100, y: 120 },
              width: 400,
              height: 250,
            },
          ],
        },
      ],
      slides: [
        {
          "layout-id": "layout-1",
          contents: {
            text: [
              {
                id: "text-1",
                "placeholder-id": "title",
                position: { x: 10, y: 20 },
                width: 300,
                height: 80,
                paragraphs: [
                  {
                    runs: [{ text: "Original title" }],
                  },
                ],
              },
            ],
            media: [
              {
                id: "media-1",
                "placeholder-id": "image",
                "file-link": "image.png",
                "media-type": "image",
                position: { x: 100, y: 120 },
                width: 400,
                height: 250,
              },
            ],
          },
        },
      ],
    },
  });

  test("propagates placeholder changes to text and media elements", () => {
    const presentation = createPresentation();

    const updated = propagateLayoutChanges(
      presentation,
      "layout-1",
      [
        {
          "placeholder-id": "title",
          position: { x: 50, y: 60 },
          width: 500,
          height: 100,
        },
        {
          "placeholder-id": "image",
          position: { x: 200, y: 220 },
          width: 300,
          height: 180,
        },
      ],
    );

    const updatedSlide = updated.slideset.slides[0];
    const updatedText = updatedSlide.contents.text[0];
    const updatedMedia = updatedSlide.contents.media[0];

    expect(updatedText.position).toEqual({ x: 50, y: 60 });
    expect(updatedText.width).toBe(500);
    expect(updatedText.height).toBe(100);

    expect(updatedMedia.position).toEqual({ x: 200, y: 220 });
    expect(updatedMedia.width).toBe(300);
    expect(updatedMedia.height).toBe(180);
  });

  test("preserves text and media content during layout propagation", () => {
    const presentation = createPresentation();

    const updated = propagateLayoutChanges(
      presentation,
      "layout-1",
      [
        {
          "placeholder-id": "title",
          position: { x: 70, y: 80 },
          width: 600,
          height: 120,
        },
        {
          "placeholder-id": "image",
          position: { x: 150, y: 160 },
          width: 350,
          height: 240,
        },
      ],
    );

    expect(
      updated.slideset.slides[0].contents.text[0].paragraphs[0].runs[0].text
    ).toBe("Original title");

    expect(
      updated.slideset.slides[0].contents.media[0]["file-link"]
    ).toBe("image.png");
  });

  test("updates the layout definition itself", () => {
    const presentation = createPresentation();

    const updatedPlaceholders = [
      {
        "placeholder-id": "title",
        position: { x: 30, y: 40 },
        width: 450,
        height: 90,
      },
    ];

    const updated = propagateLayoutChanges(
      presentation,
      "layout-1",
      updatedPlaceholders,
    );

    expect(updated.slideset.layouts[0].placeholders).toEqual(
      updatedPlaceholders
    );
  });

  test("does not change slides using a different layout", () => {
    const presentation = {
      slideset: {
        layouts: [
          {
            "layout-id": "layout-1",
            placeholders: [],
          },
          {
            "layout-id": "layout-2",
            placeholders: [],
          },
        ],
        slides: [
          {
            "layout-id": "layout-2",
            contents: {
              text: [
                {
                  id: "text-1",
                  "placeholder-id": "title",
                  position: { x: 10, y: 20 },
                  width: 300,
                  height: 80,
                },
              ],
              media: [],
            },
          },
        ],
      },
    };

    const updated = propagateLayoutChanges(
      presentation,
      "layout-1",
      [
        {
          "placeholder-id": "title",
          position: { x: 99, y: 99 },
          width: 999,
          height: 999,
        },
      ],
    );

    expect(updated.slideset.slides[0].contents.text[0].position).toEqual({
      x: 10,
      y: 20,
    });
  });
});