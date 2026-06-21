import { idbSet } from "./autoSaveService";

// Persist a media file to IndexedDB and return the generated id and storage key.
export const storeMediaFile = async (file) => {
  const mediaId = crypto.randomUUID();
  const key = `media/${mediaId}`;
  await idbSet(key, file);
  return { mediaId, key };
};
