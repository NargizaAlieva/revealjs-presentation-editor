import { indexedDbMediaStorage } from "./indexedDbMediaStorage";

const mediaStorageBackend = indexedDbMediaStorage;

export const storeMediaFile = (file) => mediaStorageBackend.store(file);
