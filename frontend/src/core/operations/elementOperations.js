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
    if ("source-width" in element) {
      const hasCrop = (element.crop ?? []).some((v) => v !== 0);
      if (hasCrop) {
        const scaleX = element.width > 0 ? newSize.width  / element.width  : 1;
        const scaleY = element.height > 0 ? newSize.height / element.height : 1;
        updates["source-width"]  = (element["source-width"]  ?? element.width)  * scaleX;
        updates["source-height"] = (element["source-height"] ?? element.height) * scaleY;
      } else {
        updates["source-width"]  = newSize.width;
        updates["source-height"] = newSize.height;
        updates.crop = [];
      }
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