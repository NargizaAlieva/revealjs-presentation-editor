import { serializePresentation } from "../export/serializationOperations";
import { EditorEventType } from "../events/editorEvents";

const DEFAULT_STORAGE_KEY = "presentation";
const DEFAULT_AUTOSAVE_DELAY = 2000;

const AUTO_SAVE_EVENTS = new Set([
  EditorEventType.SLIDE.ADD,
  EditorEventType.SLIDE.DELETE,
  EditorEventType.SLIDE.DUPLICATE,
  EditorEventType.SLIDE.REORDER,
  EditorEventType.SLIDE.TOGGLE_HIDDEN,
  EditorEventType.SLIDE.UPDATE_BACKGROUND,
  EditorEventType.SLIDE.UPDATE_TRANSITION,
  EditorEventType.SLIDE.UPDATE_NOTES,

  EditorEventType.CONTENT.ADD_TEXT,
  EditorEventType.CONTENT.UPDATE_TEXT,
  EditorEventType.CONTENT.UPDATE_TEXT_FORMATTING,
  EditorEventType.CONTENT.DELETE_ELEMENT,
  EditorEventType.CONTENT.MOVE_ELEMENT,
  EditorEventType.CONTENT.RESIZE_ELEMENT,

  EditorEventType.MEDIA.ADD,
  EditorEventType.MEDIA.DELETE,
  EditorEventType.MEDIA.UPDATE,

  EditorEventType.LAYOUT.APPLY,
  EditorEventType.LAYOUT.UPDATE,

  EditorEventType.MASTER.UPDATE_THEME,
  EditorEventType.MASTER.UPDATE_DIMENSIONS,
  EditorEventType.MASTER.UPDATE_FORMATTING,

  EditorEventType.PRESENTATION.UPDATE,
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
  } = {}
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
        serializePresentation(state.presentation)
      );

      console.log("[AutosaveService] Autosave completed");
    } catch (error) {
      console.error("[AutosaveService] Autosave failed:", error);
    }
  };

  const scheduleAutosave = createDebounce(persist, delay);

  const saveImmediately = () => {
    persist();
    console.log("[AutosaveService] Manual save completed");
  };

  const shouldAutosave = (eventType) => AUTO_SAVE_EVENTS.has(eventType);

  return {
    scheduleAutosave,
    saveImmediately,
    shouldAutosave,
  };
};