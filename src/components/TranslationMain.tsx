import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Copy, Download, Volume2, Loader2, Check } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeech } from '../hooks/useSpeech';
import type { Language, TranslationHistoryItem } from '../types';

interface TranslationMainProps {
  languages: Language[];
  onTranslationComplete: (item: TranslationHistoryItem) => void;
}

export function TranslationMain({ languages, onTranslationComplete }: TranslationMainProps) {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es'); // Default to Spanish
  const [detectedLang, setDetectedLang] = useState<string | null>(null);

  // Feedback states
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [speakingPanel, setSpeakingPanel] = useState<'source' | 'target' | null>(null);

  const { translate, isLoading, error } = useTranslation();
  const { speak, isPlaying } = useSpeech();

  useEffect(() => {
    if (!isPlaying) {
      setSpeakingPanel(null);
    }
  }, [isPlaying]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      return;
    }

    const result = await translate(sourceText, targetLang, sourceLang);
    if (result && result.length > 0) {
      const translation = result[0].translations[0].text;
      setTranslatedText(translation);
      
      let finalSourceLang = sourceLang;
      if (result[0].detectedLanguage) {
        setDetectedLang(result[0].detectedLanguage.language);
        finalSourceLang = result[0].detectedLanguage.language;
      } else {
        setDetectedLang(null);
      }

      onTranslationComplete({
        id: crypto.randomUUID(),
        sourceText,
        translatedText: translation,
        sourceLang: finalSourceLang,
        targetLang,
        timestamp: Date.now(),
      });
    }
  }, [sourceText, targetLang, sourceLang, translate, onTranslationComplete]);

  // Removed the debounced useEffect for automatic translation

  const swapLanguages = () => {
    if (sourceLang === 'auto') {
      if (detectedLang) {
        setSourceLang(targetLang);
        setTargetLang(detectedLang);
      }
      return; // Cannot swap 'auto' if no detected language
    }
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = (text: string, isSource: boolean) => {
    navigator.clipboard.writeText(text).then(() => {
      if (isSource) {
        setCopiedSource(true);
        setTimeout(() => setCopiedSource(false), 2000);
      } else {
        setCopiedTarget(true);
        setTimeout(() => setCopiedTarget(false), 2000);
      }
    });
  };

  const handleSpeak = (text: string, lang: string, panel: 'source' | 'target') => {
    setSpeakingPanel(panel);
    speak(text, lang);
  };

  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full min-h-0">
      {/* Top Bar: Language Selectors and Swap */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-card border rounded-2xl shadow-sm">
        <div className="flex-1 w-full flex items-center gap-2">
          <div className="flex-1">
            <LanguageSelector
              label="Source Language"
              languages={languages}
              value={sourceLang}
              onChange={setSourceLang}
              allowAuto
              detectedLangName={detectedLang ? languages.find(l => l.code === detectedLang)?.name || detectedLang : undefined}
            />
          </div>
        </div>
        
        <button
          onClick={swapLanguages}
          className="p-2 md:p-3 bg-background border rounded-full shadow-sm hover:shadow hover:bg-muted transition-all focus:outline-none focus:ring-2 focus:ring-primary shrink-0"
          title="Swap languages"
          disabled={sourceLang === 'auto' && !detectedLang}
        >
          <ArrowRightLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>

        <div className="flex-1 w-full">
          <LanguageSelector
            label="Target Language"
            languages={languages}
            value={targetLang}
            onChange={setTargetLang}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Source Panel */}
        <div className="flex-1 flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md min-h-0">
          <div className="relative flex-1 p-4 min-h-0">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type text to translate..."
              className="w-full h-full min-h-[150px] resize-none bg-transparent focus:outline-none text-lg"
              dir={languages.find(l => l.code === sourceLang)?.dir || 'auto'}
            />
          </div>
          <div className="p-3 flex justify-between items-center text-sm text-muted-foreground border-t bg-muted/10">
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(sourceText, true)}
                disabled={!sourceText}
                className={`px-3 py-1.5 flex items-center gap-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 ${copiedSource ? 'text-green-600 dark:text-green-500 font-medium' : ''}`}
                title="Copy source text"
              >
                {copiedSource ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedSource ? 'Copied ✓' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleSpeak(sourceText, sourceLang === 'auto' ? (detectedLang || 'en') : sourceLang, 'source')}
                disabled={!sourceText}
                className={`px-3 py-1.5 flex items-center gap-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 ${speakingPanel === 'source' ? 'text-primary font-medium' : ''}`}
                title="Listen"
              >
                <Volume2 className={`w-4 h-4 ${speakingPanel === 'source' ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{speakingPanel === 'source' ? 'Speaking...' : 'Speak'}</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 hidden sm:inline">{sourceText.length} / 5000</span>
              <button
                onClick={handleTranslate}
                disabled={!sourceText || isLoading}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                <span>[ Translate ]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Target Panel */}
        <div className="flex-1 flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md min-h-0">
          <div className="relative flex-1 p-4 bg-muted/5 min-h-0">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-muted-foreground font-medium">Translating...</span>
              </div>
            ) : error ? (
              <div className="text-destructive text-sm p-4">{error}</div>
            ) : (
              <textarea
                readOnly
                value={translatedText}
                placeholder="Translation will appear here"
                className="w-full h-full min-h-[150px] resize-none bg-transparent focus:outline-none text-lg"
                dir={languages.find(l => l.code === targetLang)?.dir || 'auto'}
              />
            )}
          </div>
          <div className="p-3 flex justify-between items-center text-sm text-muted-foreground border-t bg-muted/10">
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(translatedText, false)}
                disabled={!translatedText}
                className={`px-3 py-1.5 flex items-center gap-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 ${copiedTarget ? 'text-green-600 dark:text-green-500 font-medium' : ''}`}
                title="Copy translation"
              >
                {copiedTarget ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedTarget ? 'Copied ✓' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleSpeak(translatedText, targetLang, 'target')}
                disabled={!translatedText}
                className={`px-3 py-1.5 flex items-center gap-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 ${speakingPanel === 'target' ? 'text-primary font-medium' : ''}`}
                title="Listen"
              >
                <Volume2 className={`w-4 h-4 ${speakingPanel === 'target' ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{speakingPanel === 'target' ? 'Speaking...' : 'Speak'}</span>
              </button>
            </div>
            <button
              onClick={handleDownload}
              disabled={!translatedText}
              className={`px-3 py-1.5 flex items-center gap-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 ${downloaded ? 'text-green-600 dark:text-green-500 font-medium' : ''}`}
              title="Download as .txt"
            >
              {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">{downloaded ? 'Downloaded ✓' : 'Download'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
