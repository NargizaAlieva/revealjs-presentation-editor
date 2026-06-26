import { createId, getSlides, setSlides } from "../utils/presentationUtils";

export const createImageMediaElement = (mediaId, key, { width = 300, height = 200 } = {}) => ({
  id: mediaId,
  "file-link": `indexeddb://${key}`,
  "media-type": "image",
  position: { x: 60, y: 60 },
  width,
  height,
  "source-width": width,
  "source-height": height,
  rotation: 0,
  "z-index": 1,
  scale: 1,
  crop: [],
  effects: {},
  playback: {},
});

export const createVideoMediaElement = (mediaId, key) => ({
  id: mediaId,
  "file-link": `indexeddb://${key}`,
  "media-type": "video",
  position: { x: 60, y: 60 },
  width: 480,
  height: 270,
  rotation: 0,
  "z-index": 1,
  scale: 1,
  crop: [],
  effects: {},
  playback: { autoplay: false, loop: false, muted: false },
});

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
    ...(mediaData["source-width"] != null ? { "source-width": mediaData["source-width"] } : {}),
    ...(mediaData["source-height"] != null ? { "source-height": mediaData["source-height"] } : {}),
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
