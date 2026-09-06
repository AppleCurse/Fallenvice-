import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { CHAPTERS_INDEX } from '../data/manifesto';
import { soundEngine } from '../audio/soundEngine';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectChapter: (id: string) => void;
  /** Şu anda okunan bölümün id'si — listede işaretlenir */
  activeChapterId: string;
}

/** Türkçe karakterleri normalize ederek aksan duyarsız arama sağlar. */
function fold(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[ıİ]/g, 'i')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u');
}

const CATEGORY_LABEL: Record<string, string> = {
  chapter: 'Kapı',
  codex: 'Kodeks',
  closing: 'Mühür',
};

/**
 * Klavye öncelikli bölüm dizini. Eski sürüm yalnızca tıklanabilir bir
 * listeydi; bu sürüm ok tuşlarıyla gezilebilir, Enter ile atlar,
 * odağı hapseder ve kapanınca odağı tetikleyen düğmeye geri verir.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  onSelectChapter,
  activeChapterId,
}) => {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return CHAPTERS_INDEX;
    return CHAPTERS_INDEX.filter((ch) => {
      const haystack = fold(`${ch.numeral} ${ch.title} ${ch.subtitle ?? ''}`);
      return haystack.includes(q);
    });
  }, [query]);

  // Açılışta durumu sıfırla, odağı sakla ve arama alanına ver.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    const activeIdx = CHAPTERS_INDEX.findIndex((c) => c.id === activeChapterId);
    setCursor(activeIdx >= 0 ? activeIdx : 0);
    // Modal DOM'a girdikten sonra odaklan.
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open, activeChapterId]);

  // Kapanınca odağı geri ver — aria-modal sözünün klavye tarafındaki karşılığı.
  useEffect(() => {
    if (open) return;
    restoreFocusRef.current?.focus?.();
  }, [open]);

  // Filtre değişince imleci listeye sığdır.
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, results.length - 1)));
  }, [results.length]);

  // Seçili satırı görünür tut.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  const commit = useCallback(
    (index: number) => {
      const item = results[index];
      if (!item) return;
      onSelectChapter(item.id);
      onClose();
    },
    [results, onSelectChapter, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
      soundEngine.playParchmentRustle(0.35);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
      soundEngine.playParchmentRustle(0.35);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(cursor);
      return;
    }
    // Basit odak hapsi: paneldeki tek odaklanabilir alan arama girdisidir.
    if (e.key === 'Tab') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-[rgba(4,3,3,0.93)] backdrop-blur-xl flex items-start justify-center p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Bölümler ve Yasalar Dizini"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-lg rounded-2xl border border-[rgba(184,136,74,0.28)] bg-[#090706] shadow-[0_20px_80px_rgba(0,0,0,0.92)] overflow-hidden"
      >
        {/* Arama satırı */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#221b13]">
          <Search className="w-4 h-4 text-[#7a6f60] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kapı, yasa ya da özellik ara…"
            aria-label="Bölüm ara"
            className="flex-1 bg-transparent outline-none garamond text-lg text-[#f5eedf] placeholder:text-[#4e463b]"
          />
          <button
            onClick={onClose}
            aria-label="Dizini kapat"
            className="p-1.5 rounded-full text-[#5a5040] hover:text-[#e8dfd0] hover:bg-white/5 transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sonuçlar */}
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <p className="px-5 py-8 text-center garamond italic text-[#5a5040]">
              Karanlıkta böyle bir kapı yok.
            </p>
          )}

          {results.map((ch, idx) => {
            const selected = idx === cursor;
            const isCurrent = ch.id === activeChapterId;
            return (
              <button
                key={ch.id}
                data-idx={idx}
                onMouseEnter={() => setCursor(idx)}
                onClick={() => commit(idx)}
                className={`w-full text-left flex items-center gap-4 px-5 py-2.5 transition-colors cursor-pointer ${
                  selected ? 'bg-[rgba(184,136,74,0.13)]' : 'hover:bg-white/[0.03]'
                }`}
              >
                <span
                  className={`unicase text-lg w-9 shrink-0 text-center ${
                    selected ? 'text-[#e5a758]' : 'text-[#7a6f60]'
                  }`}
                >
                  {ch.numeral}
                </span>

                <span className="flex-1 min-w-0">
                  <span
                    className={`block garamond text-base truncate ${
                      selected ? 'text-[#fff8ee]' : 'text-[#c9bfae]'
                    }`}
                  >
                    {ch.title}
                  </span>
                  {ch.subtitle && (
                    <span className="block garamond italic text-xs text-[#6b6155] truncate">
                      {ch.subtitle}
                    </span>
                  )}
                </span>

                {isCurrent && (
                  <span className="text-[8px] inter-ui uppercase tracking-[0.2em] text-[#e5a758] border border-[#b8884a]/40 rounded-full px-2 py-0.5 shrink-0">
                    buradasın
                  </span>
                )}

                <span className="text-[8px] inter-ui uppercase tracking-[0.2em] text-[#4e463b] shrink-0 hidden sm:inline">
                  {CATEGORY_LABEL[ch.category ?? 'chapter']}
                </span>
              </button>
            );
          })}
        </div>

        {/* Klavye ipuçları */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[#221b13] text-[9px] inter-ui uppercase tracking-[0.18em] text-[#4e463b]">
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
            gez
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            git
          </span>
          <span className="ml-auto">esc — kapat</span>
        </div>
      </div>
    </div>
  );
};
