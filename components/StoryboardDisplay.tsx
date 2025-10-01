import React from 'react';
import type { GeneratedItem } from '../types';

interface StoryboardDisplayProps {
    hook: GeneratedItem;
    onImageClick: (imageUrl: string) => void;
}

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <p><span className="font-semibold text-slate-400">{label}:</span> {value}</p>
    )
}

export const StoryboardDisplay: React.FC<StoryboardDisplayProps> = ({ hook, onImageClick }) => {
    if (!hook || !hook.script) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {hook.script.map((scene, index) => (
                <div key={scene.scene} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 flex flex-col">
                    <button 
                        onClick={() => onImageClick(`data:image/jpeg;base64,${hook.storyboardImages[index]}`)}
                        className="aspect-[9/16] bg-black overflow-hidden group focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800 ring-[var(--color-primary)] rounded-t-lg"
                        aria-label={`Phóng to ảnh cảnh ${scene.scene}`}
                    >
                         <img 
                            src={`data:image/jpeg;base64,${hook.storyboardImages[index]}`} 
                            alt={`Cảnh ${scene.scene}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </button>
                    <div className="p-3 text-xs text-slate-300 flex-grow flex flex-col gap-1">
                        <p className="font-bold text-white text-sm mb-1">Cảnh {scene.scene}</p>
                        <DetailItem label="Lời thoại" value={scene.line} />
                        <DetailItem label="Cảm xúc" value={scene.character_emotion} />
                        <DetailItem label="Góc máy" value={scene.camera_angle} />
                        <DetailItem label="Hành động" value={scene.action} />
                    </div>
                </div>
            ))}
        </div>
    );
};
