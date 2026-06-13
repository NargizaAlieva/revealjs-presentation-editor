import { EditorEventType } from "../events/editorEvents";
import { createAutosaveService } from "../persistence/autoSaveService";

export const createEventBus = (reactDispatch, getState) => {
  const autosave = createAutosaveService(getState);

  return {
    async dispatch(event) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[EventBus] → ${event.type}`);
      }

      try {
        reactDispatch(event);

        await new Promise((resolve) => setTimeout(resolve, 0));

        if (event.type === EditorEventType.PRESENTATION.SAVE) {
          autosave.saveImmediately();
        } else {
          const state = getState();

          if (state.autosaveEnabled && autosave.shouldAutosave(event.type)) {
            autosave.scheduleAutosave();
          }
        }
      } catch (error) {
        console.error(`[EventBus] Failed to dispatch ${event.type}:`, error);
      }
    },
  };
};