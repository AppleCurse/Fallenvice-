import React from 'react';
import { Stamp, Flame } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface KapanisMuhruProps {
  onSeal: (quote: string, label?: string) => void;
  onRestart: () => void;
}

const CLOSING_QUOTE = 'O yüzden etrafındakiler ona yaslanmaz, onunla hizalanır.';

/**
 * Kapanış mührü — manifestonun sonunda okuyucuya iki kapı bırakır:
 * sözü yanına alıp gitmek ya da odaya baştan girmek.
 */
export const KapanisMuhru: React.FC<KapanisMuhruProps> = ({ onSeal, onRestart }) => {
  return (
    <div className="mt-24 flex flex-col items-center">
      <div className="unicase text-2xl sm:text-3xl font-light tracking-[0.6em] text-[#e5a758] drop-shadow-[0_0_20px_rgba(229,167,88,0.3)]">
        SALİM GÜMÜŞ
      </div>

      <div className="w-16 h-px bg-[#b8884a] mt-4" />

      <div className="inter-ui text-[10px] uppercase tracking-[0.6em] text-[#c5a26f] mt-3 font-mono">
        — SON —
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            soundEngine.playParchmentRustle(1.2);
            onSeal(CLOSING_QUOTE, 'Hizalanma');
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[rgba(184,136,74,0.4)] bg-[rgba(10,8,7,0.85)] text-[#e5a758] text-[10px] uppercase tracking-[0.3em] inter-ui hover:border-[#e5a758] hover:bg-[rgba(184,136,74,0.15)] hover:text-[#fff8ee] transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.8)] cursor-pointer"
        >
          <Stamp className="w-3.5 h-3.5" />
          Manifestoyu Mühürle
        </button>

        <button
          onClick={() => {
            soundEngine.playLockSound();
            onRestart();
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-transparent text-[#6b6155] text-[10px] uppercase tracking-[0.3em] inter-ui hover:text-[#c5a26f] hover:border-[rgba(184,136,74,0.25)] transition-all duration-300 cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5" />
          Baştan Ateşle
        </button>
      </div>

      <p className="garamond italic text-xs text-[#4e463b] mt-8 text-center max-w-xs">
        Mühür tarayıcında dövülür. Ne okuduğun, ne mühürlediğin — hiçbiri
        bu odadan dışarı çıkmaz.
      </p>
    </div>
  );
};
