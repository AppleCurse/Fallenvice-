import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Share2, X, Loader2, Check } from 'lucide-react';
import { renderQuoteCard, slugify } from '../lib/quoteCard';
import { soundEngine } from '../audio/soundEngine';

interface QuoteCardModalProps {
  quote: string;
  label?: string;
  onClose: () => void;
}

type Status = 'rendering' | 'ready' | 'error';

export const QuoteCardModal: React.FC<QuoteCardModalProps> = ({ quote, label, onClose }) => {
  const [status, setStatus] = useState<Status>('rendering');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Kartı üret. Modal kapanırsa sonucu at (yarış koşulu koruması).
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    renderQuoteCard({ quote, label })
      .then((blob) => {
        if (cancelled) return;
        blobRef.current = blob;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setStatus('ready');
        soundEngine.playEmberStrike();
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [quote, label]);

  // Esc ile kapat + açılışta odağı içeri al
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDownload = useCallback(() => {
    const blob = blobRef.current;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salim-gumus-${slugify(quote)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundEngine.playParchmentRustle(1.1);
  }, [quote]);

  const handleShare = useCallback(async () => {
    const blob = blobRef.current;
    if (!blob) return;
    const file = new File([blob], `salim-gumus-${slugify(quote)}.png`, { type: 'image/png' });

    // Web Share API yalnızca güvenli bağlamda ve dosya desteği varsa çalışır.
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `"${quote}" — Salim Gümüş` });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
        return;
      } catch {
        // Kullanıcı iptal etti ya da paylaşım reddedildi — indirmeye düş.
      }
    }
    handleDownload();
  }, [quote, handleDownload]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(3,2,2,0.94)] backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Alıntı Mührü"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm flex flex-col items-center gap-5"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Kapat"
          className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-[#0c0907] border border-[rgba(184,136,74,0.35)] text-[#c5a26f] hover:text-[#f5eedf] hover:border-[#e5a758] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Önizleme */}
        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-[rgba(184,136,74,0.3)] shadow-[0_0_60px_rgba(229,167,88,0.14)] bg-[#050403] flex items-center justify-center">
          {status === 'rendering' && (
            <div className="flex flex-col items-center gap-3 text-[#7a6f60]">
              <Loader2 className="w-6 h-6 animate-spin text-[#b8884a]" />
              <span className="garamond italic text-sm">mühür dövülüyor…</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-2 px-6 text-center text-[#9a8c78]">
              <span className="garamond italic text-sm">
                Mühür üretilemedi. Tarayıcınız canvas dışa aktarımını engelliyor olabilir.
              </span>
            </div>
          )}

          {status === 'ready' && previewUrl && (
            <img
              src={previewUrl}
              alt="Alıntı mührü önizlemesi"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Eylemler */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleDownload}
            disabled={status !== 'ready'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(184,136,74,0.4)] bg-[rgba(10,8,7,0.9)] text-[#e5a758] text-[11px] uppercase tracking-[0.25em] inter-ui hover:border-[#e5a758] hover:bg-[rgba(184,136,74,0.14)] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            İndir
          </button>

          <button
            onClick={handleShare}
            disabled={status !== 'ready'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(184,136,74,0.4)] bg-[rgba(10,8,7,0.9)] text-[#e5a758] text-[11px] uppercase tracking-[0.25em] inter-ui hover:border-[#e5a758] hover:bg-[rgba(184,136,74,0.14)] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {shared ? 'Paylaşıldı' : 'Paylaş'}
          </button>
        </div>

        <p className="garamond italic text-[11px] text-[#5a5040] text-center">
          Kart tarayıcında üretildi — hiçbir veri dışarı gönderilmedi.
        </p>
      </div>
    </div>
  );
};
