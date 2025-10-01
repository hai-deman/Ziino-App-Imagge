
import React from 'react';

interface CreativeFormulaSelectorProps {
  selectedFormula: string;
  onSelectFormula: (formula: string) => void;
}

const formulas = [
  {
    value: 'Hành Trình Anh Hùng',
    title: 'Hành Trình Anh Hùng',
    description: 'Nhân vật chính vượt qua thử thách, trưởng thành và mang lại giá trị mới.'
  },
  {
    value: 'Minh Triết Người Thầy',
    title: 'Minh Triết Người Thầy',
    description: 'Nhân vật chính dẫn dắt, hướng dẫn người khác đạt được thành công.'
  },
  {
    value: 'Khám Phá Nhà Thám Hiểm',
    title: 'Khám Phá Nhà Thám Hiểm',
    description: 'Câu chuyện về sự tò mò, phiêu lưu và tìm ra những điều mới mẻ.'
  },
  {
    value: 'Nước Cờ Táo Bạo',
    title: 'Nước Cờ Táo Bạo',
    description: 'Giải quyết vấn đề bằng trí thông minh và một kế hoạch độc đáo, bất ngờ.'
  },
  {
    value: 'Người Kiến Tạo Cộng Đồng',
    title: 'Người Kiến Tạo Cộng Đồng',
    description: 'Nhân vật chính gắn kết mọi người để cùng nhau tạo ra thay đổi tích cực.'
  }
];

export const CreativeFormulaSelector: React.FC<CreativeFormulaSelectorProps> = ({ selectedFormula, onSelectFormula }) => {
  return (
    <div className="border-t-2 border-slate-700 pt-6">
      <h2 className="text-2xl font-bold text-cyan-300 tracking-wide text-center lg:text-left mb-4">4. Chọn Công thức Sáng tạo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {formulas.map((formula) => (
          <button
            key={formula.value}
            onClick={() => onSelectFormula(formula.value)}
            className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${
              selectedFormula === formula.value
                ? 'bg-cyan-900/50 border-cyan-500 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
            }`}
          >
            <h3 className="font-bold text-lg text-white">{formula.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{formula.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
