import { createId, getSlides, setSlides } from "../../utils/presentationUtils";

const getLayouts = (presentation) =>
  presentation?.slideset?.layouts ?? [];

const setLayouts = (presentation, layouts) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    layouts,
  },
});

const createTextFromPlaceholder = (placeholder, masterFormatting = {}) => ({
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
  userModified: false,
  paragraphs: [
    {
      id: createId("paragraph"),
      formatting: { ...masterFormatting, ...(placeholder.formatting ?? {}) }, // ← merge
      bullets: "none",
      runs: [{ formatting: {}, "super-sub-script": "normal", text: "", link: null }],
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

const updateElementFromPlaceholder = (element, placeholders, isModified) => {
  const match = placeholders.find(
    (p) => p["placeholder-id"] === element["placeholder-id"],
  );

  if (!match) return element;
  if (isModified(element)) return element;

  return {
    ...element,
    position: { ...match.position },
    width: match.width,
    height: match.height,
    background: match.background ?? element.background,
  };
};

const isTextModified = (el) => el.userModified === true;

const isMediaModified = (el) =>
  !!el["file-link"] && el["file-link"] !== "";

export const applyLayoutToSlide = (presentation, slideIndex, layoutId) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  const masterFormatting = presentation.slideset?.master?.formatting ?? {};
  const layout = getLayouts(presentation).find(
    (l) => l["layout-id"] === layoutId,
  );

  if (!layout || !slide) return presentation;

  const placeholders = layout.placeholders ?? [];
  const placeholderMap = new Map(
    placeholders.map((p) => [p["placeholder-id"], p])
  );

  const processElement = (el, isModified) => {
    const pid = el["placeholder-id"];
    const match = pid ? placeholderMap.get(pid) : null;
    console.log("[applyLayout]", pid, match ? "→ updated" : isModified(el) ? "→ kept" : "→ removed");
    if (match) {
      return { updated: { ...el, position: { ...match.position }, width: match.width, height: match.height, background: match.background ?? el.background } };
    }
    if (!pid || isModified(el)) return { kept: el };
    return { remove: true };
  };

  const processedText = [];
  for (const el of (slide.contents?.text ?? [])) {
    const r = processElement(el, isTextModified);
    if (r.updated) processedText.push(r.updated);
    else if (r.kept) processedText.push(r.kept);
  }

  const processedMedia = [];
  for (const el of (slide.contents?.media ?? [])) {
    const r = processElement(el, isMediaModified);
    if (r.updated) processedMedia.push(r.updated);
    else if (r.kept) processedMedia.push(r.kept);
  }

  const handledPids = new Set([
    ...processedText.map((el) => el["placeholder-id"]).filter(Boolean),
    ...processedMedia.map((el) => el["placeholder-id"]).filter(Boolean),
  ]);

  const newText = [];
  const newMedia = [];

  for (const placeholder of placeholders) {
    const pid = placeholder["placeholder-id"];
    if (!pid || handledPids.has(pid)) continue;
    if (placeholder.type === "text") newText.push(createTextFromPlaceholder(placeholder, masterFormatting));
    else if (placeholder.type === "image" || placeholder.type === "video") newMedia.push(createMediaFromPlaceholder(placeholder));
  }

  slides[slideIndex] = {
    ...slide,
    "layout-id": layoutId,
    contents: {
      ...slide.contents,
      text: [...processedText, ...newText],
      media: [...processedMedia, ...newMedia],
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

    const masterFormatting = presentation.slideset?.master?.formatting ?? {}; // ← keep here only

   const updatedText = (slide.contents?.text ?? []).map((el) =>
      updateElementFromPlaceholder(el, updatedPlaceholders, isTextModified),
    );
    const updatedMedia = (slide.contents?.media ?? []).map((el) =>
      updateElementFromPlaceholder(el, updatedPlaceholders, isMediaModified),
    );

    const handledPids = new Set([
      ...updatedText.map((el) => el["placeholder-id"]).filter(Boolean),
      ...updatedMedia.map((el) => el["placeholder-id"]).filter(Boolean),
    ]);

    const newText = [];
    const newMedia = [];

    for (const placeholder of updatedPlaceholders) {
      const pid = placeholder["placeholder-id"];
      if (!pid || handledPids.has(pid)) continue;
      if (placeholder.type === "text") {
        newText.push(createTextFromPlaceholder(placeholder, masterFormatting));
      } else if (placeholder.type === "image" || placeholder.type === "video") {
        newMedia.push(createMediaFromPlaceholder(placeholder));
      }
    }

    return {
      ...slide,
      contents: {
        ...slide.contents,
        text: [...updatedText, ...newText],
        media: [...updatedMedia, ...newMedia],
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