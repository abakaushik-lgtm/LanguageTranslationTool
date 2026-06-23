export interface Language {
  code: string;
  name: string;
  nativeName?: string;
  dir: 'ltr' | 'rtl';
}

export interface TranslationResult {
  text: string;
  to: string;
}

export interface TranslationResponse {
  translations: TranslationResult[];
  detectedLanguage?: {
    language: string;
    score: number;
  };
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  isFavorite?: boolean;
}

export interface TranslatorApiError {
  code: number;
  message: string;
}
