
import React from 'react';

interface VideoOptionsProps {
  visualStyle: string;
  onVisualStyleChange: (style: string) => void;
  effects: string;
  onEffectsChange: (effect: string) => void;
  numberOfScenes: number;
  onNumberOfScenesChange: (count: number) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
}

const OptionSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  className?: string;
}> = ({ label, value, onChange, options, className }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-lg font-semibold text-cyan-300">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-slate-900/70 border-2 border-slate-600 rounded-lg p-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

const NumberInput: React.FC<{
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}> = ({ label, value, onChange, className }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <label className="text-lg font-semibold text-cyan-300">{label}</label>
        <input
            type="number"
            value={value}
            onChange={onChange}
            min="1"
            max="20"
            className="w-full bg-slate-900/70 border-2 border-slate-600 rounded-lg p-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
        />
    </div>
);


export const VideoOptions: React.FC<VideoOptionsProps> = ({
  visualStyle,
  onVisualStyleChange,
  effects,
  onEffectsChange,
  numberOfScenes,
  onNumberOfScenesChange,
  aspectRatio,
  onAspectRatioChange,
}) => {
    const visualStyles = [
        { value: 'Cinematic', label: 'Điện ảnh' },
        { value: 'Vibrant', label: 'Sống động' },
        { value: 'Anime', label: 'Anime' },
        { value: 'Retro', label: 'Cổ điển' },
        { value: 'Futuristic', label: 'Tương lai' }
    ];
    const specialEffects = [
        { value: 'None', label: 'Không có' },
        { value: 'Neon Glow', label: 'Hào quang Neon' },
        { value: 'Slow-motion', label: 'Chuyển động chậm' },
        { value: 'Lens Flare', label: 'Lóa ống kính' },
        { value: 'Glitch Effect', label: 'Hiệu ứng nhiễu' }
    ];
    const aspectRatios = [
        { value: '16:9', label: '16:9 (Widescreen)' },
        { value: '9:16', label: '9:16 (Vertical)' },
        { value: '1:1', label: '1:1 (Square)' },
        { value: '4:3', label: '4:3 (Classic TV)' },
        { value: '3:4', label: '3:4 (Portrait)' }
    ];

  return (
    <div className="border-t-2 border-slate-700 pt-6">
        <h2 className="text-2xl font-bold text-cyan-300 tracking-wide text-center lg:text-left mb-4">5. Tùy chỉnh Hình ảnh & Video</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OptionSelect
                label="Phong cách Hình ảnh"
                value={visualStyle}
                onChange={(e) => onVisualStyleChange(e.target.value)}
                options={visualStyles}
                className="md:col-span-2"
            />
             <OptionSelect
                label="Hiệu ứng Đặc biệt"
                value={effects}
                onChange={(e) => onEffectsChange(e.target.value)}
                options={specialEffects}
                className="md:col-span-2"
            />
            <NumberInput
                label="Số lượng Cảnh quay"
                value={numberOfScenes}
                onChange={(e) => onNumberOfScenesChange(parseInt(e.target.value, 10) || 1)}
            />
            <OptionSelect
                label="Tỷ lệ Khung hình"
                value={aspectRatio}
                onChange={(e) => onAspectRatioChange(e.target.value)}
                options={aspectRatios}
            />
        </div>
    </div>
  );
};
