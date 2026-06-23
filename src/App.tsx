import React, { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { TranslationMain } from './components/TranslationMain';
import { TranslationHistory } from './components/TranslationHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getLanguages } from './services/translatorApi';
import type { Language, TranslationHistoryItem } from './types';

function App() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [history, setHistory] = useLocalStorage<TranslationHistoryItem[]>('translation-history', []);
  const [isLanguagesLoading, setIsLanguagesLoading] = useState(true);

  useEffect(() => {
    const fetchLangs = async () => {
      const langs = await getLanguages();
      setLanguages(langs);
      setIsLanguagesLoading(false);
    };
    fetchLangs();
  }, []);

  const handleTranslationComplete = (newItem: TranslationHistoryItem) => {
    setHistory((prev) => {
      const updated = [newItem, ...prev];
      // Keep only last 20 items
      return updated.slice(0, 20);
    });
  };

  const handleClearHistory = () => {
    setHistory(prev => prev.filter(item => item.isFavorite));
  };

  const handleToggleFavorite = (id: string) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleSelectHistoryItem = (item: TranslationHistoryItem) => {
    // We could populate the source text here, but TranslationMain manages its own state
    // To implement this fully, we would need to lift state up or pass a prop to trigger population
    // For simplicity, we just have the history as a reference right now
  };

  if (isLanguagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Languages className="w-12 h-12 text-primary" />
          <p className="text-lg font-medium">Loading languages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background text-foreground flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b bg-secondary/80 backdrop-blur supports-[backdrop-filter]:bg-secondary/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Languages className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              LinguaGen
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 lg:py-6 flex flex-col h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0">
          <div className="lg:col-span-8 xl:col-span-9 h-full flex flex-col min-h-0">
            <TranslationMain 
              languages={languages} 
              onTranslationComplete={handleTranslationComplete} 
            />
          </div>
          <div className="lg:col-span-4 xl:col-span-3 h-[400px] lg:h-full min-h-0">
            <TranslationHistory
              history={history}
              languages={languages}
              onSelect={handleSelectHistoryItem}
              onClear={handleClearHistory}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
