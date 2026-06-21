export const DEFAULT_TRANSITION = "none";
export const DEFAULT_TRANSITION_DURATION = 0.75;

export const getSlideTransition = (slide) => ({
  transition: slide?.contents?.transition ?? DEFAULT_TRANSITION,
  duration: slide?.contents?.transitionDuration ?? DEFAULT_TRANSITION_DURATION,
});
