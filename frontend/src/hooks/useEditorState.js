import { useReducer, useRef, useMemo, useEffect, useState } from "react";
import {
  createInitialEditorState,
  editorReducer,
  createEventBus,
  EditorEventType,
  createEditorEvent,
} from "../core";
import { idbGet, idbRemove } from "../core/persistence/autoSaveService";

const STORAGE_KEY = "presentation";
const AUTOSAVE_SETTING_KEY = "autosaveEnabled";

export function useEditorState() {
  const [state, reactDispatch] = useReducer(
    editorReducer,
    undefined,
    createInitialEditorState,
  );
  const [isLoading, setIsLoading] = useState(true);

  const stateRef = useRef(state);
  stateRef.current = state;

  const eventBus = useMemo(
    () => createEventBus(reactDispatch, () => stateRef.current),
    [],
  );

  useEffect(() => {
    idbGet(STORAGE_KEY)
      .then((saved) => {
        if (!saved) return;

        const savedAutosaveEnabled = localStorage.getItem(AUTOSAVE_SETTING_KEY);
        const autosaveEnabled =
          savedAutosaveEnabled === null ? true : savedAutosaveEnabled === "true";

        reactDispatch(
          createEditorEvent(EditorEventType.PRESENTATION.LOAD, {
            jsonString: saved,
            autosaveEnabled,
          }),
        );
      })
      .catch(() => {
        idbRemove(STORAGE_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { state, eventBus, isLoading };
}