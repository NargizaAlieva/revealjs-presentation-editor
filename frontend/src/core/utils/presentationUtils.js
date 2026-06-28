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

export const createParagraphId = () => createId("paragraph");

export const DEFAULT_PRESENTATION_TITLE = "Untitled Presentation";

export const createTextElementFromPlaceholder = (placeholder, defaultText = "") => ({
  id: createId("text"),
  "placeholder-id": placeholder["placeholder-id"],
  position: { ...placeholder.position },
  "pos-type": "relative-to-placeholder",
  width: placeholder.width,
  height: placeholder.height,
  rotation: 0,
  overflow: "auto-fit",
  "z-index": 1,
  background: placeholder.background ?? "#FFFFFF00",
  paragraphs: [
    {
      id: createId("paragraph"),
      formatting: {},
      bullets: "none",
      runs: [{ formatting: {}, "super-sub-script": "normal", text: defaultText, link: null }],
    },
  ],
});

export const createMediaElementFromPlaceholder = (placeholder) => ({
  id: createId("media"),
  "placeholder-id": placeholder["placeholder-id"],
  "file-link": "",
  "media-type": placeholder.type === "video" ? "video" : "image",
  position: { ...placeholder.position },
  width: placeholder.width,
  height: placeholder.height,
  rotation: 0,
  "z-index": 1,
  scale: 1,
  crop: [],
  effects: {},
  playback: {},
});

export const getPresentationTitle = (presentation) =>
  presentation?.slideset?.title ??
  presentation?.slideset?.filename ??
  DEFAULT_PRESENTATION_TITLE;

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
