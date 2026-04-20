'use client';

import { useState, useEffect, useCallback } from 'react';
import { languages, countryToLang, bannerMessages } from '../lib/languages';
import type { Lang } from '../lib/translations';

interface LanguageBannerProps {
  currentLang: Lang;
  onChangeLang: (lang: Lang) => void;
}

export default function LanguageBanner({ currentLang, onChangeLang }: LanguageBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  // Auto-detect language from geo/browser on EVERY page load
  useEffect(() => {
    fetch('/api/geo')
      .then((r) => r.json())
      .then((data: { country: string | null }) => {
        if (data.country) {
          const detected = countryToLang[data.country] || 'en';
          if (detected !== currentLang) {
            setDetectedLang(detected);
            setShowSuggestion(true);
          }
        }
      })
      .catch(() => {
        const browserLang = navigator.language.split('-')[0];
        const supported = languages.find((l) => l.code === browserLang);
        if (supported && supported.code !== currentLang) {
          setDetectedLang(supported.code);
          setShowSuggestion(true);
        }
      });
  }, [currentLang]);

  // Add/remove body class for layout offset based on banner visibility
  useEffect(() => {
    if (bannerVisible) {
      document.body.classList.add('has-lang-banner');
    } else {
      document.body.classList.remove('has-lang-banner');
    }
    return () => { document.body.classList.remove('has-lang-banner'); };
  }, [bannerVisible]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  // Update <html lang>
  useEffect(() => {
    document.documentElement.lang = currentLang;
    const langInfo = languages.find((l) => l.code === currentLang);
    if (langInfo?.dir === 'rtl') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [currentLang]);

  const currentLangInfo = languages.find((l) => l.code === currentLang);
  const detectedLangInfo = detectedLang ? languages.find((l) => l.code === detectedLang) : null;
  const msg = bannerMessages[currentLang] || bannerMessages.en;

  const handleSelectLang = useCallback(
    (code: string) => {
      onChangeLang(code as Lang);
      localStorage.setItem('nat-lang', code);
      setIsModalOpen(false);
      setShowSuggestion(false);
    },
    [onChangeLang],
  );

  const handleAcceptSuggestion = useCallback(() => {
    if (detectedLang) {
      handleSelectLang(detectedLang);
    }
  }, [detectedLang, handleSelectLang]);

  const handleDismissSuggestion = useCallback(() => {
    setShowSuggestion(false);
  }, []);

  const handleCloseBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  // Don't render the banner if it's been closed
  if (!bannerVisible) return null;

  return (
    <>
      {/* ──── Top Banner ──── */}
      <div className="lang-banner" id="langBanner">
        <div className="lang-banner-inner">
          {/* Suggestion strip (auto-detected different language) */}
          {showSuggestion && detectedLangInfo && (
            <div className="lang-suggestion">
              <span className="lang-suggestion-text">
                {detectedLangInfo.flag} {msg.suggestSwitch} {detectedLangInfo.name}
              </span>
              <button
                className="lang-suggestion-accept"
                onClick={(e) => { e.stopPropagation(); handleAcceptSuggestion(); }}
              >
                {detectedLangInfo.name}
              </button>
              <button
                className="lang-suggestion-dismiss"
                onClick={(e) => { e.stopPropagation(); handleDismissSuggestion(); }}
                aria-label="Dismiss suggestion"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* Current language display */}
          {!showSuggestion && (
            <div className="lang-banner-content" onClick={() => setIsModalOpen(true)}>
              <i className="fa-solid fa-globe lang-banner-globe"></i>
              <span className="lang-banner-flag">{currentLangInfo?.flag}</span>
              <span className="lang-banner-label">{currentLangInfo?.name}</span>
              <button
                className="lang-banner-change"
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
              >
                {msg.change} <i className="fa-solid fa-chevron-down"></i>
              </button>
            </div>
          )}

          {/* ✕ Close banner button — always visible on right */}
          <button
            className="lang-banner-close"
            onClick={(e) => { e.stopPropagation(); handleCloseBanner(); }}
            aria-label="Close language banner"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      {/* ──── Language Picker Modal ──── */}
      {isModalOpen && (
        <div className="lang-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="lang-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={msg.chooseTitle}
          >
            {/* Header */}
            <div className="lang-modal-header">
              <div className="lang-modal-title-wrap">
                <i className="fa-solid fa-globe"></i>
                <h3>{msg.chooseTitle}</h3>
              </div>
              <button
                className="lang-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Language Grid */}
            <div className="lang-modal-grid">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-option${lang.code === currentLang ? ' active' : ''}`}
                  onClick={() => handleSelectLang(lang.code)}
                >
                  <span className="lang-option-flag">{lang.flag}</span>
                  <div className="lang-option-names">
                    <span className="lang-option-native">{lang.name}</span>
                    <span className="lang-option-english">{lang.englishName}</span>
                  </div>
                  {lang.code === currentLang && (
                    <i className="fa-solid fa-check lang-option-check"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
