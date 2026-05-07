import { createDefaultPresentation } from "../model/presentation";
import { EditorEventType } from "../events/editorEvents";
import {
  updateTextElement,
  moveElement,
  resizeElement,
} from "../operations/contentOperations";
import {
  addSlide,
  deleteSlide,
  duplicateSlide,
} from "../operations/slideOperations";

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

    case EditorEventType.SLIDE.ADD: {
      const updatedPresentation = addSlide(
        state.presentation,
        event.payload.layoutId
      );

      return {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex:
          updatedPresentation.slideset.slides.length - 1,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.SLIDE.DELETE: {
      const updatedPresentation = deleteSlide(
        state.presentation,
        state.selectedSlideIndex
      );

      const lastSlideIndex =
        updatedPresentation.slideset.slides.length - 1;

      return {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: Math.min(
          state.selectedSlideIndex,
          lastSlideIndex
        ),
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.SLIDE.DUPLICATE: {
      const updatedPresentation = duplicateSlide(
        state.presentation,
        state.selectedSlideIndex
      );

      return {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: state.selectedSlideIndex + 1,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.CONTENT.UPDATE_TEXT: {
      const updatedPresentation = updateTextElement(
        state.presentation,
        state.selectedSlideIndex,
        event.payload.textElementId,
        event.payload.text
      );

      return {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.CONTENT.MOVE_ELEMENT: {
      const updatedPresentation = moveElement(
        state.presentation,
        state.selectedSlideIndex,
        event.payload.elementId,
        event.payload.position
      );

      return {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.CONTENT.RESIZE_ELEMENT: {
      const updatedPresentation = resizeElement(
        state.presentation,
        state.selectedSlideIndex,
        event.payload.elementId,
        event.payload.size
      );

      return {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    default:
      return state;
  }
};