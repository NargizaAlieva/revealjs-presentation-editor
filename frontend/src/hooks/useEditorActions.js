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
    (layoutId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.ADD, { layoutId })
      ),
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
        createEditorEvent(EditorEventType.TEXT.UPDATE, {
          textElementId,
          text: newText,
        })
      ),
    [eventBus]
  );

  const updateTextElementFormatting = useCallback(
    (textElementId, formatting) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.TEXT.UPDATE_FORMATTING, {
          textElementId,
          formatting,
        })
      ),
    [eventBus]
  );

  const deleteElement = useCallback(
    (elementId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.TEXT.DELETE, { elementId })
      ),
    [eventBus]
  );

  const selectElement = useCallback(
    (elementId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.ELEMENT.SELECT, { elementId })
      ),
    [eventBus]
  );

  const updateElementPosition = useCallback(
    (elementId, x, y) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.ELEMENT.MOVE, {
          elementId,
          position: { x, y },
        })
      ),
    [eventBus]
  );

  const updateElementSize = useCallback(
    (elementId, width, height) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.ELEMENT.RESIZE, {
          elementId,
          size: { width, height },
        })
      ),
    [eventBus]
  );

  const updateElement = useCallback(
    (elementId, updates) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.ELEMENT.UPDATE, {
          elementId,
          updates,
        })
      ),
    [eventBus]
  );

  const addAnimation = useCallback(
    (animation) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.ANIMATION.ADD, { animation })
      ),
    [eventBus]
  );

  const updateAnimation = useCallback(
    (animationId, updates) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.ANIMATION.UPDATE, {
          animationId,
          updates,
        })
      ),
    [eventBus]
  );

  const deleteAnimation = useCallback(
    (animationId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.ANIMATION.DELETE, { animationId })
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

  const updateMedia = useCallback(
    (mediaId, updates) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.MEDIA.UPDATE, { mediaId, updates })
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

  const updateMasterTheme = useCallback(
    (colorTheme) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.MASTER.UPDATE_THEME, { colorTheme })
      ),
    [eventBus]
  );

  const updateMasterDimensions = useCallback(
    (slideDimensions, aspectRatio, dimensionUnits) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.MASTER.UPDATE_DIMENSIONS, {
          slideDimensions,
          aspectRatio,
          dimensionUnits,
        })
      ),
    [eventBus]
  );

  const updateMasterFormatting = useCallback(
    (formatting) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.MASTER.UPDATE_FORMATTING, { formatting })
      ),
    [eventBus]
  );

  const updateLayout = useCallback(
    (layoutId, placeholders) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.LAYOUT.UPDATE, {
          layoutId,
          placeholders,
        })
      ),
    [eventBus]
  );

  const applyLayout = useCallback(
    (layoutId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.LAYOUT.APPLY, { layoutId })
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

  const undo = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.HISTORY.UNDO)),
    [eventBus]
  );

  const redo = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.HISTORY.REDO)),
    [eventBus]
  );

  // const commitMoveElement = useCallback(
  //   (beforeSnapshot) =>
  //     eventBus.dispatch(
  //       createEditorEvent(EditorEventType.ELEMENT.MOVE_COMMIT, { beforeSnapshot })
  //     ),
  //   [eventBus]
  // );

  // const commitResizeElement = useCallback(
  //   (beforeSnapshot) =>
  //     eventBus.dispatch(
  //       createEditorEvent(EditorEventType.ELEMENT.RESIZE_COMMIT, { beforeSnapshot })
  //     ),
  //   [eventBus]
  // );

  // const commitTextUpdate = useCallback(
  //   (beforeSnapshot) =>
  //     eventBus.dispatch(
  //       createEditorEvent(EditorEventType.TEXT.UPDATE_COMMIT, { beforeSnapshot })
  //     ),
  //   [eventBus]
  // );

  // const commitMediaUpdate = useCallback(
  //   (beforeSnapshot) =>
  //     eventBus.dispatch(
  //       createEditorEvent(EditorEventType.MEDIA.UPDATE_COMMIT, { beforeSnapshot })
  //     ),
  //   [eventBus]
  // );

  const beginHistory = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.HISTORY.BEGIN)),
    [eventBus]
  );

  const commitHistory = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.HISTORY.COMMIT)),
    [eventBus]
  );

  const cancelHistory = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.HISTORY.CANCEL)),
    [eventBus]
  );

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
    selectElement,
    updateTextElementContent,
    updateTextElementFormatting,
    updateElementPosition,
    updateElementSize,
    updateElement,
    deleteElement,
    addMedia,
    updateMedia,
    deleteMedia,
    addAnimation,
    updateAnimation,
    deleteAnimation,
    updateMasterTheme,
    updateMasterDimensions,
    updateMasterFormatting,
    updateLayout,
    applyLayout,
    savePresentation,
    resetPresentation,
    undo,
    redo,
    // commitMoveElement,
    // commitResizeElement,
    // commitTextUpdate,
    // commitMediaUpdate,
    beginHistory,
    commitHistory,
    cancelHistory,
  };
}