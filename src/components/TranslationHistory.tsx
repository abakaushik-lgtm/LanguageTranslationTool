import React from 'react';
import type { TranslationHistoryItem, Language } from '../types';
import { Clock, Star, Trash2 } from 'lucide-react';

interface TranslationHistoryProps {
  history: TranslationHistoryItem[];
  languages: Language[];
  onSelect: (item: TranslationHistoryItem) => void;
  onClear: () => void;
  onToggleFavorite: (id: string) => void;
}

export function TranslationHistory({ history, languages, onSelect, onClear, onToggleFavorite }: TranslationHistoryProps) {
  const getLangName = (code: string) => {
    return languages.find(l => l.code === code)?.name || code;
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p>No translations yet.</p>
        <p className="text-sm mt-1">Your recent translations will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          History
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col p-3 mb-3 border-b border-border last:border-0 last:mb-0 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <span>{getLangName(item.sourceLang)}</span>
                    <span>→</span>
                    <span>{getLangName(item.targetLang)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/70">
                    {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.timestamp))}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className={`p-1 -m-1 rounded-full hover:bg-background transition-colors ${
                    item.isFavorite ? 'text-yellow-500' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              <p className="text-sm font-medium line-clamp-1 mb-0.5">{item.sourceText}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.translatedText}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
