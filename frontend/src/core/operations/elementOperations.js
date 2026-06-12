const createParagraphId = () =>
  globalThis.crypto?.randomUUID
    ? `paragraph-${globalThis.crypto.randomUUID()}`
    : `paragraph-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getSlides = (presentation) => presentation.slideset?.slides ?? [];

const setSlides = (presentation, slides) => ({
  ...presentation,
  slideset: { ...presentation.slideset, slides },
});

/**
 * Updates the text content of a text element.
 *
 * The editor represents paragraphs as newline-separated lines.
 * On save we split by \n and map each line back to its original paragraph,
 * preserving per-paragraph formatting. Extra lines get the first paragraph's
 * formatting as a template; removed lines are discarded.
 */
export const updateTextElement = (
  presentation,
  slideIndex,
  textElementId,
  newText,
) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const updatedTextElements = (slide.contents?.text ?? []).map((textElement) => {
    if (textElement.id !== textElementId) return textElement;

    const lines = newText.split("\n");
    const existingParagraphs = textElement.paragraphs ?? [];
    const templateFormatting = existingParagraphs[0]?.formatting ?? {};
    const templateRunFormatting = existingParagraphs[0]?.runs?.[0]?.formatting ?? {};

    const updatedParagraphs = lines.map((line, i) => {
      const existing = existingParagraphs[i];
      return {
        id: existing?.id ?? createParagraphId(),
        formatting: existing?.formatting ?? { ...templateFormatting },
        bullets: existing?.bullets ?? "none",
        runs: [
          {
            // Preserve run-level formatting of the first run if it exists.
            formatting: existing?.runs?.[0]?.formatting ?? { ...templateRunFormatting },
            "super-sub-script": existing?.runs?.[0]?.["super-sub-script"] ?? "normal",
            text: line,
            link: existing?.runs?.[0]?.link ?? null,
          },
        ],
      };
    });

    return { ...textElement, paragraphs: updatedParagraphs };
  });

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedTextElements },
  };

  return setSlides(presentation, slides);
};

/**
 * Applies formatting changes to ALL paragraphs of a text element.
 * This ensures that bold/italic/align etc. apply to the whole element,
 * not just the first paragraph.
 */
export const updateTextFormatting = (
  presentation,
  slideIndex,
  textElementId,
  formattingUpdate,
) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const updatedTextElements = (slide.contents?.text ?? []).map((textElement) => {
    if (textElement.id !== textElementId) return textElement;

    const updatedParagraphs = (textElement.paragraphs ?? []).map((paragraph) => ({
      ...paragraph,
      formatting: { ...(paragraph.formatting ?? {}), ...formattingUpdate },
    }));

    return { ...textElement, paragraphs: updatedParagraphs };
  });

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedTextElements },
  };

  return setSlides(presentation, slides);
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

  const updateSize = (element) =>
    element.id === elementId
      ? { ...element, width: newSize.width, height: newSize.height }
      : element;

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
