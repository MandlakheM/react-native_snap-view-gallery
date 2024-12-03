import * as SQLite from "expo-sqlite";

export async function initializeDatabase() {
  try {
    const db = await SQLite.openDatabaseAsync("gallery.db");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uri TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
      );
    `);
    console.log("Database initialized");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

export async function addImage(db, uri, timestamp, latitude, longitude) {
    try {
      const result = await db.runAsync(
        `INSERT INTO images (uri, timestamp, latitude, longitude) VALUES (?, ?, ?, ?)`,
        [uri, timestamp, latitude, longitude]
      );
      console.log("Image added:", result.lastInsertRowId);
    } catch (error) {
      console.error("Failed to add image:", error);
    }
  }

  export async function fetchImages(db) {
    try {
      const rows = await db.getAllAsync(`SELECT * FROM images`);
    //   console.log("Fetched images:", rows);
      return rows;
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }

  export async function updateImage(db, id, newUri) {
    try {
  
    } catch (error) {
      console.error("Failed to update image:", error);
    }
  }

  export async function deleteImage(db, id) {
    try {
      await db.runAsync(`DELETE FROM images WHERE id = ?`, [id]);
      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  }
  