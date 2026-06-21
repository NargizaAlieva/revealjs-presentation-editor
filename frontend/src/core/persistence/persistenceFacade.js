// =============================================================================
// persistenceFacade.js — единственная точка входа в persistence-слой.
//
// Всё остальное приложение импортирует ТОЛЬКО отсюда, никогда напрямую из
// storageAdapter / presentationsLibrary / mediaStorage / autoSaveService.
//
// При переходе на Electron достаточно заменить реализации ниже:
//   storageGet/Set/Remove  →  fs.readFile / fs.writeFile / fs.unlink
//   getMediaFile           →  fs.readFile (Buffer → Blob)
//   getSetting/setSetting  →  electron-store или app.getPath-based JSON
// =============================================================================

import { storageAdapter } from "./storageAdapter";
import {
  getIndex,
  createPresentation,
  updateIndexEntry,
  deletePresentation,
  loadPresentation,
  savePresentation,
  presentationKey,
} from "./presentationsLibrary";
import { storeMediaFile } from "./mediaStorage";
import { downloadPresentationAsJson } from "./serializationOperations";

// ── Key-value store ──────────────────────────────────────────────────────────
export const storageGet    = (key)        => storageAdapter.get(key);
export const storageSet    = (key, value) => storageAdapter.set(key, value);
export const storageRemove = (key)        => storageAdapter.remove(key);
export const storageGetAllKeys = ()       => storageAdapter.getAllKeys();

// ── Presentations CRUD ───────────────────────────────────────────────────────
export {
  getIndex,
  createPresentation,
  updateIndexEntry,
  deletePresentation,
  loadPresentation,
  savePresentation,
  presentationKey,
};

// ── Media ────────────────────────────────────────────────────────────────────
export { storeMediaFile };
export const getMediaFile = (key) => storageAdapter.get(key);

// ── Export / download ────────────────────────────────────────────────────────
export { downloadPresentationAsJson };

// ── Settings ─────────────────────────────────────────────────────────────────
// localStorage используется только здесь. При переходе на Electron — заменить
// на electron-store или fs-based JSON без изменений в остальном коде.
const SETTINGS_CACHE = new Map();

export const getSetting = (key, defaultValue = null) => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? defaultValue : v;
  } catch {
    return SETTINGS_CACHE.get(key) ?? defaultValue;
  }
};

export const setSetting = (key, value) => {
  SETTINGS_CACHE.set(key, String(value));
  try { localStorage.setItem(key, String(value)); } catch { /* private-browsing / quota */ }
};
