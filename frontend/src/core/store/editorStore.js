import { createDefaultPresentation } from "../model/presentation";
import { EditorEventType } from "../events/editorEvents";

export const createInitialEditorState = () => {
  const presentation = createDefaultPresentation();

  return {
    presentation,

    selectedSlideIndex: 0,

    selectedElementId: null,

    lastEvent: null,

    lastUpdated: Date.now(),
  };
};

export const editorReducer = (state, event) => {
  switch (event.type) {
    case EditorEventType.PRESENTATION.CREATE:
      return {
        ...createInitialEditorState(),
        lastEvent: event,
      };

    case EditorEventType.SLIDE.SELECT:
      return {
        ...state,

        selectedSlideIndex: event.payload.slideIndex,

        selectedElementId: null,

        lastEvent: event,

        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
};