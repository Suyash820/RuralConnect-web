// src/services/database.js
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const db = SQLite.openDatabase('rural_egov.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT UNIQUE,
          role TEXT DEFAULT 'citizen',
          token TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      );

      // Complaints table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS complaints (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          local_id TEXT UNIQUE,
          user_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT,
          photo_uri TEXT,
          location TEXT,
          status TEXT DEFAULT 'pending',
          priority TEXT DEFAULT 'medium',
          assigned_to INTEGER,
          sync_status INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`
      );

      // Offline queue for sync
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_name TEXT,
          record_id INTEGER,
        IME DEFAULT CURRENT_TIMESTAMP
        )`
      );

      // Learning materials (offline cache)
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS learning_materials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          description TEXT,  operation TEXT,
          data TEXT,
          created_at DATET
          file_uri TEXT,
          file_type TEXT,
          category TEXT,
          downloaded INTEGER DEFAULT 0,
          size INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      );

      // Job listings (offline cache)
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          company TEXT,
          location TEXT,
          description TEXT,
          salary TEXT,
          deadline TEXT,
          category TEXT,
          saved INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      );

      // Government schemes
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS schemes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          description TEXT,
          eligibility TEXT,
          benefits TEXT,
          department TEXT,
          category TEXT,
          last_updated DATETIME
        )`
      );

      console.log('Database initialized successfully');
      resolve();
    }, reject);
  });
};

export const executeSql = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const insertComplaint = async (complaint) => {
  const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return executeSql(
    `INSERT INTO complaints 
     (local_id, user_id, title, description, category, photo_uri, location, status, priority) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      localId,
      complaint.userId,
      complaint.title,
      complaint.description,
      complaint.category,
      complaint.photoUri,
      complaint.location,
      'pending',
      complaint.priority || 'medium'
    ]
  );
};

export const getPendingComplaints = async () => {
  const result = await executeSql(
    'SELECT * FROM complaints WHERE sync_status = 0 ORDER BY created_at DESC'
  );
  return result.rows._array;
};