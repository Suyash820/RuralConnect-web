// src/api/offlineSync.js
import { executeSql, getPendingComplaints } from '../services/database';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineSync {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
  }

  startAutoSync() {
    // Check every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 5 * 60 * 1000);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  async syncData() {
    if (this.isSyncing) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      console.log('No network connection for sync');
      return;
    }

    this.isSyncing = true;
    try {
      // Sync complaints
      const pendingComplaints = await getPendingComplaints();
      
      for (const complaint of pendingComplaints) {
        try {
          // API call to sync with server
          const response = await fetch('https://your-api-endpoint/complaints', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(complaint)
          });

          if (response.ok) {
            // Mark as synced
            await executeSql(
              'UPDATE complaints SET sync_status = 1 WHERE id = ?',
              [complaint.id]
            );
            console.log(`Complaint ${complaint.id} synced successfully`);
          }
        } catch (error) {
          console.error('Sync error for complaint:', complaint.id, error);
        }
      }

      console.log('Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async queueForSync(tableName, recordId, operation, data) {
    await executeSql(
      'INSERT INTO sync_queue (table_name, record_id, operation, data) VALUES (?, ?, ?, ?)',
      [tableName, recordId, operation, JSON.stringify(data)]
    );
  }
}

export default new OfflineSync();