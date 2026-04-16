// src/components/learning/CourseCard.tsx (Updated)
'use client';

import { useState } from 'react';
import { BookOpen, Clock, Award, Download, ChevronRight, Video as VideoIcon, FileText } from 'lucide-react';
import { Course, Video } from '@/types/learning';
import VideoPlayer from './VideoPlayer';
import PDFViewer from './PDFViewer';

interface CourseCardProps {
  course: Course;
  onProgressUpdate?: (courseId: string, progress: number) => void;
  onDownload?: (video: Video) => void;
}

export default function CourseCard({ course, onProgressUpdate, onDownload }: CourseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [localProgress, setLocalProgress] = useState(course.progress);

  const handleVideoProgress = (videoId: string, progress: number) => {
    const updatedVideos = course.videos.map(v => 
      v.id === videoId ? { ...v, progress, lastPosition: (progress / 100) * v.duration } : v
    );
    
    const totalProgress = updatedVideos.reduce((sum, v) => sum + v.progress, 0) / updatedVideos.length;
    setLocalProgress(totalProgress);
    onProgressUpdate?.(course.id, totalProgress);
  };

  const handleVideoComplete = (videoId: string) => {
    const allCompleted = course.videos.every(v => 
      v.id === videoId ? true : v.progress === 100
    );
    
    if (allCompleted && !course.completed) {
      alert(`🎉 Congratulations! You've completed "${course.title}"!`);
    }
  };

  const totalDuration = course.videos.reduce((sum, v) => sum + v.duration, 0);
  const downloadedCount = course.videos.filter(v => v.downloaded).length;
  const completedVideos = course.videos.filter(v => v.progress === 100).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Course Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Thumbnail */}
          <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{course.category}</span>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{course.instructor}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{Math.floor(totalDuration / 60)} min total</span>
              </div>
              <div className="flex items-center">
                <VideoIcon className="h-4 w-4 mr-1" />
                <span>{course.videos.length} videos</span>
              </div>
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                <span>{downloadedCount} downloaded</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>{completedVideos} of {course.videos.length} completed</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - localProgress / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{Math.round(localProgress)}%</span>
              </div>
            </div>
            {localProgress === 100 && (
              <div className="mt-2 flex items-center text-green-600 justify-end">
                <Award className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Completed!</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${localProgress}%` }}
            />
          </div>
        </div>
        
        <div className="mt-4 flex items-center text-blue-600">
          <span className="text-sm">{expanded ? 'Hide course content' : 'Expand to view lessons'}</span>
          <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {/* Video List */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <VideoIcon className="h-5 w-5 mr-2 text-blue-600" />
              Course Videos ({course.videos.length})
            </h4>
            <div className="space-y-3">
              {course.videos.map((video, index) => (
                <div key={video.id} className="border rounded-lg overflow-hidden bg-white">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedVideo(selectedVideo === video.id ? null : video.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        video.progress === 100 ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {video.progress === 100 ? (
                          <Award className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{video.title}</p>
                        <p className="text-sm text-gray-500">{Math.floor(video.duration / 60)} min • {video.progress}% watched</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {video.downloaded && (
                        <div className="flex items-center text-green-600 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Offline
                        </div>
                      )}
                      <div className="w-24">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                        selectedVideo === video.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                  
                  {/* Video Player */}
                  {selectedVideo === video.id && (
                    <div className="p-4 bg-gray-50 border-t">
                      <VideoPlayer
                        video={video}
                        courseId={course.id}
                        onProgress={(progress) => handleVideoProgress(video.id, progress)}
                        onComplete={() => handleVideoComplete(video.id)}
                        onDownload={onDownload}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Documents */}
          {course.documents.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Study Materials ({course.documents.length})
              </h4>
              <div className="grid gap-3">
                {course.documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <p className="text-sm text-gray-500">{doc.size} MB • PDF Document</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDocument(selectedDocument === doc.id ? null : doc.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {selectedDocument === doc.id ? 'Close' : 'View Online'}
                      </button>
                    </div>
                    
                    {/* PDF Viewer */}
                    {selectedDocument === doc.id && (
                      <div className="mt-4 pt-4 border-t">
                        <PDFViewer document={doc} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}