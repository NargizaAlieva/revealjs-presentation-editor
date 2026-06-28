import { storageAdapter } from "./storageAdapter";

export const indexedDbMediaStorage = {
  async store(file) {
    const mediaId = crypto.randomUUID();
    const key = `media/${mediaId}`;
    await storageAdapter.set(key, file);
    return { mediaId, key };
  },
};
