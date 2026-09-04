import { ChapterItem, TraitItem, LawItem } from '../types';

export const CHAPTERS_INDEX: ChapterItem[] = [
  { id: 'hero', numeral: '✦', title: 'Salim Gümüş', subtitle: 'bir yerçekimi', category: 'chapter' },
  { id: 'kapi-1', numeral: 'I', title: 'Şeytanın Boyun Eğmesi', category: 'chapter' },
  { id: 'kapi-2', numeral: 'II', title: 'Yatağın Ayakları', category: 'chapter' },
  { id: 'kapi-3', numeral: 'III', title: 'Mezardan Yükseliş', category: 'chapter' },
  { id: 'kapi-4', numeral: 'IV', title: 'Asla Yolda Bırakmam', category: 'chapter' },
  { id: 'kapi-5', numeral: 'V', title: 'Masada Bir Boş İskemle', category: 'chapter' },
  { id: 'kapi-6', numeral: 'VI', title: 'Sandalyeden Makama', category: 'chapter' },
  { id: 'kapi-7', numeral: 'VII', title: 'Yerçekimi', category: 'chapter' },
  { id: 'yedi-ozellik', numeral: '✦', title: 'Yedi Özellik', category: 'codex' },
  { id: 'dort-yasa', numeral: '⚖', title: 'Dört Yasa', category: 'codex' },
  { id: 'kapi-8', numeral: 'VIII', title: 'Kilit Değişti', category: 'chapter' },
  { id: 'kapi-9', numeral: 'IX', title: 'Omurga Ayarı', category: 'chapter' },
  { id: 'kapi-10', numeral: 'X', title: 'Omuz ve Omurga', category: 'chapter' },
  { id: 'son-sahne', numeral: 'Ω', title: 'Hizalanma', category: 'closing' },
];

export const SECRET_WHISPERS: string[] = [
  "sessizlik bir cevaptır.",
  "kor söndüğünde bile ısı kalır.",
  "gölge, ışığın kanıtıdır.",
  "kilit değiştiğinde anahtar ölür.",
  "güç, görünmeyende saklıdır.",
  "omurga eğilmez, kırılır.",
  "sözleşme feshedildi.",
  "sistem geri almaz.",
  "merkez görünmez.",
  "o bir kahraman değil, bir yerçekimi.",
  "hesabı yüzüne söyler, yükü yüzüne verir.",
  "kapı kapanmaz, kilit değişir.",
  "merhameti vardır, pazarlığı yoktur."
];

export const YEDI_OZELLIK: TraitItem[] = [
  {
    no: "I",
    title: "Nettir",
    description: [
      "Ne düşündüğünü bilirsin.",
      "Arkadan iş çevirmez.",
      "Hesabı yüzüne söyler, yükü yüzüne verir."
    ]
  },
  {
    no: "II",
    title: "Diktir",
    description: [
      "Söz verir, tutar.",
      "Tutmayacaksa vermez.",
      "Verdiği sözün arkasında durur, çünkü söz senettir."
    ]
  },
  {
    no: "III",
    title: "Seçicidir",
    description: [
      "Herkese güvenmez.",
      "Herkese yakın durmaz.",
      "Ama seçtiği adamı taşır, yarı yolda bırakmaz."
    ]
  },
  {
    no: "IV",
    title: "Vicdanlıdır ama şefkati satılık değildir",
    description: [
      "Merhameti vardır, pazarlığı yoktur.",
      "Acır ama acıdığı için standardını düşürmez."
    ]
  },
  {
    no: "V",
    title: "Kırıldığında susar",
    description: [
      "Bağırmaz, dağıtmaz.",
      "Affettiğinde bile unutmaz.",
      "Çünkü onun için hafıza bir intikam değil, bir arşivdir."
    ]
  },
  {
    no: "VI",
    title: "Tepki vermez, karar alır",
    description: [
      "Küslüğü uzatmaz, uzatacak kadar boş vakti yoktur.",
      "Ama itimat bitti mi, defteri kapatır.",
      "Kapı kapanmaz, kilit değişir."
    ]
  },
  {
    no: "VII",
    title: "Kibirli değildir, egosuz da değildir",
    description: [
      "Saygı ister.",
      "Hak edene verir.",
      "Hak etmeyenden beklemez."
    ]
  }
];

export const DORT_YASA: LawItem[] = [
  {
    no: "I",
    title: "Kırılganlık Yasası",
    description: [
      "Kırılganlığı zaaf olarak taşımaz.",
      "Bedel olarak taşır.",
      "Bu yüzden her kararının bir faturası olduğunu bilir.",
      "Ucuz karar vermez."
    ]
  },
  {
    no: "II",
    title: "Sessizlik Yasası",
    description: [
      "Sessizliği ceza değil, ayardır.",
      "Konuşmadığında küsmez, hizalanır.",
      "Omurgasını düzeltir."
    ]
  },
  {
    no: "III",
    title: "Kilit Yasası",
    description: [
      "Vazgeçtiğinde kapıyı kapatmaz,",
      "kilidi değiştirir.",
      "Dönüş yoktur.",
      "Çünkü güven bir sözleşmedir ve sözleşme feshedilmiştir."
    ]
  },
  {
    no: "IV",
    title: "Çalışma Yasası",
    description: [
      "\"Nasıl yapılır?\" diye sormaz,",
      "\"Nasıl çalışır?\" diye sorar.",
      "Bu yüzden tamir etmez, yeniden kurar."
    ]
  }
];
