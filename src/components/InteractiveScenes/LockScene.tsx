import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../../audio/soundEngine';

export const LockScene: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const unlockTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (unlockTimeoutRef.current) return;
            unlockTimeoutRef.current = window.setTimeout(() => {
              setIsUnlocked(true);
              soundEngine.playLockSound();
              unlockTimeoutRef.current = null;
            }, 600);
          } else {
            setIsUnlocked(false);
          }
        });
      },
      { threshold: 0.4 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
        unlockTimeoutRef.current = null;
      }
    };
  }, []);

  const handleToggle = () => {
    soundEngine.playLockSound();
    setIsUnlocked((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Kilidi değiştir"
      className="kilit-sahne aydinlan my-12 flex flex-col items-center justify-center cursor-pointer group"
      title="Kilide dokun"
    >
      <div className="relative p-6">
        <svg
          className="kilit-svg w-24 sm:w-28 h-auto drop-shadow-[0_0_30px_rgba(184,136,74,0.15)] transition-all duration-700"
          viewBox="0 0 80 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shackle (Kanca) */}
          <path
            className={`fill-none stroke-[2] transition-all duration-1000 origin-[25px_48px] ${
              isUnlocked
                ? 'stroke-[#b8884a] -translate-y-2.5 rotate-[18deg] opacity-75'
                : 'stroke-[#7a6f60] opacity-90'
            }`}
            d="M25,48 L25,28 Q25,12 40,12 Q55,12 55,28 L55,48"
          />

          {/* Lock Body (Gövde) */}
          <rect
            x="14"
            y="45"
            width="52"
            height="42"
            rx="5"
            className={`transition-all duration-700 stroke-[1.8] ${
              isUnlocked
                ? 'fill-[rgba(35,26,18,0.9)] stroke-[#e5a758] shadow-[0_0_20px_rgba(229,167,88,0.4)]'
                : 'fill-[rgba(15,12,10,0.85)] stroke-[#5a5040]'
            }`}
          />

          {/* Keyhole (Anahtar Yuvası) */}
          <circle
            cx="40"
            cy="63"
            r="4.5"
            className={`transition-colors duration-500 stroke-[1.2] ${
              isUnlocked
                ? 'fill-[#e5a758] stroke-[#e5a758]'
                : 'fill-none stroke-[#7a6f60]'
            }`}
          />
          <line
            x1="40"
            y1="67"
            x2="40"
            y2="76"
            className={`transition-colors duration-500 stroke-[1.5] ${
              isUnlocked ? 'stroke-[#e5a758]' : 'stroke-[#7a6f60]'
            }`}
          />
        </svg>

        {/* Glow halo when unlocked */}
        <div
          className={`absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(229,167,88,0.2)_0%,transparent_70%)] pointer-events-none transition-opacity duration-1000 ${
            isUnlocked ? 'opacity-100 scale-125' : 'opacity-0 scale-75'
          }`}
        />
      </div>

      <span className="mt-2 text-[11px] inter-ui uppercase tracking-[0.35em] text-[#7a6f60] group-hover:text-[#b8884a] transition-colors">
        {isUnlocked ? 'Kilit Değiştirildi' : 'Kilit Kapalı'}
      </span>
    </div>
  );
};
