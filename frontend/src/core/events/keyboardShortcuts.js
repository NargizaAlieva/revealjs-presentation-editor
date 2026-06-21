export const isEditableTarget = (target) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target.isContentEditable;

export const isUndoShortcut = (event) =>
  (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z";

export const isRedoShortcut = (event) =>
  ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") ||
  ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z");

export const isCopyShortcut = (event) =>
  (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c";

export const isPasteShortcut = (event) =>
  (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v";

export const isCutShortcut = (event) =>
  (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "x";

export const isDeleteShortcut = (event) =>
  event.key === "Delete" || event.key === "Backspace";
