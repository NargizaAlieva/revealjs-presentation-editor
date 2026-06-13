import { createId, getSlides, setSlides } from "../../utils/presentationUtils";

// NOTE: media elements retain placeholder-id internally for layout matching.
// Strip this field before sending to the backend.

const getLayouts = (presentation) =>
  presentation?.slideset?.layouts ?? [];

const setLayouts = (presentation, layouts) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    layouts,
  },
});

const createTextFromPlaceholder = (placeholder) => ({
  id: createId("text"),
  "placeholder-id": placeholder["placeholder-id"],
  position: { ...placeholder.position },
  "pos-type": "relative-to-placeholder",
  width: placeholder.width,
  height: placeholder.height,
  rotation: 0,
  overflow: "shrink-on-overflow",
  "z-index": 1,
  background: placeholder.background ?? "#FFFFFF00",
  paragraphs: [
    {
      id: createId("paragraph"),
      formatting: placeholder.formatting ?? {},
      bullets: "none",
      runs: [
        {
          formatting: {},
          "super-sub-script": "normal",
          text: "",
          link: null,
        },
      ],
    },
  ],
});

const createMediaFromPlaceholder = (placeholder) => ({
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

const updateElementFromPlaceholder = (element, placeholders) => {
  const match = placeholders.find(
    (p) => p["placeholder-id"] === element["placeholder-id"],
  );

  if (!match) return element;

  return {
    ...element,
    position: { ...match.position },
    width: match.width,
    height: match.height,
    background: match.background ?? element.background,
  };
};

export const applyLayoutToSlide = (presentation, slideIndex, layoutId) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  const layout = getLayouts(presentation).find(
    (l) => l["layout-id"] === layoutId,
  );

  if (!layout || !slide) return presentation;

  const placeholders = layout.placeholders ?? [];

  const updatedText = (slide.contents?.text ?? []).map((el) =>
    updateElementFromPlaceholder(el, placeholders),
  );
  const updatedMedia = (slide.contents?.media ?? []).map((el) =>
    updateElementFromPlaceholder(el, placeholders),
  );

  const existingPlaceholderIds = new Set([
    ...updatedText.map((el) => el["placeholder-id"]).filter(Boolean),
    ...updatedMedia.map((el) => el["placeholder-id"]).filter(Boolean),
  ]);

  const newText = [];
  const newMedia = [];

  for (const placeholder of placeholders) {
    const pid = placeholder["placeholder-id"];
    if (!pid || existingPlaceholderIds.has(pid)) continue;

    if (placeholder.type === "text") {
      newText.push(createTextFromPlaceholder(placeholder));
    } else if (placeholder.type === "image" || placeholder.type === "video") {
      newMedia.push(createMediaFromPlaceholder(placeholder));
    }
  }

  slides[slideIndex] = {
    ...slide,
    "layout-id": layoutId,
    contents: {
      ...slide.contents,
      text: [...updatedText, ...newText],
      media: [...updatedMedia, ...newMedia],
    },
  };

  return setSlides(presentation, slides);
};

export const propagateLayoutChanges = (
  presentation,
  layoutId,
  updatedPlaceholders,
) => {
  const slides = getSlides(presentation).map((slide) => {
    if (slide["layout-id"] !== layoutId) return slide;

    return {
      ...slide,
      contents: {
        ...slide.contents,
        text: (slide.contents?.text ?? []).map((el) =>
          updateElementFromPlaceholder(el, updatedPlaceholders),
        ),
        media: (slide.contents?.media ?? []).map((el) =>
          updateElementFromPlaceholder(el, updatedPlaceholders),
        ),
      },
    };
  });

  const updatedLayouts = getLayouts(presentation).map((layout) =>
    layout["layout-id"] === layoutId
      ? { ...layout, placeholders: updatedPlaceholders }
      : layout,
  );

  return setLayouts(setSlides(presentation, slides), updatedLayouts);
};