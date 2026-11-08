import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("notesbuddy.db");
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, created_at TEXT)
      `);
  }

  return db;
};

export const initDatabase = async () => {
  await getDatabase();
};

export const getNotes = async () => {
  const database = await getDatabase();
  return await database.getAllAsync(
    "SELECT * FROM notes ORDER BY created_at DESC",
  );
};

export const addNotes = async (
  title: string,
  content: string,
  created_at: string,
) => {
  const database = await getDatabase();
  return await database.runAsync(
    "INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)",
    [title, content, created_at],
  );
};

export const updateNotes = async (
  id: number,
  title: string,
  content: string,
  created_at: string,
) => {
  const database = await getDatabase();
  return await database.runAsync(
    "UPDATE notes SET title = ?, content = ?, created_at = ? WHERE id = ?",
    [title, content, created_at, id],
  );
};

export const deleteNotes = async (id: number) => {
  const database = await getDatabase();
  return await database.runAsync("DELETE FROM notes WHERE id = ?", [id]);
};
