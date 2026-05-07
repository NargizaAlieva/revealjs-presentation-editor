const createId = () => crypto.randomUUID();

const createTextElementFromPlaceholder = (
  placeholder,
  defaultText = ""
) => ({
  id: createId(),

  "placeholder-id": placeholder["placeholder-id"],
  position: {
    ...placeholder.position,
  },

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
      formatting: {
        ...placeholder.formatting,
      },

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

export const createSlideFromLayout = (layout, slideNumber) => {
  const textPlaceholders = layout.placeholders.filter(
    (placeholder) => placeholder.type === "text"
  );

  return {
    title: {
      content: `Slide ${slideNumber}`,
    },

    "layout-id": layout["layout-id"],
    hidden: false,
    contents: {
      text: textPlaceholders.map((placeholder) =>
        createTextElementFromPlaceholder(
          placeholder,
          placeholder.role === "title"
            ? `Slide ${slideNumber}`
            : "Click to edit text"
        )
      ),

      media: [],
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

export const addSlide = (
  presentation,
  layoutId = "title-content"
) => {
  const slideset = presentation.slideset;

  const layout = slideset.layouts.find(
    (item) => item["layout-id"] === layoutId
  );

  if (!layout) {
    throw new Error(`Layout not found: ${layoutId}`);
  }

  const newSlide = createSlideFromLayout(
    layout,
    slideset.slides.length + 1
  );

  return {
    ...presentation,
    slideset: {
      ...slideset,

      slides: [...slideset.slides, newSlide],
    },
  };
};

export const deleteSlide = (
  presentation,
  slideIndex
) => {
  const slides = presentation.slideset.slides;

  if (slides.length <= 1) {
    return presentation;
  }

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,

      slides: slides.filter(
        (_, index) => index !== slideIndex
      ),
    },
  };
};

const cloneTextElementWithNewIds = (textElement) => ({
  ...structuredClone(textElement),

  id: createId(),
  paragraphs: (textElement.paragraphs ?? []).map((paragraph) => ({
    ...structuredClone(paragraph),

    id: createId(),
  })),
});

export const duplicateSlide = (
  presentation,
  slideIndex
) => {
  const slideToDuplicate =
    presentation.slideset.slides[slideIndex];

  if (!slideToDuplicate) {
    return presentation;
  }

  const duplicatedSlide = {
    ...structuredClone(slideToDuplicate),

    title: {
      content: `${
        slideToDuplicate.title?.content ?? "Slide"
      } Copy`,
    },

    contents: {
      ...structuredClone(slideToDuplicate.contents),
      text: (slideToDuplicate.contents.text ?? []).map(
        cloneTextElementWithNewIds
      ),

      media:
        slideToDuplicate.contents.media ?? [],
      shapes:
        slideToDuplicate.contents.shapes ?? [],
      tables:
        slideToDuplicate.contents.tables ?? [],
      groups:
        slideToDuplicate.contents.groups ?? [],
      animations:
        slideToDuplicate.contents.animations ?? [],
    },
  };

  return {
    ...presentation,

    slideset: {
      ...presentation.slideset,

      slides: [
        ...presentation.slideset.slides.slice(
          0,
          slideIndex + 1
        ),

        duplicatedSlide,
        ...presentation.slideset.slides.slice(
          slideIndex + 1
        ),
      ],
    },
  };
};

export const reorderSlides = (
  presentation,
  fromIndex,
  toIndex
) => {
  const slides = [...presentation.slideset.slides];

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

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      slides,
    },
  };
};