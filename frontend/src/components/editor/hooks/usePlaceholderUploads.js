import { useCallback, useRef } from "react";

export default function usePlaceholderUploads({
  onImageUpload,
  onVideoUpload,
}) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const uploadTargetRef = useRef(null);

  const requestImageUpload = useCallback((element) => {
    uploadTargetRef.current = element;
    imageInputRef.current?.click();
  }, []);

  const requestVideoUpload = useCallback((element) => {
    uploadTargetRef.current = element;
    videoInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) onImageUpload?.(uploadTargetRef.current, file);
      uploadTargetRef.current = null;
      event.target.value = "";
    },
    [onImageUpload],
  );

  const handleVideoChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) onVideoUpload?.(uploadTargetRef.current, file);
      uploadTargetRef.current = null;
      event.target.value = "";
    },
    [onVideoUpload],
  );

  return {
    imageInputRef,
    videoInputRef,
    requestImageUpload,
    requestVideoUpload,
    handleImageChange,
    handleVideoChange,
  };
}
