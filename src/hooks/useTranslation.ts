import { useState, useCallback } from 'react';
import { translateText } from '../services/translatorApi';
import type { TranslationResponse } from '../types';

interface UseTranslationResult {
  translate: (text: string, to: string, from?: string) => Promise<TranslationResponse[] | null>;
  isLoading: boolean;
  error: string | null;
}

export function useTranslation(): UseTranslationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(async (text: string, to: string, from?: string) => {
    if (!text.trim()) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await translateText(text, to, from);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during translation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { translate, isLoading, error };
}
