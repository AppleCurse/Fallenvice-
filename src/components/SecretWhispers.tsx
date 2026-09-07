import React, { useEffect, useRef, useState } from 'react';
import { SECRET_WHISPERS } from '../data/manifesto';
import { getPointer } from '../lib/pointer';

/**
 * Kullanıcı bir süre kıpırdamazsa karanlıktan bir fısıltı yükselir.
 *
 * İmleç konumu artık prop olarak gelmiyor: paylaşımlı pointer modülünden
 * yalnızca fısıltı belireceği anda okunuyor. Böylece bu bileşen fare
 * hareketiyle hiç render olmuyor.
 */
export const SecretWhispers: React.FC = () => {
  const [activeWhisper, setActiveWhisper] = useState<string | null>(null);
  const [whisperPos, setWhisperPos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const visibleRef = useRef(false);
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    const hide = () => {
      if (visibleRef.current) {
        visibleRef.current = false;
        setIsVisible(false);
      }
    };

    // Kullanıcı hareket ettiği anda fısıltıyı sakla.
    window.addEventListener('mousemove', hide, { passive: true });
    window.addEventListener('touchstart', hide, { passive: true });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('keydown', hide);

    const interval = window.setInterval(() => {
      if (document.hidden) return; // arka plan sekmesine fısıldama
      if (visibleRef.current) return;

      const pointer = getPointer();
      if (Date.now() - pointer.lastMove <= 5200) return;

      // Aynı fısıltıyı üst üste tekrarlama.
      let index = Math.floor(Math.random() * SECRET_WHISPERS.length);
      if (SECRET_WHISPERS.length > 1 && index === lastIndexRef.current) {
        index = (index + 1) % SECRET_WHISPERS.length;
      }
      lastIndexRef.current = index;
      setActiveWhisper(SECRET_WHISPERS[index] ?? null);

      const isMobile = window.innerWidth <= 768;
      setWhisperPos(
        isMobile
          ? { x: window.innerWidth / 2, y: window.innerHeight / 2 - 40 }
          : { x: pointer.x || window.innerWidth / 2, y: pointer.y || window.innerHeight / 2 },
      );

      visibleRef.current = true;
      setIsVisible(true);
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', hide);
      window.removeEventListener('touchstart', hide);
      window.removeEventListener('scroll', hide);
      window.removeEventListener('keydown', hide);
      window.clearInterval(interval);
    };
  }, []);

  if (!activeWhisper) return null;

  return (
    <div
      id="gizli-fisil"
      aria-hidden="true"
      style={{ left: `${whisperPos.x}px`, top: `${whisperPos.y}px` }}
      className={`fixed pointer-events-none z-[95] -translate-x-1/2 -translate-y-16 max-w-[280px] text-center garamond italic font-light text-sm sm:text-base text-[#c5a26f] tracking-widest drop-shadow-[0_0_18px_rgba(184,136,74,0.5)] transition-opacity duration-1000 select-none ${
        isVisible ? 'opacity-85' : 'opacity-0'
      }`}
    >
      <span className="block text-[10px] text-[#7a6f60] uppercase tracking-[0.4em] not-italic mb-1">
        — fısıltı —
      </span>
      &ldquo;{activeWhisper}&rdquo;
    </div>
  );
};
