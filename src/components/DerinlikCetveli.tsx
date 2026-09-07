import React, { useEffect, useState } from 'react';

interface ChapterLayer {
  percent: number;
  name: string;
  shortName: string;
  targetId: string;
}

// percent values are fallbacks only — real positions are measured from the DOM.
const MANIFESTO_CHAPTERS: ChapterLayer[] = [
  { percent: 0, name: 'Başlangıç (Giriş)', shortName: '%0 — Başlangıç', targetId: 'hero' },
  { percent: 12, name: 'Kapı I — Şeytan & Pabuç', shortName: '%12 — Kapı I', targetId: 'kapi-1' },
  { percent: 25, name: 'Kapı III — Kökünden Sökmek', shortName: '%25 — Kapı III', targetId: 'kapi-3' },
  { percent: 38, name: 'Kapı IV — Yoldaşlık & Söz', shortName: '%38 — Kapı IV', targetId: 'kapi-4' },
  { percent: 48, name: 'Kapı V — Boş İskemle', shortName: '%48 — Kapı V', targetId: 'kapi-5' },
  { percent: 60, name: 'Yedi Özellik (Karakter)', shortName: '%60 — Yedi Özellik', targetId: 'yedi-ozellik' },
  { percent: 74, name: 'Kapı VIII — Kilit Yasası', shortName: '%74 — Kapı VIII', targetId: 'kapi-8' },
  { percent: 85, name: 'Kapı X — Omurga Ayarı', shortName: '%85 — Kapı X', targetId: 'kapi-10' },
  { percent: 100, name: 'Mühür & Hakikat (Son)', shortName: '%100 — Mühür', targetId: 'son-sahne' },
];

interface DerinlikCetveliProps {
  readingProgress: number; // 0 to 100
  onJumpToTarget: (targetId: string) => void;
}

export const DerinlikCetveli: React.FC<DerinlikCetveliProps> = ({
  readingProgress,
  onJumpToTarget,
}) => {
  const currentProgress = Math.min(100, Math.max(0, Math.round(readingProgress)));

  // Measure the real position of each chapter in the document instead of
  // trusting hardcoded percentages that drift whenever content changes.
  const [layers, setLayers] = useState<ChapterLayer[]>(MANIFESTO_CHAPTERS);

  useEffect(() => {
    const measure = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) return;

      const measured = MANIFESTO_CHAPTERS.map((chapter) => {
        const el = document.getElementById(chapter.targetId);
        if (!el) return chapter;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const raw = (Math.min(top, total) / total) * 100;
        const percent = Math.max(0, Math.min(100, Math.round(raw)));
        return { ...chapter, percent, shortName: `%${percent} — ${chapter.shortName.split('— ')[1]}` };
      });
      setLayers(measured);
    };

    measure();
    // Re-measure once webfonts settle and layout stabilizes.
    const t = window.setTimeout(measure, 900);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Find active manifesto chapter
  let activeChapter = layers[0];
  for (let i = layers.length - 1; i >= 0; i--) {
    if (currentProgress >= layers[i].percent) {
      activeChapter = layers[i];
      break;
    }
  }

  // Generate 21 evenly spaced ticks (0 to 100 in steps of 5)
  const ticks = Array.from({ length: 21 }, (_, i) => i * 5);

  return (
    <aside
      aria-label="Manifesto İlerleme Cetveli"
      className="fixed right-2 sm:right-5 top-20 bottom-16 z-[110] flex items-center select-none pointer-events-none"
    >
      <div className="relative h-[72vh] max-h-[640px] flex flex-row items-center pointer-events-auto bg-[rgba(6,5,5,0.75)] backdrop-blur-md px-2 py-3 rounded-full border border-[rgba(184,136,74,0.18)] shadow-[0_0_30px_rgba(0,0,0,0.85)]">
        {/* Live Progress HUD Tag (Hovering indicator) */}
        <div
          style={{ top: `${readingProgress}%` }}
          className="absolute -left-36 sm:-left-44 -translate-y-1/2 flex items-center gap-1.5 transition-all duration-100 ease-out"
        >
          <div className="bg-[#0e0a08] border border-[#b8884a] text-[#e8dfd0] px-2.5 py-1 rounded shadow-[0_0_20px_rgba(229,167,88,0.35)] text-right">
            <div className="text-[11px] sm:text-xs font-mono font-bold text-[#e5a758] tracking-widest">
              %{currentProgress}
            </div>
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#9a8c78] font-sans truncate max-w-[120px]">
              {activeChapter.name}
            </div>
          </div>
          {/* Glowing ember needle pointer */}
          <div className="w-4 sm:w-5 h-[1.5px] bg-[#e5a758] shadow-[0_0_8px_#e5a758]" />
        </div>

        {/* Ruler Axis Ticks */}
        <div className="relative h-full flex flex-col justify-between items-end pl-1 pr-1.5 border-r border-[#3a3024]">
          {ticks.map((p) => {
            const isMajor = p % 25 === 0;
            const isTerminal = p === 100;
            const isTarget = isMajor || isTerminal;

            const chapterMatch = layers.find(
              (c) => Math.abs(c.percent - p) <= 3
            );

            return (
              <button
                key={p}
                onClick={() => chapterMatch && onJumpToTarget(chapterMatch.targetId)}
                title={chapterMatch ? `%${p} — ${chapterMatch.name}` : `%${p}`}
                className={`group flex items-center justify-end transition-all ${
                  chapterMatch ? 'cursor-pointer hover:scale-125' : 'cursor-default'
                }`}
              >
                {/* Major numbers */}
                {isTarget && (
                  <span
                    className={`hidden sm:inline font-mono text-[8px] tracking-tighter mr-1.5 transition-colors ${
                      currentProgress >= p
                        ? 'text-[#e5a758] font-bold'
                        : 'text-[#5a5040] group-hover:text-[#b8884a]'
                    }`}
                  >
                    {p}
                  </span>
                )}

                {/* Tick bar */}
                <div
                  className={`transition-all rounded-full ${
                    isTerminal
                      ? 'w-4 h-[2px] bg-[#e5a758] shadow-[0_0_8px_#e5a758]'
                      : isMajor
                      ? currentProgress >= p
                        ? 'w-3.5 h-[1.5px] bg-[#e5a758] shadow-[0_0_6px_#e5a758]'
                        : 'w-3 h-[1px] bg-[#7a6f60] group-hover:bg-[#b8884a]'
                      : currentProgress >= p
                      ? 'w-2 h-[1px] bg-[#b8884a]'
                      : 'w-1.5 h-[1px] bg-[#3a3024]'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Chapter Badges on the right */}
        <div className="hidden lg:flex flex-col justify-between h-full pl-2 text-[8px] tracking-widest text-[#5a5040] uppercase font-mono">
          <span className="text-[#b8884a]">GİRİŞ</span>
          <span>KAPI I</span>
          <span>ÖZELLİKLER</span>
          <span>YASALAR</span>
          <span className="text-[#e5a758] font-bold">MÜHÜR</span>
        </div>
      </div>
    </aside>
  );
};
