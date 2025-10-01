import React from 'react';
import type { GeneratedItem } from '../types';

interface SocialPostDisplayProps {
    hook: GeneratedItem;
    onImageClick: (imageUrl: string) => void;
}

export const SocialPostDisplay: React.FC<SocialPostDisplayProps> = ({ hook, onImageClick }) => {
    if (hook.type !== 'social' || !hook.script) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hook.script.map((post, index) => (
                <div key={post.scene} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 flex flex-col">
                    <button 
                        onClick={() => onImageClick(`data:image/jpeg;base64,${hook.storyboardImages[index]}`)}
                        className="aspect-square bg-black overflow-hidden group focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800 ring-[var(--color-primary)] rounded-t-lg"
                        aria-label={`Phóng to ảnh bài đăng ${post.scene}`}
                    >
                         <img 
                            src={`data:image/jpeg;base64,${hook.storyboardImages[index]}`} 
                            alt={`Bài đăng ${post.scene}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </button>
                    <div className="p-4 text-sm text-slate-300 flex-grow flex flex-col gap-2">
                        <p className="font-bold text-white text-base">Bài đăng {post.scene}</p>
                        <p className="flex-grow">{post.caption}</p>
                        <p className="text-cyan-400 font-semibold break-words">{post.hashtags.join(' ')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
