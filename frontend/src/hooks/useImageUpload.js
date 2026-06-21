import { useCallback } from "react";
import { storeMediaFile } from "../core/persistence/persistenceFacade";
import { createImageMediaElement } from "../core/operations/mediaOperations";

export function useImageUpload(addMedia) {
  const handleImageUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      const { mediaId, key } = await storeMediaFile(file);
      addMedia(createImageMediaElement(mediaId, key));
      event.target.value = "";
    },
    [addMedia],
  );

  return { handleImageUpload };
}
