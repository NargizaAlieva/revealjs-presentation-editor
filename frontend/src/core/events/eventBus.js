import { serializePresentation } from "../export/serializationOperations";
import { EditorEventType } from "../events/editorEvents";

const STORAGE_KEY = "presentation";

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

const AUTO_SAVE_EVENTS = new Set([
  // Slide structure
  EditorEventType.SLIDE.ADD,
  EditorEventType.SLIDE.DELETE,
  EditorEventType.SLIDE.DUPLICATE,
  EditorEventType.SLIDE.REORDER,
  EditorEventType.SLIDE.TOGGLE_HIDDEN,
  EditorEventType.SLIDE.UPDATE_BACKGROUND,
  EditorEventType.SLIDE.UPDATE_TRANSITION,
  EditorEventType.SLIDE.UPDATE_NOTES,
  // Content
  EditorEventType.CONTENT.ADD_TEXT,
  EditorEventType.CONTENT.UPDATE_TEXT,
  EditorEventType.CONTENT.UPDATE_TEXT_FORMATTING,
  EditorEventType.CONTENT.DELETE_ELEMENT,
  EditorEventType.CONTENT.MOVE_ELEMENT,
  EditorEventType.CONTENT.RESIZE_ELEMENT,
  // Media
  EditorEventType.MEDIA.ADD,
  EditorEventType.MEDIA.DELETE,
  EditorEventType.MEDIA.UPDATE,
  // Layout
  EditorEventType.LAYOUT.APPLY,
  EditorEventType.LAYOUT.UPDATE,
  // Master
  EditorEventType.MASTER.UPDATE_THEME,
  EditorEventType.MASTER.UPDATE_DIMENSIONS,
  EditorEventType.MASTER.UPDATE_FORMATTING,
  // Presentation metadata
  EditorEventType.PRESENTATION.UPDATE,
]);

export const createEventBus = (reactDispatch, getState) => {
  const scheduleAutosave = createDebounce(() => {
    const state = getState();
    localStorage.setItem(STORAGE_KEY, serializePresentation(state.presentation));
    console.log("[EventBus] Autosave completed");
  }, 2000);

  const saveImmediately = () => {
    const state = getState();
    localStorage.setItem(STORAGE_KEY, serializePresentation(state.presentation));
    console.log("[EventBus] Manual save completed");
  };

  return {
    async dispatch(event) {
      console.log(`[EventBus] → ${event.type} at ${Date.now()}`);

      reactDispatch(event);
      console.log(`[EventBus] State updated at ${Date.now()}`);

      await new Promise((resolve) => setTimeout(resolve, 0));
      console.log(`[EventBus] After async yield at ${Date.now()}`);

      if (event.type === EditorEventType.PRESENTATION.SAVE) {
        saveImmediately();
      } else if (AUTO_SAVE_EVENTS.has(event.type)) {
        scheduleAutosave();
        console.log(`[EventBus] Autosave scheduled at ${Date.now()}`);
      }
    },
  };
};