import { useReducer, useRef, useMemo, useCallback } from "react";
import {
  createInitialEditorState,
  editorReducer,
  EditorEventType,
  createEditorEvent,
  deserializePresentation,
  createEventBus,
} from "../core";

const STORAGE_KEY = "presentation";

const loadInitialState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createInitialEditorState();

  try {
    const result = deserializePresentation(saved);

    if (!result || !result.data || !result.data.slideset) {
      console.warn(
        "[useSlides] Invalid or outdated data in localStorage, resetting.",
      );
      localStorage.removeItem(STORAGE_KEY);
      return createInitialEditorState();
    }

    if (result.errors.length > 0) {
      console.warn("[useSlides] Loaded with validation errors:", result.errors);
    }

    return {
      ...createInitialEditorState(),
      presentation: result.data,
      selectedSlideIndex: 0,
      selectedElementId: null,
      lastUpdated: Date.now(),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return createInitialEditorState();
  }
};

export function useSlides() {
  const [state, reactDispatch] = useReducer(
    editorReducer,
    undefined,
    loadInitialState,
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const eventBus = useMemo(
    () => createEventBus(reactDispatch, () => stateRef.current),
    [reactDispatch],
  );

  const slides = state.presentation?.slideset?.slides ?? [];
  const selectedSlideIndex = state.selectedSlideIndex ?? 0;
  const selectedSlide = slides[selectedSlideIndex] ?? null;

  const setSelectedSlideId = useCallback(
    (slideIndex) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.SELECT, { slideIndex }),
      ),
    [eventBus],
  );

  const addSlide = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.SLIDE.ADD)),
    [eventBus],
  );

  const deleteSlide = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.SLIDE.DELETE)),
    [eventBus],
  );

  const duplicateSlide = useCallback(
    () => eventBus.dispatch(createEditorEvent(EditorEventType.SLIDE.DUPLICATE)),
    [eventBus],
  );

  const moveSlideUp = useCallback(() => {
    if (selectedSlideIndex <= 0) return;
    eventBus.dispatch(
      createEditorEvent(EditorEventType.SLIDE.REORDER, {
        fromIndex: selectedSlideIndex,
        toIndex: selectedSlideIndex - 1,
      }),
    );
  }, [eventBus, selectedSlideIndex]);

  const moveSlideDown = useCallback(() => {
    if (selectedSlideIndex >= slides.length - 1) return;
    eventBus.dispatch(
      createEditorEvent(EditorEventType.SLIDE.REORDER, {
        fromIndex: selectedSlideIndex,
        toIndex: selectedSlideIndex + 1,
      }),
    );
  }, [eventBus, selectedSlideIndex, slides.length]);

  const toggleSlideHidden = useCallback(
    (slideIndex) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.TOGGLE_HIDDEN, { slideIndex }),
      ),
    [eventBus],
  );

  const updateSlideBackground = useCallback(
    (background) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_BACKGROUND, {
          background,
        }),
      ),
    [eventBus],
  );

  const updateSlideTransition = useCallback(
    (transition) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_TRANSITION, {
          transition,
        }),
      ),
    [eventBus],
  );

  const updateSlideNotes = useCallback(
    (notes) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_NOTES, { notes }),
      ),
    [eventBus],
  );

  const updateTextElementContent = useCallback(
    (textElementId, newText) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.UPDATE_TEXT, {
          textElementId,
          text: newText,
        }),
      ),
    [eventBus],
  );

  const updateTextElementFormatting = useCallback(
    (textElementId, formatting) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.UPDATE_TEXT_FORMATTING, {
          textElementId,
          formatting,
        }),
      ),
    [eventBus],
  );

  const updateTextElementPosition = useCallback(
    (textElementId, x, y) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.MOVE_ELEMENT, {
          elementId: textElementId,
          position: { x, y },
        }),
      ),
    [eventBus],
  );

  const updateTextElementSize = useCallback(
    (textElementId, width, height) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.RESIZE_ELEMENT, {
          elementId: textElementId,
          size: { width, height },
        }),
      ),
    [eventBus],
  );

  const deleteElement = useCallback(
    (elementId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.CONTENT.DELETE_ELEMENT, {
          elementId,
        }),
      ),
    [eventBus],
  );

  const addMedia = useCallback(
    (mediaElement) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.MEDIA.ADD, { mediaElement }),
      ),
    [eventBus],
  );

  const deleteMedia = useCallback(
    (mediaId) =>
      eventBus.dispatch(
        createEditorEvent(EditorEventType.MEDIA.DELETE, { mediaId }),
      ),
    [eventBus],
  );

  const savePresentation = useCallback(
    () =>
      eventBus.dispatch(createEditorEvent(EditorEventType.PRESENTATION.SAVE)),
    [eventBus],
  );

  const resetPresentation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  return {
    presentation: state.presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedSlideId: selectedSlideIndex,
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
