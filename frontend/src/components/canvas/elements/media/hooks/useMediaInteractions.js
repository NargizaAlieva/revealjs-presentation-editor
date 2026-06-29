import { useCallback, useState } from "react";

export default function useMediaInteractions({
  media,
  isSelected,
  isCropping,
  onSelect,
  onStartDrag,
  onOpenPictureFormat,
  onContextMenu,
  onUpdateMedia,
  startCropElementDrag,
}) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [stylePicker, setStylePicker] = useState(null);
  const [previewStyleId, setPreviewStyleId] = useState(null);

  const handlePlaceholderMouseDown = useCallback(
    (event) => {
      onSelect?.(media.id, { nativeEvent: event });
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
        onStartDrag?.(event, media.id);
      }
    },
    [media.id, onSelect, onStartDrag],
  );

  const handleDoubleClick = useCallback(
    (event) => {
      if (isCropping) return;
      event.stopPropagation();
      onOpenPictureFormat?.(media.id);
    },
    [isCropping, media.id, onOpenPictureFormat],
  );

  const handleMouseDown = useCallback(
    (event) => {
      if (isCropping) {
        startCropElementDrag(event);
        return;
      }
      onSelect(media.id, {
        nativeEvent: event,
        preserveIfSelected:
          isSelected &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey,
      });
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
        onStartDrag(event, media.id);
      }
    },
    [
      isCropping,
      isSelected,
      media.id,
      onSelect,
      onStartDrag,
      startCropElementDrag,
    ],
  );

  const handleContextMenu = useCallback(
    (event) => {
      if (isCropping) return;
      event.preventDefault();
      event.stopPropagation();
      if (onContextMenu) {
        onContextMenu(event, media.id, "media");
      } else {
        setContextMenu({ x: event.clientX, y: event.clientY });
      }
    },
    [isCropping, media.id, onContextMenu],
  );

  const openStylePicker = useCallback(() => {
    setStylePicker(contextMenu);
    setContextMenu(null);
  }, [contextMenu]);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const startVideoPlayback = useCallback((event) => {
    event.stopPropagation();
    setIsPlayingVideo(true);
  }, []);

  const stopVideoPlayback = useCallback(() => setIsPlayingVideo(false), []);

  const selectStyle = useCallback(
    (styleId) => {
      setPreviewStyleId(null);
      onUpdateMedia?.(media.id, {
        effects: { ...media.effects, "style-id": styleId },
      });
    },
    [media.effects, media.id, onUpdateMedia],
  );

  const closeStylePicker = useCallback(() => {
    setPreviewStyleId(null);
    setStylePicker(null);
  }, []);

  return {
    isPlayingVideo,
    contextMenu,
    stylePicker,
    previewStyleId,
    setPreviewStyleId,
    closeContextMenu,
    openStylePicker,
    selectStyle,
    closeStylePicker,
    startVideoPlayback,
    stopVideoPlayback,
    handlePlaceholderMouseDown,
    handleDoubleClick,
    handleMouseDown,
    handleContextMenu,
  };
}
