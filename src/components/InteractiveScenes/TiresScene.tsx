import React, { useState } from 'react';
import { soundEngine } from '../../audio/soundEngine';

export const TiresScene: React.FC = () => {
  const [activeWheel, setActiveWheel] = useState<number | null>(null);

  const handleWheelClick = (idx: number, e: React.MouseEvent) => {
    setActiveWheel(idx);
    soundEngine.playParchmentRustle(0.7);

    window.dispatchEvent(
      new CustomEvent('trigger-ash', {
        detail: { x: e.clientX, y: e.clientY, count: 12 },
      })
    );
  };

  return (
    <div className="lastikler aydinlan flex flex-col items-center justify-center my-10 py-6">
      <div className="flex justify-center items-center gap-4 sm:gap-10">
        {[1, 2, 3, 4].map((wheelIdx) => {
          const isSelected = activeWheel === wheelIdx;
          return (
            <button
              key={wheelIdx}
              onClick={(e) => handleWheelClick(wheelIdx, e)}
              className="flex flex-col items-center gap-2.5 group cursor-pointer outline-none"
              title={`Lastik ${wheelIdx} — 3 Bijon Takılı (1 Ödünç Verildi)`}
            >
              {/* Wheel Ring */}
              <div
                className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border flex items-center justify-center bg-[rgba(15,12,10,0.7)] transition-all duration-500 ${
                  isSelected
                    ? 'border-[#e5a758] shadow-[0_0_25px_rgba(229,167,88,0.4)] scale-110'
                    : 'border-[#5a5040] group-hover:border-[#b8884a] shadow-[0_0_15px_rgba(0,0,0,0.6)]'
                }`}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#3a3028] bg-[#0d0a08] flex items-center justify-center">
                  <span className="text-[8px] unicase text-[#b8884a] opacity-80">
                    {wheelIdx}
                  </span>
                </div>
              </div>

              {/* 4 Lug positions: 3 glowing, 1 empty missing */}
              <div className="flex gap-1 sm:gap-1.5 items-center">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#e5a758] shadow-[0_0_8px_#e5a758]"
                  title="Bijon 1 (Sağlam)"
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#e5a758] shadow-[0_0_8px_#e5a758]"
                  title="Bijon 2 (Sağlam)"
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#e5a758] shadow-[0_0_8px_#e5a758]"
                  title="Bijon 3 (Sağlam)"
                />
                <span
                  className="w-1.5 h-1.5 rounded-full border border-[#b8884a]/40 bg-transparent opacity-40 group-hover:border-[#e5a758]"
                  title="Eksik bijon (diğer lastiğe aktarıldı)"
                />
              </div>
            </button>
          );
        })}
      </div>

      <p className="garamond italic text-xs sm:text-sm text-[#7a6f60] mt-5 text-center tracking-wider">
        4 Lastik · 3'er Bijon · Sıfır Yolda Kalma
      </p>
    </div>
  );
};
