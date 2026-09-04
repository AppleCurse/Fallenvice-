import React, { useEffect, useRef, useState } from 'react';
import { CHAPTERS_INDEX } from '../data/manifesto';
import { soundEngine } from '../audio/soundEngine';
import { Volume2, VolumeX, Compass, Eye, Sparkles, X, Check, Search } from 'lucide-react';

interface ChapterNavProps {
  readingProgress: number;
  lanternMode: boolean;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onToggleLantern: () => void;
  onSelectChapter: (id: string) => void;
}

export const ChapterNav: React.FC<ChapterNavProps> = ({
  readingProgress,
  lanternMode,
  isAudioOn,
  onToggleAudio,
  onToggleLantern,
  onSelectChapter,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Dialog accessibility: Escape closes, focus moves into the search field
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    searchInputRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleCopyManifesto = async () => {
    const text = `Salim Gümüş — O bir kahraman değil, bir yerçekimi.\n"Birinden vazgeçtiğinde kapı kapanmaz, kilit değişir."`;
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      // Clipboard API unavailable (insecure context / permission) — legacy fallback
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
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

  const filteredChapters = CHAPTERS_INDEX.filter(
    (ch) =>
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.numeral.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.subtitle && ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Top Floating Bar */}
      <header className="fixed top-0 left-0 right-0 z-[120] px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
        {/* Brand */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => onSelectChapter('hero')}
            className="flex items-center gap-2 text-left group outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full border border-[#b8884a]/40 flex items-center justify-center text-[#e5a758] group-hover:border-[#e5a758] group-hover:shadow-[0_0_15px_rgba(229,167,88,0.4)] transition-all bg-[rgba(6,5,5,0.7)] backdrop-blur-md">
              <span className="text-xs font-serif">⚔</span>
            </div>
            <div className="hidden sm:block">
              <span className="unicase text-sm font-medium tracking-[0.2em] text-[#e8dfd0] group-hover:text-[#e5a758] transition-colors block">
                SALİM GÜMÜŞ
              </span>
              <span className="inter-ui text-[9px] uppercase tracking-[0.3em] text-[#7a6f60] block">
                Manifesto
              </span>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[rgba(6,5,5,0.8)] backdrop-blur-md border border-[rgba(184,136,74,0.2)] rounded-full px-3 py-1.5 shadow-[0_4px_25px_rgba(0,0,0,0.7)]">
          {/* Fener / Odak Işığı Modu */}
          <button
            onClick={onToggleLantern}
            title={lanternMode ? 'Fener Işığı: Aktif (Karanlık Odak)' : 'Geniş Aydınlatma'}
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
            title={isAudioOn ? 'Sesi Durdur' : 'Odanın Sesini Başlat (Rüzgâr, Kor, Çan)'}
            className={`p-1.5 rounded-full transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
              isAudioOn
                ? 'text-[#e5a758] bg-[rgba(184,136,74,0.15)] animate-pulse'
                : 'text-[#7a6f60] hover:text-[#e8dfd0]'
            }`}
          >
            {isAudioOn ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline text-[10px] inter-ui uppercase tracking-wider">
              {isAudioOn ? 'Ses Açık' : 'Sessiz'}
            </span>
          </button>

          {/* Alıntı Kopyala */}
          <button
            onClick={handleCopyManifesto}
            title="Manifestoyu Kopyala"
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
            title="Bölümler Dizini"
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[140] bg-[#0c0907] border border-[#b8884a] text-[#e8dfd0] px-5 py-2 rounded-full shadow-[0_0_30px_rgba(229,167,88,0.3)] flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#e5a758]" />
          <span className="text-xs garamond italic">Manifesto panoya mühürlendi.</span>
        </div>
      )}

      {/* Chapters Index Drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[150] bg-[rgba(4,3,3,0.92)] backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Bölümler ve Yasalar Dizini"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-[rgba(184,136,74,0.25)] bg-[#090706] p-6 sm:p-8 shadow-[0_10px_60px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between border-b border-[#2a2218] pb-4 mb-4">
              <div>
                <h3 className="unicase text-xl text-[#e8dfd0] tracking-widest font-light">
                  BÖLÜMLER & YASALAR
                </h3>
                <p className="garamond italic text-xs text-[#7a6f60]">
                  Salim Gümüş Karakter Anatomisi
                </p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full text-[#7a6f60] hover:text-[#e8dfd0] hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6f60]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Bölüm veya yasa ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#140f0c] border border-[#2a2218] rounded-xl pl-9 pr-4 py-2 text-sm text-[#e8dfd0] placeholder-[#5a5040] focus:outline-none focus:border-[#b8884a]/60 font-serif"
              />
            </div>

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {filteredChapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectChapter(ch.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl border border-transparent hover:border-[#b8884a]/30 hover:bg-[#140f0c] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="unicase text-sm font-light text-[#b8884a] group-hover:text-[#e5a758] w-8">
                      {ch.numeral}
                    </span>
                    <span className="garamond text-base text-[#ddd4c4] group-hover:text-white transition-colors">
                      {ch.title}
                    </span>
                  </div>
                  {ch.category === 'codex' && (
                    <span className="text-[9px] inter-ui uppercase tracking-wider text-[#7a6f60] bg-[#1a1410] px-2 py-0.5 rounded">
                      Kodeks
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#2a2218] flex justify-between items-center text-xs text-[#7a6f60] inter-ui">
              <span>İlerleme: %{Math.round(readingProgress)}</span>
              <button
                onClick={() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="hover:text-[#e5a758] transition-colors cursor-pointer"
              >
                Sona Git ↓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

