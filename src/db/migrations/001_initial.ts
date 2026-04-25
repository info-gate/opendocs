import type { SQLiteDatabase } from 'expo-sqlite';

export const migration001 = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS file_history (
      id           INTEGER  PRIMARY KEY AUTOINCREMENT,
      file_uri     TEXT     NOT NULL UNIQUE,
      file_name    TEXT     NOT NULL,
      file_format  TEXT     NOT NULL,
      file_size    INTEGER,
      last_opened  INTEGER  NOT NULL,
      open_count   INTEGER  NOT NULL DEFAULT 1,
      is_favorite  INTEGER  NOT NULL DEFAULT 0,
      is_deleted   INTEGER  NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_last_opened
      ON file_history (is_deleted, last_opened DESC);

    CREATE INDEX IF NOT EXISTS idx_favorites
      ON file_history (is_deleted, is_favorite, last_opened DESC);
  `);
};
