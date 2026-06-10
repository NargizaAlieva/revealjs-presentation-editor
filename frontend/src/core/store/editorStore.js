import { createDefaultPresentation } from "../model/presentation";
import { EditorEventType } from "../events/editorEvents";
import { deserializePresentation } from "../persistence/serializationOperations";
import {
  updateTextElement,
  moveElement,
  resizeElement,
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
});

export const editorReducer = (state, event) => {
  switch (event.type) {

    case EditorEventType.PRESENTATION.CREATE:
      return { ...createInitialEditorState(), lastEvent: event };

    case EditorEventType.PRESENTATION.SAVE:
      return { ...state, lastEvent: event, lastUpdated: Date.now() };

    case EditorEventType.PRESENTATION.LOAD: {
      const result = deserializePresentation(event.payload.jsonString);
      if (!result) return state; // parse failed
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
      };
    }

    case EditorEventType.PRESENTATION.UPDATE:
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: {
            ...state.presentation.slideset,
            ...event.payload, // { filename, title, author, "creation-date", fonts }
          },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
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
        event.payload.layoutId,
      );
      return {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: updatedPresentation.slideset.slides.length - 1,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.SLIDE.DELETE: {
      const updatedPresentation = deleteSlide(
        state.presentation,
        state.selectedSlideIndex,
      );
      const slides = updatedPresentation.slideset?.slides ?? [];
      return {
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
    }

    case EditorEventType.SLIDE.DUPLICATE: {
      const updatedPresentation = duplicateSlide(
        state.presentation,
        state.selectedSlideIndex,
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

    case EditorEventType.SLIDE.REORDER: {
      const updatedPresentation = reorderSlides(
        state.presentation,
        event.payload.fromIndex,
        event.payload.toIndex,
      );
      return {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: event.payload.toIndex,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.SLIDE.TOGGLE_HIDDEN: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[event.payload.slideIndex];
      if (!slide) return state;
      slides[event.payload.slideIndex] = { ...slide, hidden: !slide.hidden };
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.SLIDE.UPDATE_BACKGROUND: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];
      if (!slide) return state;
      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: { ...slide.contents, background: event.payload.background },
      };
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.SLIDE.UPDATE_TRANSITION: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];
      if (!slide) return state;
      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: { ...slide.contents, transition: event.payload.transition },
      };
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.SLIDE.UPDATE_NOTES: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];
      if (!slide) return state;
      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: { ...slide.contents, notes: event.payload.notes },
      };
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
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
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        selectedElementId: event.payload.textElement.id,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
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
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
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
      return {
        ...state,
        presentation: updatedPresentation,
        selectedElementId: event.payload.textElementId,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
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

    case EditorEventType.MEDIA.ADD:
      return {
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

    case EditorEventType.MEDIA.DELETE:
      return {
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

    case EditorEventType.MEDIA.UPDATE:
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

    case EditorEventType.ANIMATION.ADD:
      return {
        ...state,
        presentation: addAnimation(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.animation
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.ANIMATION.UPDATE:
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

    case EditorEventType.ANIMATION.DELETE:
      return {
        ...state,
        presentation: deleteAnimation(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.animationId
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.LAYOUT.APPLY: {
      const updatedPresentation = applyLayoutToSlide(
        state.presentation,
        state.selectedSlideIndex,
        event.payload.layoutId,
      );
      return {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.LAYOUT.UPDATE: {
      const updatedPresentation = propagateLayoutChanges(
        state.presentation,
        event.payload.layoutId,
        event.payload.placeholders,
      );
      return {
        ...state,
        presentation: updatedPresentation,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.MASTER.UPDATE_THEME:
      return {
        ...state,
        presentation: updateMasterTheme(
          state.presentation,
          event.payload.colorTheme
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.MASTER.UPDATE_DIMENSIONS:
      return {
        ...state,
        presentation: updateMasterDimensions(
          state.presentation,
          event.payload.slideDimensions,
          event.payload.aspectRatio
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.MASTER.UPDATE_FORMATTING:
      return {
        ...state,
        presentation: updateMasterFormatting(
          state.presentation,
          event.payload.formatting
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

      case EditorEventType.PRESENTATION.TOGGLE_AUTOSAVE:
        return {
          ...state,
          autosaveEnabled: !state.autosaveEnabled,
          lastEvent: event,
          lastUpdated: Date.now(),
        };

        default:
          return state;
      }
    };

    