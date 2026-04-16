// src/components/learning/PDFViewer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, FileText, ExternalLink } from 'lucide-react';
import { Document as DocumentType } from '@/types/learning';
import { useOfflineLearning } from '@/hooks/useOfflineLearning';

interface PDFViewerProps {
  document: DocumentType;
}

export default function PDFViewer({ document }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(document.downloaded);
  const [error, setError] = useState<string | null>(null);
  
  const { isOnline } = useOfflineLearning();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async () => {
    if (isDownloaded) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(document.url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setIsDownloaded(true);
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewOnline = () => {
    window.open(document.url, '_blank');
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <FileText className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 mb-2">Failed to load PDF</p>
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <button
          onClick={handleViewOnline}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Open in New Tab
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">{document.title}</span>
          <span className="text-xs text-gray-500">({document.size} MB)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleViewOnline}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Online</span>
          </button>
          
          {isOnline && !isDownloaded && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Save PDF</span>
                </>
              )}
            </button>
          )}
          
          {isDownloaded && (
            <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <Download className="h-4 w-4" />
              <span className="text-sm">Saved offline</span>
            </div>
          )}
        </div>
      </div>
      
      {/* PDF Preview Placeholder (instead of actual PDF render) */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96 bg-white rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Loading preview...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border">
          {/* PDF Preview */}
          <div className="relative h-96 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">PDF Document: {document.title}</p>
              <p className="text-sm text-gray-500 mb-4">Size: {document.size} MB</p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleViewOnline}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  View Full Document
                </button>
                {!isDownloaded && (
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Document Info */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Pages: Multiple pages</span>
              <span>Format: PDF</span>
              <span>Compatible with: Adobe Reader, Browsers</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}