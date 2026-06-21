import { useCallback } from "react";
import { storeMediaFile } from "../core/persistence/persistenceFacade";
import { createVideoMediaElement } from "../core/operations/mediaOperations";

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
