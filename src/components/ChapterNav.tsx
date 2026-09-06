import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Compass, Eye, Sparkles, Check } from 'lucide-react';
import { CHAPTERS_INDEX } from '../data/manifesto';
import { soundEngine } from '../audio/soundEngine';
import { CommandPalette } from './CommandPalette';

interface ChapterNavProps {
  readingProgress: number;
  lanternMode: boolean;
  isAudioOn: boolean;
  activeChapterId: string;
  onToggleAudio: () => void;
  onToggleLantern: () => void;
  onSelectChapter: (id: string) => void;
}

const SHARE_TEXT =
  'Salim Gümüş — O bir kahraman değil, bir yerçekimi.\n"Birinden vazgeçtiğinde kapı kapanmaz, kilit değişir."';

export const ChapterNav: React.FC<ChapterNavProps> = ({
  readingProgress,
  lanternMode,
  isAudioOn,
  activeChapterId,
  onToggleAudio,
  onToggleLantern,
  onSelectChapter,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  const activeChapter = CHAPTERS_INDEX.find((c) => c.id === activeChapterId);

  // ⌘K / Ctrl+K — dizini her yerden aç.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundEngine.playParchmentRustle(0.9);
        setIsMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCopyManifesto = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(SHARE_TEXT);
      copied = true;
    } catch {
      // Clipboard API unavailable (insecure context / permission) — legacy fallback
      try {
        const textarea = document.createElement('textarea');
        textarea.value = SHARE_TEXT;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copied = false;
      }
    }
    if (copied) {
      soundEngine.playEmberStrike();
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2500);
    }
  };

  return (
    <>
      {/* Üst ilerleme fitili — sayfanın en tepesinde ince kor çizgisi */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 h-[2px] z-[130] bg-gradient-to-r from-[#b8884a] via-[#e5a758] to-[#ff7a00] shadow-[0_0_12px_rgba(229,167,88,0.7)] transition-[width] duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Top Floating Bar */}
      <header className="fixed top-0 left-0 right-0 z-[120] px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
        {/* Brand */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => onSelectChapter('hero')}
            className="flex items-center gap-2 text-left group outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full border border-[#b8884a]/40 flex items-center justify-center text-[#e5a758] group-hover:border-[#e5a758] group-hover:shadow-[0_0_15px_rgba(229,167,88,0.4)] transition-all bg-[rgba(6,5,5,0.7)] backdrop-blur-md shrink-0">
              <span className="text-xs font-serif">⚔</span>
            </div>
            <div className="hidden sm:block">
              <span className="unicase text-sm font-medium tracking-[0.2em] text-[#e8dfd0] group-hover:text-[#e5a758] transition-colors block">
                SALİM GÜMÜŞ
              </span>
              {/* Marka altı satırı artık okunan bölümü canlı gösteriyor */}
              <span className="inter-ui text-[9px] uppercase tracking-[0.3em] text-[#7a6f60] block truncate max-w-[190px]">
                {activeChapter ? `${activeChapter.numeral} · ${activeChapter.title}` : 'Manifesto'}
              </span>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[rgba(6,5,5,0.8)] backdrop-blur-md border border-[rgba(184,136,74,0.2)] rounded-full px-3 py-1.5 shadow-[0_4px_25px_rgba(0,0,0,0.7)]">
          {/* Fener / Odak Işığı Modu */}
          <button
            onClick={onToggleLantern}
            aria-pressed={lanternMode}
            title={lanternMode ? 'Fener Işığı: Aktif (L)' : 'Geniş Aydınlatma (L)'}
            className={`p-1.5 rounded-full transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
              lanternMode
                ? 'text-[#e5a758] bg-[rgba(184,136,74,0.18)] border border-[#b8884a]/40 shadow-[0_0_12px_rgba(229,167,88,0.3)]'
                : 'text-[#7a6f60] hover:text-[#e8dfd0]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[10px] inter-ui uppercase tracking-wider">
              {lanternMode ? 'Fener' : 'Açık'}
            </span>
          </button>

          {/* Ses Kontrol */}
          <button
            onClick={onToggleAudio}
            aria-pressed={isAudioOn}
            title={isAudioOn ? 'Sesi Durdur (M)' : 'Odanın Sesini Başlat — Rüzgâr, Kor, Çan (M)'}
            className={`p-1.5 rounded-full transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
              isAudioOn
                ? 'text-[#e5a758] bg-[rgba(184,136,74,0.15)]'
                : 'text-[#7a6f60] hover:text-[#e8dfd0]'
            }`}
          >
            {isAudioOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline text-[10px] inter-ui uppercase tracking-wider">
              {isAudioOn ? 'Ses Açık' : 'Sessiz'}
            </span>
          </button>

          {/* Alıntı Kopyala */}
          <button
            onClick={handleCopyManifesto}
            title="Manifestoyu panoya kopyala"
            aria-label="Manifestoyu panoya kopyala"
            className="p-1.5 rounded-full text-[#7a6f60] hover:text-[#e5a758] transition-colors cursor-pointer"
          >
            {copiedQuote ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Dizin Menüsü */}
          <button
            onClick={() => {
              soundEngine.playParchmentRustle(0.9);
              setIsMenuOpen(true);
            }}
            title="Bölümler Dizini (⌘K)"
            className="p-1.5 rounded-full text-[#7a6f60] hover:text-[#e8dfd0] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="text-[10px] inter-ui uppercase tracking-wider text-[#c5a26f] font-mono ml-0.5">
              %{Math.round(readingProgress)}
            </span>
          </button>
        </div>
      </header>

      {/* Copy Toast notification */}
      {copiedQuote && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[140] bg-[#0c0907] border border-[#b8884a] text-[#e8dfd0] px-5 py-2 rounded-full shadow-[0_0_30px_rgba(229,167,88,0.3)] flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-[#e5a758]" />
          <span className="text-xs garamond italic">Manifesto panoya mühürlendi.</span>
        </div>
      )}

      {/* Klavye öncelikli bölüm dizini */}
      <CommandPalette
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectChapter={onSelectChapter}
        activeChapterId={activeChapterId}
      />
    </>
  );
};
