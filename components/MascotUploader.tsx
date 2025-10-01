import React from 'react';
import type { BrandId, MascotFile } from '../types';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });


interface AssetInputProps {
    file: MascotFile | null;
    onFileChange: (file: MascotFile | null) => void;
    label: string;
    isRequired?: boolean;
}

const AssetInput: React.FC<AssetInputProps> = ({ file, onFileChange, label, isRequired = false }) => {
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const base64 = await fileToBase64(selectedFile);
            onFileChange({
                name: selectedFile.name,
                type: selectedFile.type,
                base64: base64,
            });
        }
    };
    
    return (
        <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-400">{label} {isRequired && <span className="text-red-500">*</span>}</label>
            {file ? (
                <div className="relative group">
                    <img src={`data:${file.type};base64,${file.base64}`} alt={file.name} className="w-full h-32 object-contain rounded-lg bg-slate-900/50 p-2 border-2 border-slate-600" />
                    <button onClick={() => onFileChange(null)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        Xóa
                    </button>
                    <p className="text-xs text-slate-500 mt-1 truncate">{file.name}</p>
                </div>
            ) : (
                <div className="relative w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
                     <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <p className="mt-1 text-sm">Nhấn để tải lên</p>
                    </div>
                    <input type="file" accept="image/png, image/jpeg" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
            )}
        </div>
    );
}

interface AssetUploaderProps {
  selectedBrandId: BrandId; // Keep for styling, but not for selection
  onSelectBrand: (brandId: BrandId) => void; // Will be empty function
  mascotAsset: MascotFile | null;
  onMascotAssetChange: (file: MascotFile | null) => void;
  productAsset: MascotFile | null;
  onProductAssetChange: (file: MascotFile | null) => void;
  supportingCharAsset: MascotFile | null;
  onSupportingCharAssetChange: (file: MascotFile | null) => void;
}

export const MascotUploader: React.FC<AssetUploaderProps> = ({ selectedBrandId, onSelectBrand, mascotAsset, onMascotAssetChange, productAsset, onProductAssetChange, supportingCharAsset, onSupportingCharAssetChange }) => {

  return (
    <div className="flex flex-col space-y-6">
        <h2 className="text-2xl font-bold text-[var(--color-secondary)] tracking-wide text-center lg:text-left">1. Tải lên Assets</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AssetInput 
                label="Mascot Ziino"
                file={mascotAsset}
                onFileChange={onMascotAssetChange}
                isRequired
            />
            <AssetInput
                label="Sản phẩm (tùy chọn)"
                file={productAsset}
                onFileChange={onProductAssetChange}
            />
            <AssetInput
                label="Nhân vật phụ (tùy chọn)"
                file={supportingCharAsset}
                onFileChange={onSupportingCharAssetChange}
            />
        </div>
    </div>
  );
};