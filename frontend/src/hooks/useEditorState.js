import { useReducer, useEffect, useLayoutEffect, useState } from "react";
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

  // React 19 freezes useState values and blocks useRef mutations.
  // Solution: hide the mutable box inside a closure — React only sees the
  // frozen { get, set } object; 'box' is a plain JS closure variable that
  // React never tracks or freezes.
  const [stateAccessor] = useState(() => {
    const box = { state: undefined };
    return {
      get: () => box.state,
      set: (s) => {
        box.state = s;
      },
    };
  });

  // Update the hidden box after every render (calling set() is fine — we're
  // not mutating stateAccessor itself, just calling its frozen method)
  useLayoutEffect(() => {
    stateAccessor.set(state);
  });

  // Create eventBus once; closes over stateAccessor (not a ref), so React 19
  // doesn't flag it.
  const [eventBus] = useState(() =>
    createEventBus(reactDispatch, () => stateAccessor.get(), { storageKey }),
  );

  // Load saved presentation on mount
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
      .catch(() => idbRemove(storageKey))
      .finally(() => setIsLoading(false));
  }, [storageKey]);

  // Keep presentations_index in sync with the current title
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
