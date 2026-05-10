import { useEffect, useReducer } from "react";

import {
  createInitialEditorState,
  editorReducer,
  EditorEventType,
  createEditorEvent,
  serializePresentation,
  deserializePresentation,
} from "../core";

const STORAGE_KEY = "presentation";

const loadInitialState = () => {
  const savedPresentation = localStorage.getItem(STORAGE_KEY);

  if (!savedPresentation) {
    return createInitialEditorState();
  }

  try {
    const loadedPresentation = deserializePresentation(savedPresentation);

    if (!loadedPresentation) {
      return createInitialEditorState();
    }

    return {
      ...createInitialEditorState(),
      presentation: loadedPresentation,
      selectedSlideIndex: 0,
      selectedElementId: null,
      lastUpdated: Date.now(),
    };
  } catch {
    return createInitialEditorState();
  }
};

export function useSlides() {
  const [state, dispatch] = useReducer(
    editorReducer,
    undefined,
    loadInitialState,
  );

  const slides = state.presentation?.slides ?? [];
  const selectedSlideIndex = state.selectedSlideIndex ?? 0;
  const selectedSlide = slides[selectedSlideIndex] ?? null;

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(
        STORAGE_KEY,
        serializePresentation(state.presentation),
      );
    }, 30000);

    return () => clearInterval(timer);
  }, [state.presentation]);

  const setSelectedSlideId = (slideIndex) => {
    dispatch(
      createEditorEvent(EditorEventType.SLIDE.SELECT, {
        slideIndex,
      }),
    );
  };

  const addSlide = () => {
    dispatch(createEditorEvent(EditorEventType.SLIDE.ADD));
  };

  const deleteSlide = () => {
    dispatch(createEditorEvent(EditorEventType.SLIDE.DELETE));
  };

  const duplicateSlide = () => {
    dispatch(createEditorEvent(EditorEventType.SLIDE.DUPLICATE));
  };

  const moveSlideUp = () => {
    if (selectedSlideIndex <= 0) return;

    dispatch(
      createEditorEvent(EditorEventType.SLIDE.REORDER, {
        fromIndex: selectedSlideIndex,
        toIndex: selectedSlideIndex - 1,
      }),
    );
  };

  const moveSlideDown = () => {
    if (selectedSlideIndex >= slides.length - 1) return;

    dispatch(
      createEditorEvent(EditorEventType.SLIDE.REORDER, {
        fromIndex: selectedSlideIndex,
        toIndex: selectedSlideIndex + 1,
      }),
    );
  };

  const updateTextElementContent = (textElementId, newText) => {
    dispatch(
      createEditorEvent(EditorEventType.CONTENT.UPDATE_TEXT, {
        textElementId,
        text: newText,
      }),
    );
  };

  const updateTextElementPosition = (textElementId, x, y) => {
    dispatch(
      createEditorEvent(EditorEventType.CONTENT.MOVE_ELEMENT, {
        elementId: textElementId,
        position: { x, y },
      }),
    );
  };

  const savePresentation = () => {
    localStorage.setItem(
      STORAGE_KEY,
      serializePresentation(state.presentation),
    );
  };

  const resetPresentation = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

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

    savePresentation,
    resetPresentation,

    updateTextElementContent,
    updateTextElementPosition,
  };
}
