import React, { useEffect, useState } from 'react';
import { Flame, WifiOff, X } from 'lucide-react';

interface UpdatePromptProps {
  updateReady: boolean;
  offlineReady: boolean;
  onApply: () => void;
}

/**
 * Sayfanın altında beliren ince bildirim şeridi.
 * Okuma akışını bölmemek için modal değil, kapatılabilir bir şerit.
 */
export const UpdatePrompt: React.FC<UpdatePromptProps> = ({
  updateReady,
  offlineReady,
  onApply,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [showOffline, setShowOffline] = useState(false);

  // "Çevrimdışı hazır" bilgisi kalıcı olmamalı — kısa bir teyit yeter.
  useEffect(() => {
    if (!offlineReady) return;
    setShowOffline(true);
    const t = window.setTimeout(() => setShowOffline(false), 5000);
    return () => window.clearTimeout(t);
  }, [offlineReady]);

  // Yeni güncelleme gelirse daha önce kapatılmış olsa da tekrar göster.
  useEffect(() => {
    if (updateReady) setDismissed(false);
  }, [updateReady]);

  const visible = (updateReady && !dismissed) || showOffline;
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[180] flex items-center gap-3 rounded-full border border-[rgba(184,136,74,0.35)] bg-[rgba(8,6,5,0.96)] backdrop-blur-md pl-4 pr-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.9)] max-w-[92vw]"
    >
      {updateReady && !dismissed ? (
        <>
          <Flame className="w-4 h-4 text-[#e5a758] shrink-0" />
          <span className="garamond italic text-sm text-[#c9bfae]">
            Yeni bir sürüm hazır.
          </span>
          <button
            onClick={onApply}
            className="ml-1 px-3.5 py-1.5 rounded-full border border-[rgba(184,136,74,0.45)] text-[10px] uppercase tracking-[0.2em] inter-ui text-[#e5a758] hover:bg-[rgba(184,136,74,0.16)] hover:text-[#fff8ee] transition-colors cursor-pointer shrink-0"
          >
            Tazele
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Bildirimi kapat"
            className="p-1.5 rounded-full text-[#5a5040] hover:text-[#c5a26f] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-[#b8884a] shrink-0" />
          <span className="garamond italic text-sm text-[#c9bfae] pr-2">
            Oda artık çevrimdışı da açılıyor.
          </span>
        </>
      )}
    </div>
  );
};
