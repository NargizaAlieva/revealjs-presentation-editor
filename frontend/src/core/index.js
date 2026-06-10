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
} from "./operations/slideOperations";

export {
  updateTextElement,
  updateTextFormatting,
  moveElement,
  resizeElement,
} from "./operations/elementOperations";

export {
  applyLayoutToSlide,
  propagateLayoutChanges,
} from "./operations/layoutOperations";

export {
  addMedia,
  deleteMedia,
  updateMedia,
  rotateMedia,
} from "./operations/mediaOperations";

export {
  serializePresentation,
  deserializePresentation,
  downloadPresentationAsJson,
} from "./persistence/serializationOperations";

export {
  updateMasterTheme,
  updateMasterDimensions,
  updateMasterFormatting,
} from "./operations/masterOperations";