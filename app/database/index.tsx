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

export async function addImage(db: any, uri: string, timestamp: string, latitude: string, longitude: string) {
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

  export async function fetchImages(db: any) {
    try {
      const rows = await db.getAllAsync(`SELECT * FROM images`);
    //   console.log("Fetched images:", rows);
      return rows;
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }


  export async function deleteImage(db: any, id: number) {
    try {
      await db.runAsync(`DELETE FROM images WHERE id = ?`, [id]);
      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  }

  export async function fetchImagesByDate(db: any, month: string, day: string) {
    try {
      const rows = await db.getAllAsync(
        `
        SELECT * FROM images 
        WHERE strftime('%m', timestamp) = ? AND strftime('%d', timestamp) = ?
        `,
        [month.padStart(2, '0'), day.padStart(2, '0')] 
      );
      return rows;
    } catch (error) {
      console.error("Failed to fetch images by date:", error);
    }
  }
  
  