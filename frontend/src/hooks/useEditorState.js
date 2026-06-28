import { useReducer, useEffect, useLayoutEffect, useState, useRef } from "react";
import { createInitialEditorState, editorReducer } from "../core/store/editorStore";
import { createEventBus } from "../core/events/eventBus";
import { EditorEventType, createEditorEvent } from "../core/events/editorEvents";
import { storageGet, updateIndexEntry, getSetting } from "../core/persistence/persistenceFacade";

const AUTOSAVE_SETTING_KEY = "autosaveEnabled";

export function useEditorState(presentationId, { onSaveError } = {}) {
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
    createEventBus(reactDispatch, () => stateRef.current, {
      storageKey,
      onSaveError: onSaveError ?? ((err) => console.error("[EditorState] Autosave failed:", err)),
    }),
  );

  useEffect(() => {
    let cancelled = false;
    storageGet(storageKey)
      .then((saved) => {
        if (cancelled || !saved) return;
        const raw = getSetting(AUTOSAVE_SETTING_KEY);
        const autosaveEnabled = raw === null ? true : raw === "true";
        reactDispatch(
          createEditorEvent(EditorEventType.PRESENTATION.LOAD, {
            jsonString: saved,
            autosaveEnabled,
          }),
        );
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("[EditorState] Failed to load presentation from IndexedDB:", error);
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
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
