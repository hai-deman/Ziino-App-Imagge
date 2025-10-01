import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generateAndEvaluateScript, generateStoryboardImage, humanizeScript } from './services/geminiService';
import type { BrandId, GeneratedItem, HookConfig, ExportConfig, MascotFile, ScriptScene, ContentScore, ImageConfig, Channel, CreationContext } from './types';
import { BRAND_PACKS, HUMANIZATION_STYLES, COMIC_IMAGE_STYLES } from './data';
import { Header } from './components/Header';
import { MascotUploader } from './components/MascotUploader';
import { StoryInput } from './components/StoryInput';
import { UsagePurposeSelector } from './components/UsagePurposeSelector';
import { MediaLibrary } from './components/MediaLibrary';
import { Loader } from './components/Loader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { CreativeFormulaSelector, VideoOptions, VideoPreviewModal } from './components/EmptyComponents';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { BrandChannelSelector } from './components/BrandChannelSelector';

// =================================================================================
// SceneAudioRecorder Component
// =================================================================================
interface SceneAudioRecorderProps {
    audioUrl: string | null;
    onRecordingComplete: (audioUrl: string) => void;
    onDelete: () => void;
}

const SceneAudioRecorder: React.FC<SceneAudioRecorderProps> = ({ audioUrl, onRecordingComplete, onDelete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        if (permissionError) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermissionError(false);
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                onRecordingComplete(audioUrl);
                audioChunksRef.current = [];
                 // Stop all tracks to turn off the mic indicator
                stream.getTracks().forEach(track => track.stop());
            };
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone permission denied:", err);
            setPermissionError(true);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleRecordClick = () => {
        if (isRecording) {
            handleStopRecording();
        } else {
            handleStartRecording();
        }
    };
    
    if (audioUrl) {
        return (
             <div className="flex items-center gap-2 mt-2">
                <audio src={audioUrl} controls className="w-full h-8" />
                <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 transition-colors" aria-label="Delete audio">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
            </div>
        )
    }

    return (
        <div className="mt-2">
            <button onClick={handleRecordClick} className={`w-full px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors flex items-center justify-center gap-2 ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-slate-600 hover:bg-slate-500'}`}>
                {isRecording ? (
                    <>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>
                        Dừng
                    </>
                ) : (
                    <>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/><path d="M8 8a3 3 0 0 0-3 3v1h6v-1a3 3 0 0 0-3-3z"/></svg>
                        Ghi âm lồng thoại
                    </>
                )}
            </button>
            {permissionError && <p className="text-xs text-red-400 mt-1">Cần quyền truy cập micro.</p>}
        </div>
    )
}

// =================================================================================
// AnimaticPreviewModal Component
// =================================================================================
interface AnimaticPreviewModalProps {
    generation: GeneratedItem;
    onClose: () => void;
}

const AnimaticPreviewModal: React.FC<AnimaticPreviewModalProps> = ({ generation, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);
    const timerRef = useRef<number | null>(null);
    const { script, storyboardImages, storyboardAudio } = generation;

    const advanceScene = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % script.length);
    }, [script.length]);

    useEffect(() => {
        if (!isPlaying) {
            if (timerRef.current) clearTimeout(timerRef.current);
            audioRef.current?.pause();
            return;
        }

        const scene = script[currentIndex];
        const audioUrl = storyboardAudio[currentIndex];

        if (audioRef.current) {
            audioRef.current.onended = null; // Clear previous listener
        }
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (audioUrl && audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
            audioRef.current.onended = advanceScene;
        } else {
            const duration = (scene.duration_s || 2.5) * 1000;
            timerRef.current = window.setTimeout(advanceScene, duration);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (audioRef.current) {
                audioRef.current.onended = null;
            }
        };
    }, [currentIndex, isPlaying, script, storyboardAudio, advanceScene]);
    
    const handlePrevious = () => setCurrentIndex(prev => (prev - 1 + script.length) % script.length);
    const handleNext = () => setCurrentIndex(prev => (prev + 1) % script.length);
    const handleTogglePlay = () => setIsPlaying(prev => !prev);
    
    const currentImage = storyboardImages[currentIndex];

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="relative w-full max-w-4xl aspect-[9/16] bg-black border border-slate-700 rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                {currentImage ? (
                    <img src={`data:image/jpeg;base64,${currentImage}`} alt={`Scene ${currentIndex + 1}`} className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">Ảnh chưa được tạo</div>
                )}
                <audio ref={audioRef} className="hidden" />

                {/* Close Button */}
                 <button onClick={onClose} className="absolute -top-3 -right-3 h-10 w-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 ring-white z-10" aria-label="Đóng">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        {script.map((_, index) => (
                             <div key={index} className={`h-1 flex-1 rounded-full ${index < currentIndex ? 'bg-[var(--color-primary)]' : index === currentIndex ? 'bg-white' : 'bg-slate-600'}`}></div>
                        ))}
                    </div>
                     <div className="flex items-center justify-center gap-6 text-white">
                        <button onClick={handlePrevious}><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M8.445 14.832A1 1 0 0010 14.126V5.874a1 1 0 00-1.555-.832L4.212 9.168a1 1 0 000 1.664l4.233 4.001z" /><path d="M13.445 14.832A1 1 0 0015 14.126V5.874a1 1 0 00-1.555-.832L9.212 9.168a1 1 0 000 1.664l4.233 4.001z" /></svg></button>
                        <button onClick={handleTogglePlay} className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white">
                            {isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                        </button>
                        <button onClick={handleNext}><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M6.555 5.168A1 1 0 005 5.874v8.252a1 1 0 001.555.832l4.233-4.126a1 1 0 000-1.664L6.555 5.168z" /><path d="M11.555 5.168A1 1 0 0010 5.874v8.252a1 1 0 001.555.832l4.233-4.126a1 1 0 000-1.664l-4.233-4.126z" /></svg></button>
                    </div>
                </div>
            </div>
        </div>
    )
};


// =================================================================================
// ScriptReview Component
// =================================================================================
interface ScriptReviewProps {
  generation: GeneratedItem;
  score: ContentScore;
  onGenerateImage: (sceneIndex: number) => void;
  onGenerateAllImages: () => void;
  onHumanize: () => void;
  isGeneratingImages: boolean;
  isHumanizing: boolean;
  onAddAudio: (sceneIndex: number, audioUrl: string) => void;
  onDeleteAudio: (sceneIndex: number) => void;
  onPreview: (generation: GeneratedItem) => void;
  onDurationChange: (sceneIndex: number, duration: number) => void;
  onRegenerateImage: (sceneIndex: number, newPrompt: string) => void;
}

const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 75 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <span className={`text-4xl font-bold ${color}`}>{score}</span>
        </div>
    );
};

const ScriptReview: React.FC<ScriptReviewProps> = ({ generation, score, onGenerateImage, onGenerateAllImages, onHumanize, isGeneratingImages, isHumanizing, onAddAudio, onDeleteAudio, onPreview, onDurationChange, onRegenerateImage }) => {
    const [editingRegeneration, setEditingRegeneration] = useState<{ index: number; prompt: string } | null>(null);
    const allImagesGenerated = generation.storyboardImages.every(img => img !== null);
    const canPreview = generation.storyboardImages.some(img => img !== null) || generation.storyboardAudio.some(audio => audio !== null);
    const totalDuration = useMemo(() => generation.script.reduce((acc, scene) => acc + (scene.duration_s || 0), 0), [generation.script]).toFixed(1);

    return (
        <div className="mt-8 bg-slate-800/50 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-transparent bg-clip-text mb-6">
                Kịch bản & Đánh giá AI
            </h2>

            {/* Score & Suggestions */}
            <div className="bg-slate-900/50 rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex flex-col items-center gap-2">
                    <ScoreDisplay score={score.score} />
                    <h3 className="text-lg font-bold text-slate-200 mt-2">Độ "Người"</h3>
                </div>
                <div className="flex-1 text-slate-300">
                    <h4 className="font-bold text-white mb-2">Nhận xét từ AI:</h4>
                    <p className="mb-4 text-sm italic">"{score.feedback}"</p>
                    <h4 className="font-bold text-white mb-2">Gợi ý nhân hóa:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {score.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                    <button 
                        onClick={onHumanize} 
                        disabled={isHumanizing}
                        className="mt-4 px-4 py-2 text-sm font-semibold bg-[var(--color-secondary)] text-white rounded-md hover:opacity-90 transition-opacity disabled:bg-slate-600">
                        {isHumanizing ? 'Đang xử lý...' : 'Yêu cầu AI nhân hóa lại'}
                    </button>
                </div>
            </div>

            {/* Script & Image Generation */}
            <div>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-200">Phân cảnh & Hình ảnh</h3>
                         {(generation.type === 'video' || generation.type === 'film') && (
                            <p className="text-sm text-slate-400 mt-1">Tổng thời lượng ước tính: <span className="font-bold text-white">{totalDuration}s</span></p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => onPreview(generation)}
                            disabled={!canPreview}
                            className="px-6 py-2 bg-[var(--color-secondary)] text-white font-bold rounded-lg shadow-lg shadow-[var(--color-secondary)]/30 hover:opacity-90 transition-all disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            🎬 Preview Video
                        </button>
                        <button
                            onClick={onGenerateAllImages}
                            disabled={isGeneratingImages || allImagesGenerated}
                            className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg shadow-lg shadow-[var(--color-primary)]/30 hover:opacity-90 transition-all disabled:bg-slate-600 disabled:shadow-none"
                        >
                            {isGeneratingImages ? 'Đang tạo ảnh...' : allImagesGenerated ? 'Đã tạo tất cả ảnh' : '✨ Tạo tất cả hình ảnh'}
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {generation.script.map((scene, index) => (
                        <div key={scene.scene} className="bg-slate-900/50 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-full sm:w-40 h-auto sm:h-auto aspect-auto bg-slate-800 rounded flex-shrink-0">
                                {generation.storyboardImages[index] ? (
                                    <div className="relative group w-full h-full">
                                        <img 
                                            src={`data:image/jpeg;base64,${generation.storyboardImages[index]}`} 
                                            alt={`Cảnh ${scene.scene}`}
                                            className="w-full h-full object-cover rounded"
                                        />
                                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                            <button 
                                                onClick={() => setEditingRegeneration({ index, prompt: scene.visual_cue })}
                                                disabled={isGeneratingImages || !!editingRegeneration}
                                                className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-900 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Tạo lại ảnh
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-2" style={{aspectRatio: '9 / 16'}}>
                                        <button 
                                            onClick={() => onGenerateImage(index)}
                                            disabled={isGeneratingImages}
                                            className="px-3 py-1.5 text-xs font-semibold bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors disabled:opacity-50"
                                        >
                                            Tạo ảnh
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-slate-400 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-white text-base">Cảnh {scene.scene}</p>
                                     {(generation.type === 'video' || generation.type === 'film') && (
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                            <label htmlFor={`duration-${index}`} className="text-xs text-slate-400">Thời lượng:</label>
                                            <select
                                                id={`duration-${index}`}
                                                value={Math.round(scene.duration_s || 2)}
                                                onChange={(e) => onDurationChange(index, parseInt(e.target.value, 10))}
                                                className="bg-slate-800 border border-slate-600 rounded-md py-0.5 px-1 text-xs focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                aria-label={`Duration for scene ${scene.scene}`}
                                            >
                                                {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>{d}s</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <p><span className="font-semibold">Lời thoại:</span> "{scene.line}"</p>
                                <p><span className="font-semibold">Cảm xúc:</span> {scene.character_emotion}</p>
                                <p><span className="font-semibold">Hành động:</span> {scene.action}</p>
                                {scene.supporting_character_description && (
                                    <p className="mt-1 p-2 bg-yellow-900/50 text-yellow-300 rounded-md border border-yellow-800">
                                        <span className="font-semibold">Nhân vật phụ:</span> {scene.supporting_character_description}
                                    </p>
                                )}
                                
                                {editingRegeneration?.index === index && (
                                    <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
                                        <h4 className="text-sm font-bold text-white mb-2">Tạo lại ảnh cho Cảnh {scene.scene}</h4>
                                        <p className="text-xs text-slate-400 mb-2">Mô tả chi tiết hơn để AI tạo ảnh đúng ý bạn.</p>
                                        <textarea
                                            value={editingRegeneration.prompt}
                                            onChange={(e) => setEditingRegeneration({ ...editingRegeneration, prompt: e.target.value })}
                                            rows={4}
                                            className="w-full text-xs bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button 
                                                onClick={() => {
                                                    onRegenerateImage(editingRegeneration.index, editingRegeneration.prompt);
                                                    setEditingRegeneration(null);
                                                }}
                                                disabled={isGeneratingImages || !editingRegeneration.prompt.trim()}
                                                className="flex-1 px-3 py-1 text-xs font-semibold bg-[var(--color-primary)] text-white rounded-md hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed"
                                            >
                                                {isGeneratingImages ? 'Đang tạo...' : 'Xác nhận'}
                                            </button>
                                            <button 
                                                onClick={() => setEditingRegeneration(null)}
                                                disabled={isGeneratingImages}
                                                className="flex-1 px-3 py-1 text-xs bg-slate-600 text-white rounded-md hover:bg-slate-500 disabled:opacity-50"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <SceneAudioRecorder 
                                    audioUrl={generation.storyboardAudio[index]}
                                    onRecordingComplete={(audioUrl) => onAddAudio(index, audioUrl)}
                                    onDelete={() => onDeleteAudio(index)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =================================================================================
// Main App Component
// =================================================================================
const App: React.FC = () => {
  // Global State
  const [creationContext, setCreationContext] = useState<CreationContext | null>(null);
  const [channels, setChannels] = useState<Channel[]>(() => {
      // Lazy initializer for channels from localStorage or default
      try {
          const savedChannels = localStorage.getItem('ziino_channels');
          return savedChannels ? JSON.parse(savedChannels) : [
              { id: '1', name: 'Oniiz TikTok Official', type: 'tiktok', brandId: 'oniiz' },
              { id: '2', name: 'V2Joy Fanpage', type: 'fanpage', brandId: 'v2joy' },
          ];
      } catch (error) {
          console.error("Failed to parse channels from localStorage", error);
          return [];
      }
  });

  // Loading & Error State
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
  const [isHumanizing, setIsHumanizing] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Inputs State
  const [mascotAsset, setMascotAsset] = useState<MascotFile | null>(null);
  const [productAsset, setProductAsset] = useState<MascotFile | null>(null);
  const [supportingCharAsset, setSupportingCharAsset] = useState<MascotFile | null>(null);
  const [trendIdea, setTrendIdea] = useState<string>('');
  const [adScript, setAdScript] = useState<string>('');
  const [contentType, setContentType] = useState<'video' | 'social' | 'film' | 'sticker' | 'comic'>('video');
  const [postCount, setPostCount] = useState<number>(3);
  const [filmLength, setFilmLength] = useState<number>(60);
  const [hookConfig, setHookConfig] = useState<HookConfig>({
    style: 'pov',
    tone: 'Hài hước (Meme)',
    length: 15,
  });
   const [imageConfig, setImageConfig] = useState<ImageConfig>({
    applicationType: 'Cảnh Storyboard',
    aspectRatio: '9:16',
    style: COMIC_IMAGE_STYLES[0],
  });
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    ratios: { '9:16': true, '4:5': false, '1:1': false },
    generateVariants: false,
  });
  const [humanizationStyle, setHumanizationStyle] = useState(HUMANIZATION_STYLES[0]);
  const [persona, setPersona] = useState('');


  // Output State
  const [wipGeneration, setWipGeneration] = useState<GeneratedItem | null>(null);
  const [generations, setGenerations] = useState<GeneratedItem[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [previewGeneration, setPreviewGeneration] = useState<GeneratedItem | null>(null);


  const selectedBrandId = creationContext?.brandId || 'oniiz';
  const selectedBrandPack = useMemo(() => BRAND_PACKS[selectedBrandId], [selectedBrandId]);
  
  const handleAddChannel = (channel: Omit<Channel, 'id'>) => {
      const newChannel: Channel = { ...channel, id: new Date().toISOString() };
      setChannels(prev => {
          const updatedChannels = [...prev, newChannel];
          localStorage.setItem('ziino_channels', JSON.stringify(updatedChannels));
          return updatedChannels;
      });
  };

  const validateInputs = useCallback(() => {
    if (!trendIdea) {
        setError('Vui lòng nhập ý tưởng hoặc trend.');
        return false;
    }
     if (contentType !== 'sticker' && contentType !== 'comic' && !adScript) {
        setError('Vui lòng nhập kịch bản quảng cáo.');
        return false;
    }
    if (!mascotAsset) {
      setError('Vui lòng tải lên mascot Ziino trước khi tạo nội dung.');
      return false;
    }
    if ((contentType === 'social' || contentType === 'sticker' || contentType === 'comic') && postCount < 1) {
        setError('Số lượng bài đăng, sticker hoặc khung truyện phải lớn hơn 0.');
        return false;
    }
    return true;
  }, [trendIdea, adScript, mascotAsset, contentType, postCount]);

  const handleGenerateScript = useCallback(async (isRetry: boolean = false) => {
    if (!creationContext) {
      setError('Vui lòng chọn thương hiệu và kênh trước.');
      return;
    }
    if (!isRetry && !validateInputs()) return;
    
    setIsGeneratingScript(true);
    setError(null);
    setWipGeneration(null);
    try {
      const result = await generateAndEvaluateScript(
        trendIdea,
        adScript,
        selectedBrandPack,
        hookConfig,
        humanizationStyle,
        persona,
        setLoadingMessage,
        undefined, // existingScript
        contentType,
        postCount,
        filmLength
      );
      
      setWipGeneration({
          id: new Date().toISOString(),
          type: contentType,
          script: result.script,
          contentScore: result.score,
          storyboardImages: Array(result.script.length).fill(null),
          storyboardAudio: Array(result.script.length).fill(null),
          brandId: creationContext.brandId,
          channelId: creationContext.channel.id,
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Tạo kịch bản thất bại.');
    } finally {
      setIsGeneratingScript(false);
      setLoadingMessage('');
    }
  }, [trendIdea, adScript, selectedBrandPack, hookConfig, mascotAsset, humanizationStyle, persona, validateInputs, contentType, postCount, filmLength, creationContext]);

  const handleHumanize = useCallback(async () => {
      if (!wipGeneration || !creationContext) return;
      setIsHumanizing(true);
      setError(null);
      try {
        const humanizedScript = await humanizeScript(wipGeneration.script, humanizationStyle, persona);
        const result = await generateAndEvaluateScript(
            trendIdea, 
            adScript, 
            selectedBrandPack, 
            hookConfig, 
            humanizationStyle, 
            persona, 
            setLoadingMessage, 
            humanizedScript, 
            wipGeneration.type, 
            postCount, // Assuming postCount/filmLength don't change during humanization
            filmLength
        );

        setWipGeneration({
            ...wipGeneration,
            script: result.script,
            contentScore: result.score,
            storyboardImages: Array(result.script.length).fill(null),
            storyboardAudio: Array(result.script.length).fill(null),
        });

      } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'Nhân hóa kịch bản thất bại.');
      } finally {
          setIsHumanizing(false);
      }
  }, [wipGeneration, humanizationStyle, persona, trendIdea, adScript, selectedBrandPack, hookConfig, creationContext, postCount, filmLength]);

  const handleGenerateSingleImage = useCallback(async (sceneIndex: number) => {
    if (!wipGeneration || !mascotAsset) return;

    setIsGeneratingImages(true);
    try {
        const visual_cue = wipGeneration.script[sceneIndex].visual_cue;
        const imageB64 = await generateStoryboardImage(visual_cue, mascotAsset, productAsset, supportingCharAsset, imageConfig);

        const newImages = [...wipGeneration.storyboardImages];
        newImages[sceneIndex] = imageB64;
        const updatedWip = {...wipGeneration, storyboardImages: newImages};
        setWipGeneration(updatedWip);

        // If all images are done, finalize
        if (updatedWip.storyboardImages.every(img => img !== null)) {
            setGenerations(prev => [updatedWip, ...prev]);
            setWipGeneration(null);
        }

    } catch (err) {
        console.error(err);
        setError(`Tạo ảnh cho cảnh ${sceneIndex+1} thất bại.`);
    } finally {
        setIsGeneratingImages(false);
    }
  }, [wipGeneration, mascotAsset, productAsset, supportingCharAsset, imageConfig]);
  
  const handleGenerateAllImages = useCallback(async () => {
    if (!wipGeneration || !mascotAsset) return;
    
    setIsGeneratingImages(true);
    setError(null);
    let currentWip = {...wipGeneration};

    try {
        for (let i = 0; i < currentWip.script.length; i++) {
            if (currentWip.storyboardImages[i] === null) {
                setLoadingMessage(`Đang tạo ảnh cho cảnh ${i + 1}/${currentWip.script.length}...`);
                const visual_cue = currentWip.script[i].visual_cue;
                const imageB64 = await generateStoryboardImage(visual_cue, mascotAsset, productAsset, supportingCharAsset, imageConfig);

                const newImages = [...currentWip.storyboardImages];
                newImages[i] = imageB64;
                currentWip = {...currentWip, storyboardImages: newImages};
                setWipGeneration(currentWip);
            }
        }
        setGenerations(prev => [currentWip, ...prev]);
        setWipGeneration(null);
    } catch (err)
 {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Tạo bộ ảnh thất bại.');
    } finally {
        setIsGeneratingImages(false);
        setLoadingMessage('');
    }
  }, [wipGeneration, mascotAsset, productAsset, supportingCharAsset, imageConfig]);

  const handleRegenerateImage = useCallback(async (sceneIndex: number, newPrompt: string) => {
    if (!wipGeneration || !mascotAsset || !newPrompt.trim()) return;

    setIsGeneratingImages(true);
    setError(null);
    
    try {
        const updatedScript = [...wipGeneration.script];
        updatedScript[sceneIndex] = { ...updatedScript[sceneIndex], visual_cue: newPrompt };
        
        const imageB64 = await generateStoryboardImage(newPrompt, mascotAsset, productAsset, supportingCharAsset, imageConfig);

        setWipGeneration(prevWip => {
            if (!prevWip) return null;
            const newImages = [...prevWip.storyboardImages];
            newImages[sceneIndex] = imageB64;
            return {
                ...prevWip,
                script: updatedScript, 
                storyboardImages: newImages
            };
        });

    } catch (err) {
        console.error(err);
        setError(`Tạo lại ảnh cho cảnh ${sceneIndex + 1} thất bại.`);
    } finally {
        setIsGeneratingImages(false);
    }
  }, [wipGeneration, mascotAsset, productAsset, supportingCharAsset, imageConfig]);


  const handleAddAudio = (sceneIndex: number, audioUrl: string) => {
    if (!wipGeneration) return;
    const newAudios = [...wipGeneration.storyboardAudio];
    newAudios[sceneIndex] = audioUrl;
    setWipGeneration({ ...wipGeneration, storyboardAudio: newAudios });
  };

  const handleDeleteAudio = (sceneIndex: number) => {
    if (!wipGeneration) return;
    const currentUrl = wipGeneration.storyboardAudio[sceneIndex];
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl); // Clean up blob URL to prevent memory leaks
    }
    const newAudios = [...wipGeneration.storyboardAudio];
    newAudios[sceneIndex] = null;
    setWipGeneration({ ...wipGeneration, storyboardAudio: newAudios });
  };
  
  const handleSceneDurationChange = (sceneIndex: number, duration: number) => {
    if (!wipGeneration) return;

    const updatedScript = [...wipGeneration.script];
    if (updatedScript[sceneIndex]) {
        updatedScript[sceneIndex] = { ...updatedScript[sceneIndex], duration_s: duration };
        setWipGeneration({
            ...wipGeneration,
            script: updatedScript,
        });
    }
  };


  const isLoading = isGeneratingScript || isGeneratingImages || isHumanizing;
  const canGenerate = trendIdea && (contentType === 'sticker' || contentType === 'comic' || adScript) && mascotAsset && !isLoading && (contentType !== 'social' && contentType !== 'sticker' && contentType !== 'comic' || ((contentType === 'social' || contentType === 'sticker' || contentType === 'comic') && postCount > 0));


  const generateButtonText = () => {
      if (isGeneratingScript) return 'Đang phân tích...';
      if (wipGeneration) return 'Tạo lại Kịch bản';
      if (contentType === 'film') return '📝 Tạo Kịch bản Phim';
      if (contentType === 'social') return '🖼️ Tạo Bộ ảnh Social';
      if (contentType === 'sticker') return '🎨 Tạo Bộ Sticker';
      if (contentType === 'comic') return '🖋️ Tạo Bộ truyện tranh';
      return '📝 Tạo Kịch bản Video';
  }
  
  const mainContent = (
     <main className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-slate-300">
              Đang sáng tạo cho: <span className="font-bold text-white">{creationContext?.channel.name}</span>
          </div>
          <button 
            onClick={() => setCreationContext(null)}
            className="text-sm text-[var(--color-secondary)] hover:underline"
          >
            Đổi Brand/Kênh
          </button>
        </div>
        <div className="space-y-8 bg-slate-800/50 rounded-2xl p-6 md:p-8 shadow-2xl shadow-[var(--color-secondary)]/10 border border-slate-700">
          <MascotUploader 
            selectedBrandId={selectedBrandId}
            onSelectBrand={() => {}} // This is now handled by creationContext
            mascotAsset={mascotAsset}
            onMascotAssetChange={setMascotAsset}
            productAsset={productAsset}
            onProductAssetChange={setProductAsset}
            supportingCharAsset={supportingCharAsset}
            onSupportingCharAssetChange={setSupportingCharAsset}
          />
          <StoryInput 
            trendIdea={trendIdea}
            onTrendIdeaChange={setTrendIdea}
            adScript={adScript}
            onAdScriptChange={setAdScript}
            contentType={contentType}
          />
          <UsagePurposeSelector
            hookConfig={hookConfig}
            onHookConfigChange={setHookConfig}
            exportConfig={exportConfig}
            onExportConfigChange={setExportConfig}
            humanizationStyle={humanizationStyle}
            onHumanizationStyleChange={setHumanizationStyle}
            persona={persona}
            onPersonaChange={setPersona}
            contentType={contentType}
            onContentTypeChange={setContentType}
            postCount={postCount}
            onPostCountChange={setPostCount}
            imageConfig={imageConfig}
            onImageConfigChange={setImageConfig}
            filmLength={filmLength}
            onFilmLengthChange={setFilmLength}
          />
        </div>
        
        <div className="mt-8 text-center">
          <button
              onClick={() => handleGenerateScript(false)}
              disabled={!canGenerate}
              className="w-full sm:w-auto px-8 py-4 bg-[var(--color-primary)] text-white font-bold rounded-full text-xl shadow-lg shadow-[var(--color-primary)]/30 hover:opacity-90 transition-all duration-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/50"
          >
              {generateButtonText()}
          </button>
        </div>

        {error && <ErrorDisplay message={error} />}

        {isGeneratingScript && <Loader message={loadingMessage} />}
        
        {wipGeneration && wipGeneration.contentScore && (
            <ScriptReview 
                generation={wipGeneration} 
                score={wipGeneration.contentScore}
                onGenerateImage={handleGenerateSingleImage}
                onGenerateAllImages={handleGenerateAllImages}
                onHumanize={handleHumanize}
                isGeneratingImages={isGeneratingImages}
                isHumanizing={isHumanizing}
                onAddAudio={handleAddAudio}
                onDeleteAudio={handleDeleteAudio}
                onPreview={setPreviewGeneration}
                onDurationChange={handleSceneDurationChange}
                onRegenerateImage={handleRegenerateImage}
            />
        )}

        {generations.length > 0 && (
          <MediaLibrary 
            generations={generations} 
            channels={channels}
            brands={BRAND_PACKS}
            onImageClick={setModalImage} 
          />
        )}

        {modalImage && <ImagePreviewModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
        {previewGeneration && <AnimaticPreviewModal generation={previewGeneration} onClose={() => setPreviewGeneration(null)} />}


        <CreativeFormulaSelector />
        <VideoOptions />
        <VideoPreviewModal />
      </main>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <style>{`
        :root {
          --color-primary: ${selectedBrandPack.palette.primary};
          --color-secondary: ${selectedBrandPack.palette.secondary};
        }
        .hidden-download { display: none; }
      `}</style>
      <div className="container mx-auto max-w-6xl">
        <Header />
        
        {!creationContext ? (
            <BrandChannelSelector
                brands={Object.values(BRAND_PACKS)}
                channels={channels}
                onAddChannel={handleAddChannel}
                onStartCreation={setCreationContext}
            />
        ) : mainContent}

      </div>
    </div>
  );
};

export default App;
