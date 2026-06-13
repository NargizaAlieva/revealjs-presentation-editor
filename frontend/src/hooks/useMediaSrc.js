import { useState, useEffect } from "react";
import { idbGet } from "../core/persistence/autoSaveService";

export function useMediaSrc(fileLink) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!fileLink) return;

    if (!fileLink.startsWith("indexeddb://")) {
      setSrc(fileLink);
      return;
    }

    const key = fileLink.replace("indexeddb://", "");
    let objectUrl = null;

    idbGet(key).then((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      }
    });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileLink]);

  return src;
}