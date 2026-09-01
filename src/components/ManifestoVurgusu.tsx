import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface ManifestoVurgusuProps {
  phrase: string;
  subtext?: string;
  accentWord?: string;
  scale?: 'normal' | 'large' | 'massive';
}

export const ManifestoVurgusu: React.FC<ManifestoVurgusuProps> = ({
  phrase,
  subtext,
  accentWord,
  scale = 'large',
}) => {
  const [isIgnited, setIsIgnited] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Trigger illumination when light sweeps nearby
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkProximity = () => {
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const windowCenterY = window.innerHeight / 2;
      const distance = Math.abs(centerY - windowCenterY);

      if (distance < 220 && !isIgnited && !hasInteracted) {
        setIsIgnited(true);
        soundEngine.playEmberStrike();
      }
    };

    window.addEventListener('scroll', checkProximity, { passive: true });
    window.addEventListener('mousemove', checkProximity, { passive: true });
    checkProximity();

    return () => {
      window.removeEventListener('scroll', checkProximity);
      window.removeEventListener('mousemove', checkProximity);
    };
  }, [isIgnited, hasInteracted]);

  const handleManualIgnite = () => {
    setHasInteracted(true);
    setIsIgnited((prev) => {
      if (!prev) soundEngine.playEmberStrike();
      return !prev;
    });

    // Burst ember ash sparks
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent('trigger-ash', {
          detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, count: 28 },
        })
      );
    }
  };

  const scaleClasses =
    scale === 'massive'
      ? 'text-3xl sm:text-5xl md:text-6xl py-6'
      : scale === 'large'
      ? 'text-2xl sm:text-4xl md:text-5xl py-4'
      : 'text-xl sm:text-2xl md:text-3xl py-3';

  return (
    <div
      ref={containerRef}
      onClick={handleManualIgnite}
      onMouseEnter={() => {
        if (!isIgnited) {
          setIsIgnited(true);
          soundEngine.playEmberStrike();
        }
      }}
      className="vurgu-kapsayici my-12 relative group cursor-pointer select-none max-w-3xl mx-auto px-4"
    >
      {/* Top Ember Glow Line */}
      <div className="relative w-full h-[1.5px] overflow-hidden my-2">
        <div
          className={`h-full bg-gradient-to-r from-transparent via-[#e5a758] to-transparent shadow-[0_0_12px_#e5a758] transition-all duration-700 ease-out ${
            isIgnited ? 'w-full opacity-100' : 'w-0 opacity-20 group-hover:w-1/2 group-hover:opacity-80'
          } mx-auto`}
        />
      </div>

      {/* Manifesto Card Body */}
      <div
        className={`relative overflow-hidden transition-all duration-700 ease-out rounded-lg ${
          isIgnited
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(40,25,15,0.45)_0%,rgba(10,8,6,0.95)_75%,transparent_100%)] border-y border-[rgba(184,136,74,0.3)] shadow-[0_0_40px_rgba(229,167,88,0.12),inset_0_0_30px_rgba(229,167,88,0.08)] scale-100'
            : 'bg-transparent border-y border-transparent scale-95 opacity-75'
        }`}
      >
        {/* Glowing Ember Border Highlights */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            isIgnited ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-[#e5a758] shadow-[0_0_15px_#e5a758]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-[#b8884a] shadow-[0_0_12px_#b8884a]" />
        </div>

        {/* Revealed Sacred Phrasing */}
        <div className="relative z-10 py-6 px-4 text-center">
          {subtext && (
            <p className="garamond italic text-sm sm:text-base text-[#9a8c78] mb-2 tracking-wide">
              {subtext}
            </p>
          )}

          <h3
            className={`garamond font-medium leading-tight text-[#f0e7d8] transition-all duration-700 ${scaleClasses} ${
              isIgnited
                ? 'text-shadow-vurgu text-[#fff8ee] drop-shadow-[0_0_30px_rgba(229,167,88,0.4)]'
                : 'text-[#8a7e70]'
            }`}
          >
            {phrase}
          </h3>

          {accentWord && (
            <span className="inline-block mt-3 px-4 py-1 rounded-full border border-[#b8884a]/40 text-[#e5a758] text-xs font-mono tracking-[0.3em] uppercase bg-[#140e08]/80 shadow-[0_0_15px_rgba(229,167,88,0.2)]">
              {accentWord}
            </span>
          )}
        </div>
      </div>

      {/* Subtext Accent */}
      <div className="flex items-center justify-center gap-2 mt-2 opacity-40 group-hover:opacity-90 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full bg-[#e5a758] animate-pulse" />
        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#8a7e70]">
          {isIgnited ? '— mühürlendi —' : '— dokunarak aydınlat —'}
        </span>
      </div>
    </div>
  );
};
