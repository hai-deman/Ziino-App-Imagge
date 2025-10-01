import React, { useMemo } from 'react';
import type { GeneratedItem, Channel, BrandPack, BrandId } from '../types';
import { StoryboardDisplay } from './StoryboardDisplay';
import { SocialPostDisplay } from './SocialPostDisplay';

// Declare JSZip for TypeScript
declare const JSZip: any;

interface MediaLibraryProps {
    generations: GeneratedItem[];
    channels: Channel[];
    brands: Record<string, BrandPack>;
    onImageClick: (imageUrl: string) => void;
}

type GroupedGenerations = Record<BrandId, Record<string, GeneratedItem[]>>;

const StickerSetDisplay: React.FC<{ hook: GeneratedItem; onImageClick: (imageUrl: string) => void; }> = ({ hook, onImageClick }) => {
    if (hook.type !== 'sticker' || !hook.script) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {hook.script.map((sticker, index) => (
                <div key={sticker.scene} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 flex flex-col items-center">
                    <button 
                        onClick={() => hook.storyboardImages[index] ? onImageClick(`data:image/jpeg;base64,${hook.storyboardImages[index]}`) : undefined}
                        className="aspect-square bg-transparent w-full p-2 overflow-hidden group focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800 ring-[var(--color-primary)] rounded-t-lg disabled:cursor-default"
                        aria-label={`Phóng to sticker ${sticker.scene}`}
                        disabled={!hook.storyboardImages[index]}
                    >
                        {hook.storyboardImages[index] ? (
                            <img 
                                src={`data:image/jpeg;base64,${hook.storyboardImages[index]}`} 
                                alt={`Sticker ${sticker.scene}: ${sticker.line}`}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Chưa tạo ảnh</div>
                        )}
                    </button>
                    <div className="p-3 w-full text-center bg-slate-900/50">
                        <p className="text-sm font-bold text-white truncate">{sticker.line}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ComicStripDisplay: React.FC<{ hook: GeneratedItem; onImageClick: (imageUrl: string) => void; }> = ({ hook, onImageClick }) => {
    if (hook.type !== 'comic' || !hook.script) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hook.script.map((panel, index) => (
                <div key={panel.scene} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 flex flex-col">
                    <div className="p-2 bg-slate-900 text-center">
                        <p className="font-bold text-white text-sm">Khung {panel.scene}</p>
                    </div>
                    <button 
                        onClick={() => hook.storyboardImages[index] ? onImageClick(`data:image/jpeg;base64,${hook.storyboardImages[index]}`) : undefined}
                        className="aspect-[4/5] bg-black overflow-hidden group focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800 ring-[var(--color-primary)] disabled:cursor-default"
                        aria-label={`Phóng to khung truyện ${panel.scene}`}
                        disabled={!hook.storyboardImages[index]}
                    >
                         {hook.storyboardImages[index] ? (
                            <img 
                                src={`data:image/jpeg;base64,${hook.storyboardImages[index]}`} 
                                alt={`Khung truyện ${panel.scene}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Chưa tạo ảnh</div>
                        )}
                    </button>
                    {panel.line && (
                        <div className="p-3 text-sm text-slate-300 flex-grow">
                            <p>"{panel.line}"</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


export const MediaLibrary: React.FC<MediaLibraryProps> = ({ generations, channels, brands, onImageClick }) => {
    
    const handleDownloadAll = async (generation: GeneratedItem) => {
        try {
            const zip = new JSZip();
            const folderName = `ziino_${generation.type}_${generation.id.slice(-6)}`;
            const folder = zip.folder(folderName);

            if (!folder) {
                throw new Error("Không thể tạo thư mục trong file zip.");
            }

            if (generation.type === 'video' || generation.type === 'film') {
                // Add video script
                let scriptContent = `SCRIPT - ID: ${generation.id}\n\n`;
                generation.script.forEach(scene => {
                    scriptContent += `---------- SCENE ${scene.scene} (${scene.duration_s}s) ----------\n`;
                    scriptContent += `LINE: ${scene.line || 'N/A'}\n`;
                    scriptContent += `VISUAL: ${scene.visual_cue || 'N/A'}\n`;
                    scriptContent += `EMOTION: ${scene.character_emotion || 'N/A'}\n`;
                    scriptContent += `CAMERA: ${scene.camera_angle || 'N/A'}\n`;
                    scriptContent += `ACTION: ${scene.action || 'N/A'}\n`;
                    scriptContent += `SFX: ${scene.sfx || 'N/A'}\n\n`;
                });
                folder.file('script.txt', scriptContent);

                // Add subtitles if they exist
                if (generation.srt) {
                    folder.file('subtitles.srt', generation.srt);
                }
            } else { // Social post, sticker, or comic set
                let content = `CONTENT - ID: ${generation.id}\n\n`;
                 generation.script.forEach((item, index) => {
                    if (generation.type === 'social') {
                        content += `---------- POST ${index + 1} ----------\n`;
                        content += `CAPTION:\n${item.caption || 'N/A'}\n\n`;
                        content += `HASHTAGS:\n${(item.hashtags || []).join(' ')}\n\n`;
                    } else if (generation.type === 'sticker') {
                        content += `---------- STICKER ${index + 1} ----------\n`;
                        content += `TEXT: ${item.line || 'N/A'}\n\n`;
                    } else { // comic
                        content += `---------- PANEL ${index + 1} ----------\n`;
                        content += `DIALOGUE/NARRATION: ${item.line || 'N/A'}\n\n`;
                    }
                    content += `VISUAL CUE:\n${item.visual_cue || 'N/A'}\n\n\n`;
                });
                folder.file('content.txt', content);
            }

            // Create promises for all assets to be added
            const assetPromises: Promise<any>[] = [];

            // Add images
            generation.storyboardImages.forEach((base64, index) => {
                if (base64) {
                    let fileName = `item_${index + 1}.jpg`;
                    if (generation.type === 'video' || generation.type === 'film') fileName = `scene_${index + 1}.jpg`;
                    else if (generation.type === 'social') fileName = `post_${index + 1}.jpg`;
                    else if (generation.type === 'sticker') fileName = `sticker_${index + 1}.png`; // Stickers as png
                    else if (generation.type === 'comic') fileName = `panel_${index + 1}.jpg`;
                    
                    assetPromises.push(Promise.resolve(folder.file(fileName, base64, { base64: true })));
                }
            });

            // Add audio files
            if (generation.storyboardAudio) {
                generation.storyboardAudio.forEach((audioUrl, index) => {
                    if (audioUrl) {
                        const fileName = `scene_${index + 1}_audio.webm`;
                        // Fetch the blob from the URL and add it to the zip
                        const promise = fetch(audioUrl)
                            .then(response => response.blob())
                            .then(blob => {
                                folder.file(fileName, blob);
                            });
                        assetPromises.push(promise);
                    }
                });
            }

            // Wait for all files to be processed
            await Promise.all(assetPromises);


            // Generate and download zip
            const zipContent = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipContent);
            link.download = `${folderName}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to create zip file:", error);
            alert("Không thể tạo file zip. Vui lòng kiểm tra console để biết thêm chi tiết.");
        }
    };

    const groupedGenerations = useMemo<GroupedGenerations>(() => {
        return generations.reduce((acc, gen) => {
            const { brandId, channelId } = gen;
            if (!acc[brandId]) {
                acc[brandId] = {};
            }
            if (!acc[brandId][channelId]) {
                acc[brandId][channelId] = [];
            }
            acc[brandId][channelId].push(gen);
            return acc;
        }, {} as GroupedGenerations);
    }, [generations]);

    const channelMap = useMemo(() => new Map(channels.map(c => [c.id, c])), [channels]);

    const getTitleForType = (type: GeneratedItem['type']) => {
        switch (type) {
            case 'film': return 'Phim Cinematics';
            case 'social': return 'Bộ ảnh Social';
            case 'sticker': return 'Bộ Sticker';
            case 'comic': return 'Bộ truyện tranh';
            case 'video':
            default: return 'Video Hook';
        }
    }

    if (generations.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 text-transparent bg-clip-text">
                    Thư viện Media
                </h2>
            </div>
            <div className="space-y-10">
                {Object.entries(groupedGenerations).map(([brandId, channelsData]) => (
                    <div key={brandId} className="space-y-8">
                        <h3 className="text-4xl font-extrabold" style={{ color: brands[brandId]?.palette.primary }}>
                            {brands[brandId]?.name || brandId}
                        </h3>
                        {Object.entries(channelsData).map(([channelId, channelGenerations]) => (
                            <div key={channelId} className="bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-700 ml-4 md:ml-8">
                                <h4 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                                    Kênh: {channelMap.get(channelId)?.name || 'Kênh không xác định'}
                                </h4>
                                <div className="space-y-6">
                                    {channelGenerations.map((gen) => (
                                         <div key={gen.id} className="border-t border-slate-600 pt-4">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                                <h5 className="text-xl font-bold text-slate-200">
                                                    {getTitleForType(gen.type)}
                                                    <span className="text-sm font-normal text-slate-400 ml-2">({new Date(gen.id).toLocaleString()})</span>
                                                </h5>
                                                <button
                                                    onClick={() => handleDownloadAll(gen)}
                                                    className="px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary)] transition-colors flex items-center gap-2 self-start sm:self-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                    Tải về (.zip)
                                                </button>
                                            </div>
                                           {gen.type === 'social' ? (
                                                <SocialPostDisplay hook={gen} onImageClick={onImageClick} />
                                            ) : gen.type === 'sticker' ? (
                                                <StickerSetDisplay hook={gen} onImageClick={onImageClick} />
                                           ) : gen.type === 'comic' ? (
                                                <ComicStripDisplay hook={gen} onImageClick={onImageClick} />
                                           ) : (
                                                <StoryboardDisplay hook={gen} onImageClick={onImageClick} />
                                           )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};