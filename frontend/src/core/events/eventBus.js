import { EditorEventType } from "../events/editorEvents";
import { createAutosaveService } from "../persistence/autoSaveService";

export const createEventBus = (reactDispatch, getState, { storageKey } = {}) => {
  const autosave = createAutosaveService(getState, { storageKey });

  return {
    async dispatch(event) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[EventBus] → ${event.type}`);
      }

      try {
        reactDispatch(event);

        await new Promise((resolve) => queueMicrotask(resolve));

        if (event.type === EditorEventType.PRESENTATION.TOGGLE_AUTOSAVE) {
          autosave.persistAutosaveSetting(getState()?.autosaveEnabled);
        } else if (event.type === EditorEventType.PRESENTATION.SAVE) {
          autosave.saveImmediately();
        } else {
          const state = getState();
          if (!state) return;

          if (state.autosaveEnabled && autosave.shouldAutosave(event.type)) {
            autosave.scheduleAutosave(event.type);
          }
        }
      } catch (error) {
        console.error(`[EventBus] Failed to dispatch ${event.type}:`, error);
      }
    },
  };
};