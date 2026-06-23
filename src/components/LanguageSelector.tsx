import React from 'react';
import type { Language } from '../types';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  label: string;
  languages: Language[];
  value: string;
  onChange: (value: string) => void;
  allowAuto?: boolean;
  detectedLangName?: string;
}

export function LanguageSelector({ label, languages, value, onChange, allowAuto = false, detectedLangName }: LanguageSelectorProps) {
  return (
    <div className="relative group">
      <label className="sr-only">{label}</label>
      <div className="relative flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full bg-transparent hover:bg-muted font-medium text-foreground py-2 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {allowAuto && <option value="auto">{detectedLangName ? `Detected: ${detectedLangName}` : 'Detect Language'}</option>}
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground group-hover:text-foreground">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
