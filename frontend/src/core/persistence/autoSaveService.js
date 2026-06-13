import { serializePresentation } from "./serializationOperations";
import { EditorEventType } from "../events/editorEvents";

const DEFAULT_STORAGE_KEY = "presentation";
const DEFAULT_AUTOSAVE_DELAY = 2000;

const AUTO_SAVE_EVENTS = new Set([
  EditorEventType.SLIDE.ADD,
  EditorEventType.SLIDE.DELETE,
  EditorEventType.SLIDE.DUPLICATE,
  EditorEventType.SLIDE.REORDER,
  EditorEventType.SLIDE.TOGGLE_HIDDEN,
  EditorEventType.SLIDE.UPDATE_TRANSITION,
  EditorEventType.SLIDE.UPDATE_NOTES,

  EditorEventType.TEXT.ADD,
  EditorEventType.TEXT.UPDATE_COMMIT,
  EditorEventType.TEXT.UPDATE_FORMATTING,
  EditorEventType.TEXT.DELETE,

  EditorEventType.ELEMENT.DELETE,
  EditorEventType.ELEMENT.MOVE_COMMIT,
  EditorEventType.ELEMENT.RESIZE_COMMIT,

  EditorEventType.MEDIA.ADD,
  EditorEventType.MEDIA.DELETE,
  EditorEventType.MEDIA.UPDATE,

  EditorEventType.ANIMATION.ADD,
  EditorEventType.ANIMATION.UPDATE,
  EditorEventType.ANIMATION.DELETE,

  EditorEventType.LAYOUT.APPLY,
  EditorEventType.LAYOUT.UPDATE,

  EditorEventType.MASTER.UPDATE_THEME,
  EditorEventType.MASTER.UPDATE_DIMENSIONS,
  EditorEventType.MASTER.UPDATE_FORMATTING,

  EditorEventType.PRESENTATION.UPDATE,

  EditorEventType.HISTORY.UNDO,
  EditorEventType.HISTORY.REDO,
]);

const createDebounce = (fn, delay) => {
  let timer = null;

  return () => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn();
      timer = null;
    }, delay);
  };
};

export const createAutosaveService = (
  getState,
  {
    storageKey = DEFAULT_STORAGE_KEY,
    delay = DEFAULT_AUTOSAVE_DELAY,
  } = {},
) => {
  const persist = () => {
    try {
      const state = getState();

      if (!state?.presentation) {
        console.warn("[AutosaveService] No presentation state to save.");
        return;
      }

      localStorage.setItem(
        storageKey,
        serializePresentation(state.presentation),
      );

      if (process.env.NODE_ENV === "development") {
        console.log("[AutosaveService] Saved.");
      }
    } catch (error) {
      console.error("[AutosaveService] Save failed:", error);
    }
  };

  const scheduleAutosave = createDebounce(persist, delay);
  const saveImmediately = () => persist();
  const shouldAutosave = (eventType) => AUTO_SAVE_EVENTS.has(eventType);

  return {
    scheduleAutosave,
    saveImmediately,
    shouldAutosave,
  };
};