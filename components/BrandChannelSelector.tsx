import React, { useState } from 'react';
import type { BrandPack, Channel, BrandId, ChannelType, CreationContext } from '../types';
import { CHANNEL_TYPES } from '../data';

interface BrandChannelSelectorProps {
    brands: BrandPack[];
    channels: Channel[];
    onAddChannel: (channel: Omit<Channel, 'id'>) => void;
    onStartCreation: (context: CreationContext) => void;
}

const AddChannelForm: React.FC<{ brandId: BrandId; onAddChannel: (channel: Omit<Channel, 'id'>) => void; onCancel: () => void }> = ({ brandId, onAddChannel, onCancel }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<ChannelType>('tiktok');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onAddChannel({ name: name.trim(), type, brandId });
            onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-700/50 p-4 rounded-lg mt-2 space-y-3">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên kênh (VD: Ziino TikTok)"
                className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm"
                required
            />
            <select
                value={type}
                onChange={(e) => setType(e.target.value as ChannelType)}
                className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm"
            >
                {CHANNEL_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
            </select>
            <div className="flex gap-2">
                <button type="submit" className="flex-1 px-3 py-1.5 text-sm font-semibold bg-[var(--color-primary)] text-white rounded-md">Thêm</button>
                <button type="button" onClick={onCancel} className="flex-1 px-3 py-1.5 text-sm bg-slate-600 text-white rounded-md">Hủy</button>
            </div>
        </form>
    );
};

export const BrandChannelSelector: React.FC<BrandChannelSelectorProps> = ({ brands, channels, onAddChannel, onStartCreation }) => {
    const [selectedBrandId, setSelectedBrandId] = useState<BrandId | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [addingChannelForBrand, setAddingChannelForBrand] = useState<BrandId | null>(null);

    const handleSelectBrand = (brandId: BrandId) => {
        setSelectedBrandId(brandId);
        // Deselect channel if brand changes
        if (selectedChannel?.brandId !== brandId) {
            setSelectedChannel(null);
        }
    };

    const handleStart = () => {
        if (selectedBrandId && selectedChannel) {
            onStartCreation({ brandId: selectedBrandId, channel: selectedChannel });
        }
    };

    return (
        <main className="mt-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-200">Chào mừng đến với Không gian làm việc</h2>
                <p className="text-slate-400 mt-2">Chọn một Thương hiệu và Kênh phân phối để bắt đầu sáng tạo nội dung.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1: Select Brand */}
                <div>
                    <h3 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">1. Chọn Thương hiệu</h3>
                    <div className="space-y-4">
                        {brands.map(brand => (
                            <button
                                key={brand.id}
                                onClick={() => handleSelectBrand(brand.id)}
                                className={`w-full p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                                    selectedBrandId === brand.id
                                    ? 'bg-slate-700/50 border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20'
                                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                                }`}
                                style={{'--color-primary': brand.palette.primary} as React.CSSProperties}
                            >
                                <h4 className="font-bold text-xl" style={{color: brand.palette.primary}}>{brand.name}</h4>
                                <p className="text-sm text-slate-400 mt-1">{brand.taglines[0]}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Select Channel */}
                <div className={`${!selectedBrandId ? 'opacity-50' : ''}`}>
                     <h3 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">2. Chọn Kênh phân phối</h3>
                     {!selectedBrandId ? (
                         <div className="h-full flex items-center justify-center bg-slate-800/60 rounded-lg border-2 border-slate-700 text-slate-500">
                             Vui lòng chọn một thương hiệu trước
                         </div>
                     ) : (
                         <div className="bg-slate-800/60 rounded-lg border-2 border-slate-700 p-4 space-y-3">
                            {channels.filter(c => c.brandId === selectedBrandId).map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => setSelectedChannel(channel)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${selectedChannel?.id === channel.id ? 'bg-[var(--color-primary)]/80 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    <span className="w-6 h-6" dangerouslySetInnerHTML={{ __html: CHANNEL_TYPES.find(ct => ct.id === channel.type)?.icon || '' }}></span>
                                    <span>{channel.name}</span>
                                </button>
                            ))}
                            {addingChannelForBrand === selectedBrandId ? (
                                <AddChannelForm brandId={selectedBrandId} onAddChannel={onAddChannel} onCancel={() => setAddingChannelForBrand(null)} />
                            ) : (
                                <button
                                    onClick={() => setAddingChannelForBrand(selectedBrandId)}
                                    className="w-full p-3 text-center text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700 transition-colors border border-dashed border-slate-500"
                                >
                                    + Thêm kênh mới
                                </button>
                            )}
                         </div>
                     )}
                </div>
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={handleStart}
                    disabled={!selectedBrandId || !selectedChannel}
                    className="px-12 py-4 bg-[var(--color-primary)] text-white font-bold rounded-full text-xl shadow-lg shadow-[var(--color-primary)]/30 hover:opacity-90 transition-all duration-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
                >
                    Bắt đầu Sáng tạo
                </button>
            </div>
        </main>
    );
};