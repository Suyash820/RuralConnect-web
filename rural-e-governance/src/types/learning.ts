// src/types/learning.ts

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail: string;
  videos: Video[];
  documents: Document[];
  progress: number; // 0-100
  completed: boolean;
  lastWatched?: number; // timestamp
}

export interface Video {
  id: string;
  title: string;
  duration: number; // in seconds
  url: string;
  thumbnail: string;
  progress: number; // watch progress 0-100
  lastPosition: number; // last watched position in seconds
  downloaded: boolean;
  downloadProgress?: number;
}

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt';
  url: string;
  size: number; // in MB
  downloaded: boolean;
  downloadProgress?: number;
}

export interface DownloadQueueItem {
  id: string;
  type: 'video' | 'document';
  title: string;
  url: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  size: number;
}

export interface LearningProgress {
  courseId: string;
  videoId: string;
  position: number; // in seconds
  timestamp: number;
  completed: boolean;
}