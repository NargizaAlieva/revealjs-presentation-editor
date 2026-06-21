export const DEFAULT_TRANSITION = "none";
export const DEFAULT_TRANSITION_DURATION = 0.75;

export const getSlideTransition = (slide) => ({
  transition: slide?.contents?.transition ?? DEFAULT_TRANSITION,
  duration: slide?.contents?.transitionDuration ?? DEFAULT_TRANSITION_DURATION,
});

export const TRANSITIONS = [
  { value: "none",    label: "None" },
  { value: "fade",    label: "Fade" },
  { value: "slide",   label: "Slide" },
  { value: "convex",  label: "Convex" },
  { value: "concave", label: "Concave" },
  { value: "zoom",    label: "Zoom" },
];

export const TRANSITION_SPEEDS = [
  { value: 0.3,  label: "Fast" },
  { value: 0.75, label: "Medium" },
  { value: 1.5,  label: "Slow" },
];

export const PREVIEW_TRANSITION_MS = 900;
