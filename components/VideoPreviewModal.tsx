import React, { useState, useEffect, useCallback } from 'react';
import type { StoryboardPanelData } from '../types';

interface VideoPreviewModalProps {
  panels: StoryboardPanelData[];
  startIndex: number;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ panels, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % panels.length);
  }, [panels.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + panels.length) % panels.length);
  }, [panels.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious, onClose]);

  const currentPanel = panels[currentIndex];
  if (!currentPanel) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="relative bg-slate-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-xl font-bold text-cyan-300">
            Xem trước: Cảnh {currentPanel.scene}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
            {currentPanel.videoUrl ? (
                <video
                    key={currentPanel.videoUrl}
                    src={currentPanel.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[60vh] object-contain rounded bg-black"
                >
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="w-full aspect-video bg-black rounded flex items-center justify-center">
                    <p className="text-slate-500">Video không có sẵn.</p>
                </div>
            )}
             <p className="mt-4 text-center text-slate-300">{currentPanel.description}</p>
        </div>


        <div className="flex justify-between items-center p-4 border-t border-slate-700">
          <button onClick={goToPrevious} className="px-6 py-2 bg-slate-700 text-cyan-300 rounded-full font-semibold hover:bg-slate-600 transition-colors">
            Trước
          </button>
          <span className="text-slate-400">{currentIndex + 1} / {panels.length}</span>
          <button onClick={goToNext} className="px-6 py-2 bg-slate-700 text-cyan-300 rounded-full font-semibold hover:bg-slate-600 transition-colors">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};
