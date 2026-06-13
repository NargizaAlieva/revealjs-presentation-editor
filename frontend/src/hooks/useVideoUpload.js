import { useCallback } from "react";
import { idbSet } from "../core/persistence/autoSaveService";

export function useVideoUpload(addMedia) {
  const handleVideoUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith("video/")) return;

      const mediaId = crypto.randomUUID();
      const key = `media/${mediaId}`;

      await idbSet(key, file);

      addMedia({
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

      event.target.value = "";
    },
    [addMedia],
  );

  return { handleVideoUpload };
}
