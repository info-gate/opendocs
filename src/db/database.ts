import * as SQLite from 'expo-sqlite';
import { migration001 } from './migrations/001_initial';

const DB_NAME = 'opendocs.db';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(_db);
  return _db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Simple migration: always run CREATE TABLE IF NOT EXISTS
  await migration001(db);
}

// ─── CRUD operations ────────────────────────────────────────────────────────

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

/** 파일 열람 기록 저장 또는 업데이트 */
export async function upsertFileHistory(
  fileUri: string,
  fileName: string,
  fileFormat: string,
  fileSize?: number,
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO file_history (file_uri, file_name, file_format, file_size, last_opened, open_count)
     VALUES (?, ?, ?, ?, ?, 1)
     ON CONFLICT(file_uri) DO UPDATE SET
       file_name   = excluded.file_name,
       last_opened = excluded.last_opened,
       open_count  = open_count + 1,
       is_deleted  = 0`,
    [fileUri, fileName, fileFormat, fileSize ?? null, now],
  );
}

/** 최근 파일 목록 조회 (최대 20개) */
export async function getRecentFiles(limit = 20): Promise<FileRecord[]> {
  const db = await getDatabase();
  return db.getAllAsync<FileRecord>(
    `SELECT * FROM file_history
     WHERE is_deleted = 0
     ORDER BY last_opened DESC
     LIMIT ?`,
    [limit],
  );
}

/** 즐겨찾기 목록 조회 */
export async function getFavoriteFiles(): Promise<FileRecord[]> {
  const db = await getDatabase();
  return db.getAllAsync<FileRecord>(
    `SELECT * FROM file_history
     WHERE is_deleted = 0 AND is_favorite = 1
     ORDER BY last_opened DESC`,
  );
}

/** 즐겨찾기 토글 */
export async function toggleFavorite(id: number, current: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE file_history SET is_favorite = ? WHERE id = ?`,
    [current === 1 ? 0 : 1, id],
  );
}

/** 파일이 기기에서 삭제된 경우 soft-delete */
export async function markFileDeleted(fileUri: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE file_history SET is_deleted = 1 WHERE file_uri = ?`,
    [fileUri],
  );
}

/** 기록 완전 삭제 */
export async function deleteFileHistory(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM file_history WHERE id = ?`, [id]);
}
