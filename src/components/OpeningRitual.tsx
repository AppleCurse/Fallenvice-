import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface OpeningRitualProps {
  onEnter: () => void;
}

export const OpeningRitual: React.FC<OpeningRitualProps> = ({ onEnter }) => {
  const [ignited, setIgnited] = useState(false);
  const [fadedOut, setFadedOut] = useState(false);

  const handleIgnite = async () => {
    if (ignited) return;
    setIgnited(true);
    // Start procedural sound on user interaction
    await soundEngine.start();

    // Trigger ash burst event
    window.dispatchEvent(
      new CustomEvent('trigger-ash', {
        detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, count: 50 },
      })
    );

    setTimeout(() => {
      setFadedOut(true);
      setTimeout(() => {
        onEnter();
      }, 1500);
    }, 1800);
  };

  if (fadedOut) return null;

  return (
    <div
      id="acilis"
      className={`fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center transition-all duration-[2000ms] select-none ${
        ignited ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Glow halo behind match flame */}
        <div
          className={`absolute rounded-full transition-all duration-[2200ms] pointer-events-none ${
            ignited
              ? 'w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(229,167,88,0.25)_0%,rgba(184,136,74,0.08)_40%,transparent_75%)] scale-150'
              : 'w-24 h-24 bg-[radial-gradient(circle,rgba(184,136,74,0.15)_0%,transparent_70%)] animate-pulse'
          }`}
        />

        {/* Center clickable ember / match core */}
        <button
          id="cekirdek"
          onClick={handleIgnite}
          aria-label="Karanlığı Ateşle"
          className={`group relative z-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-1000 outline-none ${
            ignited ? 'scale-[20] opacity-0' : 'hover:scale-110 active:scale-95'
          }`}
        >
          {/* Match Flame Head */}
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#e5a758] shadow-[0_0_20px_#e5a758,0_0_45px_rgba(184,136,74,0.6)] animate-pulse" />
            <div className="absolute -top-3 w-2 h-4 rounded-full bg-[#ff7a00] blur-[1px] opacity-75 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        {/* Cinematic Title & Instructions */}
        <div
          className={`mt-14 text-center transition-all duration-1000 ${
            ignited ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
          }`}
        >
          <h1 className="unicase text-3xl sm:text-5xl font-light tracking-[0.25em] text-[#e8dfd0] drop-shadow-[0_0_30px_rgba(184,136,74,0.25)]">
            SALİM GÜMÜŞ
          </h1>
          <p className="garamond italic text-lg sm:text-xl text-[#7a6f60] mt-3 tracking-widest">
            o bir kahraman değil, bir yerçekimi.
          </p>

          <button
            onClick={handleIgnite}
            className="mt-10 px-6 py-2.5 rounded-full border border-[rgba(184,136,74,0.3)] bg-[rgba(10,8,7,0.8)] text-[#c5a26f] text-xs uppercase tracking-[0.35em] font-light hover:border-[#b8884a] hover:bg-[rgba(184,136,74,0.15)] hover:text-[#f3e7d3] transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          >
            Ateşe Dokun
          </button>
        </div>
      </div>
    </div>
  );
};
