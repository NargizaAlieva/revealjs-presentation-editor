import { createDefaultPresentation } from "../model/presentation";
import { EditorEventType } from "../events/editorEvents";
import { deserializePresentation } from "../persistence/serializationOperations";
import {
  updateTextElement,
  moveElement,
  resizeElement,
  updateElement,
  updateTextFormatting,
} from "../operations/elementOperations";
import {
  addSlide,
  deleteSlide,
  duplicateSlide,
  reorderSlides,
} from "../operations/slideOperations";
import {
  applyLayoutToSlide,
  propagateLayoutChanges,
} from "../operations/layoutOperations";
import {
  addMedia,
  deleteMedia,
  updateMedia,
  rotateMedia
} from "../operations/mediaOperations";
import {
  updateMasterTheme,
  updateMasterDimensions,
  updateMasterFormatting,
} from "../operations/masterOperations";
import {
  addAnimation,
  updateAnimation,
  deleteAnimation,
} from "../operations/animationOperations";

export const createInitialEditorState = () => ({
  presentation: createDefaultPresentation(),
  selectedSlideIndex: 0,
  selectedElementId: null,
  autosaveEnabled: true,
  lastEvent: null,
  lastUpdated: Date.now(),
  past: [],
  future: [],
});

const HISTORY_LIMIT = 50;

function createHistorySnapshot(state) {
  return {
    presentation: structuredClone(state.presentation),
    selectedSlideIndex: state.selectedSlideIndex,
    selectedElementId: state.selectedElementId,
  };
}

function withHistory(state, newState) {
  return {
    ...newState,
    past: [...state.past, createHistorySnapshot(state)].slice(-HISTORY_LIMIT),
    future: [],
  };
}

function pushSnapshotToHistory(state, snapshot) {
  return {
    ...state,
    past: [...state.past, snapshot].slice(-HISTORY_LIMIT),
    future: [],
  };
}

export const editorReducer = (state, event) => {
  switch (event.type) {

    case EditorEventType.PRESENTATION.CREATE:
      return { ...createInitialEditorState(), lastEvent: event };

    case EditorEventType.PRESENTATION.SAVE:
      return { ...state, lastEvent: event, lastUpdated: Date.now() };

    case EditorEventType.PRESENTATION.LOAD: {
      const result = deserializePresentation(event.payload.jsonString);
      if (!result) return state;
      if (result.errors.length > 0) {
        console.warn("Loaded presentation has validation errors:", result.errors);
      }
      return {
        ...state,
        presentation: result.data,
        selectedSlideIndex: 0,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
        past: [],
        future: [],
      };
    }

    case EditorEventType.PRESENTATION.UPDATE:
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: {
            ...state.presentation.slideset,
            ...event.payload, 
          },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.HISTORY.UNDO: {
      if (state.past.length === 0) return state;

      const previousState = state.past[state.past.length - 1];

      return {
        ...state,
        presentation: previousState.presentation,
        selectedSlideIndex: previousState.selectedSlideIndex,
        selectedElementId: previousState.selectedElementId,
        past: state.past.slice(0, -1),
        future: [createHistorySnapshot(state), ...state.future],
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.HISTORY.REDO: {
      if (state.future.length === 0) return state;

      const nextState = state.future[0];

      return {
        ...state,
        presentation: nextState.presentation,
        selectedSlideIndex: nextState.selectedSlideIndex,
        selectedElementId: nextState.selectedElementId,
        past: [...state.past, createHistorySnapshot(state)].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

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
        event.payload.layoutId,
      );

      const newState = {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: updatedPresentation.slideset.slides.length - 1,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }
    

    case EditorEventType.SLIDE.DELETE: {
      const updatedPresentation = deleteSlide(
        state.presentation,
        state.selectedSlideIndex,
      );

      const slides = updatedPresentation.slideset?.slides ?? [];

      const newState = {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: Math.max(
          0,
          Math.min(state.selectedSlideIndex, slides.length - 1),
        ),
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.SLIDE.DUPLICATE: {
      const updatedPresentation = duplicateSlide(
        state.presentation,
        state.selectedSlideIndex,
      );

      const newState = {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: state.selectedSlideIndex + 1,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.SLIDE.REORDER: {
      const updatedPresentation = reorderSlides(
        state.presentation,
        event.payload.fromIndex,
        event.payload.toIndex,
      );

      const newState = {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: event.payload.toIndex,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.SLIDE.TOGGLE_HIDDEN: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[event.payload.slideIndex];

      if (!slide) return state;

      slides[event.payload.slideIndex] = { 
        ...slide, 
        hidden: !slide.hidden 
      };

      const newState = {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { 
            ...state.presentation.slideset, 
            slides 
          },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.SLIDE.UPDATE_BACKGROUND: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];

      if (!slide) return state;

      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: { 
          ...slide.contents, 
          background: event.payload.background 
        },
      };

      const newState = {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { 
            ...state.presentation.slideset, 
            slides 
          },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.SLIDE.UPDATE_TRANSITION: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];

      if (!slide) return state;

      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: { 
          ...slide.contents, 
          transition: event.payload.transition 
        },
      };

      const newState = {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { 
            ...state.presentation.slideset, 
            slides 
          },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.SLIDE.UPDATE_NOTES: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];

      if (!slide) return state;

      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: { 
          ...slide.contents, 
          notes: event.payload.notes 
        },
      };

      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { 
            ...state.presentation.slideset, 
            slides 
          },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.CONTENT.ADD_TEXT: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];

      if (!slide) return state;

      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: {
          ...slide.contents,
          text: [...(slide.contents?.text ?? []), event.payload.textElement],
        },
      };

      const newState = {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { 
            ...state.presentation.slideset, 
            slides 
          },
        },
        selectedElementId: event.payload.textElement.id,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.CONTENT.DELETE_ELEMENT: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];

      if (!slide) return state;

      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: {
          ...slide.contents,
          text: (slide.contents?.text ?? []).filter(
            (el) => el.id !== event.payload.elementId,
          ),
          media: (slide.contents?.media ?? []).filter(
            (el) => el.id !== event.payload.elementId,
          ),
        },
      };

      const newState = {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { 
            ...state.presentation.slideset, 
            slides 
          },
        },
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.CONTENT.UPDATE_TEXT: {
      const updatedPresentation = updateTextElement(
        state.presentation,
        state.selectedSlideIndex,
        event.payload.textElementId,
        event.payload.text,
      );

      return {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.CONTENT.UPDATE_TEXT_FORMATTING: {
      const updatedPresentation = updateTextFormatting(
        state.presentation,
        state.selectedSlideIndex,
        event.payload.textElementId,
        event.payload.formatting,
      );

      const newState = {
        ...state,
        presentation: updatedPresentation,
        selectedElementId: event.payload.textElementId,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.CONTENT.MOVE_ELEMENT: {
      const updatedPresentation = moveElement(
        state.presentation,
        state.selectedSlideIndex,
        event.payload.elementId,
        event.payload.position,
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
        event.payload.size,
      );

      return {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.CONTENT.UPDATE_ELEMENT: {
      return {
        ...state,
        presentation: updateElement(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.elementId,
          event.payload.updates
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.MEDIA.ADD: {
      const newState = {
        ...state,
        presentation: addMedia(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.mediaElement
        ),
        selectedElementId: event.payload.mediaElement.id,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.MEDIA.DELETE: {
      const newState = {
        ...state,
        presentation: deleteMedia(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.mediaId
        ),
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.MEDIA.UPDATE: {
      return {
        ...state,
        presentation: updateMedia(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.mediaId,
          event.payload.updates
        ),
        lastEvent: event,
        selectedElementId: event.payload.mediaId,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.ANIMATION.ADD: {
      const newState = {
        ...state,
        presentation: addAnimation(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.animation
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.ANIMATION.UPDATE: {
      return {
        ...state,
        presentation: updateAnimation(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.animationId,
          event.payload.updates
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.ANIMATION.DELETE: {
      const newState = {
        ...state,
        presentation: deleteAnimation(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.animationId
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.LAYOUT.APPLY: {
      const updatedPresentation = applyLayoutToSlide(
        state.presentation,
        state.selectedSlideIndex,
        event.payload.layoutId,
      );

      const newState = {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.LAYOUT.UPDATE: {
      const updatedPresentation = propagateLayoutChanges(
        state.presentation,
        event.payload.layoutId,
        event.payload.placeholders,
      );

      const newState = {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.MASTER.UPDATE_THEME: {
      const newState = {
        ...state,
        presentation: updateMasterTheme(
          state.presentation,
          event.payload.colorTheme
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.MASTER.UPDATE_DIMENSIONS:{
      const newState = {
        ...state,
        presentation: updateMasterDimensions(
          state.presentation,
          event.payload.slideDimensions,
          event.payload.aspectRatio
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

    case EditorEventType.MASTER.UPDATE_FORMATTING: {
      const newState = {
        ...state,
        presentation: updateMasterFormatting(
          state.presentation,
          event.payload.formatting
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      return withHistory(state, newState);
    }

      case EditorEventType.PRESENTATION.TOGGLE_AUTOSAVE: {
        const autosaveEnabled = !state.autosaveEnabled;

        localStorage.setItem("autosaveEnabled", String(autosaveEnabled));

        return {
          ...state,
          autosaveEnabled,
          lastEvent: event,
          lastUpdated: Date.now(),
        };
      }

      case EditorEventType.CONTENT.UPDATE_TEXT_COMMIT:
      case EditorEventType.CONTENT.MOVE_ELEMENT_COMMIT:
      case EditorEventType.CONTENT.RESIZE_ELEMENT_COMMIT:
      case EditorEventType.CONTENT.UPDATE_ELEMENT_COMMIT:
      case EditorEventType.MEDIA.UPDATE_COMMIT: {
        return pushSnapshotToHistory(
          {
            ...state,
            lastEvent: event,
            lastUpdated: Date.now(),
          },
          event.payload.beforeSnapshot
        );
      }

        default:
          return state;
      }
    };

    