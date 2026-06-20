import { storageAdapter } from "./storageAdapter";

const INDEX_KEY = "presentations_index";

export function presentationKey(id) {
  return `presentation-${id}`;
}

export async function getIndex() {
  const stored = await storageAdapter.get(INDEX_KEY);
  if (stored && stored.length > 0) return stored;

  const ids = await storageAdapter.getAllPresentationIds();
  if (ids.length === 0) return [];

  const entries = await Promise.all(
    ids.map(async (id) => {
      const raw = await storageAdapter.get(presentationKey(id));
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      const title =
        data?.slideset?.title ??
        data?.slideset?.filename ??
        "Untitled Presentation";
      return { id, title, updatedAt: Date.now() };
    }),
  );

  entries.sort((a, b) => b.updatedAt - a.updatedAt);
  await storageAdapter.set(INDEX_KEY, entries);
  return entries;
}

export async function createPresentation(title = "Untitled Presentation") {
  const id = crypto.randomUUID();
  await updateIndexEntry(id, title);
  return id;
}

export async function updateIndexEntry(id, title) {
  const index = await getIndex();
  const pos = index.findIndex((p) => p.id === id);
  const entry = {
    id,
    title: title || "Untitled Presentation",
    updatedAt: Date.now(),
  };
  if (pos >= 0) {
    index[pos] = entry;
  } else {
    index.unshift(entry);
  }
  index.sort((a, b) => b.updatedAt - a.updatedAt);
  await storageAdapter.set(INDEX_KEY, index);
}

export async function deletePresentation(id) {
  const index = await getIndex();
  await storageAdapter.set(
    INDEX_KEY,
    index.filter((p) => p.id !== id),
  );
  await storageAdapter.remove(presentationKey(id));
}

export async function loadPresentation(id) {
  return storageAdapter.get(presentationKey(id));
}
