import { useCallback } from "react";
import { storeMediaFile } from "../core/persistence/persistenceFacade";
import { createImageMediaElement } from "../core/operations/mediaOperations";

function readImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 300, height: 200 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function fitToSlide(width, height, slideWidth, slideHeight) {
  const maxW = slideWidth * 0.3;
  const maxH = slideHeight * 0.3;
  if (width <= maxW && height <= maxH) return { width, height };
  const scale = Math.min(maxW / width, maxH / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function useImageUpload(addMedia, slideWidth = 960, slideHeight = 700) {
  const handleImageUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      const [{ mediaId, key }, dims] = await Promise.all([
        storeMediaFile(file),
        readImageDimensions(file),
      ]);
      const scaledDims = fitToSlide(dims.width, dims.height, slideWidth, slideHeight);
      addMedia(createImageMediaElement(mediaId, key, scaledDims));
      event.target.value = "";
    },
    [addMedia, slideWidth, slideHeight],
  );

  return { handleImageUpload };
}
