import { idbSet } from "./autoSaveService";

export const indexedDbMediaStorage = {
  async store(file) {
    const mediaId = crypto.randomUUID();
    const key = `media/${mediaId}`;
    await idbSet(key, file);
    return { mediaId, key };
  },
};
