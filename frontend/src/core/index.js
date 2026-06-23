export { createDefaultPresentation } from "./model/presentation";
export { createEventBus } from "./events/eventBus";

export {
  validateSlideset,
  isSlidesetValid,
} from "./model/slidesetValidation";

export {
  EditorEventType,
  createEditorEvent,
} from "./events/editorEvents";

export {
  createInitialEditorState,
  editorReducer,
} from "./store/editorStore";

export {
  addSlide,
  deleteSlide,
  duplicateSlide,
  reorderSlides,
  createSlideFromLayout,
  toggleSlideHidden,
  updateSlideNotes,
  updateSlideTransition,
  updateSlideBackgroundImage,
} from "./operations/slideOperations";

export {
  updateTextElement,
  updateTextFormatting,
  deleteTextElement,
} from "./operations/textOperations";

export {
  moveElement,
  resizeElement,
  updateElement,
} from "./operations/elementOperations";

export {
  applyLayoutToSlide,
  propagateLayoutChanges,
  updateLayoutItem,
} from "./operations/layoutOperations";

export {
  addMedia,
  deleteMedia,
  updateMedia,
} from "./operations/mediaOperations";

export {
  addAnimation,
  updateAnimation,
  deleteAnimation,
} from "./operations/animationOperations";

export {
  serializePresentation,
  deserializePresentation,
  downloadPresentationAsJson,
} from "./persistence/serializationOperations";

export {
  updateMasterTheme,
  updateMasterDimensions,
  updateMasterFormatting,
  hasTitle,
  hasFooters,
} from "./operations/masterOperations";