import { getSlides, setSlides } from "../utils/presentationUtils";

export const findElementInSlide = (textElements, mediaElements, elementId) => {
  const text = textElements.find((el) => el.id === elementId);
  if (text) return { element: text, type: "text" };
  const media = mediaElements.find((el) => el.id === elementId);
  if (media) return { element: media, type: "media" };
  return null;
};

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

  const updateSize = (element) => {
    if (element.id !== elementId) return element;
    const updates = { ...element, width: newSize.width, height: newSize.height };
    // Keep source-width/source-height in sync for media elements so crop mode uses the right base size
    if ("source-width" in element) {
      updates["source-width"] = newSize.width;
      updates["source-height"] = newSize.height;
      // Only reset crop if all values are >= 0 (no empty space outside image)
      const [ct = 0, cr = 0, cb = 0, cl = 0] = element.crop ?? [];
      if (ct >= 0 && cr >= 0 && cb >= 0 && cl >= 0) updates.crop = [];
    }
    return updates;
  };

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