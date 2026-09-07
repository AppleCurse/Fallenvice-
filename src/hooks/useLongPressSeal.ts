import { useEffect, useRef } from 'react';

/** Mühürlenebilir bir pasaj olarak kabul edilen seçiciler. */
const SEALABLE = '[data-seal-text], .soz, .hukum, .vurgu-kapsayici';

const HOLD_MS = 550;
/** Bu kadar px kayma olursa kullanıcı kaydırmak istiyordur, basış iptal edilir. */
const MOVE_TOLERANCE = 12;

const MIN_LEN = 12;
const MAX_LEN = 240;

function extractText(el: HTMLElement): { text: string; label?: string } | null {
  const explicit = el.getAttribute('data-seal-text');
  const label = el.getAttribute('data-seal-label') ?? undefined;

  const raw = explicit ?? el.textContent ?? '';
  const text = raw.replace(/\s+/g, ' ').trim();

  if (text.length < MIN_LEN) return null;
  return { text: text.slice(0, MAX_LEN), label };
}

/**
 * Dokunmatik cihazlarda uzun basış ile mühürleme.
 *
 * Masaüstünde alıntı kartı metin seçilerek üretiliyor; telefonda metin
 * seçmek zahmetli ve işletim sisteminin kendi menüsü araya giriyor.
 * Bu yüzden dokunmatikte pasaja uzun basmak doğrudan kartı açar.
 */
export function useLongPressSeal(
  onSeal: (quote: string, label?: string) => void,
  enabled: boolean,
): void {
  // Handler'ı ref'te tut ki effect her render'da yeniden kurulmasın.
  const sealRef = useRef(onSeal);
  useEffect(() => {
    sealRef.current = onSeal;
  }, [onSeal]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    // Yalnızca kaba işaretleyicili (dokunmatik) cihazlar.
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    let timer: number | null = null;
    let startX = 0;
    let startY = 0;
    let target: HTMLElement | null = null;

    const cancel = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      target = null;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return cancel();
      const touch = e.touches[0];
      if (!touch) return;

      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(SEALABLE);
      if (!el) return;

      target = el;
      startX = touch.clientX;
      startY = touch.clientY;

      timer = window.setTimeout(() => {
        timer = null;
        if (!target) return;
        const payload = extractText(target);
        target = null;
        if (!payload) return;

        // Hafif dokunsal geri bildirim — "mühür bastı" hissi.
        navigator.vibrate?.(18);
        sealRef.current(payload.text, payload.label);
      }, HOLD_MS);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (timer === null) return;
      const touch = e.touches[0];
      if (!touch) return cancel();
      if (
        Math.abs(touch.clientX - startX) > MOVE_TOLERANCE ||
        Math.abs(touch.clientY - startY) > MOVE_TOLERANCE
      ) {
        cancel();
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', cancel);
    document.addEventListener('touchcancel', cancel);
    window.addEventListener('scroll', cancel, { passive: true });

    return () => {
      cancel();
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', cancel);
      document.removeEventListener('touchcancel', cancel);
      window.removeEventListener('scroll', cancel);
    };
  }, [enabled]);
}
