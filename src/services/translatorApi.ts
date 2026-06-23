import type { TranslationResponse, Language } from '../types';

export const getLanguages = async (): Promise<Language[]> => {
  // Using a predefined list of languages since we are using a free public API
  return [
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
    { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  ].sort((a, b) => a.name.localeCompare(b.name));
};

export const translateText = async (
  text: string,
  to: string,
  from?: string
): Promise<TranslationResponse[]> => {
  
  // Use MyMemory API which is completely free and requires NO API KEY!
  const sourceLang = from === 'auto' || !from ? 'autodetect' : from;
  const langpair = `${sourceLang}|${to}`;
  
  const url = new URL(`https://api.mymemory.translated.net/get`);
  url.searchParams.append('q', text);
  url.searchParams.append('langpair', langpair);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Translation network request failed. Please check your connection.');
  }

  const data = await response.json();
  
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'Translation API returned an error.');
  }

  return [
    {
      translations: [
        {
          text: data.responseData.translatedText,
          to: to,
        },
      ],
      detectedLanguage: from === 'auto' || !from ? {
        // MyMemory doesn't specifically identify auto-detected lang easily, so we fallback
        language: 'auto-detected', 
        score: 1.0
      } : undefined
    },
  ];
};
