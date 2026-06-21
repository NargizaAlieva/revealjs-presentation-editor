import { createDefaultPresentation } from "../model/presentation";
import { EditorEventType } from "../events/editorEvents";
import { deserializePresentation } from "../persistence/serializationOperations";

import {
  moveElement,
  resizeElement,
  updateElement,
} from "../operations/elementOperations";

import {
  addTextElement,
  updateTextElement,
  updateTextFormatting,
  updateTextElementParagraphs,
  updateTextRangeFormatting,
  updateRunLink,
  deleteTextElement,
} from "../operations/textOperations";

import {
  addSlide,
  deleteSlide,
  duplicateSlide,
  reorderSlides,
  toggleSlideHidden,
  updateSlideNotes,
} from "../operations/slideOperations";
import {
  applyLayoutToSlide,
  propagateLayoutChanges,
  resetSlideToLayout,
  deleteLayout,
  renameLayout,
  addLayoutElement,
  updateLayoutElement,
  updateLayoutElementTextContent,
  deleteLayoutElement,
  addLayoutPlaceholder,
  removeLayoutPlaceholder,
  updateLayoutPlaceholder,
  updateLayoutElementsFont,
} from "../operations/layoutOperations";
import {
  addMedia,
  deleteMedia,
  updateMedia,
} from "../operations/mediaOperations";
import {
  updateMasterTheme,
  updateMasterDimensions,
  updateMasterFormatting,
  addMasterElement,
  updateMasterElement,
  updateMasterTextContent,
  updateMasterTextFormatting,
  deleteMasterElement,
  toggleMasterTitle,
  toggleMasterFooters,
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
  pendingSnapshot: null,
  clipboard: null,
  formatPainterClipboard: null,
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
    pendingSnapshot: null,
  };
}

export const editorReducer = (state, event) => {
  switch (event.type) {
    case EditorEventType.HISTORY.BEGIN:
      if (state.pendingSnapshot) return state;

      return {
        ...state,
        pendingSnapshot: createHistorySnapshot(state),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.HISTORY.COMMIT:
      if (!state.pendingSnapshot) return state;

      return {
        ...state,
        past: [...state.past, state.pendingSnapshot].slice(-HISTORY_LIMIT),
        future: [],
        pendingSnapshot: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.HISTORY.CANCEL:
      if (!state.pendingSnapshot) return state;

      return {
        ...state,
        presentation: state.pendingSnapshot.presentation,
        selectedSlideIndex: state.pendingSnapshot.selectedSlideIndex,
        selectedElementId: state.pendingSnapshot.selectedElementId,
        pendingSnapshot: null,
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
        pendingSnapshot: null,
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
        past: [...state.past, createHistorySnapshot(state)].slice(
          -HISTORY_LIMIT,
        ),
        future: state.future.slice(1),
        pendingSnapshot: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      };
    }

    case EditorEventType.ELEMENT.COPY: {
      return {
        ...state,
        clipboard: structuredClone(event.payload.element),
      };
    }

    case EditorEventType.ELEMENT.PASTE: {
      if (!state.clipboard) return state;

      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];
      if (!slide) return state;

      const newElement = {
        ...structuredClone(state.clipboard),
        id: crypto.randomUUID(),
        position: {
          x: (state.clipboard.position?.x ?? 0) + 20,
          y: (state.clipboard.position?.y ?? 0) + 20,
        },
      };

      const isMedia = state.clipboard["media-type"] !== undefined;

      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: {
          ...slide.contents,
          ...(isMedia
            ? { media: [...(slide.contents?.media ?? []), newElement] }
            : { text: [...(slide.contents?.text ?? []), newElement] }),
        },
      };

      return withHistory(state, {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        selectedElementId: newElement.id,
        lastEvent: event,
        lastUpdated: Date.now(),
      });
    }

    case EditorEventType.ELEMENT.CUT: {
      const element = event.payload.element;
      const isMedia = element["media-type"] !== undefined;
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];
      if (!slide) return state;

      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: {
          ...slide.contents,
          ...(isMedia
            ? {
              media: (slide.contents?.media ?? []).filter(
                (el) => el.id !== element.id,
              ),
            }
            : {
              text: (slide.contents?.text ?? []).filter(
                (el) => el.id !== element.id,
              ),
            }),
        },
      };

      return withHistory(state, {
        ...state,
        clipboard: structuredClone(element),
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      });
    }

    case EditorEventType.FORMAT_PAINTER.COPY:
      return {
        ...state,
        formatPainterClipboard: { formatting: event.payload.formatting, sourceElementId: event.payload.elementId },
        lastEvent: event,
      };

    case EditorEventType.FORMAT_PAINTER.PASTE:
      return {
        ...state,
        formatPainterClipboard: null,
        lastEvent: event,
      };

    case EditorEventType.FORMAT_PAINTER.CLEAR:
      return { ...state, formatPainterClipboard: null, lastEvent: event };

    case EditorEventType.PRESENTATION.CREATE:
      return { ...createInitialEditorState(), lastEvent: event };

    case EditorEventType.PRESENTATION.SAVE:
      return { ...state, lastEvent: event, lastUpdated: Date.now() };

    case EditorEventType.PRESENTATION.LOAD: {
      const result = deserializePresentation(event.payload.jsonString);
      if (!result?.data) return state;

      if (result.errors.length > 0) {
        console.warn(
          "[Reducer] Loaded presentation has validation errors:",
          result.errors,
        );
      }

      return {
        ...state,
        presentation: result.data,
        autosaveEnabled: event.payload.autosaveEnabled ?? true,
        selectedSlideIndex: 0,
        selectedElementId: null,
        past: [],
        future: [],
        pendingSnapshot: null,
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
            ...event.payload,
          },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.PRESENTATION.TOGGLE_AUTOSAVE: {
      return {
        ...state,
        autosaveEnabled: !state.autosaveEnabled,
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

      return withHistory(state, {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: updatedPresentation.slideset.slides.length - 1,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      });
    }

    case EditorEventType.SLIDE.DELETE: {
      const updatedPresentation = deleteSlide(
        state.presentation,
        state.selectedSlideIndex,
      );
      const slides = updatedPresentation.slideset?.slides ?? [];

      return withHistory(state, {
        ...state,
        presentation: updatedPresentation,
        selectedSlideIndex: Math.max(
          0,
          Math.min(state.selectedSlideIndex, slides.length - 1),
        ),
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      });
    }

    case EditorEventType.SLIDE.DUPLICATE:
      return withHistory(state, {
        ...state,
        presentation: duplicateSlide(
          state.presentation,
          state.selectedSlideIndex,
        ),
        selectedSlideIndex: state.selectedSlideIndex + 1,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.SLIDE.REORDER:
      return withHistory(state, {
        ...state,
        presentation: reorderSlides(
          state.presentation,
          event.payload.fromIndex,
          event.payload.toIndex,
        ),
        selectedSlideIndex: event.payload.toIndex,
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.SLIDE.TOGGLE_HIDDEN:
      return withHistory(state, {
        ...state,
        presentation: toggleSlideHidden(
          state.presentation,
          event.payload.slideIndex,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.SLIDE.UPDATE_TRANSITION: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];

      if (!slide) return state;

      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: {
          ...slide.contents,
          ...(event.payload.transition !== undefined
            ? { transition: event.payload.transition }
            : {}),
          ...(event.payload.duration !== undefined
            ? { transitionDuration: event.payload.duration }
            : {}),
        },
      };

      return withHistory(state, {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      });
    }

    case EditorEventType.SLIDE.APPLY_TRANSITION_TO_ALL: {
      const slides = (state.presentation.slideset?.slides ?? []).map(
        (slide) => ({
          ...slide,
          contents: {
            ...slide.contents,
            transition: event.payload.transition,
            transitionDuration: event.payload.duration,
          },
        }),
      );

      return withHistory(state, {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      });
    }

    case EditorEventType.SLIDE.UPDATE_NOTES:
      return {
        ...state,
        presentation: updateSlideNotes(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.notes,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.TEXT.ADD:
      return withHistory(state, {
        ...state,
        presentation: addTextElement(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.textElement,
        ),
        selectedElementId: event.payload.textElement.id,
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.TEXT.UPDATE:
      return {
        ...state,
        presentation: updateTextElement(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.textElementId,
          event.payload.text,
          event.payload.userModified,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.TEXT.UPDATE_FORMATTING:
      return withHistory(state, {
        ...state,
        presentation: updateTextFormatting(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.textElementId,
          event.payload.formatting,
        ),
        selectedElementId: event.payload.textElementId,
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.TEXT.UPDATE_PARAGRAPHS:
      return {
        ...state,
        presentation: updateTextElementParagraphs(
          state.presentation,
          event.payload.slideIndex,
          event.payload.elementId,
          event.payload.paragraphs,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.TEXT.UPDATE_RANGE_FORMATTING:
      return withHistory(state, {
        ...state,
        presentation: updateTextRangeFormatting(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.elementId,
          event.payload.paragraphIdx,
          event.payload.rangeStart,
          event.payload.endParagraphIdx ?? event.payload.paragraphIdx,
          event.payload.rangeEnd,
          event.payload.formatting,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.TEXT.UPDATE_RUN_LINK:
      return withHistory(state, {
        ...state,
        presentation: updateRunLink(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.elementId,
          event.payload.paragraphIdx,
          event.payload.rangeStart,
          event.payload.rangeEnd,
          event.payload.link,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.TEXT.DELETE:
      return withHistory(state, {
        ...state,
        presentation: deleteTextElement(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.elementId,
        ),
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.ELEMENT.SELECT:
      return {
        ...state,
        selectedElementId: event.payload.elementId,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.ELEMENT.MOVE:
      return {
        ...state,
        presentation: moveElement(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.elementId,
          event.payload.position,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.ELEMENT.RESIZE:
      return {
        ...state,
        presentation: resizeElement(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.elementId,
          event.payload.size,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.ELEMENT.UPDATE:
      return {
        ...state,
        presentation: updateElement(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.elementId,
          event.payload.updates,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.MEDIA.ADD:
      return withHistory(state, {
        ...state,
        presentation: addMedia(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.mediaElement,
        ),
        selectedElementId: event.payload.mediaElement.id,
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MEDIA.DELETE:
      return withHistory(state, {
        ...state,
        presentation: deleteMedia(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.mediaId,
        ),
        selectedElementId: null,
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MEDIA.UPDATE:
      return {
        ...state,
        presentation: updateMedia(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.mediaId,
          event.payload.updates,
        ),
        selectedElementId: event.payload.mediaId,
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.ANIMATION.ADD:
      return withHistory(state, {
        ...state,
        presentation: addAnimation(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.animation,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.ANIMATION.UPDATE:
      return {
        ...state,
        presentation: updateAnimation(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.animationId,
          event.payload.updates,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.ANIMATION.DELETE:
      return withHistory(state, {
        ...state,
        presentation: deleteAnimation(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.animationId,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.APPLY:
      return withHistory(state, {
        ...state,
        presentation: applyLayoutToSlide(
          state.presentation,
          state.selectedSlideIndex,
          event.payload.layoutId,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.UPDATE:
      return withHistory(state, {
        ...state,
        presentation: propagateLayoutChanges(
          state.presentation,
          event.payload.layoutId,
          event.payload.placeholders,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.UPDATE_FONT:
      return withHistory(state, {
        ...state,
        presentation: updateLayoutElementsFont(
          state.presentation,
          event.payload.layoutId,
          event.payload.font,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.DELETE:
      return withHistory(state, {
        ...state,
        presentation: deleteLayout(state.presentation, event.payload.layoutId),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.RENAME:
      return withHistory(state, {
        ...state,
        presentation: renameLayout(state.presentation, event.payload.layoutId, event.payload.name),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.ADD_ELEMENT:
      return withHistory(state, {
        ...state,
        presentation: addLayoutElement(
          state.presentation,
          event.payload.layoutId,
          event.payload.elementType,
          event.payload.element,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.UPDATE_ELEMENT:
      return withHistory(state, {
        ...state,
        presentation: updateLayoutElement(
          state.presentation,
          event.payload.layoutId,
          event.payload.elementType,
          event.payload.elementId,
          event.payload.updates,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.UPDATE_ELEMENT_TEXT:
      return withHistory(state, {
        ...state,
        presentation: updateLayoutElementTextContent(
          state.presentation,
          event.payload.layoutId,
          event.payload.elementId,
          event.payload.text,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.DELETE_ELEMENT:
      return withHistory(state, {
        ...state,
        presentation: deleteLayoutElement(
          state.presentation,
          event.payload.layoutId,
          event.payload.elementType,
          event.payload.elementId,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.ADD_PLACEHOLDER:
      return withHistory(state, {
        ...state,
        presentation: addLayoutPlaceholder(
          state.presentation,
          event.payload.layoutId,
          event.payload.placeholder,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.REMOVE_PLACEHOLDER:
      return withHistory(state, {
        ...state,
        presentation: removeLayoutPlaceholder(
          state.presentation,
          event.payload.layoutId,
          event.payload.placeholderId,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.UPDATE_PLACEHOLDER:
      return withHistory(state, {
        ...state,
        presentation: updateLayoutPlaceholder(
          state.presentation,
          event.payload.layoutId,
          event.payload.placeholderId,
          event.payload.updates,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.LAYOUT.RESET:
      return withHistory(state, {
        ...state,
        presentation: resetSlideToLayout(
          state.presentation,
          state.selectedSlideIndex,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MASTER.UPDATE_THEME:
      return withHistory(state, {
        ...state,
        presentation: updateMasterTheme(state.presentation, event.payload.colorTheme, event.payload.decorations),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MASTER.UPDATE_DIMENSIONS:
      return withHistory(state, {
        ...state,
        presentation: updateMasterDimensions(
          state.presentation,
          event.payload.slideDimensions,
          event.payload.aspectRatio,
          event.payload.dimensionUnits,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MASTER.UPDATE_FORMATTING:
      return withHistory(state, {
        ...state,
        presentation: updateMasterFormatting(
          state.presentation,
          event.payload.formatting,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MASTER.ADD_ELEMENT:
      return withHistory(state, {
        ...state,
        presentation: addMasterElement(
          state.presentation,
          event.payload.elementType,
          event.payload.element,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MASTER.UPDATE_TEXT_CONTENT:
      return {
        ...state,
        presentation: updateMasterTextContent(
          state.presentation,
          event.payload.elementId,
          event.payload.text,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.MASTER.UPDATE_TEXT_FORMATTING:
      return {
        ...state,
        presentation: updateMasterTextFormatting(
          state.presentation,
          event.payload.elementId,
          event.payload.formatting,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.MASTER.UPDATE_ELEMENT:
      return {
        ...state,
        presentation: updateMasterElement(
          state.presentation,
          event.payload.elementType,
          event.payload.elementId,
          event.payload.updates,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      };

    case EditorEventType.MASTER.DELETE_ELEMENT:
      return withHistory(state, {
        ...state,
        presentation: deleteMasterElement(
          state.presentation,
          event.payload.elementType,
          event.payload.elementId,
        ),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MASTER.TOGGLE_TITLE:
      return withHistory(state, {
        ...state,
        presentation: toggleMasterTitle(state.presentation, event.payload.layoutId ?? null),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.MASTER.TOGGLE_FOOTERS:
      return withHistory(state, {
        ...state,
        presentation: toggleMasterFooters(state.presentation, event.payload.layoutId ?? null),
        lastEvent: event,
        lastUpdated: Date.now(),
      });

    case EditorEventType.COMMENT.ADD: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];
      if (!slide) return state;
      const newComment = {
        id: crypto.randomUUID(),
        author: event.payload.author ?? "User",
        text: event.payload.text,
        createdAt: Date.now(),
      };
      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: {
          ...slide.contents,
          comments: [...(slide.contents?.comments ?? []), newComment],
        },
      };
      return withHistory(state, {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      });
    }

    case EditorEventType.COMMENT.DELETE: {
      const slides = [...(state.presentation.slideset?.slides ?? [])];
      const slide = slides[state.selectedSlideIndex];
      if (!slide) return state;
      slides[state.selectedSlideIndex] = {
        ...slide,
        contents: {
          ...slide.contents,
          comments: (slide.contents?.comments ?? []).filter(
            (c) => c.id !== event.payload.commentId,
          ),
        },
      };
      return withHistory(state, {
        ...state,
        presentation: {
          ...state.presentation,
          slideset: { ...state.presentation.slideset, slides },
        },
        lastEvent: event,
        lastUpdated: Date.now(),
      });
    }

    default:
      return state;
  }
};
