import { useCallback } from "react";
import { idbSet } from "../core/persistence/autoSaveService";

export function useImageUpload(addMedia) {
  const handleImageUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      const mediaId = crypto.randomUUID();
      const key = `media/${mediaId}`;

      await idbSet(key, file);

      addMedia({
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

      event.target.value = "";
    },
    [addMedia],
  );

  return { handleImageUpload };
}