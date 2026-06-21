export const createId = (prefix = "id") => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getSlides = (presentation) => presentation?.slideset?.slides ?? [];

export const setSlides = (presentation, slides) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    slides,
  },
});

export const DEFAULT_PRESENTATION_TITLE = "Untitled Presentation";

export const getPresentationTitle = (presentation) =>
  presentation?.slideset?.title ??
  presentation?.slideset?.filename ??
  DEFAULT_PRESENTATION_TITLE;
