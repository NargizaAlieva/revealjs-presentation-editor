import { getSlides, setSlides } from "../../utils/presentationUtils";

export const addAnimation = (presentation, slideIndex, animation) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      animations: [
        ...(slide.contents?.animations ?? []),
        animation,
      ],
    },
  };

  return setSlides(presentation, slides);
};

export const updateAnimation = (presentation, slideIndex, animationId, updates) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      animations: (slide.contents?.animations ?? []).map((animation) =>
        animation.id === animationId
          ? { ...animation, ...updates }
          : animation
      ),
    },
  };

  return setSlides(presentation, slides);
};

export const deleteAnimation = (presentation, slideIndex, animationId) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      animations: (slide.contents?.animations ?? [])
        .filter((animation) => animation.id !== animationId)
        .map((animation, index) => ({ ...animation, sequence: index + 1 })),
    },
  };

  return setSlides(presentation, slides);
};