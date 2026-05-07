const createEventId = () => crypto.randomUUID();

export const EditorEventType = {
  PRESENTATION: {
    CREATE: "CREATE_PRESENTATION",
    SAVE: "SAVE_PRESENTATION",
    LOAD: "LOAD_PRESENTATION",
    EXPORT: "EXPORT_PRESENTATION",
  },

  SLIDE: {
    ADD: "ADD_SLIDE",
    DELETE: "DELETE_SLIDE",
    DUPLICATE: "DUPLICATE_SLIDE",
    SELECT: "SELECT_SLIDE",
    REORDER: "REORDER_SLIDES",
  },

  CONTENT: {
    UPDATE_TEXT: "UPDATE_TEXT",
    ADD_IMAGE: "ADD_IMAGE",
    MOVE_ELEMENT: "MOVE_ELEMENT",
    RESIZE_ELEMENT: "RESIZE_ELEMENT",
  },

  LAYOUT: {
    APPLY: "APPLY_LAYOUT",
    UPDATE: "UPDATE_LAYOUT",
  },
};

export const createEditorEvent = (type, payload = {}) => ({
  id: createEventId(),
  type,
  payload,
  timestamp: Date.now(),
});