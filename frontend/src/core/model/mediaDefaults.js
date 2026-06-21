export const createImageMediaElement = (mediaId, key) => ({
  id: mediaId,
  "file-link": `indexeddb://${key}`,
  "media-type": "image",
  position: { x: 60, y: 60 },
  width: 300,
  height: 200,
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
