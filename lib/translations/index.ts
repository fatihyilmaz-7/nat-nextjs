export type { TranslationSet } from './types';
export type Lang = 'ar' | 'az' | 'bn' | 'zh' | 'nl' | 'en' | 'fr' | 'de' | 'hi' | 'id' | 'it' | 'ja' | 'ko' | 'pt' | 'ru' | 'es' | 'sw' | 'th' | 'tr' | 'uk' | 'vi';

import type { TranslationSet } from './types';
import { tr } from './tr';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { it } from './it';
import { nl } from './nl';
import { pt } from './pt';
import { ru } from './ru';
import { uk } from './uk';
import { ar } from './ar';
import { az } from './az';
import { ja } from './ja';
import { ko } from './ko';
import { zh } from './zh';
import { hi } from './hi';
import { bn } from './bn';
import { th } from './th';
import { vi } from './vi';
import { id } from './id';
import { sw } from './sw';

const translations: Record<string, TranslationSet> = {
  tr, en, es, fr, de, it, nl, pt, ru, uk, ar, az, ja, ko, zh, hi, bn, th, vi, id, sw,
};

/** Returns full translation set for the given language, falling back to English */
export function getTranslation(lang: Lang): TranslationSet {
  return translations[lang] || translations.en;
}
