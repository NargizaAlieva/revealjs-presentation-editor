import { idbSet } from "./autoSaveService";

export const storeMediaFile = async (file) => {
  const mediaId = crypto.randomUUID();
  const key = `media/${mediaId}`;
  await idbSet(key, file);
  return { mediaId, key };
};
