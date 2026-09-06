/**
 * Paylaşımlı imleç takibi — React state'i dışında çalışır.
 *
 * Neden modül seviyesinde?
 * Daha önce imleç koordinatı App içinde useState ile tutuluyordu ve her
 * mousemove olayında 1000 satırlık ağacın tamamı yeniden render ediliyordu.
 * Koordinat aslında yalnızca (a) CSS custom property'lerine ve (b) nadiren
 * okuyan birkaç bileşene gerekiyor — ikisi de render gerektirmiyor.
 */

export interface PointerState {
  /** Ham imleç konumu (px, viewport) */
  x: number;
  y: number;
  /** Yumuşatılmış konum — fener ışığının gecikmeli takibi için */
  sx: number;
  sy: number;
  /** Son etkileşim zamanı (ms) — boşta kalma tespiti için */
  lastMove: number;
}

const state: PointerState = {
  x: typeof window === 'undefined' ? 0 : window.innerWidth / 2,
  y: typeof window === 'undefined' ? 0 : window.innerHeight / 2,
  sx: typeof window === 'undefined' ? 0 : window.innerWidth / 2,
  sy: typeof window === 'undefined' ? 0 : window.innerHeight / 2,
  lastMove: Date.now(),
};

let started = false;
let frame = 0;

/** Anlık imleç durumunu okur. Render tetiklemez. */
export function getPointer(): Readonly<PointerState> {
  return state;
}

/**
 * Takibi başlatır. Birden çok kez çağrılması güvenlidir (idempotent).
 * @returns Takibi durduran temizleme fonksiyonu.
 */
export function startPointerTracking(): () => void {
  if (started) return () => {};
  started = true;

  const onMouse = (e: MouseEvent) => {
    state.x = e.clientX;
    state.y = e.clientY;
    state.lastMove = Date.now();
  };

  const onTouch = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    state.x = touch.clientX;
    state.y = touch.clientY;
    state.lastMove = Date.now();
  };

  const root = document.documentElement;

  const tick = () => {
    // Kritik sönümleme: hedefe %14 yaklaş — fenere "ağırlık" hissi verir.
    state.sx += (state.x - state.sx) * 0.14;
    state.sy += (state.y - state.sy) * 0.14;
    root.style.setProperty('--mx', `${state.sx}px`);
    root.style.setProperty('--my', `${state.sy}px`);
    frame = requestAnimationFrame(tick);
  };

  window.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchstart', onTouch, { passive: true });
  frame = requestAnimationFrame(tick);

  return () => {
    window.removeEventListener('mousemove', onMouse);
    window.removeEventListener('touchmove', onTouch);
    window.removeEventListener('touchstart', onTouch);
    cancelAnimationFrame(frame);
    started = false;
  };
}
