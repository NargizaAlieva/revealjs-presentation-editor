import { serializePresentation } from "./serializationOperations";
import { updateIndexEntry } from "./presentationsLibrary";
import { EditorEventType } from "../events/editorEvents";

const DEFAULT_STORAGE_KEY = "presentation";
const DEFAULT_AUTOSAVE_DELAY = 2000;
const DB_NAME = "editor-db";
const DB_VERSION = 1;
const STORE_NAME = "keyval";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = (e) => resolve(e.target.result ?? null);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function idbGetAllKeys() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAllKeys();
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function idbGetAllPresentationIds() {
  const keys = await idbGetAllKeys();
  return keys
    .filter((k) => k.startsWith("presentation-"))
    .map((k) => k.replace("presentation-", ""));
}

export async function idbRemove(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

const AUTO_SAVE_EVENTS = new Set([
  EditorEventType.SLIDE.ADD,
  EditorEventType.SLIDE.DELETE,
  EditorEventType.SLIDE.DUPLICATE,
  EditorEventType.SLIDE.REORDER,
  EditorEventType.SLIDE.TOGGLE_HIDDEN,
  EditorEventType.SLIDE.UPDATE_TRANSITION,
  EditorEventType.SLIDE.UPDATE_NOTES,

  EditorEventType.TEXT.ADD,
  EditorEventType.TEXT.UPDATE_COMMIT,
  EditorEventType.TEXT.UPDATE_FORMATTING,
  EditorEventType.TEXT.DELETE,

  EditorEventType.ELEMENT.DELETE,
  EditorEventType.ELEMENT.MOVE_COMMIT,
  EditorEventType.ELEMENT.RESIZE_COMMIT,

  EditorEventType.MEDIA.ADD,
  EditorEventType.MEDIA.DELETE,
  EditorEventType.MEDIA.UPDATE,

  EditorEventType.ANIMATION.ADD,
  EditorEventType.ANIMATION.UPDATE,
  EditorEventType.ANIMATION.DELETE,

  EditorEventType.LAYOUT.APPLY,
  EditorEventType.LAYOUT.UPDATE,

  EditorEventType.MASTER.UPDATE_THEME,
  EditorEventType.MASTER.UPDATE_DIMENSIONS,
  EditorEventType.MASTER.UPDATE_FORMATTING,

  EditorEventType.PRESENTATION.UPDATE,

  EditorEventType.HISTORY.UNDO,
  EditorEventType.HISTORY.REDO,
]);

const createDebounce = (fn, delay) => {
  let timer = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
      timer = null;
    }, delay);
  };
};

export const createAutosaveService = (
  getState,
  { storageKey = DEFAULT_STORAGE_KEY, delay = DEFAULT_AUTOSAVE_DELAY } = {},
) => {
  const persist = async () => {
    try {
      const state = getState();
      if (!state?.presentation) {
        console.warn("[AutosaveService] No presentation state to save.");
        return;
      }
      const id = storageKey.replace("presentation-", "");
      const title = state.presentation?.slideset?.filename ?? "Untitled Presentation";
      await idbSet(storageKey, serializePresentation(state.presentation));
      await updateIndexEntry(id, title);
      if (process.env.NODE_ENV === "development") {
        console.log("[AutosaveService] Saved.");
      }
    } catch (error) {
      console.error("[AutosaveService] Save failed:", error);
    }
  };

  const scheduleAutosave = createDebounce(persist, delay);
  const saveImmediately = () => persist();
  const shouldAutosave = (eventType) => AUTO_SAVE_EVENTS.has(eventType);

  return { scheduleAutosave, saveImmediately, shouldAutosave };
};