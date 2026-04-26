/**
 * database.web — Web stub
 * Web 빌드는 wa-sqlite.wasm 번들링 미설정 → in-memory 임시 store 로 대체.
 * 실제 영속화는 모바일에서만. 웹은 UI 시연용.
 */

export interface FileRecord {
  id: number;
  file_uri: string;
  file_name: string;
  file_format: string;
  file_size: number | null;
  last_opened: number;
  open_count: number;
  is_favorite: number;
  is_deleted: number;
}

const memStore: FileRecord[] = [];
let nextId = 1;

export async function getDatabase(): Promise<unknown> {
  return null;  // unused on web
}

export async function upsertFileHistory(
  fileUri: string,
  fileName: string,
  fileFormat: string,
  fileSize?: number,
): Promise<void> {
  const now = Date.now();
  const existing = memStore.find(r => r.file_uri === fileUri);
  if (existing) {
    existing.file_name = fileName;
    existing.last_opened = now;
    existing.open_count += 1;
    existing.is_deleted = 0;
  } else {
    memStore.unshift({
      id: nextId++,
      file_uri: fileUri,
      file_name: fileName,
      file_format: fileFormat,
      file_size: fileSize ?? null,
      last_opened: now,
      open_count: 1,
      is_favorite: 0,
      is_deleted: 0,
    });
  }
}

export async function getRecentFiles(limit = 20): Promise<FileRecord[]> {
  return memStore.filter(r => r.is_deleted === 0).slice(0, limit);
}

export async function getFavoriteFiles(): Promise<FileRecord[]> {
  return memStore.filter(r => r.is_deleted === 0 && r.is_favorite === 1);
}

export async function toggleFavorite(id: number, current: number): Promise<void> {
  const r = memStore.find(x => x.id === id);
  if (r) r.is_favorite = current === 1 ? 0 : 1;
}

export async function markFileDeleted(fileUri: string): Promise<void> {
  const r = memStore.find(x => x.file_uri === fileUri);
  if (r) r.is_deleted = 1;
}

export async function deleteFileHistory(id: number): Promise<void> {
  const i = memStore.findIndex(x => x.id === id);
  if (i >= 0) memStore.splice(i, 1);
}
