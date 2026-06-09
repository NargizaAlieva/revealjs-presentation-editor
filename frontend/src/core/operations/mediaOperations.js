const createId = (prefix = "media") => {
  if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getSlides = (presentation) => presentation?.slideset?.slides ?? [];

const setSlides = (presentation, slides) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    slides,
  },
});

export const addMedia = (presentation, slideIndex, mediaData) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  const mediaElement = {
    id: mediaData.id ?? createId(),
    "file-link": mediaData["file-link"] ?? mediaData.fileLink ?? mediaData.src,
    "media-type": mediaData["media-type"] ?? mediaData.mediaType ?? "image",
    position: mediaData.position ?? { x: 100, y: 100 },
    width: mediaData.width ?? 300,
    height: mediaData.height ?? 200,
    rotation: mediaData.rotation ?? 0,
    "z-index": mediaData["z-index"] ?? mediaData.zIndex ?? 1,
    scale: mediaData.scale ?? 1,
    crop: mediaData.crop ?? null,
    effects: mediaData.effects ?? {},
    playback: mediaData.playback ?? {},
  };

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      media: [...(slide.contents?.media ?? []), mediaElement],
    },
  };

  return setSlides(presentation, slides);
};

export const deleteMedia = (presentation, slideIndex, mediaId) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      media: (slide.contents?.media ?? []).filter(
        (media) => media.id !== mediaId
      ),
    },
  };

  return setSlides(presentation, slides);
};

export const updateMedia = (presentation, slideIndex, mediaId, updates) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      media: (slide.contents?.media ?? []).map((media) =>
        media.id === mediaId ? { ...media, ...updates } : media
      ),
    },
  };

  return setSlides(presentation, slides);
};

export const moveMedia = (presentation, slideIndex, mediaId, newPosition) =>
  updateMedia(presentation, slideIndex, mediaId, {
    position: { x: newPosition.x, y: newPosition.y },
  });

export const resizeMedia = (presentation, slideIndex, mediaId, newSize) =>
  updateMedia(presentation, slideIndex, mediaId, {
    width: newSize.width,
    height: newSize.height,
  });

export const rotateMedia = (presentation, slideIndex, mediaId, rotation) =>
  updateMedia(presentation, slideIndex, mediaId, { rotation });