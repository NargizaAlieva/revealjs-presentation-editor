import { createId, getSlides, setSlides } from "../../utils/presentationUtils";

export const addMedia = (presentation, slideIndex, mediaData) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];

  if (!slide) return presentation;

  const mediaElement = {
    id: mediaData.id ?? createId("media"),
    "file-link": mediaData["file-link"] ?? "",
    "media-type": mediaData["media-type"] ?? "image",
    position: mediaData.position ?? { x: 10, y: 10 },
    width: mediaData.width ?? 300,
    height: mediaData.height ?? 200,
    rotation: mediaData.rotation ?? 0,
    "z-index": mediaData["z-index"] ?? 1,
    scale: mediaData.scale ?? 1,
    crop: mediaData.crop ?? [],
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
      media: (slide.contents?.media ?? []).filter((media) => media.id !== mediaId),
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
        media.id === mediaId ? { ...media, ...updates } : media,
      ),
    },
  };

  return setSlides(presentation, slides);
};

export const rotateMedia = (presentation, slideIndex, mediaId, rotation) =>
  updateMedia(presentation, slideIndex, mediaId, { rotation });