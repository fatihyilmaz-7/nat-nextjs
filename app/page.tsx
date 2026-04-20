'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTranslation, type Lang } from '../lib/translations';
import LanguageBanner from '../components/LanguageBanner';

export default function Home() {
  const [lang, setLang] = useState<Lang>('tr');

  useEffect(() => {
    const saved = localStorage.getItem('nat-lang') as Lang | null;
    if (saved) setLang(saved);
  }, []);

  const t = getTranslation(lang);

  useEffect(() => {
    // Preloader fade + hero CSS animation
    const showHero = () => {
      const pre = document.getElementById('preloader');
      if (!pre) { document.body.classList.add('hero-animate'); return; }
      setTimeout(() => { pre.style.transition = 'opacity 0.6s ease'; pre.style.opacity = '0'; }, 500);
      setTimeout(() => {
        pre.style.display = 'none';
        document.body.classList.add('hero-animate');
        // Auto expand/collapse NAT
        setTimeout(() => {
          const el = document.getElementById('heroNatTrigger');
          const br = document.getElementById('natBreak');
          if (!el) return;
          el.style.opacity = '0';
          setTimeout(() => {
            el.textContent = 'Natural Agriculture Technologies';
            el.classList.add('nat-is-expanded');
            if (br) br.style.display = '';
            el.style.opacity = '1';
            setTimeout(() => {
              el.style.opacity = '0';
              setTimeout(() => {
                el.textContent = 'NAT';
                el.classList.remove('nat-is-expanded');
                if (br) br.style.display = 'none';
                el.style.opacity = '1';
              }, 200);
            }, 2000);
          }, 200);
        }, 1200);
      }, 1100);
    };
    if (document.readyState === 'complete') showHero();
    else window.addEventListener('load', showHero, { once: true });

    // NAT hover
    const natEl = document.getElementById('heroNatTrigger');
    if (natEl) {
      let hovered = false;
      const expand = () => {
        natEl.style.opacity = '0';
        setTimeout(() => {
          natEl.textContent = 'Natural Agriculture Technologies';
          natEl.classList.add('nat-is-expanded');
          const br = document.getElementById('natBreak');
          if (br) br.style.display = '';
          natEl.style.opacity = '1';
        }, 200);
      };
      const collapse = () => {
        natEl.style.opacity = '0';
        setTimeout(() => {
          natEl.textContent = 'NAT';
          natEl.classList.remove('nat-is-expanded');
          const br = document.getElementById('natBreak');
          if (br) br.style.display = 'none';
          natEl.style.opacity = '1';
        }, 200);
      };
      natEl.addEventListener('mouseenter', () => { hovered = true; expand(); });
      natEl.addEventListener('mouseleave', () => { hovered = false; setTimeout(() => { if (!hovered) collapse(); }, 400); });
    }

    // Nav scroll
    const navbar = document.getElementById('navbar');
    const onScroll = () => navbar?.classList.toggle('scrolled', window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (navToggle && mobileMenu) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });
      mobileMenu.querySelectorAll('.mobile-link').forEach((l) => l.addEventListener('click', () => {
        navToggle.classList.remove('open'); mobileMenu.classList.remove('open'); document.body.style.overflow = '';
      }));
    }

    // Scroll reveal via IntersectionObserver
    const revealEls = document.querySelectorAll<HTMLElement>('.anim-reveal, .problem-card, .device-float, .prediction-card, .op-card, .sec-card, .lab-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    revealEls.forEach((el) => observer.observe(el));

    // Smooth scroll
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href') || '');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      })
    );

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <LanguageBanner currentLang={lang} onChangeLang={setLang} />

      <div id="preloader">
        <div className="preloader-inner">
          <div className="preloader-ring"></div><div className="preloader-ring"></div><div className="preloader-ring"></div>
          <span className="preloader-logo"><span className="pl-n">N</span><span className="pl-a">a</span><span className="pl-t">T</span></span>
        </div>
      </div>

      {/* Navbar */}
      <nav id="navbar" className="navbar" role="navigation" aria-label={t.nav.mainNav}>
        <div className="nav-container">
          <a href="#hero" className="nav-logo" title="NaT">
            <span className="logo-word"><span className="logo-n">N</span></span>
            <span className="logo-word"><span className="logo-a">a</span></span>
            <span className="logo-word"><span className="logo-t">T</span></span>
          </a>
          <div className="nav-links" id="navLinks">
            <a href="#hero" className="nav-link active" data-text={t.nav.home}>{t.nav.home}</a>
            <a href="#problem" className="nav-link" data-text={t.nav.problem}>{t.nav.problem}</a>
            <a href="#hardware" className="nav-link" data-text={t.nav.hardware}>{t.nav.hardware}</a>
            <a href="#rag" className="nav-link" data-text={t.nav.intelligence}>{t.nav.intelligence}</a>
            <a href="#operation" className="nav-link" data-text={t.nav.operation}>{t.nav.operation}</a>
            <a href="#security" className="nav-link" data-text={t.nav.security}>{t.nav.security}</a>
            <a href="#vision" className="nav-link nav-link-cta" data-text={t.nav.join}>{t.nav.join}</a>
          </div>
          <button className="nav-toggle" id="navToggle" aria-label={t.nav.mobileToggle} type="button">
            <span className="hamburger-line"></span><span className="hamburger-line"></span><span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-menu" id="mobileMenu" role="navigation" aria-label={t.nav.mobileNav}>
        <div className="mobile-menu-bg"></div>
        <div className="mobile-menu-content">
          <a href="#hero" className="mobile-link">{t.nav.home}</a>
          <a href="#problem" className="mobile-link">{t.nav.problem}</a>
          <a href="#hardware" className="mobile-link">{t.nav.hardware}</a>
          <a href="#rag" className="mobile-link">{t.nav.intelligence}</a>
          <a href="#operation" className="mobile-link">{t.nav.operation}</a>
          <a href="#security" className="mobile-link">{t.nav.security}</a>
          <a href="#vision" className="mobile-link mobile-link-cta">{t.nav.join}</a>
        </div>
      </div>

      {/* Hero */}
      <section id="hero" className="section hero-section">
        <div className="hero-video-container">
          <img src="/drone.jpeg" className="hero-video" alt="Drone view" />
          <div className="hero-video-overlay"></div>
        </div>
        <div className="hero-content" id="heroContent">
          <h1 className="hero-title" id="heroTitle">
            <span className="title-line title-line-top">To be, or</span>
            <span className="title-line title-line-bottom">
              <span className="highlight-nat" id="heroNatTrigger">NAT</span>
              <br id="natBreak" style={{ display: 'none' }} />
              <span id="toBeText"> to be.</span>
            </span>
          </h1>
          <p className="hero-subtitle" id="heroSubtitle" style={{ opacity: 0, transform: 'translateY(20px)' }}>{t.hero.subtitle}</p>
          <div className="hero-cta-row" style={{ opacity: 0, transform: 'translateY(20px)' }}>
            <a href="#core-vision" className="hero-cta" id="heroCta">
              <span className="hero-cta-text">{t.hero.exploreBtn}</span>
              <span className="hero-cta-arrow">→</span>
              <span className="hero-cta-glow"></span>
            </a>
            <a href={t.hero.pdf} className="hero-cta-secondary" download>
              📄
              <span>{t.hero.pitchBtn}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="section problem-section">
        <div className="section-watermark">PROBLEM</div>
        <div className="container">
          <span className="section-tag">⚠️ {t.problem.tag}</span>
          <h2 className="section-title anim-reveal">{t.problem.title}</h2>
          <p className="section-desc anim-reveal" dangerouslySetInnerHTML={{ __html: t.problem.desc }} />
          <div className="problem-grid">
            <div className="glass-card problem-card">
              <div className="glass-card-shine"></div>
              <div className="card-icon-wrap">💧</div>
              <h4>{t.problem.card1Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.problem.card1Desc }} />
            </div>
            <div className="glass-card problem-card">
              <div className="glass-card-shine"></div>
              <div className="card-icon-wrap warn">🌡️</div>
              <h4>{t.problem.card2Title}</h4>
              <p>{t.problem.card2Desc}</p>
            </div>
            <div className="glass-card problem-card">
              <div className="glass-card-shine"></div>
              <div className="card-icon-wrap info">⚡</div>
              <h4>{t.problem.card3Title}</h4>
              <p>{t.problem.card3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Vision */}
      <section id="core-vision" className="section hardware-section" style={{ background: 'var(--dark)', paddingBottom: '4rem' }}>
        <div className="container">
          <span className="section-tag tag-green">🌍 {t.coreVision.tag}</span>
          <h2 className="section-title anim-reveal" dangerouslySetInnerHTML={{ __html: t.coreVision.title.replace('\n', '<br/>') }} />
          <p className="section-desc anim-reveal" dangerouslySetInnerHTML={{ __html: t.coreVision.desc }} />
          <div className="features-grid">
            <div className="glass-card feature-card">
              <div className="glass-card-shine"></div>
              <div className="feature-icon-wrap">🌡️</div>
              <h4>{t.coreVision.feat1Title}</h4>
              <p>{t.coreVision.feat1Desc}</p>
            </div>
            <div className="glass-card feature-card">
              <div className="glass-card-shine"></div>
              <div className="feature-icon-wrap">💧</div>
              <h4>{t.coreVision.feat2Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.coreVision.feat2Desc }} />
            </div>
            <div className="glass-card feature-card">
              <div className="glass-card-shine"></div>
              <div className="feature-icon-wrap">⚙️</div>
              <h4>{t.coreVision.feat3Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.coreVision.feat3Desc }} />
            </div>
          </div>
        </div>
      </section>

      {/* Hardware */}
      <section id="hardware" className="section hardware-section" style={{ paddingTop: '4rem' }}>
        <div className="section-watermark">{t.hardware.watermark}</div>
        <div className="container">
          <span className="section-tag tag-green">⚙️ {t.hardware.tag}</span>
          <h2 className="section-title anim-reveal">{t.hardware.title}</h2>
          <p className="section-desc anim-reveal">{t.hardware.desc}</p>
          <div className="devices-showcase">
            <div className="device-float">
              <div className="glass-card device-card green-glow">
                <div className="glass-card-shine"></div>
                <img src="/assets/sensTree.png" alt="sensTree" className="device-image" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'cover' }} />
                <h2 className="sensor-title" data-shadow="sensTree">sensTree</h2>
                <p dangerouslySetInnerHTML={{ __html: t.hardware.sensTreeDesc }} />
              </div>
            </div>
            <div className="device-float">
              <div className="glass-card device-card green-glow">
                <div className="glass-card-shine"></div>
                <img src="/assets/sensSoil.png" alt="sensSoil" className="device-image" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'cover' }} />
                <h2 className="sensor-title" data-shadow="sensSoil">sensSoil</h2>
                <p dangerouslySetInnerHTML={{ __html: t.hardware.sensSoilDesc }} />
              </div>
            </div>
            <div className="device-float">
              <div className="glass-card device-card green-glow">
                <div className="glass-card-shine"></div>
                <img src="/assets/sensPlant.png" alt="sensPlant" className="device-image" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'cover' }} />
                <h2 className="sensor-title" data-shadow="sensPlant">sensPlant</h2>
                <p dangerouslySetInnerHTML={{ __html: t.hardware.sensPlantDesc }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAG */}
      <section id="rag" className="section rag-section">
        <div className="section-watermark">{t.rag.watermark}</div>
        <div className="container rag-container">
          <span className="section-tag tag-green">🧠 {t.rag.tag}</span>
          <h2 className="section-title anim-reveal">{t.rag.title}</h2>
          <p className="section-desc anim-reveal">{t.rag.desc}</p>
          <div className="glass-card prediction-card green-glow">
            <div className="glass-card-shine"></div>
            <div className="pred-icon">✨</div>
            <div className="pred-text">
              <h4>{t.rag.pred1Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.rag.pred1Desc }} />
            </div>
          </div>
          <div className="glass-card prediction-card green-glow" style={{ marginTop: '1rem' }}>
            <div className="glass-card-shine"></div>
            <div className="pred-icon">🔄</div>
            <div className="pred-text">
              <h4>{t.rag.pred2Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.rag.pred2Desc }} />
            </div>
          </div>
        </div>
      </section>

      {/* Operation */}
      <section id="operation" className="section operation-section">
        <div className="section-watermark">{t.operation.watermark}</div>
        <div className="container">
          <span className="section-tag tag-green">🤖 {t.operation.tag}</span>
          <h2 className="section-title anim-reveal">{t.operation.title}</h2>
          <p className="section-desc anim-reveal">{t.operation.desc}</p>
          <div className="op-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', maxWidth: '900px', margin: '0 auto 3rem' }}>
            <div className="glass-card op-card">
              <div className="glass-card-shine"></div>
              <div className="op-icon-wrap">📡</div>
              <h4>{t.operation.card1Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.operation.card1Desc }} />
            </div>
            <div className="glass-card op-card">
              <div className="glass-card-shine"></div>
              <div className="op-icon-wrap">🌿</div>
              <h4>{t.operation.card2Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.operation.card2Desc }} />
            </div>
          </div>
        </div>
      </section>

      {/* Lab — simplified grid (no pinned scroll) */}
      <section id="lab-test" className="section" style={{ background: 'var(--dark2)', position: 'relative', overflow: 'hidden' }}>
        <div className="lab-video-bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="/lab.jpg" alt="Lab" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="section-title anim-reveal" style={{ textAlign: 'center' }}>{t.lab.title}</h2>
          <p className="section-desc anim-reveal" style={{ textAlign: 'center' }}>{t.lab.subtitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
            {[
              { n: 1, title: t.lab.box1Title, desc: t.lab.box1Desc },
              { n: 2, title: t.lab.box2Title, desc: t.lab.box2Desc },
              { n: 3, title: t.lab.box3Title, desc: t.lab.box3Desc },
              { n: 4, title: t.lab.box4Title, desc: t.lab.box4Desc },
            ].map(({ n, title, desc }) => (
              <div key={n} className="glass-card lab-card" style={{ padding: '2rem' }}>
                <div className="glass-card-shine"></div>
                <div className="box-number-wrap">{n}</div>
                <h4 style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="section security-section">
        <div className="section-watermark">{t.security.watermark}</div>
        <div className="container security-container">
          <span className="section-tag tag-green">🛡️ {t.security.tag}</span>
          <h2 className="section-title anim-reveal">{t.security.title}<br />{t.security.title2}</h2>
          <p className="section-desc anim-reveal" dangerouslySetInnerHTML={{ __html: t.security.desc }} />
          <div className="sec-grid">
            <div className="glass-card sec-card green-glow">
              <div className="glass-card-shine"></div>
              <div className="sec-icon-wrap">🔒</div>
              <h4>{t.security.card1Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.security.card1Desc }} />
              <div className="sec-detail">👁 {t.security.card1Badge}</div>
            </div>
            <div className="glass-card sec-card green-glow">
              <div className="glass-card-shine"></div>
              <div className="sec-icon-wrap">🔐</div>
              <h4>{t.security.card2Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.security.card2Desc }} />
              <div className="sec-detail">🏷️ {t.security.card2Badge}</div>
            </div>
            <div className="glass-card sec-card green-glow">
              <div className="glass-card-shine"></div>
              <div className="sec-icon-wrap">🗄️</div>
              <h4>{t.security.card3Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.security.card3Desc }} />
              <div className="sec-detail">↩️ {t.security.card3Badge}</div>
            </div>
          </div>
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="section vision-section">
        <div className="vision-bg">
          <div className="vbg-shape vbg-1"></div>
          <div className="vbg-shape vbg-2"></div>
          <div className="vbg-shape vbg-3"></div>
        </div>
        <div className="container vision-container">
          <span className="section-tag tag-green" style={{ marginBottom: '1rem' }}>
            🚀 {t.vision.tag}
          </span>
          <h2 className="section-title anim-reveal vision-title">
            {t.vision.title}<br />{t.vision.title2}
          </h2>
          <p className="section-desc anim-reveal">
            {t.vision.desc1}<br /><br />{t.vision.desc2}
          </p>
          <Link href="/iletisim" className="cta-button" id="ctaButton" style={{ marginTop: '2rem' }}>
            <span className="cta-btn-text">{t.vision.cta}</span>
            <span className="cta-btn-icon">→</span>
            <span className="cta-blob cta-blob-1"></span>
            <span className="cta-blob cta-blob-2"></span>
          </Link>
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
              <a href="#hardware">⚙️ sensSeries</a>
              <a href="#rag">🧠 RAG</a>
              <a href="#operation">🤖 {t.operation.tag}</a>
            </div>
            <div className="footer-col col-lg-2">
              <h5>{t.footer.company}</h5>
              <a href="/">{t.footer.home}</a>
              <a href="#vision">{t.footer.career}</a>
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
    </>
  );
}
