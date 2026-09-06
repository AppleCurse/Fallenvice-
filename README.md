# ⚔ Salim Gümüş — Manifesto

> **"O bir kahraman değil, bir yerçekimi."**

Kurgusal karakter **Salim Gümüş**'ün karanlık atmosferli, interaktif karakter manifestosu. Bir belge değil; kibrit çakarak girilen, fenerle gezilen, kulakla dinlenen bir **monolog deneyimi**.

Sunucusuz, hesapsız, izlemesiz. Tek bir ağ isteği yapmaz — fontlar dışında.

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
| **Alıntı Mührü** | Masaüstünde cümleyi seç, telefonda pasaja basılı tut → paylaşılabilir PNG kart. Tamamen tarayıcıda çizilir |
| **Komut Paleti** | `⌘K` / `Ctrl+K` ile bölüm dizini; ok tuşlarıyla gez, `Enter` ile atla |
| **Derin Bağlantı** | Okudukça adres çubuğu güncellenir; `#kapi-8` gibi bağlantılar doğrudan o kapıyı açar |
| **Kapanış Mührü** | Son sahnede manifestoyu mühürle ya da odayı baştan ateşle |

### Etkileşimli Sahneler
- 🔥 **Yerçekimi Sahnesi** — harfler yerçekimiyle yerine düşer; tıklayınca yeniden tetiklenir
- 🪑 **Boş İskemle** — dokun, sandalyeyi çek, makamı hazırla
- 🔒 **Kilit Sahnesi** — view girince kilit kendiliğinden değişir
- 🛞 **Dört Lastik** — 4 lastik, 3'er bijon, sıfır yolda kalma

## ⌨ Kontroller

| Tuş / Eylem | İşlev |
|---|---|
| `L` | Fener modu aç/kapa |
| `M` | Atmosferik ses aç/kapa |
| `⌘K` / `Ctrl+K` | Bölüm dizinini aç (ok tuşları + `Enter`) |
| `Esc` | Dizini / mühür kartını kapatır |
| **Metni seç** (masaüstü) | Üstte beliren araç çubuğundan **Mühürle** ya da kopyala |
| **Basılı tut** (dokunmatik) | Pasaja ~0.5 sn bas → mühür kartı açılır (titreşimli geri bildirim) |
| Fare imleci | Kor noktası + fener ışığı |
| Boşta bekleme | ~5 sn sonra karanlıktan bir "fısıltı" yükselir |

## 🏗 Teknoloji

- **React 19 + Vite 6 + TypeScript** — `strict: true`, `npm run lint` ile sıfır hata
- **Tailwind CSS 4** — tasarım sistemi: `--void`, `--bone`, `--ember-bright`
- **Web Audio API** — `src/audio/soundEngine.ts`, prosedürel ses sentezi
- **Canvas 2D** — kor/kül parçacık motorları ve alıntı kartı üreteci (DPR en fazla 2x)
- **IntersectionObserver** — aydınlanma koreografisi, sahne tetikleyicileri, aktif bölüm takibi

### Mimari

```
src/
├── App.tsx                      # Sahne akışı ve global etkileşim yönetimi
├── index.css                    # Atmosfer katmanı: vinyet, fener, paralaks, reveal
├── audio/soundEngine.ts         # Prosedürel Web Audio motoru (tekil)
├── data/manifesto.ts            # Bölüm indeksi, yedi özellik, dört yasa, fısıltılar
├── types.ts                     # Paylaşılan arayüzler
├── lib/
│   ├── pointer.ts               # Render tetiklemeyen paylaşımlı imleç takibi
│   └── quoteCard.ts             # Canvas ile paylaşılabilir PNG alıntı kartı
├── hooks/
│   ├── useInView.ts             # Tekrar kullanılabilir IntersectionObserver
│   └── useLongPressSeal.ts      # Dokunmatikte uzun basış ile mühürleme
└── components/
    ├── OpeningRitual.tsx        # Kibrit ateşleme açılışı (ses kilidini açar)
    ├── ChapterNav.tsx           # Üst bar: ses, fener, ilerleme, aktif bölüm
    ├── CommandPalette.tsx       # ⌘K dizini — klavye öncelikli, odak hapsi
    ├── SelectionActions.tsx     # Metin seçince beliren mühürleme araç çubuğu
    ├── QuoteCardModal.tsx       # Kart önizleme + indir / paylaş (lazy yüklenir)
    ├── KapanisMuhru.tsx         # Final: mühürle ya da baştan ateşle
    ├── DerinlikCetveli.tsx      # DOM ölçümlü ilerleme cetveli
    ├── ManifestoVurgusu.tsx     # "Dokunarak aydınlat" vurgu kartları
    ├── SecretWhispers.tsx       # Boşta kalınca beliren fısıltılar
    ├── FloatingEmbersCanvas.tsx # Süzülen kor parçacıkları
    ├── AshDissolveCanvas.tsx    # Kül dağılma patlamaları (trigger-ash eventi)
    └── InteractiveScenes/       # Kilit, iskemle, lastikler, yerçekimi
```

### Performans Notları
- **İmleç React state'i dışında takip edilir.** Koordinat doğrudan `--mx` / `--my` CSS
  değişkenlerine yazılır; fare hareketi hiçbir bileşeni yeniden render etmez.
- Vurgu kartları yakınlık hesabı için `IntersectionObserver` kullanır — her fare
  hareketinde `getBoundingClientRect()` çağrılmaz (zorunlu layout yok).
- Canvas'lar en fazla 2x DPR ile çizilir; kül motoru parçacık yokken durur.
- Alıntı kartı motoru ayrı bir chunk'tır (`React.lazy`) — ilk yüke girmez,
  yalnızca kullanıcı gerçekten mühürlediğinde indirilir.

### Erişilebilirlik
- `prefers-reduced-motion`: gren, paralaks, parçacık animasyonları ve otomatik kül
  patlamaları kapanır; yumuşak kaydırma devre dışı kalır
- Dizin `Esc` + arka plan tıklamasıyla kapanır, `aria-modal`, odak hapsi ve
  kapanışta odağı tetikleyen düğmeye geri verir
- Sahneler klavyeden erişilebilir (`role="button"` + `Enter`/`Space`, ya da native `<button>`)
- Tüm etkileşimli öğelerde görünür `:focus-visible` halkası

### Gizlilik
Analytics yok, çerez yok, `localStorage` yok, sunucu yok. Alıntı kartı bile
tarayıcıda üretilir — hiçbir metin cihazdan çıkmaz.

## 🚀 Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # dist/ üretimi
npm run lint     # tsc --noEmit (strict)
```

---

*Söz senettir; kod da öyle.* ✦
