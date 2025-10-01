import React from 'react';
import type { HookConfig, ExportConfig, ImageConfig, ImageApplicationType, AspectRatio } from '../types';
import { HOOK_TEMPLATES, TONES, LENGTHS, HUMANIZATION_STYLES, IMAGE_APPLICATION_TYPES, ASPECT_RATIOS, FILM_LENGTHS, COMIC_STYLES, COMIC_IMAGE_STYLES } from '../data';

interface ConfigPanelProps {
  hookConfig: HookConfig;
  onHookConfigChange: (config: HookConfig) => void;
  exportConfig: ExportConfig;
  onExportConfigChange: (config: ExportConfig) => void;
  humanizationStyle: string;
  onHumanizationStyleChange: (value: string) => void;
  persona: string;
  onPersonaChange: (value: string) => void;
  contentType: 'video' | 'social' | 'film' | 'sticker' | 'comic';
  onContentTypeChange: (type: 'video' | 'social' | 'film' | 'sticker' | 'comic') => void;
  postCount: number;
  onPostCountChange: (count: number) => void;
  imageConfig: ImageConfig;
  onImageConfigChange: (config: ImageConfig) => void;
  filmLength: number;
  onFilmLengthChange: (length: number) => void;
}

const ratios = ['9:16', '4:5', '1:1'];

export const UsagePurposeSelector: React.FC<ConfigPanelProps> = ({ 
    hookConfig, onHookConfigChange, 
    exportConfig, onExportConfigChange,
    humanizationStyle, onHumanizationStyleChange,
    persona, onPersonaChange,
    contentType, onContentTypeChange,
    postCount, onPostCountChange,
    imageConfig, onImageConfigChange,
    filmLength, onFilmLengthChange
}) => {
  
  const handleHookChange = (key: keyof HookConfig, value: string | number) => {
    onHookConfigChange({ ...hookConfig, [key]: value });
  };

  const handleExportChange = (key: keyof ExportConfig, value: any) => {
    onExportConfigChange({ ...exportConfig, [key]: value });
  };
  
  return (
    <div className="border-t-2 border-slate-700 pt-6 space-y-8">
      <h2 className="text-2xl font-bold text-[var(--color-secondary)] tracking-wide text-center lg:text-left">3. Cấu hình Sáng tạo</h2>
      
      {/* Content Type Selector */}
      <div>
          <label className="font-semibold text-slate-400 mb-2 block">Loại nội dung</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-lg bg-slate-800 p-1">
              <button onClick={() => onContentTypeChange('video')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${contentType === 'video' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                  🎬 Video Hook
              </button>
              <button onClick={() => onContentTypeChange('social')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${contentType === 'social' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                  🖼️ Bộ ảnh Social
              </button>
              <button onClick={() => onContentTypeChange('sticker')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${contentType === 'sticker' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                  🎨 Bộ Sticker
              </button>
               <button onClick={() => onContentTypeChange('comic')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${contentType === 'comic' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                  🖋️ Bộ truyện tranh
              </button>
              <button onClick={() => onContentTypeChange('film')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${contentType === 'film' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                  🎬 Phim Cinematics
              </button>
          </div>
      </div>

      {/* Script Config */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contentType === 'video' && (
                <div>
                <label className="font-semibold text-slate-400 mb-2 block">Hook Style</label>
                <select value={hookConfig.style} onChange={(e) => handleHookChange('style', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2">
                    {HOOK_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                </div>
            )}
            
            { contentType === 'comic' ? (
                 <div className="md:col-span-2">
                    <label className="font-semibold text-slate-400 mb-2 block">Phong cách nội dung</label>
                    <select value={hookConfig.tone} onChange={(e) => handleHookChange('tone', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2">
                        {COMIC_STYLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            ) : (
                <div className={contentType !== 'video' ? 'md:col-span-2' : ''}>
                    <label className="font-semibold text-slate-400 mb-2 block">Tone</label>
                    <select value={hookConfig.tone} onChange={(e) => handleHookChange('tone', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2">
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            )}


            {contentType === 'video' ? (
                <div>
                    <label className="font-semibold text-slate-400 mb-2 block">Độ dài (giây)</label>
                    <select value={hookConfig.length} onChange={(e) => handleHookChange('length', parseInt(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2">
                        {LENGTHS.map(l => <option key={l} value={l}>{l}s</option>)}
                    </select>
                </div>
            ) : contentType === 'social' ? (
                <div>
                    <label className="font-semibold text-slate-400 mb-2 block">Số lượng bài đăng</label>
                    <input type="number" min="1" max="10" value={postCount} onChange={e => onPostCountChange(parseInt(e.target.value) || 1)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2"/>
                </div>
            ) : contentType === 'sticker' ? (
                <div>
                    <label className="font-semibold text-slate-400 mb-2 block">Số lượng sticker</label>
                    <input type="number" min="1" max="12" value={postCount} onChange={e => onPostCountChange(parseInt(e.target.value) || 1)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2"/>
                </div>
            ) : contentType === 'comic' ? (
                 <div>
                    <label className="font-semibold text-slate-400 mb-2 block">Số lượng khung truyện</label>
                    <input type="number" min="2" max="12" value={postCount} onChange={e => onPostCountChange(parseInt(e.target.value) || 2)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2"/>
                </div>
            ) : ( // film
                 <div>
                    <label className="font-semibold text-slate-400 mb-2 block">Độ dài phim</label>
                    <select value={filmLength} onChange={(e) => onFilmLengthChange(parseInt(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2">
                        {FILM_LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                </div>
            )}
        </div>
        {contentType !== 'social' && contentType !== 'sticker' && contentType !== 'comic' && (
            <div className="text-sm text-slate-500 text-center md:text-right">
                Gợi ý: Mỗi ảnh/cảnh storyboard tương ứng khoảng <b>2.5 giây</b>.
            </div>
        )}
      </div>


      {/* Humanization Config */}
      <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 tracking-wide">Tùy chỉnh Nhân hóa (Tùy chọn)</h3>
          <p className="text-sm text-slate-500">Giúp AI tạo ra kịch bản có cá tính và "người" hơn. Sẽ được áp dụng khi bạn nhấn "Tạo Kịch bản".</p>
          
          <div className={`grid grid-cols-1 ${contentType !== 'sticker' && contentType !== 'comic' ? 'md:grid-cols-2' : ''} gap-4`}>
            <div>
                <label htmlFor="humanization-style" className="font-semibold text-slate-400 mb-2 block">Phong cách nhân hóa</label>
                <select id="humanization-style" value={humanizationStyle} onChange={(e) => onHumanizationStyleChange(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2">
                    {HUMANIZATION_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            {contentType !== 'sticker' && contentType !== 'comic' && (
                <div>
                    <label htmlFor="persona" className="font-semibold text-slate-400 mb-2 block">Persona người kể chuyện</label>
                    <input
                        type="text"
                        id="persona"
                        value={persona}
                        onChange={(e) => onPersonaChange(e.target.value)}
                        placeholder="VD: Cô gái 25 tuổi, ở Sài Gòn,..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 placeholder:text-slate-500"
                    />
                </div>
            )}
          </div>
      </div>
      
      {/* Image Generation Config */}
      <div className="space-y-4 pt-6 border-t border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-300 tracking-wide">Tùy chỉnh Hình ảnh</h3>
          <p className="text-sm text-slate-500">Chọn loại hình và tỷ lệ khung hình cho ảnh được tạo bởi AI.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="application-type" className="font-semibold text-slate-400 mb-2 block">Loại hình ảnh</label>
                <select 
                    id="application-type" 
                    value={imageConfig.applicationType} 
                    onChange={(e) => onImageConfigChange({ ...imageConfig, applicationType: e.target.value as ImageApplicationType })} 
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2"
                >
                    {IMAGE_APPLICATION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="aspect-ratio" className="font-semibold text-slate-400 mb-2 block">Tỷ lệ khung hình</label>
                <select 
                    id="aspect-ratio" 
                    value={imageConfig.aspectRatio} 
                    onChange={(e) => onImageConfigChange({ ...imageConfig, aspectRatio: e.target.value as AspectRatio })} 
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2"
                >
                    {ASPECT_RATIOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
          </div>
           {contentType === 'comic' && (
            <div className="mt-4">
                <label htmlFor="comic-style" className="font-semibold text-slate-400 mb-2 block">Phong cách hình ảnh truyện tranh</label>
                <select 
                    id="comic-style" 
                    value={imageConfig.style || COMIC_IMAGE_STYLES[0]} 
                    onChange={(e) => onImageConfigChange({ ...imageConfig, style: e.target.value })} 
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2"
                >
                    {COMIC_IMAGE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
          )}
      </div>


      {/* Export Config */}
      {contentType === 'video' && (
        <div className="pt-6 border-t border-slate-700/50">
          <label className="font-semibold text-slate-400 mb-2 block">Tỷ lệ xuất (cho video)</label>
          <div className="flex gap-4 items-center flex-wrap">
              {ratios.map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input 
                          type="checkbox"
                          checked={exportConfig.ratios[r as keyof ExportConfig['ratios']]}
                          onChange={e => handleExportChange('ratios', {...exportConfig.ratios, [r]: e.target.checked})}
                          className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span>{r}</span>
                  </label>
              ))}
              <div className="flex-grow"></div>
               <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                      type="checkbox"
                      checked={exportConfig.generateVariants}
                      onChange={e => handleExportChange('generateVariants', e.target.checked)}
                      className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span>Tạo 2 biến thể A/B</span>
              </label>
          </div>
        </div>
      )}
    </div>
  );
};
