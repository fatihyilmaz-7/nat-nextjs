export interface LanguageInfo {
  code: string;
  name: string;       // Native name
  englishName: string; // English name (for sorting & display)
  flag: string;        // Emoji flag
  dir?: 'rtl' | 'ltr';
}

// All supported languages — sorted alphabetically by English name
export const languages: LanguageInfo[] = [
  { code: 'ar', name: 'العربية', englishName: 'Arabic', flag: '🇸🇦', dir: 'rtl' },
  { code: 'az', name: 'Azərbaycanca', englishName: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩' },
  { code: 'zh', name: '中文', englishName: 'Chinese', flag: '🇨🇳' },
  { code: 'nl', name: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱' },
  { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩' },
  { code: 'it', name: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', englishName: 'Korean', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
  { code: 'es', name: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
  { code: 'sw', name: 'Kiswahili', englishName: 'Swahili', flag: '🇰🇪' },
  { code: 'th', name: 'ไทย', englishName: 'Thai', flag: '🇹🇭' },
  { code: 'tr', name: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', name: 'Українська', englishName: 'Ukrainian', flag: '🇺🇦' },
  { code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese', flag: '🇻🇳' },
];

// ISO 3166-1 alpha-2 country code → language code
export const countryToLang: Record<string, string> = {
  // Turkish
  TR: 'tr',
  // Azerbaijani
  AZ: 'az',
  // English
  US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en', ZA: 'en',
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es',
  SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  // Italian
  IT: 'it',
  // Japanese
  JP: 'ja',
  // Korean
  KR: 'ko',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  // Dutch
  NL: 'nl', BE: 'nl', SR: 'nl',
  // Russian
  RU: 'ru', BY: 'ru', KG: 'ru', KZ: 'ru',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar', LB: 'ar',
  LY: 'ar', MA: 'ar', OM: 'ar', QA: 'ar', SY: 'ar', TN: 'ar', YE: 'ar',
  BH: 'ar', DZ: 'ar', SD: 'ar',
  // French
  FR: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TD: 'fr',
  CM: 'fr', MG: 'fr', CD: 'fr',
  // German
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // Hindi / Bengali
  IN: 'hi', BD: 'bn',
  // Indonesian
  ID: 'id',
  // Thai
  TH: 'th',
  // Vietnamese
  VN: 'vi',
  // Portuguese
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',
  // Swahili
  KE: 'sw', TZ: 'sw', UG: 'sw',
  // Ukrainian
  UA: 'uk',
};

// Banner UI strings per language
export const bannerMessages: Record<string, {
  viewing: string;
  change: string;
  chooseTitle: string;
  suggestSwitch: string;
}> = {
  tr: { viewing: 'Siteyi görüntülüyorsunuz:', change: 'Değiştir', chooseTitle: 'Dilinizi Seçin', suggestSwitch: 'Geçiş yap →' },
  en: { viewing: 'Viewing the site in:', change: 'Change', chooseTitle: 'Choose Your Language', suggestSwitch: 'Switch →' },
  es: { viewing: 'Viendo el sitio en:', change: 'Cambiar', chooseTitle: 'Elige tu idioma', suggestSwitch: 'Cambiar →' },
  it: { viewing: 'Visualizzazione del sito in:', change: 'Cambia', chooseTitle: 'Scegli la tua lingua', suggestSwitch: 'Passa a →' },
  ja: { viewing: 'サイト表示言語:', change: '変更', chooseTitle: '言語を選択', suggestSwitch: '切替 →' },
  ko: { viewing: '사이트 표시 언어:', change: '변경', chooseTitle: '언어 선택', suggestSwitch: '전환 →' },
  zh: { viewing: '网站显示语言:', change: '更改', chooseTitle: '选择您的语言', suggestSwitch: '切换 →' },
  nl: { viewing: 'Site weergeven in:', change: 'Wijzigen', chooseTitle: 'Kies uw taal', suggestSwitch: 'Wissel →' },
  ru: { viewing: 'Просмотр сайта на:', change: 'Изменить', chooseTitle: 'Выберите язык', suggestSwitch: 'Переключить →' },
  ar: { viewing: 'عرض الموقع بـ:', change: 'تغيير', chooseTitle: 'اختر لغتك', suggestSwitch: '← التبديل' },
  az: { viewing: 'Saytı görüntüləyirsiniz:', change: 'Dəyişdir', chooseTitle: 'Dilinizi Seçin', suggestSwitch: 'Keçid →' },
  fr: { viewing: 'Affichage du site en:', change: 'Changer', chooseTitle: 'Choisissez votre langue', suggestSwitch: 'Changer →' },
  de: { viewing: 'Seite anzeigen in:', change: 'Ändern', chooseTitle: 'Wählen Sie Ihre Sprache', suggestSwitch: 'Wechseln →' },
  hi: { viewing: 'साइट भाषा:', change: 'बदलें', chooseTitle: 'अपनी भाषा चुनें', suggestSwitch: 'स्विच →' },
  pt: { viewing: 'Visualizando o site em:', change: 'Alterar', chooseTitle: 'Escolha seu idioma', suggestSwitch: 'Mudar →' },
  bn: { viewing: 'সাইটটি দেখা হচ্ছে:', change: 'পরিবর্তন', chooseTitle: 'আপনার ভাষা নির্বাচন করুন', suggestSwitch: 'পরিবর্তন →' },
  id: { viewing: 'Melihat situs dalam:', change: 'Ubah', chooseTitle: 'Pilih Bahasa Anda', suggestSwitch: 'Beralih →' },
  th: { viewing: 'ดูเว็บไซต์เป็น:', change: 'เปลี่ยน', chooseTitle: 'เลือกภาษาของคุณ', suggestSwitch: 'เปลี่ยน →' },
  uk: { viewing: 'Перегляд сайту:', change: 'Змінити', chooseTitle: 'Оберіть мову', suggestSwitch: 'Змінити →' },
  sw: { viewing: 'Kuangalia tovuti kwa:', change: 'Badilisha', chooseTitle: 'Chagua Lugha Yako', suggestSwitch: 'Badilisha →' },
  vi: { viewing: 'Xem trang web bằng:', change: 'Thay đổi', chooseTitle: 'Chọn ngôn ngữ', suggestSwitch: 'Chuyển →' },
};
