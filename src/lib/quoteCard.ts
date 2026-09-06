/**
 * Alıntı Mührü — manifestodan seçilen bir cümleyi paylaşılabilir bir
 * PNG karta dönüştürür. Tamamen Canvas 2D ile çizilir; sunucu yok,
 * dış servis yok, hiçbir veri siteden dışarı çıkmaz.
 */

const W = 1080;
const H = 1350;

const VOID = '#050403';
const BONE = '#f5eedf';
const EMBER = '#b8884a';
const EMBER_BRIGHT = '#e5a758';
const WHISPER = '#c5a26f';

export interface QuoteCardInput {
  /** Kart üzerindeki ana metin */
  quote: string;
  /** İsteğe bağlı üst etiket — ör. "Kilit Yasası" */
  label?: string;
}

/**
 * Sayfadaki webfont'lar yüklenene kadar bekler.
 * Beklemezsek canvas serif yedeğine düşer ve kart "ucuz" görünür.
 */
async function ensureFonts(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('400 56px "Cormorant Garamond"'),
        document.fonts.load('500 34px "Cormorant Unicase"'),
        document.fonts.load('500 20px Inter'),
        document.fonts.ready,
      ]),
      // Font CDN erişilemezse kartı süresiz bekletme.
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    // Yedek fontlarla devam et.
  }
}

/** Metni verilen genişliğe göre satırlara böler. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Uzun alıntıyı karta sığdırmak için punto küçültür. */
function fitQuote(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
): { lines: string[]; size: number; lineHeight: number } {
  for (let size = 72; size >= 30; size -= 2) {
    ctx.font = `500 ${size}px "Cormorant Garamond", Georgia, serif`;
    const lineHeight = size * 1.34;
    const lines = wrap(ctx, text, maxWidth);
    if (lines.length * lineHeight <= maxHeight) {
      return { lines, size, lineHeight };
    }
  }
  ctx.font = `500 30px "Cormorant Garamond", Georgia, serif`;
  return { lines: wrap(ctx, text, maxWidth), size: 30, lineHeight: 40 };
}

/** Kor dokusu: rastgele ama deterministik olmayan hafif parçacık serpintisi. */
function drawEmbers(ctx: CanvasRenderingContext2D): void {
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 2.1 + 0.4;
    const alpha = Math.random() * 0.5 + 0.08;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(229, 167, 88, ${alpha.toFixed(3)})`;
    ctx.shadowColor = EMBER_BRIGHT;
    ctx.shadowBlur = 12;
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

/** Film greni — düz siyahı kırıp basılı hissi verir. */
function drawGrain(ctx: CanvasRenderingContext2D): void {
  const grain = ctx.createImageData(W, H);
  const data = grain.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 8; // çok düşük opaklık
  }
  ctx.putImageData(grain, 0, 0);
}

/** Alıntı kartını çizer ve PNG blob'u döndürür. */
export async function renderQuoteCard({ quote, label }: QuoteCardInput): Promise<Blob> {
  await ensureFonts();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D bağlamı oluşturulamadı.');

  // ── Zemin
  ctx.fillStyle = VOID;
  ctx.fillRect(0, 0, W, H);

  // ── Merkezden yayılan kor ışığı
  const glow = ctx.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.42, W * 0.82);
  glow.addColorStop(0, 'rgba(229, 167, 88, 0.16)');
  glow.addColorStop(0.45, 'rgba(184, 136, 74, 0.05)');
  glow.addColorStop(1, 'rgba(4, 3, 3, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  drawEmbers(ctx);

  // ── Vinyet
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.78);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.86)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  // ── İnce altın çerçeve
  ctx.strokeStyle = 'rgba(184, 136, 74, 0.34)';
  ctx.lineWidth = 2;
  ctx.strokeRect(46, 46, W - 92, H - 92);
  ctx.strokeStyle = 'rgba(184, 136, 74, 0.14)';
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, W - 124, H - 124);

  ctx.textAlign = 'center';

  // ── Tepe amblemi
  ctx.font = '400 52px Georgia, serif';
  ctx.fillStyle = EMBER_BRIGHT;
  ctx.shadowColor = 'rgba(229, 167, 88, 0.75)';
  ctx.shadowBlur = 34;
  ctx.fillText('⚔', W / 2, 176);
  ctx.shadowBlur = 0;

  // ── İsteğe bağlı etiket
  if (label) {
    ctx.font = '600 21px Inter, system-ui, sans-serif';
    ctx.fillStyle = WHISPER;
    ctx.letterSpacing = '7px';
    ctx.fillText(label.toLocaleUpperCase('tr-TR'), W / 2, 246);
    ctx.letterSpacing = '0px';
  }

  // ── Alıntı
  const maxWidth = W - 260;
  const maxHeight = 560;
  const { lines, lineHeight } = fitQuote(ctx, quote, maxWidth, maxHeight);

  const blockHeight = lines.length * lineHeight;
  let y = H * 0.46 - blockHeight / 2 + lineHeight * 0.78;

  ctx.fillStyle = BONE;
  ctx.shadowColor = 'rgba(229, 167, 88, 0.4)';
  ctx.shadowBlur = 26;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }
  ctx.shadowBlur = 0;

  // ── Ayırıcı
  const dividerY = Math.min(H - 250, y + 54);
  const divider = ctx.createLinearGradient(W * 0.28, 0, W * 0.72, 0);
  divider.addColorStop(0, 'rgba(184, 136, 74, 0)');
  divider.addColorStop(0.5, EMBER_BRIGHT);
  divider.addColorStop(1, 'rgba(184, 136, 74, 0)');
  ctx.fillStyle = divider;
  ctx.fillRect(W * 0.28, dividerY, W * 0.44, 1.5);

  // ── İmza
  ctx.font = '500 38px "Cormorant Unicase", Georgia, serif';
  ctx.fillStyle = EMBER_BRIGHT;
  ctx.letterSpacing = '13px';
  ctx.fillText('SALİM GÜMÜŞ', W / 2, H - 168);
  ctx.letterSpacing = '0px';

  ctx.font = '400 19px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(122, 111, 96, 0.95)';
  ctx.letterSpacing = '9px';
  ctx.fillText('MANİFESTO', W / 2, H - 122);
  ctx.letterSpacing = '0px';

  ctx.font = 'italic 400 25px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = EMBER;
  ctx.fillText('o bir kahraman değil, bir yerçekimi', W / 2, H - 84);

  drawGrain(ctx);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG üretilemedi.'))),
      'image/png',
    );
  });
}

/** Dosya adı için metni sadeleştirir. */
export function slugify(text: string): string {
  const map: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => map[ch] ?? ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'alinti';
}
