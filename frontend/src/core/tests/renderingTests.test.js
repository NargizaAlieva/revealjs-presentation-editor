import { describe, it, expect } from "vitest";
import {
  getSlideSize,
  getVisibleSlides,
  getTextElements,
  getMediaElements,
  escapeHtml,
} from "../render/slidesetRenderUtils";
import {
  buildTextElementStyle,
  buildMediaElementStyle,
  buildSlideContainerStyle,
  getTextContent,
  getSlideTransition,
} from "../render/revealRenderer";


function makePresentationWith(masterOverrides = {}, slides = []) {
  return {
    slideset: {
      master: {
        "slide-dimensions": { width: 1280, height: 720 },
        "aspect-ratio": "16:9",
        ...masterOverrides,
      },
      slides,
    },
  };
}

function makeSlide(overrides = {}) {
  return {
    hidden: false,
    contents: {
      transition: "slide",
      background: "white",
      text: [],
      media: [],
    },
    ...overrides,
  };
}

function makeTextElement(overrides = {}) {
  return {
    id: "text-1",
    position: { x: 100, y: 200 },
    width: 400,
    height: 100,
    rotation: 0,
    "z-index": 1,
    background: "transparent",
    overflow: "hidden",
    paragraphs: [
      {
        id: "p-1",
        formatting: { size: "32px", weight: "bold", color: "#000000" },
        runs: [{ text: "Hello World" }],
      },
    ],
    ...overrides,
  };
}


describe("getSlideSize", () => {
  it("returns dimensions from master", () => {
    const presentation = makePresentationWith({
      "slide-dimensions": { width: 1280, height: 720 },
    });
    const { width, height } = getSlideSize(presentation);
    expect(width).toBe(1280);
    expect(height).toBe(720);
  });

  it("returns fallback when no dimensions in master", () => {
    const { width, height } = getSlideSize(null);
    expect(width).toBe(960);
    expect(height).toBe(540);
  });
});


describe("getVisibleSlides", () => {
  it("returns only visible slides", () => {
    const presentation = makePresentationWith({}, [
      makeSlide({ hidden: false }),
      makeSlide({ hidden: true }),
      makeSlide({ hidden: false }),
    ]);
    const visible = getVisibleSlides(presentation);
    expect(visible.length).toBe(2);
  });

  it("returns empty array when no slides", () => {
    const visible = getVisibleSlides(makePresentationWith({}, []));
    expect(visible.length).toBe(0);
  });

  it("hidden slide is not exported", () => {
    const presentation = makePresentationWith({}, [
      makeSlide({ hidden: true, title: { content: "Secret" } }),
    ]);
    const visible = getVisibleSlides(presentation);
    expect(visible.length).toBe(0);
  });
});


describe("getTextElements", () => {
  it("returns text elements from contents", () => {
    const slide = makeSlide({
      contents: {
        text: [makeTextElement(), makeTextElement({ id: "text-2" })],
        media: [],
      },
    });
    expect(getTextElements(slide).length).toBe(2);
  });

  it("returns empty array for slide with no text", () => {
    const slide = makeSlide();
    expect(getTextElements(slide).length).toBe(0);
  });
});


describe("getMediaElements", () => {
  it("returns media elements from contents", () => {
    const slide = makeSlide({
      contents: {
        text: [],
        media: [
          { id: "img-1", "file-link": "image.png", "media-type": "image",
            position: { x: 0, y: 0 }, width: 200, height: 100 },
        ],
      },
    });
    expect(getMediaElements(slide).length).toBe(1);
  });

  it("returns empty array when no media", () => {
    expect(getMediaElements(makeSlide()).length).toBe(0);
  });
});


describe("buildTextElementStyle", () => {
  it("uses coordinates from text element", () => {
    const style = buildTextElementStyle(makeTextElement(), 0);
    expect(style.left).toBe("100px");
    expect(style.top).toBe("200px");
  });

  it("uses width and height from text element", () => {
    const style = buildTextElementStyle(makeTextElement(), 0);
    expect(style.width).toBe("400px");
    expect(style.height).toBe("100px");
  });

  it("uses formatting from first paragraph", () => {
    const style = buildTextElementStyle(makeTextElement(), 0);
    expect(style.fontSize).toBe("32px");
    expect(style.fontWeight).toBe("bold");
    expect(style.color).toBe("#000000");
  });

  it("uses fallback font size when no formatting", () => {
    const element = makeTextElement({ paragraphs: [{ id: "p", runs: [{ text: "x" }] }] });
    const style = buildTextElementStyle(element, 0);
    expect(style.fontSize).toBe("44px");
  });

  it("position is absolute", () => {
    const style = buildTextElementStyle(makeTextElement(), 0);
    expect(style.position).toBe("absolute");
  });
});


describe("buildMediaElementStyle", () => {
  it("uses coordinates from media element", () => {
    const media = { position: { x: 50, y: 60 }, width: 300, height: 200,
      rotation: 0, "z-index": 1 };
    const style = buildMediaElementStyle(media, 0);
    expect(style.left).toBe("50px");
    expect(style.top).toBe("60px");
  });

  it("position is absolute", () => {
    const media = { position: { x: 0, y: 0 }, width: 100, height: 100 };
    const style = buildMediaElementStyle(media, 0);
    expect(style.position).toBe("absolute");
  });
});


describe("buildSlideContainerStyle", () => {
  it("sets correct width and height", () => {
    const style = buildSlideContainerStyle(1280, 720);
    expect(style.width).toBe("1280px");
    expect(style.height).toBe("720px");
  });

  it("position is relative", () => {
    const style = buildSlideContainerStyle(1280, 720);
    expect(style.position).toBe("relative");
  });
});


describe("getTextContent", () => {
  it("extracts text from paragraphs and runs", () => {
    const element = makeTextElement();
    expect(getTextContent(element)).toBe("Hello World");
  });

  it("returns empty string for element with no paragraphs", () => {
    expect(getTextContent({ paragraphs: [] })).toBe("");
  });

  it("concatenates multiple runs", () => {
    const element = makeTextElement({
      paragraphs: [{
        id: "p-1",
        runs: [{ text: "Hello " }, { text: "World" }],
      }],
    });
    expect(getTextContent(element)).toBe("Hello World");
  });
});


describe("getSlideTransition", () => {
  it("returns transition from slide", () => {
    const slide = makeSlide({ contents: { transition: "fade" } });
    expect(getSlideTransition(slide)).toBe("fade");
  });

  it("returns default when no transition set", () => {
    const slide = makeSlide({ contents: {} });
    expect(getSlideTransition(slide)).toBe("slide");
  });

  it("returns default for invalid transition value", () => {
    const slide = makeSlide({ contents: { transition: "invalid-value" } });
    expect(getSlideTransition(slide)).toBe("slide");
  });
});


describe("escapeHtml", () => {
  it("escapes < and >", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("escapes &", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });
});