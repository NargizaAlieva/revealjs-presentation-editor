import { createId, getSlides, setSlides } from "../utils/presentationUtils";

// Sentinel value meaning "use the theme background color" (no custom per-slide background)
export const TRANSPARENT_SLIDE_BG = "#FFFFFFFF";

const getLayouts = (presentation) =>
  presentation?.slideset?.layouts ?? [];

const createTextElementFromPlaceholder = (placeholder, defaultText = "") => ({
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
      formatting: {},
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

export const createSlideFromLayout = (layout, slideNumber) => {
  const placeholders = layout.placeholders ?? [];

  const textPlaceholders = placeholders.filter((p) => p.type === "text");
  const mediaPlaceholders = placeholders.filter(
    (p) => p.type === "image" || p.type === "video",
  );

  return {
    title: { content: `Slide ${slideNumber}` },
    "layout-id": layout["layout-id"],
    hidden: false,
    contents: {
      text: textPlaceholders.map((p) =>
        createTextElementFromPlaceholder(
          p,
          p.promptText ?? (p.role === "title" ? "Click to edit Master title style" : "Click to edit text"),
        )
      ),
      media: mediaPlaceholders.map(createMediaElementFromPlaceholder),
      shapes: [],
      tables: [],
      groups: [],
      animations: [],
      background: "#FFFFFFFF",
      transition: "none",
      notes: "",
    },
  };
};

export const addSlide = (presentation, layoutId = "title-content") => {
  const layouts = getLayouts(presentation);
  const slides = getSlides(presentation);

  const layout = layouts.find((l) => l["layout-id"] === layoutId);

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

export const duplicateSlide = (presentation, slideIndex) => {
  const slides = getSlides(presentation);
  const source = slides[slideIndex];

  if (!source) return presentation;

  const idMap = new Map();

  const text = (source.contents?.text ?? []).map((el) => {
    const newId = createId("text");
    idMap.set(el.id, newId);
    return {
      ...structuredClone(el),
      id: newId,
      paragraphs: (el.paragraphs ?? []).map((p) => ({
        ...structuredClone(p),
        id: createId("paragraph"),
      })),
    };
  });

  const media = (source.contents?.media ?? []).map((el) => {
    const newId = createId("media");
    idMap.set(el.id, newId);
    return { ...structuredClone(el), id: newId };
  });

  const duplicated = {
    ...structuredClone(source),
    title: { content: `${source.title?.content ?? "Slide"} Copy` },
    contents: {
      ...structuredClone(source.contents),
      text,
      media,
      shapes: (source.contents?.shapes ?? []).map((el) => ({
        ...structuredClone(el),
        id: createId("shape"),
      })),
      tables: (source.contents?.tables ?? []).map((el) => ({
        ...structuredClone(el),
        id: createId("table"),
      })),
      groups: (source.contents?.groups ?? []).map((el) => ({
        ...structuredClone(el),
        id: createId("group"),
      })),
      animations: (source.contents?.animations ?? [])
        .slice()
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .map((anim, index) => ({
          ...structuredClone(anim),
          id: idMap.get(anim.id) ?? createId("animation"),
          sequence: index + 1,
        })),
    },
  };

  return setSlides(presentation, [
    ...slides.slice(0, slideIndex + 1),
    duplicated,
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

  const [moved] = slides.splice(fromIndex, 1);
  slides.splice(toIndex, 0, moved);

  return setSlides(presentation, slides);
};

export const updateSlideNotes = (presentation, slideIndex, notes) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, notes },
  };

  return setSlides(presentation, slides);
};

export const getSlideCommentCount = (slide) =>
  (slide?.contents?.comments ?? []).length;

export const getSlideCommentCounts = (slides) =>
  (slides ?? []).map(getSlideCommentCount);

export const toggleSlideHidden = (presentation, slideIndex) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  slides[slideIndex] = { ...slide, hidden: !slide.hidden };

  return setSlides(presentation, slides);
};

export const updateSlideTransition = (presentation, slideIndex, transition) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, transition },
  };

  return setSlides(presentation, slides);
};

// Find a text or media element by id within a slide's contents.
export const getSlideElement = (slide, elementId) => {
  if (!elementId || !slide) return null;
  return (
    (slide.contents?.text ?? []).find((e) => e.id === elementId) ||
    (slide.contents?.media ?? []).find((e) => e.id === elementId) ||
    null
  );
};