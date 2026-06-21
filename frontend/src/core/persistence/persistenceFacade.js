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

export const storageGet    = (key)        => storageAdapter.get(key);
export const storageSet    = (key, value) => storageAdapter.set(key, value);
export const storageRemove = (key)        => storageAdapter.remove(key);
export const storageGetAllKeys = ()       => storageAdapter.getAllKeys();

export {
  getIndex,
  createPresentation,
  updateIndexEntry,
  deletePresentation,
  loadPresentation,
  savePresentation,
  presentationKey,
};

export { storeMediaFile };
export const getMediaFile = (key) => storageAdapter.get(key);

export { downloadPresentationAsJson };

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
