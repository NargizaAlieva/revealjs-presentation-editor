import { indexedDbMediaStorage } from "./indexedDbMediaStorage";
import { storageAdapter } from "./storageAdapter";

const mediaStorageBackend = indexedDbMediaStorage;

export const storeMediaFile = (file) => mediaStorageBackend.store(file);
export const getMediaFile = (key) => storageAdapter.get(key);
