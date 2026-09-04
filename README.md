# ⚔ Salim Gümüş — Manifesto

> **"O bir kahraman değil, bir yerçekimi."**

Kurgusal karakter **Salim Gümüş**'ün karanlık atmosferli, interaktif karakter manifestosu. Bir belge değil; kibrit çakarak girilen, fenerle gezilen, kulakla dinlenen bir **monolog deneyimi**.

---

## 🕯 Deneyim

| Katman | Açıklama |
|---|---|
| **Açılış Ritüeli** | Karanlık bir odada bir kibrit alevi. Dokun, ateşle, gir. (Ses de bu jestle açılır.) |
| **10 Kapı** | Şeytanın Boyun Eğmesi → Yatağın Ayakları → … → Omuz ve Omurga |
| **Kodeksler** | Yedi Özellik (✦) ve Dört Yasa (⚖) |
| **Fener Modu** | Sayfayı karartır; imlecin hareketiyle ışığı taşır — okuma ışığı |
| **Kor & Kül** | Canvas üzerinde süzülen kor parçacıkları; geçilen cümleler arkadan kül savurur |
| **Prosedürel Ses** | Rüzgâr, 55 Hz drone, çıtırtı, uzak çan, parşömen hışırtısı, kilit mekanizması — **tamamı Web Audio ile kodla üretilir**, tek bir ses dosyası yok |
| **Derinlik Cetveli** | Sağ kenarda gerçek DOM ölçümüyle çalışan okuma cetveli; bölümlere ışınlanma |

### Etkileşimli Sahneler
- 🔥 **Yerçekimi Sahnesi** — harfler yerçekimiyle yerine düşer; tıklayınca yeniden tetiklenir
- 🪑 **Boş İskemle** — dokun, sandalyeyi çek, makamı hazırla
- 🔒 **Kilit Sahnesi** — view girince kilit kendiliginden değişir
- 🛞 **Dört Lastik** — 4 lastik, 3'er bijon, sıfır yolda kalma

## ⌨ Kontroller

| Tuş / Eylem | İşlev |
|---|---|
| `L` | Fener modu aç/kapa |
| `M` | Atmosferik ses aç/kapa |
| Fare imleci | Kor noktası + fener ışığı + duman izi |
| Boşta bekleme | ~5 sn sonra karanlıktan bir "fısıltı" yükselir |
| `Esc` | Bölüm dizinini kapatır |

## 🏗 Teknoloji

- **React 19 + Vite 6 + TypeScript** — katı tip kontrolü (`npm run lint`)
- **Tailwind CSS 4** — tasarım sistemi: `--void`, `--bone`, `--ember-bright`
- **Web Audio API** — `src/audio/soundEngine.ts`, prosedürel ses sentezi
- **Canvas 2D** — kor/kül parçacık motorları (DPR ölçekli, talebe bağlı render döngüsü)
- **IntersectionObserver** — aydınlanma (scroll-reveal) koreografisi ve sahne tetikleyicileri

### Mimari

```
src/
├── App.tsx                      # Sahne akışı ve global etkileşim yönetimi
├── index.css                    # Atmosfer katmanı: vinyet, fener, paralaks, reveal
├── audio/soundEngine.ts         # Prosedürel Web Audio motoru (tekil)
├── data/manifesto.ts            # Bölüm indeksi, yedi özellik, dört yasa, fısıltılar
├── types.ts                     # Paylaşılan arayüzler
└── components/
    ├── OpeningRitual.tsx        # Kibrit ateşleme açılışı (ses kilidini açar)
    ├── ChapterNav.tsx           # Üst bar: ses, fener, dizin modalı (aramalı)
    ├── DerinlikCetveli.tsx      # DOM ölçümlü ilerleme cetveli
    ├── ManifestoVurgusu.tsx     # "Dokunarak aydınlat" vurgu kartları
    ├── SecretWhispers.tsx       # Boşta kalınca beliren fısıltılar
    ├── FloatingEmbersCanvas.tsx # Süzülen kor parçacıkları
    ├── AshDissolveCanvas.tsx    # Kül dağılma patlamaları (trigger-ash eventi)
    └── InteractiveScenes/       # Kilit, iskemle, lastikler, yerçekimi
```

### Erişilebilirlik & Performans Notları
- `prefers-reduced-motion` desteklenir: gren, paralaks, parçacık animasyonları ve otomatik kül patlamaları kapanır
- Canvas'lar 2x DPR ile çizilir; kül motoru boşta çalışmaz
- Sahneler klavyeden erişilebilir (`role="button"`, `Enter`/`Space`)
- Dizin modalı `Esc` + arka plan tıklamasıyla kapanır, `aria-modal`

## 🚀 Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # dist/ üretimi
npm run lint     # tsc --noEmit
```

---

*Söz senettir; kod da öyle.* ✦
