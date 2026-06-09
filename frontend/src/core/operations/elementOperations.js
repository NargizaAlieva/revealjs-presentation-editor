const getSlides = (presentation) => presentation.slideset?.slides ?? [];

const setSlides = (presentation, slides) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    slides,
  },
});

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

    const updatedParagraphs = [...(textElement.paragraphs ?? [])];
    if (updatedParagraphs.length === 0) return textElement;

    const firstParagraph = { ...updatedParagraphs[0] };
    const updatedRuns = [...(firstParagraph.runs ?? [])];
    if (updatedRuns.length === 0) return textElement;

    updatedRuns[0] = { ...updatedRuns[0], text: newText };
    firstParagraph.runs = updatedRuns;
    updatedParagraphs[0] = firstParagraph;

    return { ...textElement, paragraphs: updatedParagraphs };
  });

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedTextElements },
  };

  return setSlides(presentation, slides);
};

export const moveElement = (
  presentation,
  slideIndex,
  elementId,
  newPosition,
) => {
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

export const resizeElement = (
  presentation,
  slideIndex,
  elementId,
  newSize,
) => {
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

    const updatedParagraphs = [...(textElement.paragraphs ?? [])];
    if (updatedParagraphs.length === 0) return textElement;

    updatedParagraphs[0] = {
      ...updatedParagraphs[0],
      formatting: {
        ...(updatedParagraphs[0].formatting ?? {}),
        ...formattingUpdate,
      },
    };

    return { ...textElement, paragraphs: updatedParagraphs };
  });

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedTextElements },
  };

  return setSlides(presentation, slides);
};