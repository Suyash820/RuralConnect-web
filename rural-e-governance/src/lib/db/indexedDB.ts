// src/lib/db/indexedDB.ts

export class OfflineStorage {
  private dbName = 'LearningDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store for videos
        if (!db.objectStoreNames.contains('videos')) {
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
          videoStore.createIndex('url', 'url', { unique: false });
        }
        
        // Store for documents
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('url', 'url', { unique: false });
        }
        
        // Store for progress
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('courseId', 'courseId', { unique: false });
        }
        
        // Store for courses
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
      };
    });
  }

  async saveVideo(id: string, blob: Blob, metadata: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['videos'], 'readwrite');
      const store = transaction.objectStore('videos');
      const request = store.put({ id, blob, metadata, timestamp: Date.now() });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getVideo(id: string): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['videos'], 'readonly');
      const store = transaction.objectStore('videos');
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result?.blob || null);
      };
    });
  }

  async saveProgress(progress: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      const request = store.put({ ...progress, updatedAt: Date.now() });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getProgress(courseId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');
      const index = store.index('courseId');
      const request = index.getAll(courseId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteVideo(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['videos'], 'readwrite');
      const store = transaction.objectStore('videos');
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getStorageInfo(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      };
    }
    return { used: 0, available: 0 };
  }
}

export const offlineStorage = new OfflineStorage();