import { useReducer, useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  createInitialEditorState,
  editorReducer,
  createEventBus,
  EditorEventType,
  createEditorEvent,
} from "../core";
import { idbGet, idbRemove } from "../core/persistence/autoSaveService";
import { updateIndexEntry } from "../core/persistence/presentationsLibrary";

const AUTOSAVE_SETTING_KEY = "autosaveEnabled";

export function useEditorState(presentationId) {
  const storageKey = presentationId
    ? `presentation-${presentationId}`
    : "presentation";

  const [state, reactDispatch] = useReducer(
    editorReducer,
    undefined,
    createInitialEditorState,
  );
  const [isLoading, setIsLoading] = useState(true);

  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  const [eventBus] = useState(() =>
    createEventBus(reactDispatch, () => stateRef.current, { storageKey }),
  );

  useEffect(() => {
    idbGet(storageKey)
      .then((saved) => {
        if (!saved) return;
        const savedAutosaveEnabled = localStorage.getItem(AUTOSAVE_SETTING_KEY);
        const autosaveEnabled =
          savedAutosaveEnabled === null
            ? true
            : savedAutosaveEnabled === "true";
        reactDispatch(
          createEditorEvent(EditorEventType.PRESENTATION.LOAD, {
            jsonString: saved,
            autosaveEnabled,
          }),
        );
      })
      .catch((error) => {
        // Логируем ошибку, но НЕ удаляем данные — пусть пользователь решает
        console.error("[EditorState] Failed to load presentation from IndexedDB:", error);
      })
      .finally(() => setIsLoading(false));
  }, [storageKey]);

  useEffect(() => {
    if (isLoading || !presentationId) return;
    const title =
      state.presentation?.slideset?.title ??
      state.presentation?.slideset?.filename ??
      "Untitled Presentation";
    updateIndexEntry(presentationId, title);
  }, [
    presentationId,
    isLoading,
    state.presentation?.slideset?.title,
    state.presentation?.slideset?.filename,
  ]);

  return { state, eventBus, isLoading };
}
