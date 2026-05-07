export const updateTextElement = (
  presentation,
  slideIndex,
  textElementId,
  newText
) => {
  const slides = [...presentation.slideset.slides];
  const slide = slides[slideIndex];

  if (!slide) {
    return presentation;
  }

  const updatedTextElements = slide.contents.text.map((textElement) => {
    if (textElement.id !== textElementId) {
      return textElement;
    }

    const updatedParagraphs = [...textElement.paragraphs];

    if (updatedParagraphs.length === 0) {
      return textElement;
    }

    const firstParagraph = {
      ...updatedParagraphs[0],
    };

    const updatedRuns = [...firstParagraph.runs];

    if (updatedRuns.length === 0) {
      return textElement;
    }

    updatedRuns[0] = {
      ...updatedRuns[0],
      text: newText,
    };

    firstParagraph.runs = updatedRuns;

    updatedParagraphs[0] = firstParagraph;

    return {
      ...textElement,
      paragraphs: updatedParagraphs,
    };
  });

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      text: updatedTextElements,
    },
  };

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      slides,
    },
  };
};