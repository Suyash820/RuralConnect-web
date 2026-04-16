// src/hooks/useOfflineLearning.ts

import { useState, useEffect } from 'react';
import { offlineStorage } from '@/lib/db/indexedDB';
import { Course, Video, Document, DownloadQueueItem } from '@/types/learning';

export function useOfflineLearning() {
  const [isOnline, setIsOnline] = useState(true);
  const [downloadQueue, setDownloadQueue] = useState<DownloadQueueItem[]>([]);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0 });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    offlineStorage.init().then(() => {
      loadStorageInfo();
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadStorageInfo = async () => {
    const info = await offlineStorage.getStorageInfo();
    setStorageInfo(info);
  };

  const downloadVideo = async (video: Video, onProgress?: (progress: number) => void): Promise<void> => {
    try {
      // Add to queue
      const queueItem: DownloadQueueItem = {
        id: video.id,
        type: 'video',
        title: video.title,
        url: video.url,
        progress: 0,
        status: 'downloading',
        size: 0
      };
      setDownloadQueue(prev => [...prev, queueItem]);
      
      // Fetch video
      const response = await fetch(video.url);
      const reader = response.body?.getReader();
      const contentLength = parseInt(response.headers.get('Content-Length') || '0');
      
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        if (contentLength) {
          const progress = (receivedLength / contentLength) * 100;
          onProgress?.(progress);
          updateQueueProgress(video.id, progress);
        }
      }
      
      const blob = new Blob(chunks);
      await offlineStorage.saveVideo(video.id, blob, { title: video.title, duration: video.duration });
      
      // Update queue
      setDownloadQueue(prev => prev.map(item => 
        item.id === video.id ? { ...item, status: 'completed', progress: 100 } : item
      ));
      
      await loadStorageInfo();
    } catch (error) {
      setDownloadQueue(prev => prev.map(item => 
        item.id === video.id ? { ...item, status: 'failed' } : item
      ));
      throw error;
    }
  };

  const updateQueueProgress = (id: string, progress: number) => {
    setDownloadQueue(prev => prev.map(item => 
      item.id === id ? { ...item, progress } : item
    ));
  };

  const getOfflineVideo = async (videoId: string): Promise<Blob | null> => {
    return await offlineStorage.getVideo(videoId);
  };

  const deleteOfflineVideo = async (videoId: string): Promise<void> => {
    await offlineStorage.deleteVideo(videoId);
    await loadStorageInfo();
  };

  const saveProgress = async (courseId: string, videoId: string, position: number, completed: boolean) => {
    await offlineStorage.saveProgress({
      id: `${courseId}-${videoId}`,
      courseId,
      videoId,
      position,
      completed,
      timestamp: Date.now()
    });
  };

  const formatStorage = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return {
    isOnline,
    downloadQueue,
    storageInfo: {
      used: formatStorage(storageInfo.used),
      available: formatStorage(storageInfo.available),
      percentage: (storageInfo.used / storageInfo.available) * 100
    },
    downloadVideo,
    getOfflineVideo,
    deleteOfflineVideo,
    saveProgress
  };
}