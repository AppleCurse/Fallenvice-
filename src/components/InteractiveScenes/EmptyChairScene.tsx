import React, { useRef, useState } from 'react';
import { soundEngine } from '../../audio/soundEngine';

export const EmptyChairScene: React.FC = () => {
  const [isPulled, setIsPulled] = useState(false);

  const pullChair = (clientX: number, clientY: number) => {
    setIsPulled((prev) => !prev);
    soundEngine.playEmberStrike();

    window.dispatchEvent(
      new CustomEvent('trigger-ash', {
        detail: { x: clientX, y: clientY, count: 20 },
      })
    );
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleChairClick = (e: React.MouseEvent) => pullChair(e.clientX, e.clientY);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      pullChair(
        rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
      );
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleChairClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="İskemleyi çek"
      className="sandalye-sahne aydinlan my-16 py-10 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14 text-center md:text-left transition-all duration-500 cursor-pointer select-none group"
      title="İskemleye dokun"
    >
      <div className="relative group">
        <svg
          className={`sandalye-svg w-32 sm:w-36 h-auto transition-all duration-700 ${
            isPulled
              ? 'drop-shadow-[0_0_45px_rgba(229,167,88,0.5)] scale-110 -translate-y-2'
              : 'drop-shadow-[0_0_25px_rgba(184,136,74,0.15)] group-hover:scale-105'
          }`}
          viewBox="0 0 120 160"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shadow ellipse */}
          <ellipse
            cx="60"
            cy="154"
            rx={isPulled ? 56 : 48}
            ry="6"
            className="fill-[rgba(184,136,74,0.08)] transition-all duration-500"
          />
          {/* Back legs */}
          <line
            x1="30"
            y1="60"
            x2="25"
            y2="155"
            className="stroke-[#5a5040] stroke-[1.5] opacity-50"
          />
          <line
            x1="90"
            y1="60"
            x2="95"
            y2="155"
            className="stroke-[#5a5040] stroke-[1.5] opacity-50"
          />
          {/* Front legs */}
          <line
            x1="30"
            y1="100"
            x2="25"
            y2="155"
            className={`stroke-[1.5] transition-colors duration-500 ${
              isPulled ? 'stroke-[#e5a758] opacity-100' : 'stroke-[#b8884a] opacity-70'
            }`}
          />
          <line
            x1="90"
            y1="100"
            x2="95"
            y2="155"
            className={`stroke-[1.5] transition-colors duration-500 ${
              isPulled ? 'stroke-[#e5a758] opacity-100' : 'stroke-[#b8884a] opacity-70'
            }`}
          />
          {/* Seat cushion */}
          <rect
            x="22"
            y="95"
            width="76"
            height="8"
            rx="2"
            className={`stroke-[1.5] transition-all duration-500 ${
              isPulled
                ? 'stroke-[#e5a758] fill-[rgba(35,26,18,0.9)] shadow-[0_0_15px_rgba(229,167,88,0.4)]'
                : 'stroke-[#b8884a] fill-[rgba(20,16,14,0.7)]'
            }`}
          />
          {/* Chair backrest frame */}
          <line
            x1="30"
            y1="95"
            x2="30"
            y2="36"
            className="stroke-[#7a6f60] stroke-[1.5]"
          />
          <line
            x1="90"
            y1="95"
            x2="90"
            y2="36"
            className="stroke-[#7a6f60] stroke-[1.5]"
          />
          <line
            x1="30"
            y1="36"
            x2="90"
            y2="36"
            className={`stroke-[1.5] transition-colors duration-500 ${
              isPulled ? 'stroke-[#e5a758]' : 'stroke-[#c5a26f]'
            }`}
          />
          <line
            x1="30"
            y1="52"
            x2="90"
            y2="52"
            className="stroke-[#5a5040] stroke-[1]"
          />
          <line
            x1="30"
            y1="68"
            x2="90"
            y2="68"
            className="stroke-[#5a5040] stroke-[1]"
          />
          <line
            x1="30"
            y1="84"
            x2="90"
            y2="84"
            className="stroke-[#5a5040] stroke-[1]"
          />
          {/* Glowing ember mark on the seat */}
          <circle
            cx="60"
            cy="99"
            r={isPulled ? 3 : 2}
            className="fill-[#e5a758] shadow-[0_0_12px_#e5a758]"
          />
        </svg>

        {/* Ambient candle flame icon above chair */}
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-5 rounded-full bg-gradient-to-t from-[#e5a758] to-[#ff7a00] blur-[1px] transition-all duration-700 ${
            isPulled ? 'opacity-90 scale-125' : 'opacity-30 scale-75 group-hover:opacity-75'
          }`}
        />
      </div>

      <div className="max-w-[280px] space-y-2">
        <p className="garamond italic text-base sm:text-lg text-[#ddd4c4] font-light leading-relaxed">
          Masada bir iskemle boş duruyor.
        </p>
        <p className="garamond italic text-sm text-[#b8884a] font-normal tracking-wide">
          Kimin için bırakıldığını herkes biliyor.
        </p>
        <span className="text-[10px] inter-ui uppercase tracking-widest text-[#7a6f60] block pt-2">
          {isPulled ? '✦ İskemle Hazır' : 'Dokunarak çek'}
        </span>
      </div>
    </div>
  );
};

