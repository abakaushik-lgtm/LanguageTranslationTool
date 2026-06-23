import { useState, useCallback } from 'react';

export function useSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback((text: string, lang: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    // Best effort mapping of Azure lang codes to BCP 47
    utterance.lang = lang;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  return { speak, stop, isPlaying };
}
