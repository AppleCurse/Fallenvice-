import React, { useEffect, useState, useRef } from 'react';
import { FloatingEmbersCanvas } from './components/FloatingEmbersCanvas';
import { AshDissolveCanvas } from './components/AshDissolveCanvas';
import { SecretWhispers } from './components/SecretWhispers';
import { ChapterNav } from './components/ChapterNav';
import { DerinlikCetveli } from './components/DerinlikCetveli';
import { ManifestoVurgusu } from './components/ManifestoVurgusu';
import { EmptyChairScene } from './components/InteractiveScenes/EmptyChairScene';
import { LockScene } from './components/InteractiveScenes/LockScene';
import { TiresScene } from './components/InteractiveScenes/TiresScene';
import { GravityFallScene } from './components/InteractiveScenes/GravityFallScene';
import { YEDI_OZELLIK, DORT_YASA } from './data/manifesto';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const [hasEntered, setHasEntered] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [lanternMode, setLanternMode] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isCursorLarge, setIsCursorLarge] = useState(false);

  const coordsRef = useRef({
    mx: window.innerWidth / 2,
    my: window.innerHeight / 2,
    sx: window.innerWidth / 2,
    sy: window.innerHeight / 2,
  });

  // Track cursor and smooth interpolation for lantern
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      coordsRef.current.mx = e.clientX;
      coordsRef.current.my = e.clientY;
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        coordsRef.current.mx = e.touches[0].clientX;
        coordsRef.current.my = e.touches[0].clientY;
        setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animationFrameId: number;

    const updateSmoothCoords = () => {
      const c = coordsRef.current;
      c.sx += (c.mx - c.sx) * 0.14;
      c.sy += (c.my - c.sy) * 0.14;

      document.documentElement.style.setProperty('--mx', `${c.sx}px`);
      document.documentElement.style.setProperty('--my', `${c.sy}px`);

      animationFrameId = requestAnimationFrame(updateSmoothCoords);
    };

    updateSmoothCoords();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Track scroll progress for reading wick (fitil)
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min((window.scrollY / totalHeight) * 100, 100);
        setReadingProgress(progress);
        const fitilEl = document.getElementById('fitil');
        if (fitilEl) {
          fitilEl.style.height = `${progress}%`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure all texts are 100% visible
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.aydinlan, .soz, .kapi, .hukum');
    elements.forEach((el) => {
      el.style.opacity = '1';
    });
  }, [lanternMode]);

  // Track chapters/doors visibility for subtle parchment rustle atmospheric sound
  const lastSectionRef = useRef<string>('');
  const lastSoundTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!hasEntered) return;

    const chapterSelector = 'section.kapi, section#hero, section#yedi-ozellik, section#dort-yasa, section#son-sahne';
    const sections = document.querySelectorAll(chapterSelector);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const now = Date.now();
            if (id && id !== lastSectionRef.current && now - lastSoundTimeRef.current > 750) {
              lastSectionRef.current = id;
              lastSoundTimeRef.current = now;
              soundEngine.playParchmentRustle(0.9);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-15% 0px -35% 0px',
        threshold: 0.15,
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
      observer.disconnect();
    };
  }, [hasEntered]);

  // Keyboard shortcuts (L: Lantern, M: Audio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'l' || e.key === 'L') {
        setLanternMode((prev) => !prev);
      }
      if (e.key === 'm' || e.key === 'M') {
        if (soundEngine.getIsPlaying()) {
          soundEngine.stop();
        } else {
          soundEngine.start();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      soundEngine.playParchmentRustle(1.15);
      lastSectionRef.current = id;
      lastSoundTimeRef.current = Date.now();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePhraseClick = (e: React.MouseEvent) => {
    soundEngine.playParchmentRustle(0.6);
    window.dispatchEvent(
      new CustomEvent('trigger-ash', {
        detail: { x: e.clientX, y: e.clientY, count: 18 },
      })
    );
  };

  return (
    <div
      className={`min-h-screen bg-[#040303] text-[#f5eedf] relative ${
        window.innerWidth > 768 ? 'cursor-none' : 'cursor-auto'
      }`}
    >
      {/* 2. Living Breathing Vignette & Film Grain */}
      <div className="vignette-breath" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />

      {/* Parallax Typography Background Layers */}
      <div
        id="layer1"
        className="parallax-layer parallax-layer-1"
        aria-hidden="true"
      >
        SALİM
      </div>
      <div
        id="layer2"
        className="parallax-layer parallax-layer-2"
        aria-hidden="true"
      >
        GÜMÜŞ
      </div>
      <div
        id="layer3"
        className="parallax-layer parallax-layer-3"
        aria-hidden="true"
      >
        ⚔
      </div>

      {/* 3. Ambient Embers & Dissolving Ash Canvases */}
      <FloatingEmbersCanvas />
      <AshDissolveCanvas />

      {/* 4. Interactive Lantern & Glowing Cursor Point */}
      {lanternMode && <div id="fener" aria-hidden="true" />}
      <div
        id="kor"
        className={isCursorLarge ? 'kor-buyuk' : ''}
        aria-hidden="true"
      />

      {/* 5. Reading Wick (Fitil) on Left Margin */}
      <div id="fitil" aria-hidden="true" />

      {/* 6. Right Progress Gauge */}
      <DerinlikCetveli
        readingProgress={readingProgress}
        onJumpToTarget={handleSelectChapter}
      />

      {/* 7. Secret Whispers on Idle */}
      <SecretWhispers cursorX={cursorPos.x} cursorY={cursorPos.y} />

      {/* 8. Floating Navigation Bar & Audio Controls */}
      <ChapterNav
        readingProgress={readingProgress}
        lanternMode={lanternMode}
        onToggleLantern={() => setLanternMode((prev) => !prev)}
        onSelectChapter={handleSelectChapter}
      />

      {/* ═══════════ MANIFESTO CHAMBER (DÜNYA) ═══════════ */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 py-24 pr-16 sm:pr-24">
        {/* HERO */}
        <section
          id="hero"
          className="soz aydinlan min-h-[85vh] flex flex-col justify-center items-center text-center py-20"
          onMouseEnter={() => setIsCursorLarge(true)}
          onMouseLeave={() => setIsCursorLarge(false)}
        >
          <span className="inter-ui text-xs uppercase tracking-[0.6em] text-[#c5a26f] mb-6 block font-medium">
            — BİR KARAKTER VE BİR ÇAĞ —
          </span>
          <h1 className="unicase text-6xl sm:text-8xl md:text-9xl font-light tracking-[0.14em] text-[#fff8ee] leading-[1.05] drop-shadow-[0_0_50px_rgba(229,167,88,0.35)]">
            SALİM
            <br />
            GÜMÜŞ
          </h1>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#e5a758] to-transparent my-8" />
          <p className="garamond italic text-2xl sm:text-3xl text-[#e5a758] tracking-wider font-light">
            "O bir kahraman değil, bir yerçekimi."
          </p>
          <span className="inter-ui text-xs uppercase tracking-[0.4em] text-[#c5a26f] mt-12 animate-pulse bg-[#140e0a]/80 px-5 py-2 rounded-full border border-[#b8884a]/30">
            ↓ Manifestoyu Keşfetmek İçin Aşağı Kaydırın
          </span>
        </section>

        {/* I. ŞEYTANIN BOYUN EĞMESİ */}
        <section id="kapi-1" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            I
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Şeytanın Boyun Eğmesi
          </div>
        </section>

        {/* Manifesto Highlight I */}
        <ManifestoVurgusu
          subtext='Siz "ters mi giydi, düz mi giydi" diye düşünürken...'
          phrase="ben şeytana pabucunu giymeyi unutturan adamım."
          accentWord="Şeytan & Pabuç"
          scale="large"
        />

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Aslında şeytanın bile aklına gelmeyecekleri akıl edebiliyorken,
          </p>
          <p className="garamond italic text-xl sm:text-2xl text-[#e5a758] mt-3">
            melek gibi davrandığım için kusura bakmayın.
          </p>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-lg sm:text-xl text-[#c5a26f]">Benim felsefem:</p>
          <span className="vurgu block text-3xl sm:text-5xl font-semibold text-[#fff8ee] mt-3 tracking-wide drop-shadow-[0_0_25px_rgba(229,167,88,0.3)]">
            ÇÖZÜM GETİRMEK.
          </span>
        </div>

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Ben, külkedisini Sindirella'ya dönüştüren
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            o ayakkabının satıcısı değilim.
          </p>
        </div>

        {/* II. YATAĞIN AYAKLARI */}
        <section id="kapi-2" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            II
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Yatağın Ayakları
          </div>
        </section>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Yatağınızın altında canavar var diye tedirgin misiniz?
          </p>
        </div>

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Sizi terapiye gönderip,
          </p>
          <p className="garamond italic text-xl sm:text-2xl text-[#e5a758] mt-3">
            olmayan bir canavarın yokluğuna inanmanızı istemem.
          </p>
        </div>

        {/* Manifesto Highlight II */}
        <ManifestoVurgusu
          subtext="Korkuyu yatıştırmam. Kökünden sökerim."
          phrase="Ben gelir, o yatağın ayaklarını keserim."
          accentWord="Kökünden Sökmek"
          scale="large"
        />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Altı kalmayan yatağın korkusu da kalmaz.
          </p>
          <span className="vurgu block text-2xl sm:text-3xl font-medium text-[#e5a758] mt-4">
            İşte bu, Salim Gümüş olmak.
          </span>
        </div>

        {/* III. MEZARDAN YÜKSELİŞ */}
        <section id="kapi-3" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            III
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Mezardan Yükseliş
          </div>
        </section>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="garamond italic text-xl text-[#c5a26f]">Unutmayın:</p>
        </div>

        {/* Manifesto Highlight III */}
        <ManifestoVurgusu
          subtext="Eğer derin bir mezardaysanız..."
          phrase="üzerinize atılan her toprak, ayağınızın altında sizi yukarıya taşıyacaktır."
          accentWord="Toprak & İrade"
          scale="large"
        />

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Tabii çaresizce yatıp kabullenmez,
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-semibold text-[#fff8ee] mt-3">
            AYAĞA KALKIP DİK DURURSANIZ.
          </span>
        </div>

        {/* IV. ASLA YOLDA BIRAKMAM */}
        <section id="kapi-4" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            IV
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Asla Yolda Bırakmam
          </div>
        </section>

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Lastiğiniz patladı,
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            bijonlar mazgala düştü.
          </p>
        </div>

        <div className="soz aydinlan my-12 text-center max-w-2xl mx-auto">
          <p className="garamond italic text-xl text-[#c5a26f]">
            Size çekici falan göndermem.
          </p>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Yanınıza gelirim,
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            diğer lastiklerden birer bijon alırız.
          </p>
        </div>

        {/* 4 Wheels Visual Scene */}
        <TiresScene />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Dört lastik, üçer bijonla
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            yolunuza devam edersiniz.
          </p>
        </div>

        {/* Manifesto Highlight IV */}
        <ManifestoVurgusu
          subtext="Salim Gümüş Yemini:"
          phrase="Çünkü ben sizi yolda bırakmam. ASLA."
          accentWord="Sözün Çeliği"
          scale="massive"
        />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Ben kuralları değil,
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee] mt-3">
            sistemin ezberini bozarım.
          </span>
        </div>

        {/* V. MASADA BİR BOŞ İSKEMLE */}
        <section id="kapi-5" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            V
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Masada Bir Boş İskemle
          </div>
        </section>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Şeytan konuşmaz;
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee] mt-3">
            sana <em className="text-[#e5a758]">"sormayı"</em> öğretir.
          </span>
        </div>

        <div className="soz aydinlan my-12 text-center max-w-2xl mx-auto">
          <p className="text-lg sm:text-xl text-[#c5a26f]">
            Yani sana şüpheyi hediye eder.
          </p>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Ben <em className="text-[#e5a758]">"okunan"</em> kutsal metinler yerine,
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee] mt-3">
            <em className="text-[#e5a758]">"okuyan"</em> insanı seçiyorum.
          </span>
        </div>

        {/* Kitabe Scripture */}
        <div className="kitabe aydinlan my-20 py-12 px-6 border-y border-[#b8884a]/40 bg-[#120e0b]/60 text-center max-w-2xl mx-auto rounded-xl">
          <blockquote className="garamond italic text-2xl sm:text-3xl text-[#fff8ee] font-light leading-relaxed">
            "Şeytanla konuştum, o susuyordu;
            <br />
            çünkü cevap vermek Tanrı'ya aittir.
            <br />
            <span className="kor text-[#e5a758] font-medium not-italic block mt-4 drop-shadow-[0_0_20px_rgba(229,167,88,0.4)]">
              O bana soru sormayı öğretti.
            </span>
          </blockquote>
        </div>

        {/* Empty Chair Scene */}
        <EmptyChairScene />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="garamond italic text-xl text-[#c5a26f]">Cehenneme düşmez…</p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee] mt-2">
            Oraya yatırım yapar.
          </span>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Cehennem onu dışlar,
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            çünkü cehennem bile
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#e5a758] mt-3">
            onunla baş edemez.
          </span>
        </div>

        {/* Manifesto Highlight V */}
        <ManifestoVurgusu
          subtext="O, şeytanı suçlayanlardan değil..."
          phrase="masasında şeytan için bir iskemle bırakanlardan."
          accentWord="Boş İskemle"
          scale="large"
        />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Gerçek güç,
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            düşmanını bile strateji tahtasında
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee] mt-3">
            bir piyon yapabilmektir.
          </span>
        </div>

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Kurallar onun için yazılmadı —
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#e5a758] mt-3">
            yazarını işe aldı.
          </span>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Kendini bilmeyenler için bir tehlike;
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            kendini bilenler içinse
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#e5a758] mt-3">
            bir ilham kaynağıdır.
          </span>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Şeytan onunla pazarlık etmez,
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee] mt-3">
            çünkü masada oturan zaten odur.
          </span>
        </div>

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            İlk hamleyi yapmaz,
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            çünkü oyun zaten
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#e5a758] mt-3">
            onun varlığıyla başlamıştır.
          </span>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Ben cennetin steril sakinlerinden değilim.
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Meleklerle aynı notaya susmam.
          </p>
          <span className="vurgu block text-2xl sm:text-3xl font-medium text-[#fff8ee] mt-4 leading-relaxed">
            Benim sesim, yasak meyveyi ısıran çene kemiğinden yükselir.
          </span>
        </div>

        {/* VI. SANDALYEDEN MAKAMA */}
        <section id="kapi-6" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            VI
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Sandalyeden Makama
          </div>
        </section>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Eğer otursa,
          </p>
          <p className="garamond italic text-xl text-[#c5a26f]">
            yer sadece bir sandalye olmaz.
          </p>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Ona oturmasıyla birlikte
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            o sandalyenin adı
          </p>
          <span className="vurgu block text-3xl sm:text-5xl font-medium text-[#fff8ee] mt-4 drop-shadow-[0_0_25px_rgba(229,167,88,0.3)]">
            "MAKAM"A DÖNÜŞÜR.
          </span>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Çünkü bazı insanlar koltuğa oturunca büyümez.
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Bazı insanlar oturduğu her şeyi büyütür.
          </p>
          <span className="vurgu block text-2xl sm:text-3xl font-medium text-[#e5a758] mt-4">
            Salim de bu ikinci sınıfın adamı.
          </span>
        </div>

        {/* VII. YERÇEKİMİ */}
        <section id="kapi-7" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            VII
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Yerçekimi
          </div>
        </section>

        {/* Manifesto Highlight VII */}
        <ManifestoVurgusu
          subtext="Merkezde görünmez ama merkez odur."
          phrase="O bir kahraman değil, bir yerçekimi."
          accentWord="Kozmik Ağırlık"
          scale="massive"
        />

        {/* Gravity Falling Text Component */}
        <GravityFallScene />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Salim gibi adamlar
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee] mt-3">
            hikâyenin zeminini oluşturur.
          </span>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Kendisini sistemin merkezine koymadan sistemi çevirebilen,
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf] mt-3">
            ama o çekildiğinde tüm yapıyı çökertebilecek kadar
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#e5a758] mt-4">
            hayati bir figür.
          </span>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="garamond italic text-xl text-[#c5a26f]">Merkezde görünmez.</p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#e5a758] mt-2">
            Ama merkez odur.
          </span>
        </div>

        {/* YEDİ ÖZELLİK CODEX */}
        <section id="yedi-ozellik" className="py-20 sm:py-28">
          <div className="hukum-baslik aydinlan text-center unicase text-2xl sm:text-3xl text-[#e5a758] tracking-[0.4em] font-light mb-16 drop-shadow-[0_0_20px_rgba(229,167,88,0.3)]">
            — Yedi Özellik —
          </div>

          <div className="space-y-12 max-w-2xl mx-auto">
            {YEDI_OZELLIK.map((item) => (
              <div
                key={item.no}
                onClick={handlePhraseClick}
                className="hukum aydinlan pl-8 pr-4 py-4 rounded-xl border-l-2 border-[#b8884a] bg-[#120e0b]/40 hover:border-[#e5a758] hover:bg-[#120e0b]/70 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="no unicase text-2xl sm:text-3xl text-[#e5a758] tracking-widest block font-medium">
                    {item.no}
                  </span>
                  <span className="ad inter-ui text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#c5a26f] font-semibold">
                    {item.title}
                  </span>
                </div>
                {item.description.map((desc, dIdx) => (
                  <p
                    key={dIdx}
                    className="text-lg sm:text-xl font-light text-[#f5eedf] leading-relaxed my-1"
                  >
                    {desc}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* DÖRT YASA CODEX */}
        <section id="dort-yasa" className="py-20 sm:py-28">
          <div className="hukum-baslik aydinlan text-center unicase text-2xl sm:text-3xl text-[#e5a758] tracking-[0.4em] font-light mb-16 drop-shadow-[0_0_20px_rgba(229,167,88,0.3)]">
            — Dört Yasa —
          </div>

          <div className="space-y-12 max-w-2xl mx-auto">
            {DORT_YASA.map((item) => (
              <div
                key={item.no}
                onClick={handlePhraseClick}
                className="hukum aydinlan pl-8 pr-4 py-4 rounded-xl border-l-2 border-[#b8884a] bg-[#120e0b]/40 hover:border-[#e5a758] hover:bg-[#120e0b]/70 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="no unicase text-2xl sm:text-3xl text-[#e5a758] tracking-widest block font-medium">
                    {item.no}
                  </span>
                  <span className="ad inter-ui text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#c5a26f] font-semibold">
                    {item.title}
                  </span>
                </div>
                {item.description.map((desc, dIdx) => (
                  <p
                    key={dIdx}
                    className="text-lg sm:text-xl font-light text-[#f5eedf] leading-relaxed my-1"
                  >
                    {desc}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* VIII. KİLİT DEĞİŞTİ */}
        <section id="kapi-8" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            VIII
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Kilit Değişti
          </div>
        </section>

        {/* Interactive SVG Lock Animation */}
        <LockScene />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Birinden vazgeçtiğinde,
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            o kişi artık geri dönemez;
          </p>
        </div>

        {/* Manifesto Highlight VIII */}
        <ManifestoVurgusu
          subtext="Klişe adam kapıyı çarpar. Salim kapıyı çarpmaz..."
          phrase="Kapı kapalı değildir, KİLİT DEĞİŞMİŞTİR."
          accentWord="Kilit Yasası"
          scale="large"
        />

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Klişe adam kapıyı çarpar.
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Kapı kapalıdır ama anahtar hâlâ cebindedir.
          </p>
          <p className="garamond italic text-xl text-[#c5a26f] mt-2">
            Bir gün açabilir.
          </p>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee]">
            Salim kapıyı çarpmaz.
          </span>
          <p className="garamond italic text-xl text-[#c5a26f] mt-3">
            Gülümser, uğurlar, sessizleşir.
          </p>
        </div>

        <div
          className="soz aydinlan my-16 text-center max-w-2xl mx-auto"
          data-kul="gecti"
          onClick={handlePhraseClick}
        >
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Kapı hâlâ orada duruyordur
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            ama kilit değişmiştir.
          </p>
          <p className="garamond italic text-xl text-[#e5a758] mt-2 font-medium">
            Senin eski anahtarın artık hiçbir yeri açmaz.
          </p>
        </div>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Çünkü o senden vazgeçmemiştir,
          </p>
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            seni sistemden çıkarmıştır.
          </p>
          <span className="vurgu block text-3xl sm:text-5xl font-semibold text-[#fff8ee] mt-4 drop-shadow-[0_0_30px_rgba(229,167,88,0.35)]">
            VE SİSTEM GERİ ALMAZ.
          </span>
        </div>

        {/* IX. OMURGA AYARI */}
        <section id="kapi-9" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            IX
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Omurga Ayarı
          </div>
        </section>

        {/* Manifesto Highlight IX */}
        <ManifestoVurgusu
          subtext="Küsen adam hâlâ bağlıdır. Ayar yapan adam bağını kesmiştir."
          phrase="Bu küslük değil, OMURGA AYARIDIR."
          accentWord="Omurga Yasası"
          scale="large"
        />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="garamond italic text-xl text-[#c5a26f]">
            Küsen adam hâlâ bağlıdır.
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#e5a758] mt-2">
            Ayar yapan adam bağını kesmiştir.
          </span>
        </div>

        {/* X. OMUZ VE OMURGA */}
        <section id="kapi-10" className="kapi aydinlan text-center py-20 sm:py-28">
          <div className="unicase text-7xl sm:text-9xl font-light text-[#c5a26f]/70 tracking-widest leading-none drop-shadow-[0_0_35px_rgba(229,167,88,0.25)]">
            X
          </div>
          <div className="inter-ui text-xs sm:text-sm tracking-[0.6em] text-[#e5a758] uppercase mt-4 font-semibold">
            Omuz ve Omurga
          </div>
        </section>

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            İnsanlar zor günde omuz arar.
          </p>
        </div>

        {/* Manifesto Highlight X */}
        <ManifestoVurgusu
          subtext="Omuz ağlatır..."
          phrase="Salim omuz vermez. OMURGA VERİR."
          accentWord="Dik Duruş"
          scale="large"
        />

        <div className="soz aydinlan my-16 text-center max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-light text-[#f5eedf]">
            Omuz ağlatır,
          </p>
          <span className="vurgu block text-2xl sm:text-4xl font-medium text-[#fff8ee] mt-2">
            omurga ayağa kaldırır.
          </span>
        </div>

        {/* CLOSING SEAL - HAKİKAT & ÖZ */}
        <section
          id="son-sahne"
          className="son-sahne aydinlan text-center py-32 sm:py-44 max-w-2xl mx-auto"
          onMouseEnter={() => setIsCursorLarge(true)}
          onMouseLeave={() => setIsCursorLarge(false)}
        >
          <div className="inter-ui text-xs uppercase tracking-[0.6em] text-[#e5a758] mb-8 font-mono font-semibold">
            [ MÜHÜR & HAKİKAT ]
          </div>

          <ManifestoVurgusu
            subtext="O yüzden etrafındakiler ona yaslanmaz..."
            phrase="onunla hizalanır."
            accentWord="Hizalanma"
            scale="massive"
          />

          <div className="mt-24">
            <div className="unicase text-2xl sm:text-3xl font-light tracking-[0.6em] text-[#e5a758] drop-shadow-[0_0_20px_rgba(229,167,88,0.3)]">
              SALİM GÜMÜŞ
            </div>
            <div className="w-16 h-px bg-[#b8884a] mx-auto mt-4" />
            <div className="inter-ui text-[10px] uppercase tracking-[0.6em] text-[#c5a26f] mt-3 font-mono">
              — SON —
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
