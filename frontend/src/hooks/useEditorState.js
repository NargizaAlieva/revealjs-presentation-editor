import { useReducer, useRef, useMemo } from "react";
import {
  createInitialEditorState,
  editorReducer,
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
      console.warn("[useEditorState] Invalid or outdated data in localStorage, resetting.");
      localStorage.removeItem(STORAGE_KEY);
      return createInitialEditorState();
    }

    if (result.errors.length > 0) {
      console.warn("[useEditorState] Loaded with validation errors:", result.errors);
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

export function useEditorState() {
  const [state, reactDispatch] = useReducer(
    editorReducer,
    undefined,
    loadInitialState
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const eventBus = useMemo(
    () => createEventBus(reactDispatch, () => stateRef.current),
    []
  );

  return {
    state,
    eventBus,
  };
}