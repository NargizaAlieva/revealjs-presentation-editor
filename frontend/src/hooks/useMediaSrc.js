import { useEffect, useState } from "react";
import { idbGet } from "../core/persistence/autoSaveService";

export function useMediaSrc(fileLink) {
  const [src, setSrc] = useState(() => {
    if (!fileLink) return null;
    if (!fileLink.startsWith("indexeddb://")) return fileLink;
    return null;
  });

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    if (!fileLink) {
      setSrc(null);
      return;
    }

    if (!fileLink.startsWith("indexeddb://")) {
      setSrc(fileLink);
      return;
    }

    const key = fileLink.replace("indexeddb://", "");

    idbGet(key).then((blob) => {
      if (cancelled || !blob) return;

      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    });

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileLink]);

  return src;
}
