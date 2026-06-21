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

        // useReducer обновляет stateRef синхронно через useLayoutEffect,
        // но этот эффект запускается только после paint. setTimeout(0)
        // уступает управление React, чтобы stateRef успел обновиться
        // до чтения autosaveEnabled из состояния.
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (event.type === EditorEventType.PRESENTATION.SAVE) {
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