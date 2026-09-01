import React, { useEffect, useState, useRef } from 'react';
import { SECRET_WHISPERS } from '../data/manifesto';

interface SecretWhispersProps {
  cursorX: number;
  cursorY: number;
}

export const SecretWhispers: React.FC<SecretWhispersProps> = ({ cursorX, cursorY }) => {
  const [activeWhisper, setActiveWhisper] = useState<string | null>(null);
  const [whisperPos, setWhisperPos] = useState({ x: cursorX, y: cursorY });
  const [isVisible, setIsVisible] = useState(false);
  const lastInteractionRef = useRef(Date.now());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMove = () => {
      lastInteractionRef.current = Date.now();
      if (isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchstart', handleMove, { passive: true });
    window.addEventListener('scroll', handleMove, { passive: true });

    timerRef.current = window.setInterval(() => {
      const isMobile = window.innerWidth <= 768;
      const idleTime = Date.now() - lastInteractionRef.current;

      if (idleTime > 4200 && !isVisible) {
        const randomQuote =
          SECRET_WHISPERS[Math.floor(Math.random() * SECRET_WHISPERS.length)];
        setActiveWhisper(randomQuote);

        if (isMobile) {
          setWhisperPos({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2 - 40,
          });
        } else {
          setWhisperPos({
            x: cursorX || window.innerWidth / 2,
            y: cursorY || window.innerHeight / 2,
          });
        }
        setIsVisible(true);
      }
    }, 800);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      window.removeEventListener('scroll', handleMove);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!activeWhisper) return null;

  return (
    <div
      id="gizli-fisil"
      style={{
        left: `${whisperPos.x}px`,
        top: `${whisperPos.y}px`,
      }}
      className={`fixed pointer-events-none z-[95] -translate-x-1/2 -translate-y-16 max-w-[280px] text-center garamond italic font-light text-sm sm:text-base text-[#c5a26f] tracking-widest drop-shadow-[0_0_18px_rgba(184,136,74,0.5)] transition-opacity duration-1000 select-none ${
        isVisible ? 'opacity-85' : 'opacity-0'
      }`}
    >
      <span className="block text-[10px] text-[#7a6f60] uppercase tracking-[0.4em] not-italic mb-1">
        — fısıltı —
      </span>
      "{activeWhisper}"
    </div>
  );
};
