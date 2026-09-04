import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../../audio/soundEngine';

export const GravityFallScene: React.FC = () => {
  // Start unfallen: when the scene scrolls into view, gravity pulls the
  // letters down into place — the effect the component was designed for.
  const [isFallen, setIsFallen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fallTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (fallTimeoutRef.current) return;
            fallTimeoutRef.current = window.setTimeout(() => {
              setIsFallen(true);
              soundEngine.playParchmentRustle(0.8);
              fallTimeoutRef.current = null;
            }, 400);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (fallTimeoutRef.current) {
        clearTimeout(fallTimeoutRef.current);
        fallTimeoutRef.current = null;
      }
    };
  }, []);

  const replay = (clientX: number, clientY: number) => {
    setIsFallen(false);
    soundEngine.playParchmentRustle(0.9);

    window.dispatchEvent(
      new CustomEvent('trigger-ash', {
        detail: { x: clientX, y: clientY, count: 24 },
      })
    );

    setTimeout(() => {
      setIsFallen(true);
      soundEngine.playEmberStrike();
    }, 600);
  };

  const handleReplay = (e: React.MouseEvent) => replay(e.clientX, e.clientY);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      replay(rect ? rect.left + rect.width / 2 : window.innerWidth / 2, rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
    }
  };

  const text = 'Kahramanlar hikâyeyi ilerletir.';
  const characters = Array.from(text);

  return (
    <div
      ref={containerRef}
      onClick={handleReplay}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Yerçekimini yeniden tetikle"
      className="dusus aydinlan my-12 text-center py-6 select-none cursor-pointer group"
      title="Yerçekimini yeniden başlatmak için tıkla"
    >
      <div className="flex flex-wrap justify-center items-center gap-x-[1px] max-w-xl mx-auto">
        {characters.map((char, index) => {
          const delay = index * 40;
          return (
            <span
              key={index}
              style={{
                transitionDelay: `${delay}ms`,
                transitionDuration: '1100ms',
              }}
              className={`inline-block font-light text-xl sm:text-2xl md:text-3xl text-[#ddd4c4] transition-all ease-out group-hover:text-[#e5a758] ${
                isFallen
                  ? 'opacity-100 translate-y-0 rotate-0 filter-none'
                  : 'opacity-0 -translate-y-16 -rotate-6 blur-[3px]'
              }`}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>
      <span className="text-[10px] inter-ui uppercase tracking-[0.3em] text-[#7a6f60] block mt-3 opacity-0 group-hover:opacity-75 transition-opacity">
        [ Yerçekimini Tetikle ]
      </span>
    </div>
  );
};

