
export enum PageType {
  RECOMMENDATION = 'RECOMMENDATION',
  DELETION_CREATION = 'DELETION_CREATION',
}

export type ThemeMode = 'royal' | 'sapphire' | 'emerald' | 'ruby' | 'midnight';

export interface FileEntry {
  id: string;
  name: string;
  file: File;
  status: 'جاهز' | 'جاري المعالجة' | 'تم' | 'خطأ';
}

export interface CommitteeMember {
  id: string;
  role: string;
  name: string;
  col: number;
  rowOffset: number;
}

export interface MergeConfig {
  title: string;
  keyword: string;
  startRow: number;
  allowedPrefixes: string[];
}
