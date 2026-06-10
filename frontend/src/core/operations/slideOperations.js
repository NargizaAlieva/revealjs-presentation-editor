const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getSlides = (presentation) => presentation?.slideset?.slides ?? [];
const getLayouts = (presentation) => presentation?.slideset?.layouts ?? [];

const setSlides = (presentation, slides) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    slides,
  },
});

const createTextElementFromPlaceholder = (placeholder, defaultText = "") => ({
  id: createId(),
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
      id: createId(),
      formatting: { ...(placeholder.formatting ?? {}) },
      bullets: "none",
      runs: [
        {
          formatting: {},
          "super-sub-script": "normal",
          text: defaultText,
          link: null,
        },
      ],
    },
  ],
});

const createMediaElementFromPlaceholder = (placeholder) => ({
  id: createId(),
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

export const createSlideFromLayout = (layout, slideNumber) => {
  const placeholders = layout.placeholders ?? [];

  const textPlaceholders = placeholders.filter(
    (placeholder) => placeholder.type === "text",
  );

  const mediaPlaceholders = placeholders.filter(
    (placeholder) =>
      placeholder.type === "image" || placeholder.type === "video",
  );

  return {
    title: { content: `Slide ${slideNumber}` },
    "layout-id": layout["layout-id"],
    hidden: false,
    contents: {
      text: textPlaceholders.map((placeholder) =>
        createTextElementFromPlaceholder(
          placeholder,
          placeholder.role === "title"
            ? `Slide ${slideNumber}`
            : "Click to edit text",
        ),
      ),
      media: mediaPlaceholders.map(createMediaElementFromPlaceholder),
      shapes: [],
      tables: [],
      groups: [],
      animations: [],
      background: "var(--bg-light)",
      transition: "slide",
      notes: "",
    },
  };
};

export const addSlide = (presentation, layoutId = "title-content") => {
  const layouts = getLayouts(presentation);
  const slides = getSlides(presentation);

  const layout = layouts.find((item) => item["layout-id"] === layoutId);

  if (!layout) {
    throw new Error(`Layout not found: ${layoutId}`);
  }

  const newSlide = createSlideFromLayout(layout, slides.length + 1);

  return setSlides(presentation, [...slides, newSlide]);
};

export const deleteSlide = (presentation, slideIndex) => {
  const slides = getSlides(presentation);

  if (slides.length <= 1) return presentation;

  return setSlides(
    presentation,
    slides.filter((_, index) => index !== slideIndex),
  );
};

const cloneTextElementWithNewIds = (textElement) => ({
  ...structuredClone(textElement),
  id: createId(),
  paragraphs: (textElement.paragraphs ?? []).map((paragraph) => ({
    ...structuredClone(paragraph),
    id: createId(),
  })),
});

const cloneMediaElementWithNewId = (mediaElement) => ({
  ...structuredClone(mediaElement),
  id: createId(),
});

const cloneShapeElementWithNewId = (shapeElement) => ({
  ...structuredClone(shapeElement),
  id: createId(),
});

const cloneTableElementWithNewId = (tableElement) => ({
  ...structuredClone(tableElement),
  id: createId(),
});

const cloneGroupElementWithNewId = (groupElement) => ({
  ...structuredClone(groupElement),
  id: createId(),
});

const cloneAnimationElement = (animationElement) => ({
  ...structuredClone(animationElement),
});

export const duplicateSlide = (presentation, slideIndex) => {
  const slides = getSlides(presentation);
  const slideToDuplicate = slides[slideIndex];

  if (!slideToDuplicate) return presentation;

  const duplicatedSlide = {
    ...structuredClone(slideToDuplicate),
    title: {
      content: `${slideToDuplicate.title?.content ?? "Slide"} Copy`,
    },
    contents: {
      ...structuredClone(slideToDuplicate.contents),
      text: (slideToDuplicate.contents?.text ?? []).map(
        cloneTextElementWithNewIds,
      ),
      media: (slideToDuplicate.contents?.media ?? []).map(
        cloneMediaElementWithNewId,
      ),
      shapes: (slideToDuplicate.contents?.shapes ?? []).map(
        cloneShapeElementWithNewId,
      ),
      tables: (slideToDuplicate.contents?.tables ?? []).map(
        cloneTableElementWithNewId,
      ),
      groups: (slideToDuplicate.contents?.groups ?? []).map(
        cloneGroupElementWithNewId,
      ),
      animations: (slideToDuplicate.contents?.animations ?? []).map(
        cloneAnimationElement,
      ),
    },
  };

  return setSlides(presentation, [
    ...slides.slice(0, slideIndex + 1),
    duplicatedSlide,
    ...slides.slice(slideIndex + 1),
  ]);
};

export const reorderSlides = (presentation, fromIndex, toIndex) => {
  const slides = [...getSlides(presentation)];

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= slides.length ||
    toIndex >= slides.length ||
    fromIndex === toIndex
  ) {
    return presentation;
  }

  const [movedSlide] = slides.splice(fromIndex, 1);
  slides.splice(toIndex, 0, movedSlide);

  return setSlides(presentation, slides);
};