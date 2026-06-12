const createId = (prefix = "id") => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getSlides = (presentation) => presentation?.slideset?.slides ?? [];

const getLayouts = (presentation) =>
  presentation?.slideset?.master?.layouts ??
  presentation?.slideset?.layouts ??
  [];

const setSlides = (presentation, slides) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    slides,
  },
});

const setLayouts = (presentation, layouts) => {
  if (presentation?.slideset?.master?.layouts) {
    return {
      ...presentation,
      slideset: {
        ...presentation.slideset,
        master: {
          ...presentation.slideset.master,
          layouts,
        },
      },
    };
  }

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      layouts,
    },
  };
};

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
  background: placeholder.background ?? "transparent",
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
  crop: null,
  effects: {},
  playback: {},
});

const updateElementFromPlaceholder = (element, placeholders) => {
  const matchingPlaceholder = placeholders.find(
    (placeholder) =>
      placeholder["placeholder-id"] === element["placeholder-id"],
  );

  if (!matchingPlaceholder) return element;

  return {
    ...element,
    position: { ...matchingPlaceholder.position },
    width: matchingPlaceholder.width,
    height: matchingPlaceholder.height,
    background: matchingPlaceholder.background ?? element.background,
  };
};

export const applyLayoutToSlide = (presentation, slideIndex, layoutId) => {
  const slides = [...getSlides(presentation)];
  const layout = getLayouts(presentation).find(
    (item) => item["layout-id"] === layoutId,
  );
  const slide = slides[slideIndex];

  if (!layout || !slide) return presentation;

  const placeholders = layout.placeholders ?? [];

  const existingText = slide.contents?.text ?? [];
  const existingMedia = slide.contents?.media ?? [];

  const updatedText = existingText.map((element) =>
    updateElementFromPlaceholder(element, placeholders),
  );

  const updatedMedia = existingMedia.map((element) =>
    updateElementFromPlaceholder(element, placeholders),
  );

  const existingPlaceholderIds = new Set([
    ...updatedText.map((element) => element["placeholder-id"]).filter(Boolean),
    ...updatedMedia.map((element) => element["placeholder-id"]).filter(Boolean),
  ]);

  const missingTextElements = [];
  const missingMediaElements = [];

  for (const placeholder of placeholders) {
    const placeholderId = placeholder["placeholder-id"];

    if (!placeholderId || existingPlaceholderIds.has(placeholderId)) {
      continue;
    }

    if (placeholder.type === "text") {
      missingTextElements.push(createTextFromPlaceholder(placeholder));
    }

    if (placeholder.type === "image" || placeholder.type === "video") {
      missingMediaElements.push(createMediaFromPlaceholder(placeholder));
    }
  }

  slides[slideIndex] = {
    ...slide,
    "layout-id": layoutId,
    contents: {
      ...slide.contents,
      text: [...updatedText, ...missingTextElements],
      media: [...updatedMedia, ...missingMediaElements],
    },
  };

  return setSlides(presentation, slides);
};

export const propagateLayoutChanges = (
  presentation,
  layoutId,
  updatedPlaceholders,
) => {
  const updateElementFromPlaceholder = (element) => {
    const matchingPlaceholder = updatedPlaceholders.find(
      (placeholder) =>
        placeholder["placeholder-id"] === element["placeholder-id"],
    );

    if (!matchingPlaceholder) return element;

    return {
      ...element,
      position: { ...matchingPlaceholder.position },
      width: matchingPlaceholder.width,
      height: matchingPlaceholder.height,
      background: matchingPlaceholder.background ?? element.background,
    };
  };

  const slides = getSlides(presentation).map((slide) => {
    if (slide["layout-id"] !== layoutId) return slide;

    return {
      ...slide,
      contents: {
        ...slide.contents,
        text: (slide.contents?.text ?? []).map(updateElementFromPlaceholder),
        media: (slide.contents?.media ?? []).map(updateElementFromPlaceholder),
      },
    };
  });

  const updatedLayouts = getLayouts(presentation).map((layout) =>
    layout["layout-id"] === layoutId
      ? { ...layout, placeholders: updatedPlaceholders }
      : layout,
  );

  const presentationWithSlides = setSlides(presentation, slides);

  return setLayouts(presentationWithSlides, updatedLayouts);
};