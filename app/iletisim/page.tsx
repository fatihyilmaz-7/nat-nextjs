'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getTranslation, type Lang } from '../../lib/translations';
import LanguageBanner from '../../components/LanguageBanner';

export default function IletisimPage() {
  const orgFieldsRef = useRef<HTMLDivElement>(null);
  const orgToggleRef = useRef<HTMLLabelElement>(null);

  const [lang, setLang] = useState<Lang>('tr');

  useEffect(() => {
    const saved = localStorage.getItem('nat-lang') as Lang | null;
    if (saved) setLang(saved);
  }, []);

  const t = getTranslation(lang);
  const tc = t.contact;

  useEffect(() => {
    const loadAnimations = () => {
      const win = window as typeof window & { gsap?: unknown; ScrollTrigger?: unknown };
      if (!win.gsap) { setTimeout(loadAnimations, 100); return; }
      runContactAnimations();
    };

    const runContactAnimations = () => {
      const win = window as typeof window & {
        gsap: {
          registerPlugin: (...args: unknown[]) => void;
          to: (target: unknown, vars: unknown) => unknown;
          from: (target: unknown, vars: unknown) => unknown;
        };
        ScrollTrigger: { create: (vars: unknown) => void; refresh: () => void };
      };
      const { gsap, ScrollTrigger } = win;
      if (!gsap || !ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);

      // Preloader
      window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
          gsap.to(preloader, {
            opacity: 0, duration: 0.8, delay: 0.6, ease: 'power2.out',
            onComplete: () => { preloader.style.display = 'none'; },
          });
        }
        const highlightText = document.querySelector('.contact-info-title .highlight-text');
        if (highlightText) {
          setTimeout(() => highlightText.classList.add('active'), 1200);
        }
      });

      gsap.to('#heroSub', { opacity: 1, y: 0, duration: 0.8, delay: 0.9, ease: 'power3.out' });
      gsap.to('#heroTitle', { opacity: 1, y: 0, duration: 1, delay: 1.1, ease: 'power3.out' });

      const heroImg = document.getElementById('heroImg');
      if (heroImg) {
        gsap.to(heroImg, {
          yPercent: 18, ease: 'none',
          scrollTrigger: { trigger: '#contactHero', start: 'top top', end: 'bottom top', scrub: true },
        });
      }

      gsap.from('#contactInfo', {
        opacity: 0, x: -50, duration: 1, delay: 0.3, ease: 'power3.out',
        scrollTrigger: { trigger: '#contactInfo', start: 'top 80%' },
      });
      gsap.from('#formCard', {
        opacity: 0, x: 50, duration: 1, delay: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '#formCard', start: 'top 80%' },
      });
      gsap.from('#contactForm .form-field, #contactForm .org-toggle-wrapper, #contactForm .form-group, #contactForm .form-submit-wrapper', {
        opacity: 0, y: 20, duration: 0.6, stagger: 0.07, ease: 'power2.out',
        scrollTrigger: { trigger: '#contactForm', start: 'top 75%' },
      });

      // Particles
      const particlesContainer = document.getElementById('formParticles');
      if (particlesContainer) {
        for (let i = 0; i < 18; i++) {
          const p = document.createElement('div');
          p.className = 'form-particle';
          const size = Math.random() * 4 + 2;
          p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;bottom:${Math.random() * 40}%;animation-duration:${6 + Math.random() * 10}s;animation-delay:${Math.random() * 8}s;opacity:0;`;
          particlesContainer.appendChild(p);
        }
      }

      // Navbar scroll
      const navbar = document.getElementById('navbar');
      const navToggle = document.getElementById('navToggle');
      const mobileMenu = document.getElementById('mobileMenu');

      window.addEventListener('scroll', () => {
        if (navbar) {
          if (window.scrollY > 80) navbar.classList.add('scrolled');
          else navbar.classList.remove('scrolled');
        }
      }, { passive: true });

      if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
          const isOpen = mobileMenu.classList.toggle('open');
          navToggle.classList.toggle('open', isOpen);
          document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
          link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            navToggle.classList.remove('open');
            document.body.style.overflow = '';
          });
        });
      }

      // Highlight observer
      const highlightEl = document.querySelector('.highlight-text');
      if (highlightEl) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); }
          });
        }, { threshold: 0.5 });
        observer.observe(highlightEl);
      }
    };

    loadAnimations();
  }, []);

  const handleOrgToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fields = orgFieldsRef.current;
    const toggle = orgToggleRef.current;
    if (!fields || !toggle) return;
    if (e.target.checked) {
      fields.classList.add('visible');
      toggle.classList.add('active');
    } else {
      fields.classList.remove('visible');
      toggle.classList.remove('active');
      const orgName = document.getElementById('orgName') as HTMLInputElement | null;
      const orgRole = document.getElementById('orgRole') as HTMLInputElement | null;
      if (orgName) orgName.value = '';
      if (orgRole) orgRole.value = '';
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const counter = document.getElementById('charCounter');
    if (counter) {
      const len = e.target.value.length;
      counter.textContent = `${len} / 1000`;
      counter.classList.toggle('warn', len > 900);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;
    const successMsg = document.getElementById('formSuccess');
    const errorMsg = document.getElementById('formError');

    // Basic validation
    let valid = true;
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input[required], textarea[required], select[required]').forEach((el) => {
      const wrapper = el.closest('.form-field');
      if (!el.checkValidity() || (el.required && !el.value.trim())) {
        wrapper?.classList.add('error');
        valid = false;
      } else {
        wrapper?.classList.remove('error');
      }
    });
    if (!valid) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="btn-blob"></span><span>${tc.submitting}</span><span class="btn-spinner"></span>`;
    }
    successMsg?.classList.remove('visible');
    errorMsg?.classList.remove('visible');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message || 'Server error');

      successMsg?.classList.add('visible');
      form.reset();
      orgFieldsRef.current?.classList.remove('visible');
      orgToggleRef.current?.classList.remove('active');
      const counter = document.getElementById('charCounter');
      if (counter) counter.textContent = '0 / 1000';
      form.querySelectorAll('.form-field').forEach((f) => f.classList.remove('error'));
    } catch {
      errorMsg?.classList.add('visible');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span class="btn-blob"></span><span>${tc.submitBtn}</span>✉️`;
      }
    }
  };

  return (
    <>
      <LanguageBanner currentLang={lang} onChangeLang={setLang} />

      <div id="preloader">
        <div className="preloader-inner">
          <div className="preloader-ring"></div>
          <div className="preloader-ring"></div>
          <div className="preloader-ring"></div>
          <span className="preloader-logo">
            <span className="pl-n">N</span><span className="pl-a">a</span><span className="pl-t">T</span>
          </span>
        </div>
      </div>

      {/* Navbar */}
      <nav id="navbar" className="navbar" role="navigation" aria-label={t.nav.mainNav}>
        <div className="nav-container">
          <Link href="/" className="nav-logo" title="NaT">
            <span className="logo-word"><span className="logo-n">N</span></span>
            <span className="logo-word"><span className="logo-a">a</span></span>
            <span className="logo-word"><span className="logo-t">T</span></span>
          </Link>
          <div className="nav-links" id="navLinks">
            <Link href="/#hero" className="nav-link" data-text={t.nav.home}>{t.nav.home}</Link>
            <Link href="/#problem" className="nav-link" data-text={t.nav.problem}>{t.nav.problem}</Link>
            <Link href="/#hardware" className="nav-link" data-text={t.nav.hardware}>{t.nav.hardware}</Link>
            <Link href="/#rag" className="nav-link" data-text={t.nav.intelligence}>{t.nav.intelligence}</Link>
            <Link href="/#operation" className="nav-link" data-text={t.nav.operation}>{t.nav.operation}</Link>
            <Link href="/#security" className="nav-link" data-text={t.nav.security}>{t.nav.security}</Link>
            <Link href="/iletisim" className="nav-link active" data-text={tc.infoTag}>{tc.infoTag}</Link>
          </div>
          <button className="nav-toggle" id="navToggle" aria-label={t.nav.mobileToggle} type="button">
            <span className="hamburger-line" aria-hidden="true"></span>
            <span className="hamburger-line" aria-hidden="true"></span>
            <span className="hamburger-line" aria-hidden="true"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-menu" id="mobileMenu" role="navigation" aria-label={t.nav.mobileNav}>
        <div className="mobile-menu-bg"></div>
        <div className="mobile-menu-content">
          <Link href="/#hero" className="mobile-link">{t.nav.home}</Link>
          <Link href="/#problem" className="mobile-link">{t.nav.problem}</Link>
          <Link href="/#hardware" className="mobile-link">{t.nav.hardware}</Link>
          <Link href="/#rag" className="mobile-link">{t.nav.intelligence}</Link>
          <Link href="/#operation" className="mobile-link">{t.nav.operation}</Link>
          <Link href="/#security" className="mobile-link">{t.nav.security}</Link>
          <Link href="/iletisim" className="mobile-link mobile-link-cta">{tc.infoTag}</Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="contact-hero" id="contactHero">
        <img
          src="/assets/sensTree-background-animation-photo.png"
          alt="NaT"
          className="contact-hero-img"
          id="heroImg"
        />
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-text">
          <span className="contact-hero-sub" id="heroSub">{tc.heroSub}</span>
          <h1 className="contact-hero-title" id="heroTitle">{tc.heroTitle}</h1>
        </div>
      </div>

      {/* Contact Form Section */}
      <section className="contact-section section">
        <div className="contact-watermark">{tc.watermark}</div>
        <div className="form-particles" id="formParticles"></div>
        <div className="container">
          <div className="contact-grid">
            {/* Left Info Panel */}
            <div className="contact-info" id="contactInfo">
              <span className="contact-info-tag">
                ✉️ {tc.infoTag}
              </span>
              <h1 className="contact-info-title" dangerouslySetInnerHTML={{ __html: tc.infoTitleHtml }} />
              <p className="contact-info-desc">{tc.infoDesc}</p>
              <div className="contact-channels">
                <div className="contact-channel">
                  <div className="contact-channel-icon">📧</div>
                  <div className="contact-channel-info">
                    <span className="contact-channel-label">{tc.emailLabel}</span>
                    <span className="contact-channel-value">fatih@nat-project.com</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--cream2)', opacity: 0.55, marginTop: '0.1rem', fontFamily: 'var(--font-body)' }}>
                      {tc.coFounder}
                    </span>
                  </div>
                </div>
                <a className="contact-channel" href="https://github.com/nat-project" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                  <div className="contact-channel-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg></div>
                  <div className="contact-channel-info">
                    <span className="contact-channel-label">GitHub</span>
                    <span className="contact-channel-value">NaT-Project</span>
                  </div>
                </a>
                <div className="contact-channel">
                  <div className="contact-channel-icon">📍</div>
                  <div className="contact-channel-info">
                    <span className="contact-channel-label">{tc.locationLabel}</span>
                    <span className="contact-channel-value">{tc.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="contact-form-card" id="formCard">
              <div className="form-title">
                ✏️ {tc.formTitle}
              </div>
              <form id="contactForm" noValidate onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-field" id="field-name">
                    <input type="text" id="name" name="name" placeholder={tc.nameField} autoComplete="name" required />
                    <label htmlFor="name">{tc.nameField}</label>
                    <span className="field-error">{tc.nameError}</span>
                  </div>
                  <div className="form-field" id="field-email">
                    <input type="email" id="email" name="email" placeholder={tc.emailField} autoComplete="email" required />
                    <label htmlFor="email">{tc.emailField}</label>
                    <span className="field-error">{tc.emailError}</span>
                  </div>
                </div>
                <br />

                <label className="org-toggle-wrapper" htmlFor="orgCheck" id="orgToggle" ref={orgToggleRef}>
                  <span className="org-checkbox">
                    <input type="checkbox" id="orgCheck" name="orgCheck" onChange={handleOrgToggle} />
                    <span className="org-checkbox-box">✓</span>
                  </span>
                  <span className="org-toggle-text">
                    <strong>{tc.orgToggleTitle}</strong>
                    {tc.orgToggleDesc}
                  </span>
                </label>

                <div className="org-fields" id="orgFields" ref={orgFieldsRef}>
                  <div className="form-field">
                    <input type="text" id="orgName" name="orgName" placeholder={tc.orgNameField} autoComplete="organization" />
                    <label htmlFor="orgName">{tc.orgNameField}</label>
                  </div>
                  <div className="form-field">
                    <input type="text" id="orgRole" name="orgRole" placeholder={tc.orgRoleField} autoComplete="organization-title" />
                    <label htmlFor="orgRole">{tc.orgRoleField}</label>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="select-label">{tc.subjectLabel}</label>
                  <div className="form-field select-wrapper" id="field-subject">
                    <select id="subject" name="subject" required>
                      <option value="" disabled hidden></option>
                      <option value="yatirim">{tc.subjectInvest}</option>
                      <option value="partner">{tc.subjectPartner}</option>
                      <option value="urun">{tc.subjectProduct}</option>
                      <option value="kariyer">{tc.subjectCareer}</option>
                      <option value="medya">{tc.subjectMedia}</option>
                      <option value="diger">{tc.subjectOther}</option>
                    </select>
                    <span className="field-error">{tc.subjectError}</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                  <div className="form-field" id="field-message">
                    <textarea id="message" name="message" placeholder={tc.messageField} maxLength={1000} required onChange={handleTextareaInput}></textarea>
                    <label htmlFor="message">{tc.messageField}</label>
                    <span className="field-error">{tc.messageError}</span>
                  </div>
                  <span className="char-counter" id="charCounter">0 / 1000</span>
                </div>

                <div className="form-submit-wrapper">
                  <button type="submit" className="form-submit-btn" id="submitBtn">
                    <span className="btn-blob"></span>
                    <span>{tc.submitBtn}</span>
                    ✉️
                  </button>
                  <span className="form-privacy-note">
                    🔒 {tc.privacyNote}
                  </span>
                </div>

                <div className="form-status success" id="formSuccess">
                  ✅
                  {tc.successMsg}
                </div>
                <div className="form-status error" id="formError">
                  ⚠️
                  {tc.errorMsg}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="footer-logo">
                <span style={{ fontSize: '40px' }} className="logo-n">N</span>
                <span style={{ fontSize: '40px' }} className="logo-a">a</span>
                <span style={{ fontSize: '40px' }} className="logo-t">T</span>
              </span>
              <p>Natural Agriculture Technologies</p>
            </div>
            <div className="footer-col col-lg-2">
              <h5>{t.footer.ecosystem}</h5>
              <Link href="/#hardware">⚙️ sensSeries</Link>
              <Link href="/#rag">🧠 RAG</Link>
              <Link href="/#operation">🤖 {t.operation.tag}</Link>
            </div>
            <div className="footer-col col-lg-2">
              <h5>{t.footer.company}</h5>
              <Link href="/">{t.footer.home}</Link>
              <Link href="/#vision">{t.footer.career}</Link>
              <Link href="/iletisim">{t.footer.contact}</Link>
            </div>
            <div className="footer-col col-lg-2">
              <h5>{t.footer.legal}</h5>
              <a href="#">{t.footer.privacy}</a>
              <a href="#">{t.footer.kvkk}</a>
              <a href="#">{t.footer.terms}</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </footer>

      <style>{`
        .contact-hero {
          position: relative;
          height: 500px;
          margin-top: 70px;
          overflow: hidden;
        }
        .contact-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .contact-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(8,12,10,0.45) 0%, rgba(8,12,10,0.25) 40%, rgba(8,12,10,0.65) 100%);
        }
        .contact-hero-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 0.75rem;
        }
        .contact-hero-title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 5vw, 3.6rem);
          font-weight: 500;
          color: var(--cream);
          text-align: center;
          letter-spacing: -0.02em;
          line-height: 1.15;
          text-shadow: 0 4px 32px rgba(0,0,0,0.6);
          opacity: 0;
          transform: translateY(30px);
        }
        .contact-hero-sub {
          font-family: var(--font-body);
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: var(--accent);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          opacity: 0;
          transform: translateY(20px);
        }
        .contact-section {
          background: var(--dark);
          padding: 6rem 0 8rem;
          position: relative;
          overflow: hidden;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 4rem;
          align-items: start;
          position: relative;
          z-index: 2;
        }
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: sticky;
          top: 100px;
        }
        .contact-info-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--glass-green-bg);
          border: 1px solid var(--glass-green-border);
          border-radius: 50px;
          padding: 0.4rem 1rem;
          font-size: 0.75rem;
          font-family: var(--font-body);
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          width: fit-content;
        }
        .contact-info-title {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 5vw + 0.5rem, 4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--cream);
          line-height: 1.15;
          max-width: 100%;
          overflow: hidden;
          padding: 20px 0;
        }
        .contact-info-title span b {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 5vw + 0.5rem, 4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #A2CB8B;
          line-height: 1.15;
        }
        .contact-info-desc {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--cream2);
          line-height: 1.75;
        }
        .contact-channels {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .contact-channel {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          transition: border-color 0.3s, background 0.3s;
          cursor: default;
        }
        .contact-channel:hover {
          border-color: var(--glass-green-border);
          background: var(--glass-green-bg);
        }
        .contact-channel-icon {
          width: 40px; height: 40px;
          background: var(--glass-green-bg);
          border: 1px solid var(--glass-green-border);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        .contact-channel-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .contact-channel-label { font-family: var(--font-body); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cream2); }
        .contact-channel-value { font-family: var(--font-body); font-size: 0.9rem; font-weight: 500; color: var(--cream); }
        .contact-form-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid var(--glass-border);
          border-radius: 28px;
          padding: 3rem;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }
        .contact-form-card::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .form-title { font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: var(--cream); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.6rem; }
        .form-title i { color: var(--accent); font-size: 1.1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .form-group { position: relative; margin-bottom: 1.5rem; }
        .form-field { position: relative; }
        .form-field input, .form-field textarea, .form-field select {
          width: 100%; background: rgba(255,255,255,0.035); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 14px;
          padding: 1.1rem 1.25rem 0.5rem; font-family: var(--font-body); font-size: 0.95rem; color: var(--cream);
          outline: none; transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
          -webkit-appearance: none; appearance: none;
        }
        .form-field select { padding: 0.85rem 1.25rem; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2300FF88' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.25rem center; padding-right: 3rem; }
        .form-field select option { background: var(--dark2); color: var(--cream); }
        .form-field textarea { min-height: 160px; resize: vertical; line-height: 1.6; padding-top: 1.1rem; }
        .form-field label { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); font-family: var(--font-body); font-size: 0.9rem; color: var(--cream2); pointer-events: none; transition: all 0.25s; background: transparent; }
        .form-field textarea ~ label { top: 1.1rem; transform: none; }
        .form-field input:focus ~ label, .form-field input:not(:placeholder-shown) ~ label, .form-field textarea:focus ~ label, .form-field textarea:not(:placeholder-shown) ~ label { top: 0.45rem; transform: none; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; color: var(--accent); }
        .form-field textarea:focus ~ label, .form-field textarea:not(:placeholder-shown) ~ label { top: 0.45rem; }
        .form-field input:focus, .form-field textarea:focus, .form-field select:focus { border-color: var(--accent2); background: rgba(0,255,136,0.04); box-shadow: 0 0 0 3px rgba(0,255,136,0.08), 0 4px 20px rgba(0,0,0,0.2); }
        .form-field input::placeholder, .form-field textarea::placeholder { color: transparent; }
        .org-toggle-wrapper { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.25rem; background: rgba(255,255,255,0.025); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; cursor: pointer; transition: border-color 0.3s, background 0.3s; user-select: none; margin-bottom: 1.5rem; }
        .org-toggle-wrapper:hover { border-color: var(--glass-green-border); background: var(--glass-green-bg); }
        .org-toggle-wrapper.active { border-color: var(--accent2); background: rgba(0,255,136,0.05); }
        .org-checkbox { position: relative; width: 22px; height: 22px; flex-shrink: 0; }
        .org-checkbox input { position: absolute; opacity: 0; width: 0; height: 0; }
        .org-checkbox-box { width: 22px; height: 22px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; background: transparent; display: flex; align-items: center; justify-content: center; transition: all 0.25s; }
        .org-checkbox input:checked ~ .org-checkbox-box { background: var(--accent); border-color: var(--accent); }
        .org-checkbox-box i { color: var(--dark); font-size: 0.65rem; opacity: 0; transform: scale(0.5); transition: all 0.2s; }
        .org-checkbox input:checked ~ .org-checkbox-box i { opacity: 1; transform: scale(1); }
        .org-toggle-text { font-family: var(--font-body); font-size: 0.9rem; color: var(--cream2); line-height: 1.4; transition: color 0.3s; }
        .org-toggle-wrapper.active .org-toggle-text { color: var(--cream); }
        .org-toggle-text strong { display: block; font-weight: 600; font-size: 0.88rem; color: var(--cream); }
        .org-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.5s, opacity 0.4s ease, margin 0.4s ease; margin-bottom: 0; }
        .org-fields.visible { max-height: 200px; opacity: 1; margin-bottom: 1.5rem; }
        .select-wrapper { position: relative; }
        .select-label { display: block; font-family: var(--font-body); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; color: var(--accent); margin-bottom: 0.4rem; padding-left: 0.25rem; }
        .char-counter { position: absolute; bottom: 0.7rem; right: 1rem; font-size: 0.7rem; color: var(--cream2); opacity: 0.6; font-family: var(--font-body); pointer-events: none; transition: color 0.3s; }
        .char-counter.warn { color: #ffad33; opacity: 1; }
        .form-submit-wrapper { margin-top: 0.5rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .form-submit-btn { position: relative; display: inline-flex; align-items: center; gap: 0.75rem; padding: 0.9rem 2.5rem; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: var(--dark); font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; border: none; border-radius: 50px; cursor: pointer; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; letter-spacing: 0.01em; }
        .form-submit-btn:hover { transform: scale(1.04) translateY(-2px); box-shadow: 0 12px 40px rgba(0,255,136,0.35); }
        .form-submit-btn .btn-blob { position: absolute; width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,0.15); transform: scale(0); transition: transform 0.6s, opacity 0.6s; opacity: 0; }
        .form-submit-btn:hover .btn-blob { transform: scale(2.5); opacity: 1; }
        .form-submit-btn i { position: relative; z-index: 1; transition: transform 0.3s; }
        .form-submit-btn:hover i { transform: translateX(4px); }
        .form-submit-btn span { position: relative; z-index: 1; }
        .form-privacy-note { font-family: var(--font-body); font-size: 0.8rem; color: var(--cream2); display: flex; align-items: center; gap: 0.4rem; }
        .form-privacy-note i { color: var(--accent2); font-size: 0.75rem; }
        .form-status { display: none; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; border-radius: 14px; font-family: var(--font-body); font-size: 0.9rem; font-weight: 500; margin-top: 1.5rem; }
        .form-status.success { background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.25); color: var(--accent); }
        .form-status.error { background: rgba(246,104,94,0.08); border: 1px solid rgba(246,104,94,0.25); color: #f6685e; }
        .form-status.visible { display: flex; }
        .form-field.error input, .form-field.error textarea, .form-field.error select { border-color: rgba(246,104,94,0.5); }
        .field-error { font-family: var(--font-body); font-size: 0.75rem; color: #f6685e; margin-top: 0.35rem; padding-left: 0.25rem; display: none; }
        .form-field.error .field-error { display: block; }
        .form-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .form-particle { position: absolute; border-radius: 50%; background: var(--accent); opacity: 0; animation: floatParticle linear infinite; }
        @keyframes floatParticle { 0% { opacity: 0; transform: translateY(0) scale(0.5); } 10% { opacity: 0.4; } 90% { opacity: 0.15; } 100% { opacity: 0; transform: translateY(-120px) scale(1); } }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr; gap: 3rem; }
          .contact-info { position: static; }
          .contact-info-title { font-size: clamp(3.2rem, 8vw, 4rem); line-height: 1.2; }
          .contact-info-title span b { font-size: clamp(3.2rem, 8vw, 4rem); line-height: 1.2; }
          .contact-form-card { padding: 2rem 1.5rem; }
          .form-row { grid-template-columns: 1fr; }
          .org-fields { grid-template-columns: 1fr; }
          .org-fields.visible { max-height: 280px; }
        }
        @media (max-width: 480px) {
          .contact-hero { height: 380px; }
          .contact-form-card { padding: 1.5rem 1rem; }
          .form-submit-wrapper { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  );
}
