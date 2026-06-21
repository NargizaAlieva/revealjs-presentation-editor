import { getSlides, setSlides } from "../utils/presentationUtils";

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

// Build a new animation model object with sensible defaults.
export const createAnimation = (elementId, effect, sequence) => ({
  id: elementId,
  sequence,
  effect,
  speed: 1,
  "effect-options": { sequence: "as-one-object" },
});

export const getMaxAnimationSequence = (animations) =>
  (animations ?? []).reduce((max, item) => Math.max(max, item.sequence ?? 1), 0);

export const findAnimationForElement = (animations, elementId) =>
  (animations ?? []).find((a) => a.id === elementId) ?? null;

export const getNextAnimationSequence = (animations) =>
  (animations ?? []).length + 1;

export const getAnimationDurationMs = (speed) =>
  speed === 0.5 ? 200 : speed === 2 ? 2200 : 800;

export const reorderAnimation = (animations, animationId, direction) => {
  const list = animations ?? [];
  const item = list.find((a) => a.id === animationId);
  if (!item) return [];
  const currentSeq = item.sequence ?? 1;
  const targetSeq = currentSeq + direction;
  const neighbor = list.find((a) => (a.sequence ?? 1) === targetSeq);
  const updates = [{ id: animationId, sequence: targetSeq }];
  if (neighbor) updates.push({ id: neighbor.id, sequence: currentSeq });
  return updates;
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