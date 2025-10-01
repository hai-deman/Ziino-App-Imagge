import React from 'react';

interface StoryInputProps {
  trendIdea: string;
  onTrendIdeaChange: (value: string) => void;
  adScript: string;
  onAdScriptChange: (value: string) => void;
  contentType: 'video' | 'social' | 'film' | 'sticker' | 'comic';
}

export const StoryInput: React.FC<StoryInputProps> = ({ trendIdea, onTrendIdeaChange, adScript, onAdScriptChange, contentType }) => {
  const showAdScript = contentType !== 'sticker' && contentType !== 'comic';
  
  return (
    <div className="flex flex-col space-y-6 border-t-2 border-slate-700 pt-6">
      <h2 className="text-2xl font-bold text-[var(--color-secondary)] tracking-wide text-center lg:text-left">
        {showAdScript ? "2. Nhập Ý tưởng & Kịch bản" : "2. Nhập Ý tưởng"}
      </h2>
      
      <div className="flex flex-col gap-2">
         <label htmlFor="trend-idea" className="font-semibold text-slate-400">
            Ý tưởng / Trend {showAdScript && 'cho Visual Hook'} <span className="text-red-500">*</span>
         </label>
         <p className="text-sm text-slate-500">
            Nhập một ý tưởng, mô tả meme, hoặc dán link video/hình ảnh trend. AI sẽ dùng nó làm cảm hứng chính.
         </p>
         <textarea
            id="trend-idea"
            value={trendIdea}
            onChange={(e) => onTrendIdeaChange(e.target.value)}
            placeholder="Ví dụ: 'POV: Khi bạn lỡ lời trước mặt crush' hoặc 'Ziino đang nằm dài trên ghế sofa, than thở về deadline'..."
            rows={3}
            className="w-full flex-grow bg-slate-900/70 border-2 border-slate-600 rounded-lg p-4 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      {showAdScript && (
        <div className="flex flex-col gap-2">
           <label htmlFor="ad-script" className="font-semibold text-slate-400">
              Kịch bản quảng cáo chính <span className="text-red-500">*</span>
           </label>
           <p className="text-sm text-slate-500">
              Dán kịch bản video quảng cáo của bạn vào đây. Hook được tạo ra sẽ dẫn dắt vào kịch bản này.
           </p>
           <textarea
              id="ad-script"
              value={adScript}
              onChange={(e) => onAdScriptChange(e.target.value)}
              placeholder="Ví dụ: Cảnh 1: Một chàng trai đang loay hoay trong bếp..."
              rows={5}
              className="w-full flex-grow bg-slate-900/70 border-2 border-slate-600 rounded-lg p-4 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
      )}
    </div>
  );
};