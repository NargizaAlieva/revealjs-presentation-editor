import { getSlides, setSlides } from "../utils/presentationUtils";

// Find an element by id across text and media arrays. Returns { element, type } or null.
export const findElementInSlide = (textElements, mediaElements, elementId) => {
  const text = textElements.find((el) => el.id === elementId);
  if (text) return { element: text, type: "text" };
  const media = mediaElements.find((el) => el.id === elementId);
  if (media) return { element: media, type: "media" };
  return null;
};

// Returns a human-readable label for any slide element (text or media).
export const getElementLabel = (element) => {
  if (!element) return null;
  if (element.paragraphs) {
    return element.paragraphs?.[0]?.runs?.[0]?.text || "Text";
  }
  return "Image";
};

export const moveElement = (presentation, slideIndex, elementId, newPosition) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const updatePosition = (element) =>
    element.id === elementId
      ? { ...element, position: { x: newPosition.x, y: newPosition.y } }
      : element;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      text: (slide.contents?.text ?? []).map(updatePosition),
      media: (slide.contents?.media ?? []).map(updatePosition),
    },
  };

  return setSlides(presentation, slides);
};

export const resizeElement = (presentation, slideIndex, elementId, newSize) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const updateSize = (element) =>
    element.id === elementId
      ? { ...element, width: newSize.width, height: newSize.height }
      : element;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      text: (slide.contents?.text ?? []).map(updateSize),
      media: (slide.contents?.media ?? []).map(updateSize),
    },
  };

  return setSlides(presentation, slides);
};

export const updateElement = (presentation, slideIndex, elementId, updates) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const applyUpdates = (element) =>
    element.id === elementId ? { ...element, ...updates } : element;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      text: (slide.contents?.text ?? []).map(applyUpdates),
      media: (slide.contents?.media ?? []).map(applyUpdates),
    },
  };

  return setSlides(presentation, slides);
};