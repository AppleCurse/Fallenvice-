import React, { useCallback, useEffect, useState } from 'react';
import { Stamp, Copy, Check } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface SelectionActionsProps {
  /** Seçili metinden alıntı mührü üretilmesi istendiğinde çağrılır */
  onSeal: (quote: string) => void;
}

interface Anchor {
  x: number;
  y: number;
  text: string;
}

const MIN_LEN = 12;
const MAX_LEN = 240;

/**
 * Kullanıcı manifestodan bir cümle seçtiğinde seçimin üzerinde beliren
 * araç çubuğu. Sitenin "her cümle mühürlenebilir" fikrini keşfedilebilir
 * kılar — kullanıcının önce bir kartın var olduğunu bilmesi gerekmez.
 */
export const SelectionActions: React.FC<SelectionActionsProps> = ({ onSeal }) => {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [copied, setCopied] = useState(false);

  const readSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setAnchor(null);
      return;
    }

    const text = selection.toString().trim().replace(/\s+/g, ' ');
    if (text.length < MIN_LEN || text.length > MAX_LEN) {
      setAnchor(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setAnchor(null);
      return;
    }

    setAnchor({
      x: rect.left + rect.width / 2,
      y: Math.max(64, rect.top - 12),
      text,
    });
  }, []);

  useEffect(() => {
    // selectionchange çok sık tetiklenir; sürükleme bitince okumak yeterli.
    const onPointerUp = () => window.setTimeout(readSelection, 10);
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.key === 'Escape') window.setTimeout(readSelection, 10);
    };
    const onScroll = () => setAnchor(null);

    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('scroll', onScroll);
    };
  }, [readSelection]);

  if (!anchor) return null;

  const handleCopy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(`"${anchor.text}" — Salim Gümüş`);
      ok = true;
    } catch {
      ok = false;
    }
    if (ok) {
      soundEngine.playEmberStrike();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      style={{ left: `${anchor.x}px`, top: `${anchor.y}px` }}
      className="fixed z-[160] -translate-x-1/2 -translate-y-full flex items-center gap-1 rounded-full border border-[rgba(184,136,74,0.35)] bg-[rgba(8,6,5,0.96)] backdrop-blur-md px-1.5 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.85)] animate-[fadeUp_220ms_ease-out]"
      // Araç çubuğuna basmak seçimi kaybettirmesin
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onClick={() => {
          soundEngine.playParchmentRustle(0.8);
          onSeal(anchor.text);
          setAnchor(null);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] inter-ui text-[#e5a758] hover:bg-[rgba(184,136,74,0.16)] transition-colors cursor-pointer"
      >
        <Stamp className="w-3.5 h-3.5" />
        Mühürle
      </button>

      <div className="w-px h-4 bg-[rgba(184,136,74,0.25)]" />

      <button
        onClick={handleCopy}
        aria-label="Alıntıyı kopyala"
        className="p-2 rounded-full text-[#7a6f60] hover:text-[#e5a758] hover:bg-[rgba(184,136,74,0.12)] transition-colors cursor-pointer"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
