import { serializePresentation } from "./serializationOperations";
import { updateIndexEntry } from "./presentationsLibrary";
import { setSetting } from "./persistenceFacade";
import { EditorEventType } from "../events/editorEvents";
import { storageAdapter } from "./storageAdapter";

const AUTOSAVE_SETTING_KEY = "autosaveEnabled";

const DEFAULT_STORAGE_KEY = "presentation";
const DEFAULT_AUTOSAVE_DELAY = 2000;
const TEXT_UPDATE_AUTOSAVE_DELAY = 5000;

const AUTO_SAVE_EVENTS = new Set([
  EditorEventType.SLIDE.ADD,
  EditorEventType.SLIDE.DELETE,
  EditorEventType.SLIDE.DUPLICATE,
  EditorEventType.SLIDE.REORDER,
  EditorEventType.SLIDE.TOGGLE_HIDDEN,
  EditorEventType.SLIDE.UPDATE_TRANSITION,
  EditorEventType.SLIDE.UPDATE_NOTES,
  EditorEventType.SLIDE.UPDATE_BACKGROUND,
  EditorEventType.SLIDE.APPLY_TRANSITION_TO_ALL,
  EditorEventType.SLIDE.APPLY_BACKGROUND_TO_ALL,

  EditorEventType.TEXT.ADD,
  EditorEventType.TEXT.UPDATE_CONTENT,
  EditorEventType.TEXT.UPDATE_FORMATTING,
  EditorEventType.TEXT.UPDATE_PARAGRAPH_FORMATTING,
  EditorEventType.TEXT.UPDATE_RANGE_FORMATTING,
  EditorEventType.TEXT.UPDATE_PARAGRAPHS,
  EditorEventType.TEXT.UPDATE_RUN_LINK,
  EditorEventType.TEXT.DELETE,

  EditorEventType.MEDIA.ADD,
  EditorEventType.MEDIA.DELETE,
  EditorEventType.MEDIA.UPDATE,

  EditorEventType.ELEMENT.RESIZE,
  EditorEventType.ELEMENT.UPDATE,
  EditorEventType.ELEMENT.UPDATE_SILENT,
  EditorEventType.ELEMENT.CUT,
  EditorEventType.ELEMENT.PASTE,
  EditorEventType.ELEMENT.DELETE_SELECTION,
  EditorEventType.ELEMENT.UPDATE_MANY,

  EditorEventType.ANIMATION.ADD,
  EditorEventType.ANIMATION.UPDATE,
  EditorEventType.ANIMATION.DELETE,

  EditorEventType.LAYOUT.ADD,
  EditorEventType.LAYOUT.DELETE,
  EditorEventType.LAYOUT.APPLY,
  EditorEventType.LAYOUT.UPDATE_PLACEHOLDERS,
  EditorEventType.LAYOUT.RESET,
  EditorEventType.LAYOUT.RENAME,
  EditorEventType.LAYOUT.ADD_ELEMENT,
  EditorEventType.LAYOUT.DELETE_ELEMENT,
  EditorEventType.LAYOUT.ADD_PLACEHOLDER,
  EditorEventType.LAYOUT.DELETE_PLACEHOLDER,
  EditorEventType.LAYOUT.UPDATE_FONT,
  EditorEventType.LAYOUT.UPDATE_ITEM,
  EditorEventType.LAYOUT.UPDATE_TEXT_FORMATTING,

  EditorEventType.FONT.ADD,
  EditorEventType.FONT.DELETE,

  EditorEventType.MASTER.UPDATE_THEME,
  EditorEventType.MASTER.UPDATE_DIMENSIONS,
  EditorEventType.MASTER.UPDATE_FORMATTING,
  EditorEventType.MASTER.ADD_ELEMENT,
  EditorEventType.MASTER.UPDATE_ITEM,
  EditorEventType.MASTER.DELETE_ELEMENT,
  EditorEventType.MASTER.TOGGLE_TITLE,
  EditorEventType.MASTER.TOGGLE_FOOTERS,

  EditorEventType.COMMENT.ADD,
  EditorEventType.COMMENT.DELETE,

  EditorEventType.HISTORY.CANCEL,
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
  { storageKey = DEFAULT_STORAGE_KEY, delay = DEFAULT_AUTOSAVE_DELAY, onError } = {},
) => {
  let saveQueue = Promise.resolve();

  const persist = () => {
    saveQueue = saveQueue.then(async () => {
      try {
        const state = getState();
        if (!state?.presentation) {
          console.warn("[AutosaveService] No presentation state to save.");
          return;
        }
        const id = storageKey.startsWith("presentation-") ? storageKey.slice("presentation-".length) : storageKey;
        const title = state.presentation?.slideset?.filename ?? "Untitled Presentation";
        await storageAdapter.set(storageKey, serializePresentation(state.presentation));
        await updateIndexEntry(id, title);
        if (process.env.NODE_ENV === "development") {
          console.log("[AutosaveService] Saved.");
        }
      } catch (error) {
        console.error("[AutosaveService] Save failed:", error);
        onError?.(error);
      }
    });
    return saveQueue;
  };

  const scheduleAutosave = createDebounce(persist, delay);
  const scheduleTextAutosave = createDebounce(persist, TEXT_UPDATE_AUTOSAVE_DELAY);
  const saveImmediately = () => persist();
  const shouldAutosave = (eventType) => AUTO_SAVE_EVENTS.has(eventType);

  const schedule = (eventType) => {
    if (eventType === EditorEventType.TEXT.UPDATE_CONTENT) {
      scheduleTextAutosave();
    } else {
      scheduleAutosave();
    }
  };

  const persistAutosaveSetting = (enabled) => {
    try { setSetting(AUTOSAVE_SETTING_KEY, String(enabled)); } catch (e) {
      console.warn("[AutosaveService] Failed to persist autosave setting:", e);
    }
  };

  return { scheduleAutosave: schedule, saveImmediately, shouldAutosave, persistAutosaveSetting };
};
