import { useCallback } from "react";
import { storeMediaFile } from "../core/persistence/mediaStorage";
import { createVideoMediaElement } from "../core/model/mediaDefaults";

export function useVideoUpload(addMedia) {
  const handleVideoUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith("video/")) return;

      const { mediaId, key } = await storeMediaFile(file);
      addMedia(createVideoMediaElement(mediaId, key));
      event.target.value = "";
    },
    [addMedia],
  );

  return { handleVideoUpload };
}
