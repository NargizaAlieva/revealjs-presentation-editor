import { createId, getSlides, setSlides } from "../utils/presentationUtils";

export const computeCropOrigin = (media) => {
  const [ct = 0, cr = 0, cb = 0, cl = 0] =
    media.crop?.length === 4 ? media.crop : [0, 0, 0, 0];
  const W = media.width ?? 300;
  const H = media.height ?? 200;
  const srcW = media["source-width"] ?? W / Math.max(0.01, 1 - cl / 100 - cr / 100);
  const srcH = media["source-height"] ?? H / Math.max(0.01, 1 - ct / 100 - cb / 100);
  const fullX = (media.position?.x ?? 0) - (cl / 100) * srcW;
  const fullY = (media.position?.y ?? 0) - (ct / 100) * srcH;
  return { fullX, fullY, srcW, srcH, initialCrop: [ct, cr, cb, cl] };
};

export const computeCropResult = (crop, cropOrigin) => {
  const [ct, cr, cb, cl] = crop;
  const { fullX, fullY, srcW, srcH } = cropOrigin;
  const x1n = (cl / 100) * srcW, x2n = srcW - (cr / 100) * srcW;
  const y1n = (ct / 100) * srcH, y2n = srcH - (cb / 100) * srcH;
  const winX1 = Math.min(x1n, x2n), winX2 = Math.max(x1n, x2n);
  const winY1 = Math.min(y1n, y2n), winY2 = Math.max(y1n, y2n);
  return {
    crop: [winY1 / srcH * 100, (srcW - winX2) / srcW * 100, (srcH - winY2) / srcH * 100, winX1 / srcW * 100],
    position: { x: fullX + winX1, y: fullY + winY1 },
    width: Math.max(1, winX2 - winX1),
    height: Math.max(1, winY2 - winY1),
    "source-width": srcW,
    "source-height": srcH,
  };
};

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
    opacity: mediaData.opacity ?? 1,
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
