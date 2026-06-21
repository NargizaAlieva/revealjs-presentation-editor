import { serializePresentation } from "./serializationOperations";
import { updateIndexEntry } from "./presentationsLibrary";
import { EditorEventType } from "../events/editorEvents";
import { storageAdapter } from "./storageAdapter";

const DEFAULT_STORAGE_KEY = "presentation";
const DEFAULT_AUTOSAVE_DELAY = 2000;
// Набор текста сохраняется с увеличенным debounce, чтобы не перегружать IDB
const TEXT_UPDATE_AUTOSAVE_DELAY = 5000;

export const idbSet = (key, value) => storageAdapter.set(key, value);
export const idbGet = (key) => storageAdapter.get(key);
export const idbRemove = (key) => storageAdapter.remove(key);
export const idbGetAllKeys = () => storageAdapter.getAllKeys();
export const idbGetAllPresentationIds = () => storageAdapter.getAllPresentationIds();

const AUTO_SAVE_EVENTS = new Set([
  EditorEventType.SLIDE.ADD,
  EditorEventType.SLIDE.DELETE,
  EditorEventType.SLIDE.DUPLICATE,
  EditorEventType.SLIDE.REORDER,
  EditorEventType.SLIDE.TOGGLE_HIDDEN,
  EditorEventType.SLIDE.UPDATE_TRANSITION,
  EditorEventType.SLIDE.UPDATE_NOTES,

  EditorEventType.TEXT.ADD,
  EditorEventType.TEXT.UPDATE,
  EditorEventType.TEXT.UPDATE_FORMATTING,
  EditorEventType.TEXT.UPDATE_RANGE_FORMATTING,
  EditorEventType.TEXT.UPDATE_PARAGRAPHS,
  EditorEventType.TEXT.DELETE,

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
  EditorEventType.MASTER.TOGGLE_TITLE,
  EditorEventType.MASTER.TOGGLE_FOOTERS,

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
  { storageKey = DEFAULT_STORAGE_KEY, delay = DEFAULT_AUTOSAVE_DELAY } = {},
) => {
  const persist = async () => {
    try {
      const state = getState();
      if (!state?.presentation) {
        console.warn("[AutosaveService] No presentation state to save.");
        return;
      }
      const id = storageKey.replace("presentation-", "");
      const title = state.presentation?.slideset?.filename ?? "Untitled Presentation";
      await storageAdapter.set(storageKey, serializePresentation(state.presentation));
      await updateIndexEntry(id, title);
      if (process.env.NODE_ENV === "development") {
        console.log("[AutosaveService] Saved.");
      }
    } catch (error) {
      console.error("[AutosaveService] Save failed:", error);
    }
  };

  const scheduleAutosave = createDebounce(persist, delay);
  const scheduleTextAutosave = createDebounce(persist, TEXT_UPDATE_AUTOSAVE_DELAY);
  const saveImmediately = () => persist();
  const shouldAutosave = (eventType) => AUTO_SAVE_EVENTS.has(eventType);

  // TEXT.UPDATE использует более длинный debounce, остальные — стандартный
  const schedule = (eventType) => {
    if (eventType === EditorEventType.TEXT.UPDATE) {
      scheduleTextAutosave();
    } else {
      scheduleAutosave();
    }
  };

  return { scheduleAutosave: schedule, saveImmediately, shouldAutosave };
};