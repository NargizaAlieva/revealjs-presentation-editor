import { useCallback } from "react";
import {
  EditorEventType,
  createEditorEvent,
} from "../core";

const STORAGE_KEY = "presentation";

export function useEditorActions(eventBus, selectedSlideIndex, slidesLength) {
  const setSelectedSlideId = useCallback(
    (slideIndex) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.SELECT, { slideIndex })
      ),
    [eventBus]
  );

  const addSlide = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.SLIDE.ADD)),
    [eventBus]
  );

  const deleteSlide = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.SLIDE.DELETE)),
    [eventBus]
  );

  const duplicateSlide = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.SLIDE.DUPLICATE)),
    [eventBus]
  );

  const moveSlideUp = useCallback(() => {
    if (selectedSlideIndex <= 0) return;

    eventBus.dispatch(
      createEditorEvent(EditorEventType.SLIDE.REORDER, {
        fromIndex: selectedSlideIndex,
        toIndex: selectedSlideIndex - 1,
      })
    );
  }, [eventBus, selectedSlideIndex]);

  const moveSlideDown = useCallback(() => {
    if (selectedSlideIndex >= slidesLength - 1) return;

    eventBus.dispatch(
      createEditorEvent(EditorEventType.SLIDE.REORDER, {
        fromIndex: selectedSlideIndex,
        toIndex: selectedSlideIndex + 1,
      })
    );
  }, [eventBus, selectedSlideIndex, slidesLength]);

  const toggleSlideHidden = useCallback(
    (slideIndex) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.TOGGLE_HIDDEN, { slideIndex })
      ),
    [eventBus]
  );

  const updateSlideBackground = useCallback(
    (background) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_BACKGROUND, { background })
      ),
    [eventBus]
  );

  const updateSlideTransition = useCallback(
    (transition) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_TRANSITION, { transition })
      ),
    [eventBus]
  );

  const updateSlideNotes = useCallback(
    (notes) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_NOTES, { notes })
      ),
    [eventBus]
  );

  const updateTextElementContent = useCallback(
    (textElementId, newText) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.UPDATE_TEXT, {
          textElementId,
          text: newText,
        })
      ),
    [eventBus]
  );

  const updateTextElementFormatting = useCallback(
    (textElementId, formatting) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.UPDATE_TEXT_FORMATTING, {
          textElementId,
          formatting,
        })
      ),
    [eventBus]
  );

  const updateTextElementPosition = useCallback(
    (textElementId, x, y) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.MOVE_ELEMENT, {
          elementId: textElementId,
          position: { x, y },
        })
      ),
    [eventBus]
  );

  const updateTextElementSize = useCallback(
    (textElementId, width, height) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.RESIZE_ELEMENT, {
          elementId: textElementId,
          size: { width, height },
        })
      ),
    [eventBus]
  );

  const deleteElement = useCallback(
    (elementId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.DELETE_ELEMENT, { elementId })
      ),
    [eventBus]
  );

  const addMedia = useCallback(
    (mediaElement) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.MEDIA.ADD, { mediaElement })
      ),
    [eventBus]
  );

  const deleteMedia = useCallback(
    (mediaId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.MEDIA.DELETE, { mediaId })
      ),
    [eventBus]
  );

  const savePresentation = useCallback(
    () =>
      eventBus.dispatch(createEditorEvent(EditorEventType.PRESENTATION.SAVE)),
    [eventBus]
  );

  const resetPresentation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  return {
    setSelectedSlideId,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlideUp,
    moveSlideDown,
    toggleSlideHidden,
    updateSlideBackground,
    updateSlideTransition,
    updateSlideNotes,
    savePresentation,
    resetPresentation,
    updateTextElementContent,
    updateTextElementFormatting,
    updateTextElementPosition,
    updateTextElementSize,
    deleteElement,
    addMedia,
    deleteMedia,
  };
}