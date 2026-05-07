export { createDefaultPresentation } from "./model/presentation";

export {
  validatePresentation,
  isPresentationValid,
} from "./model/presentationValidation";

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
  createSlideFromLayout,
} from "./operations/slideOperations";

export {
  updateTextElement,
  moveElement,
  resizeElement,
} from "./operations/contentOperations";

export {
  applyLayoutToSlide,
  propagateLayoutChanges,
} from "./operations/layoutOperations";

export {
  serializePresentation,
  deserializePresentation,
  downloadPresentationAsJson,
} from "./export/serializationOperations";

export {
  preparePresentationForExport,
} from "./export/preparePresentationForExport";