import {
  addMedia,
  deleteMedia,
  updateMedia,
} from "../operations/mediaOperations";

import {
  moveElement,
  resizeElement,
} from "../operations/elementOperations";

describe("mediaOperations", () => {
  const createPresentation = () => ({
    slideset: {
      slides: [
        {
          id: "slide-1",
          contents: {
            text: [],
            media: [],
          },
        },
      ],
    },
  });

  test("addMedia adds media element to slide", () => {
    const presentation = createPresentation();

    const updated = addMedia(presentation, 0, {
      id: "media-1",
      "file-link": "image.png",
      "media-type": "image",
    });

    expect(
      updated.slideset.slides[0].contents.media
    ).toHaveLength(1);

    expect(
      updated.slideset.slides[0].contents.media[0].id
    ).toBe("media-1");
  });

  test("deleteMedia removes media element", () => {
    const presentation = addMedia(
      createPresentation(),
      0,
      {
        id: "media-1",
        "file-link": "image.png",
      }
    );

    const updated = deleteMedia(
      presentation,
      0,
      "media-1"
    );

    expect(
      updated.slideset.slides[0].contents.media
    ).toHaveLength(0);
  });

  test("updateMedia updates media properties", () => {
    const presentation = addMedia(
      createPresentation(),
      0,
      {
        id: "media-1",
        "file-link": "image.png",
      }
    );

    const updated = updateMedia(
      presentation,
      0,
      "media-1",
      {
        rotation: 90,
      }
    );

    expect(
      updated.slideset.slides[0].contents.media[0].rotation
    ).toBe(90);
  });

  test("moveElement moves media element", () => {
    const presentation = addMedia(
      createPresentation(),
      0,
      {
        id: "media-1",
        "file-link": "image.png",
        position: { x: 0, y: 0 },
      }
    );

    const updated = moveElement(
      presentation,
      0,
      "media-1",
      { x: 100, y: 200 }
    );

    expect(
      updated.slideset.slides[0].contents.media[0].position
    ).toEqual({
      x: 100,
      y: 200,
    });
  });

  test("resizeElement resizes media element", () => {
    const presentation = addMedia(
      createPresentation(),
      0,
      {
        id: "media-1",
        width: 300,
        height: 200,
      }
    );

    const updated = resizeElement(
      presentation,
      0,
      "media-1",
      {
        width: 500,
        height: 400,
      }
    );

    expect(
      updated.slideset.slides[0].contents.media[0].width
    ).toBe(500);

    expect(
      updated.slideset.slides[0].contents.media[0].height
    ).toBe(400);
  });
});