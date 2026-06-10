import { EditorEventType } from "../events/editorEvents";
import { createAutosaveService } from "../persistence/autosaveService";

export const createEventBus = (reactDispatch, getState) => {
  const autosave = createAutosaveService(getState);

  return {
    async dispatch(event) {
      console.log(`[EventBus] → ${event.type} at ${Date.now()}`);

      reactDispatch(event);
      console.log(`[EventBus] State updated at ${Date.now()}`);

      await new Promise((resolve) => setTimeout(resolve, 0));
      console.log(`[EventBus] After async yield at ${Date.now()}`);

      if (event.type === EditorEventType.PRESENTATION.SAVE) {
        autosave.saveImmediately();
      } else {
        const state = getState();

        if (state.autosaveEnabled && autosave.shouldAutosave(event.type)) {
          autosave.scheduleAutosave();
          console.log(`[EventBus] Autosave scheduled at ${Date.now()}`);
        }
      }
    },
  };
};