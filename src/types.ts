export interface ChapterItem {
  id: string;
  numeral: string;
  title: string;
  subtitle?: string;
  category?: 'chapter' | 'codex' | 'closing';
}

export interface TraitItem {
  no: string;
  title: string;
  description: string[];
}

export interface LawItem {
  no: string;
  title: string;
  description: string[];
}
