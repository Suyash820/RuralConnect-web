// src/components/learning/VideoPlayer.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Download,
  SkipBack, SkipForward, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { Video } from '@/types/learning';
import { useOfflineLearning } from '@/hooks/useOfflineLearning';

interface VideoPlayerProps {
  video: Video;
  courseId: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onDownload?: (video: Video) => void;
}

export default function VideoPlayer({ video, courseId, onProgress, onComplete, onDownload }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(video.lastPosition || 0);
  const [duration, setDuration] = useState(video.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(video.downloaded);
  const [downloadProgress, setDownloadProgress] = useState(video.downloadProgress || 0);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isOnline, getOfflineVideo, saveProgress } = useOfflineLearning();

  // Load video (online or offline)
  useEffect(() => {
    loadVideo();
  }, [video.id, isOnline]);

  const loadVideo = async () => {
    setIsLoading(true);
    setError(null);
    const videoElement = videoRef.current;
    if (!videoElement) return;

    try {
      // Try to load offline version first
      const offlineBlob = await getOfflineVideo(video.id);
      if (offlineBlob) {
        const url = URL.createObjectURL(offlineBlob);
        videoElement.src = url;
        setIsDownloaded(true);
      } else if (isOnline && video.url) {
        videoElement.src = video.url;
      } else {
        throw new Error('No offline version available and you are offline');
      }
      
      await videoElement.load();
      if (video.lastPosition > 0 && video.lastPosition < (video.duration || Infinity)) {
        videoElement.currentTime = video.lastPosition;
      }
    } catch (err) {
      console.error('Error loading video:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  // Resume from last position
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && video.lastPosition > 0 && !isLoading && videoElement.readyState >= 1) {
      videoElement.currentTime = video.lastPosition;
    }
  }, [isLoading]);

  // Save progress periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current && !isLoading && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        const position = videoRef.current.currentTime;
        const progressPercent = (position / videoRef.current.duration) * 100;
        await saveProgress(courseId, video.id, position, progressPercent >= 95);
        onProgress?.(progressPercent);
        if (progressPercent >= 95 && !video.completed) {
          onComplete?.();
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [duration, isLoading]);

  const handlePlay = async () => {
    try {
      await videoRef.current?.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Play failed:', err);
      setError('Unable to play video. Please try again.');
    }
  };

  const handlePause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration && videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setError('Failed to load video. Please check your connection or try downloading.');
    setIsLoading(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement?.parentElement;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current && !isNaN(time)) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = async () => {
    if (isDownloaded) {
      alert('Video already downloaded!');
      return;
    }
    
    setIsDownloading(true);
    try {
      if (onDownload) {
        await onDownload(video);
        setIsDownloaded(true);
        setDownloadProgress(100);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please check your internet connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black rounded-xl overflow-hidden">
      {/* Video Element */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onError={handleError}
          onClick={isPlaying ? handlePause : handlePlay}
          playsInline
          preload="metadata"
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
            <span className="ml-3 text-white">Loading video...</span>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-white text-sm mb-2 max-w-md px-4">{error}</p>
              {!isDownloaded && isOnline && (
                <button
                  onClick={handleDownload}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Download for Offline
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Controls */}
        {!isLoading && !error && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
            {/* Progress Bar */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, #4b5563 ${(currentTime / (duration || 1)) * 100}%)`
              }}
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-3">
                {/* Play/Pause */}
                <button onClick={isPlaying ? handlePause : handlePlay} className="text-white hover:text-blue-400">
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                
                {/* Skip Back/Forward */}
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(0, currentTime - 10);
                    }
                  }}
                  className="text-white hover:text-blue-400"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.min(duration, currentTime + 10);
                    }
                  }}
                  className="text-white hover:text-blue-400"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
                
                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="text-white hover:text-blue-400">
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                {/* Time */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Download Button */}
                {isOnline && !isDownloaded && video.url && (
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">{Math.round(downloadProgress)}%</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span className="text-sm">Save Offline</span>
                      </>
                    )}
                  </button>
                )}
                
                {/* Downloaded Badge */}
                {isDownloaded && (
                  <div className="flex items-center space-x-1 text-green-400 bg-black/50 px-2 py-1 rounded">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Available Offline</span>
                  </div>
                )}
                
                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="text-white hover:text-blue-400">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}