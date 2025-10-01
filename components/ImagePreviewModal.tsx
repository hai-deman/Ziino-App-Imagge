import React, { useEffect } from 'react';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" 
        onClick={onClose}
        role="dialog" 
        aria-modal="true"
    >
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
      <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img 
            src={imageUrl} 
            alt="Xem trước ảnh" 
            className="w-full h-auto object-contain rounded-lg shadow-2xl"
        />
        <button 
            onClick={onClose} 
            className="absolute -top-4 -right-4 h-10 w-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 ring-white"
            aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
