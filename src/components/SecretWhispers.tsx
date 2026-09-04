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
  // Keep cursor in a ref so the interval is created exactly once instead of
  // being torn down and recreated on every pixel of mouse movement.
  const cursorRef = useRef({ x: cursorX, y: cursorY });
  const visibleRef = useRef(false);

  useEffect(() => {
    cursorRef.current = { x: cursorX, y: cursorY };
  }, [cursorX, cursorY]);

  useEffect(() => {
    const handleMove = () => {
      lastInteractionRef.current = Date.now();
      if (visibleRef.current) {
        visibleRef.current = false;
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchstart', handleMove, { passive: true });
    window.addEventListener('scroll', handleMove, { passive: true });

    timerRef.current = window.setInterval(() => {
      if (document.hidden) return; // don't whisper into a background tab

      const isMobile = window.innerWidth <= 768;
      const idleTime = Date.now() - lastInteractionRef.current;

      if (idleTime > 5200 && !visibleRef.current) {
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
            x: cursorRef.current.x || window.innerWidth / 2,
            y: cursorRef.current.y || window.innerHeight / 2,
          });
        }
        visibleRef.current = true;
        setIsVisible(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      window.removeEventListener('scroll', handleMove);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
