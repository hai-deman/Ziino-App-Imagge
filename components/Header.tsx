
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-transparent bg-clip-text">
          Ziino Hook Builder v2
        </span>
      </h1>
      <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-400">
        Lấy cảm hứng từ các trend hot nhất để tạo video hook. Nhập ý tưởng, AI sẽ tự động tạo kịch bản, storyboard và caption viral cho bạn.
      </p>
    </header>
  );
};