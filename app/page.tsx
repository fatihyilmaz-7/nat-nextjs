'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { translations, type Lang } from '../lib/translations';

export default function Home() {
  const [lang, setLang] = useState<Lang>('tr');

  useEffect(() => {
    // Check saved preference first
    const saved = localStorage.getItem('nat-lang') as Lang | null;
    if (saved === 'tr' || saved === 'en') {
      setLang(saved);
      return;
    }
    // Auto-detect via Vercel geo headers (server-side country detection)
    fetch('/api/geo')
      .then((r) => r.json())
      .then((data: { country: string | null }) => {
        if (data.country && data.country !== 'TR') {
          setLang('en');
        }
      })
      .catch(() => {
        // Fallback: use browser language
        if (!navigator.language.startsWith('tr')) setLang('en');
      });
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === 'tr' ? 'en' : 'tr';
    setLang(next);
    localStorage.setItem('nat-lang', next);
  };

  const t = translations[lang];

  useEffect(() => {
    const loadAnimations = () => {
      const win = window as typeof window & { gsap?: unknown; ScrollTrigger?: unknown };
      if (typeof win.gsap === 'undefined') {
        setTimeout(loadAnimations, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = '/_next/static/chunks/animation.js';
      script.onerror = () => {};

      // Run the animation code inline
      runAnimations();
    };

    const runAnimations = () => {
      type Tl = {
        to: (target: unknown, vars: unknown, position?: unknown) => Tl;
        fromTo: (target: unknown, fv: unknown, tv: unknown, position?: unknown) => Tl;
      };
      const win = window as typeof window & {
        gsap: {
          registerPlugin: (...args: unknown[]) => void;
          to: (target: unknown, vars: unknown) => unknown;
          from: (target: unknown, vars: unknown) => unknown;
          fromTo: (target: unknown, fromVars: unknown, toVars: unknown) => unknown;
          set: (target: unknown, vars: unknown) => unknown;
          timeline: (vars?: unknown) => Tl;
          matchMedia: () => { add: (condition: string, callback: () => void) => void };
          killTweensOf: (target: unknown) => void;
        };
        ScrollTrigger: {
          create: (vars: unknown) => void;
          refresh: () => void;
        };
      };
      const { gsap, ScrollTrigger } = win;
      if (!gsap || !ScrollTrigger) return;

      gsap.registerPlugin(ScrollTrigger);

      // Preloader
      window.addEventListener('load', function () {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.8,
          delay: 1,
          ease: 'power2.inOut',
          onComplete: function () {
            preloader.style.display = 'none';
            startHeroAnimation();
            ScrollTrigger.refresh();
          },
        });
      });

      // Navigation
      const navbar = document.getElementById('navbar');
      const navToggle = document.getElementById('navToggle');
      const mobileMenu = document.getElementById('mobileMenu');
      let lastScroll = 0;

      window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;
        if (navbar) {
          if (scrollY > 80) navbar.classList.add('scrolled');
          else navbar.classList.remove('scrolled');
          if (scrollY > lastScroll && scrollY > 400) gsap.to(navbar, { y: -100, duration: 0.3 });
          else gsap.to(navbar, { y: 0, duration: 0.3 });
        }
        lastScroll = scrollY;

        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link:not(.nav-link-cta)');
        let currentSection = '';
        sections.forEach((sec: Element) => {
          if (scrollY >= (sec as HTMLElement).offsetTop - 200) currentSection = sec.id;
        });
        navLinks.forEach((link: Element) => {
          if (link.getAttribute('href') === '#' + currentSection) link.classList.add('active');
          else link.classList.remove('active');
        });
      });

      if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
          navToggle.classList.toggle('open');
          mobileMenu.classList.toggle('open');
          document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });
      }

      document.querySelectorAll('.mobile-link').forEach(function (link) {
        link.addEventListener('click', function () {
          navToggle?.classList.remove('open');
          mobileMenu?.classList.remove('open');
          document.body.style.overflow = '';
        });
      });

      // Hero Section
      function startHeroAnimation() {
        const tl = gsap.timeline();
        let natLoopTimeout: ReturnType<typeof setTimeout> | null = null;
        let natIsExpanded = false;
        let natIsHovered = false;

        function expandNat(onDone?: () => void) {
          const trigger = document.getElementById('heroNatTrigger');
          const natBreak = document.getElementById('natBreak');
          if (!trigger) return;
          natIsExpanded = true;
          gsap.killTweensOf(trigger);
          gsap.to(trigger, {
            opacity: 0, duration: 0.25, ease: 'power2.in',
            onComplete: function () {
              trigger.textContent = 'Natural Agriculture Technologies';
              trigger.classList.add('nat-is-expanded');
              if (natBreak) natBreak.style.display = '';
              gsap.to(trigger, {
                opacity: 1, duration: 0.5, ease: 'power2.out',
                onComplete: function () { if (onDone) onDone(); },
              });
            },
          });
        }

        function collapseNat(onDone?: () => void) {
          const trigger = document.getElementById('heroNatTrigger');
          const natBreak = document.getElementById('natBreak');
          if (!trigger) return;
          natIsExpanded = false;
          gsap.killTweensOf(trigger);
          gsap.to(trigger, {
            opacity: 0, duration: 0.25, ease: 'power2.in',
            onComplete: function () {
              trigger.textContent = 'NAT';
              trigger.classList.remove('nat-is-expanded');
              if (natBreak) natBreak.style.display = 'none';
              gsap.to(trigger, {
                opacity: 1, duration: 0.4, ease: 'power2.out',
                onComplete: function () { if (onDone) onDone(); },
              });
            },
          });
        }

        function triggerOnceOnLoad() {
          if (natIsHovered || natIsExpanded) return;
          expandNat(function () {
            natLoopTimeout = setTimeout(function () {
              if (!natIsHovered) collapseNat();
            }, 1500);
          });
        }

        const natTriggerEl = document.getElementById('heroNatTrigger');
        if (natTriggerEl) {
          natTriggerEl.addEventListener('mouseenter', function () {
            natIsHovered = true;
            if (natLoopTimeout) clearTimeout(natLoopTimeout);
            if (!natIsExpanded) expandNat();
          });
          natTriggerEl.addEventListener('mouseleave', function () {
            natIsHovered = false;
            natLoopTimeout = setTimeout(function () { collapseNat(); }, 400);
          });
        }

        tl.to('.hero-badge', { opacity: 1, duration: 0.6, ease: 'power2.out' })
          .fromTo('.title-line-top', { opacity: 0, x: 70 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
          .fromTo('.title-line-bottom', { opacity: 0, x: -70 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7')
          .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4')
          .to('.hero-cta-row', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3')
          .to('.scroll-indicator', {
            opacity: 1, duration: 0.5,
            onComplete: function () { setTimeout(triggerOnceOnLoad, 500); },
          }, '-=0.2');

        const heroScrub = gsap.timeline({
          scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
        });
        heroScrub.to('.title-line:nth-child(1)', { x: -120, opacity: 0, scale: 0.9 }, 0);
        heroScrub.to('.title-line:nth-child(2)', { x: 120, opacity: 0, scale: 0.9 }, 0);
        heroScrub.to('.hero-subtitle', { y: 60, opacity: 0, scale: 0.8 }, 0);
        heroScrub.to('.hero-cta-row', { y: 100, opacity: 0 }, 0);
        heroScrub.to('.hero-video', { scale: 1.35, filter: 'brightness(0.3) blur(12px)' }, 0);
      }

      const heroContent = document.getElementById('heroContent');
      if (heroContent) {
        document.addEventListener('mousemove', function (e) {
          const cx = (e.clientX / window.innerWidth - 0.5) * 2;
          const cy = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to('#heroTitle', { x: cx * 12, y: cy * 8, duration: 0.6, ease: 'power2.out' });
          gsap.to('#heroSubtitle', { x: cx * 6, y: cy * 4, duration: 0.6, ease: 'power2.out' });
        });
      }

      const particleContainer = document.getElementById('heroParticles');
      if (particleContainer) {
        for (let i = 0; i < 20; i++) {
          const p = document.createElement('div');
          const size = 2 + Math.random() * 3;
          p.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:rgba(0,255,136,${0.1 + Math.random() * 0.2});border-radius:50%;left:${Math.random() * 100}%;top:${Math.random() * 100}%;pointer-events:none;`;
          particleContainer.appendChild(p);
          gsap.to(p, { y: -100 - Math.random() * 150, x: (Math.random() - 0.5) * 60, opacity: 0, duration: 3 + Math.random() * 3, repeat: -1, delay: Math.random() * 3, ease: 'none' });
        }
      }

      const heroCta = document.getElementById('heroCta');
      if (heroCta) {
        heroCta.addEventListener('mousemove', function (e) {
          const rect = heroCta.getBoundingClientRect();
          const dx = (e.clientX - rect.left - rect.width / 2) * 0.1;
          const dy = (e.clientY - rect.top - rect.height / 2) * 0.1;
          gsap.to(heroCta, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
        });
        heroCta.addEventListener('mouseleave', function () {
          gsap.to(heroCta, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
        });
      }

      // Section titles animation
      function splitTextForAnimation(selector: string) {
        document.querySelectorAll(selector).forEach(function (el: Element) {
          const hasComplexChildren = Array.from(el.children).some((child) => child.tagName !== 'BR');
          if (hasComplexChildren) return;
          const html = el.innerHTML;
          const newHtml = html.replace(/(?![^<]*>)[^<>\s]+/g, '<span class="split-word" style="display:inline-block; opacity:0; transform:translateY(30px);">$&</span>');
          el.innerHTML = newHtml;
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'none';
        });
      }

      splitTextForAnimation('.section-title.anim-reveal');

      document.querySelectorAll('.anim-reveal').forEach(function (el: Element) {
        if (el.classList.contains('section-title') && el.querySelector('.split-word')) {
          const words = el.querySelectorAll('.split-word');
          gsap.to(words, {
            y: 0, opacity: 1, duration: 1.2, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          });
        } else {
          gsap.to(el, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          });
        }
      });

      // Watermarks
      document.querySelectorAll('.section-watermark').forEach(function (wm: Element) {
        gsap.to(wm, {
          y: 150,
          scrollTrigger: { trigger: (wm as HTMLElement).closest('.section'), start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });

      // Geometric shapes
      document.querySelectorAll('.bg-geometry').forEach(function (shape: Element) {
        const el = shape as HTMLElement;
        const baseSpeed = parseFloat(el.dataset.scrubSpeed || '0.5') || 0.5;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el.closest('.section'), start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
        if (el.classList.contains('scroll-spin')) tl.to(el, { rotation: 720 * baseSpeed, x: 1000 * baseSpeed, y: 1000 * baseSpeed }, 0);
        else if (el.classList.contains('scroll-float')) tl.to(el, { y: 2000 * baseSpeed, x: -1200 * baseSpeed, rotation: 360 * baseSpeed }, 0);
        else if (el.classList.contains('scroll-scale')) tl.to(el, { scale: 3 + Math.abs(baseSpeed), y: -1500 * baseSpeed, x: 800 * baseSpeed }, 0);
        else if (el.classList.contains('scroll-scale-reverse')) tl.to(el, { scale: 0.1, y: 1500 * baseSpeed, x: -1500 * baseSpeed, rotation: -360 * baseSpeed }, 0);
      });

      // Problem section
      ScrollTrigger.create({
        trigger: '#problem', start: 'top 70%', once: true,
        onEnter: function () {
          const drops = document.querySelectorAll('.water-drop');
          const waterDropsContainer = document.getElementById('waterDrops');
          drops.forEach(function (drop, index) {
            gsap.to(drop, {
              opacity: 1, duration: 0.4, delay: index * 0.1,
              onComplete: function () { setTimeout(() => drop.classList.add('evaporate'), 600 + index * 150); },
            });
          });
          if (waterDropsContainer) {
            setTimeout(() => {
              gsap.to(waterDropsContainer, { height: 0, marginBottom: 0, opacity: 0, duration: 0.5, ease: 'power2.inOut' });
            }, 2500 + 4 * 150);
          }
          gsap.to('.problem-card', { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, delay: 0.5, ease: 'power2.out' });
        },
      });

      document.querySelectorAll('.problem-card').forEach(function (card: Element) {
        const el = card as HTMLElement;
        const speed = parseFloat(el.dataset.speed || '0') || 0;
        if (speed !== 0 && window.innerWidth > 768) {
          gsap.to(card, { y: speed * -60, scrollTrigger: { trigger: '#problem', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        }
      });

      // Hardware section
      ScrollTrigger.create({
        trigger: '#hardware', start: 'top 80%', once: true,
        onEnter: function () {
          gsap.to('.device-float', { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power2.out' });
        },
      });

      document.querySelectorAll('.device-float').forEach(function (device: Element) {
        const el = device as HTMLElement;
        const speed = parseFloat(el.dataset.speed || '0') || 0;
        if (window.innerWidth > 768) {
          gsap.to(device, { y: speed * -80, scrollTrigger: { trigger: '#hardware', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        }
      });

      // RAG Network Canvas
      const networkCanvas = document.getElementById('networkCanvas') as HTMLCanvasElement | null;
      if (networkCanvas) {
        const nCtx = networkCanvas.getContext('2d')!;
        type Node = { x: number; y: number; r: number; vx: number; vy: number; opacity: number };
        let nodes: Node[] = [];
        let networkActive = false;

        function initNodes() {
          nodes = [];
          for (let n = 0; n < 90; n++) {
            nodes.push({ x: Math.random() * networkCanvas!.width, y: Math.random() * networkCanvas!.height, r: Math.random() * 2.5 + 0.5, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, opacity: Math.random() * 0.4 + 0.1 });
          }
        }
        function resizeNetwork() {
          networkCanvas!.width = networkCanvas!.offsetWidth;
          networkCanvas!.height = networkCanvas!.offsetHeight;
          initNodes();
        }
        resizeNetwork();
        window.addEventListener('resize', resizeNetwork);

        function drawNetwork() {
          if (!networkActive) return;
          nCtx.clearRect(0, 0, networkCanvas!.width, networkCanvas!.height);
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            node.x += node.vx; node.y += node.vy;
            if (node.x < 0 || node.x > networkCanvas!.width) node.vx *= -1;
            if (node.y < 0 || node.y > networkCanvas!.height) node.vy *= -1;
            nCtx.beginPath(); nCtx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            nCtx.fillStyle = `rgba(0, 255, 136, ${node.opacity})`; nCtx.fill();
          }
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x; const dy = nodes[i].y - nodes[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 100) {
                nCtx.beginPath(); nCtx.moveTo(nodes[i].x, nodes[i].y); nCtx.lineTo(nodes[j].x, nodes[j].y);
                nCtx.strokeStyle = `rgba(0, 255, 136, ${0.06 * (1 - dist / 100)})`; nCtx.lineWidth = 0.5; nCtx.stroke();
              }
            }
          }
          requestAnimationFrame(drawNetwork);
        }

        ScrollTrigger.create({
          trigger: '#rag', start: 'top 80%', end: 'bottom 20%',
          onEnter: () => { networkActive = true; drawNetwork(); },
          onLeave: () => { networkActive = false; },
          onEnterBack: () => { networkActive = true; drawNetwork(); },
          onLeaveBack: () => { networkActive = false; },
        });
      }

      ScrollTrigger.create({
        trigger: '#rag', start: 'top 60%', once: true,
        onEnter: function () {
          gsap.to('.prediction-card', { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, delay: 0.3, ease: 'power2.out' });
        },
      });

      // Operation section
      ScrollTrigger.create({
        trigger: '#operation', start: 'top 65%', once: true,
        onEnter: function () {
          gsap.to('.op-card', { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' });
        },
      });

      document.querySelectorAll('.op-card').forEach(function (card: Element) {
        const el = card as HTMLElement;
        const speed = parseFloat(el.dataset.speed || '0') || 0;
        if (speed !== 0 && window.innerWidth > 768) {
          gsap.to(card, { y: speed * -50, scrollTrigger: { trigger: '#operation', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        }
      });

      // Security shield canvas
      const shieldCanvas = document.getElementById('shieldCanvas') as HTMLCanvasElement | null;
      if (shieldCanvas) {
        const sCtx = shieldCanvas.getContext('2d')!;
        type Particle = { x: number; y: number; r: number; vx: number; vy: number; opacity: number };
        let particles: Particle[] = [];
        let shieldActive = false;

        function initParticles() {
          particles = [];
          for (let s = 0; s < 90; s++) {
            particles.push({ x: Math.random() * shieldCanvas!.width, y: Math.random() * shieldCanvas!.height, r: Math.random() * 2 + 0.5, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, opacity: Math.random() * 0.4 + 0.1 });
          }
        }
        function resizeShield() {
          shieldCanvas!.width = shieldCanvas!.offsetWidth;
          shieldCanvas!.height = shieldCanvas!.offsetHeight;
          initParticles();
        }
        resizeShield();
        window.addEventListener('resize', resizeShield);

        function drawShield() {
          if (!shieldActive) return;
          sCtx.clearRect(0, 0, shieldCanvas!.width, shieldCanvas!.height);
          for (let i = 0; i < particles.length; i++) {
            const pt = particles[i];
            pt.x += pt.vx; pt.y += pt.vy;
            if (pt.x < 0 || pt.x > shieldCanvas!.width) pt.vx *= -1;
            if (pt.y < 0 || pt.y > shieldCanvas!.height) pt.vy *= -1;
            sCtx.beginPath(); sCtx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
            sCtx.fillStyle = `rgba(0, 255, 136, ${pt.opacity})`; sCtx.fill();
          }
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 140) {
                sCtx.beginPath(); sCtx.moveTo(particles[i].x, particles[i].y); sCtx.lineTo(particles[j].x, particles[j].y);
                sCtx.strokeStyle = `rgba(0, 255, 136, ${0.08 * (1 - dist / 140)})`; sCtx.lineWidth = 0.5; sCtx.stroke();
              }
            }
          }
          requestAnimationFrame(drawShield);
        }

        ScrollTrigger.create({
          trigger: '#security', start: 'top 80%', end: 'bottom 20%',
          onEnter: () => { shieldActive = true; drawShield(); },
          onLeave: () => { shieldActive = false; },
          onEnterBack: () => { shieldActive = true; drawShield(); },
          onLeaveBack: () => { shieldActive = false; },
        });
      }

      ScrollTrigger.create({
        trigger: '#security', start: 'top 60%', once: true,
        onEnter: function () {
          gsap.to('.sec-card', { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, delay: 0.2, ease: 'power2.out' });
        },
      });

      document.querySelectorAll('.sec-card').forEach(function (card: Element) {
        const el = card as HTMLElement;
        const speed = parseFloat(el.dataset.speed || '0') || 0;
        if (speed !== 0 && window.innerWidth > 768) {
          gsap.to(card, { y: speed * -50, scrollTrigger: { trigger: '#security', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        }
      });

      gsap.to('.orb-1', { y: -70, x: 25, scrollTrigger: { trigger: '#security', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('.orb-2', { y: 50, x: -18, scrollTrigger: { trigger: '#security', start: 'top bottom', end: 'bottom top', scrub: 1 } });

      // Vision section
      ScrollTrigger.create({
        trigger: '#vision', start: 'top 55%', once: true,
        onEnter: function () {
          gsap.to('.cta-button', { opacity: 1, y: 0, duration: 0.6, delay: 0.7, ease: 'power2.out' });
        },
      });

      gsap.to('.vbg-1', { y: -50, x: -25, rotation: 12, scrollTrigger: { trigger: '#vision', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('.vbg-2', { y: 35, x: 18, rotation: -8, scrollTrigger: { trigger: '#vision', start: 'top bottom', end: 'bottom top', scrub: 1 } });

      const ctaButton = document.getElementById('ctaButton');
      if (ctaButton) {
        ctaButton.addEventListener('mousemove', function (e) {
          const rect = ctaButton.getBoundingClientRect();
          const dx = (e.clientX - rect.left - rect.width / 2) * 0.12;
          const dy = (e.clientY - rect.top - rect.height / 2) * 0.12;
          gsap.to(ctaButton, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
        });
        ctaButton.addEventListener('mouseleave', function () {
          gsap.to(ctaButton, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
        });
      }

      // Lab pinned section
      if (document.querySelector('.lab-pin-container')) {
        const mm = gsap.matchMedia();
        mm.add('(min-width: 769px)', () => {
          const labTl = gsap.timeline({
            scrollTrigger: { trigger: '.lab-pin-container', start: 'top top', end: '+=500%', pin: true, scrub: 1 },
          });
          labTl.to('#lab-box-1', { opacity: 1, x: 0, y: 0, duration: 1 });
          labTl.to('#lab-box-2', { opacity: 1, x: 0, y: 0, duration: 1 }, '-=0.5');
          labTl.to({}, { duration: 1.2 });
          labTl.to('#lab-box-1', { opacity: 0, y: -40, duration: 0.8 });
          labTl.to('#lab-box-3', { opacity: 1, x: 0, y: 0, duration: 1 }, '-=0.4');
          labTl.to({}, { duration: 1.2 });
          labTl.to('#lab-box-2', { opacity: 0, x: 40, duration: 0.8 });
          labTl.to('#lab-box-4', { opacity: 1, x: 0, y: 0, duration: 1 }, '-=0.4');
          labTl.to({}, { duration: 1.5 });
        });
        mm.add('(max-width: 768px)', () => {
          const labTl = gsap.timeline({
            scrollTrigger: { trigger: '.lab-pin-container', start: 'top top', end: '+=400%', pin: true, scrub: 1 },
          });
          labTl.to('#lab-box-1', { opacity: 1, y: 0, duration: 1 });
          labTl.to('#lab-box-1', { opacity: 0, y: -20, duration: 0.5 }, '+=1');
          labTl.to('#lab-box-2', { opacity: 1, y: 0, duration: 1 });
          labTl.to('#lab-box-2', { opacity: 0, y: -20, duration: 0.5 }, '+=1');
          labTl.to('#lab-box-3', { opacity: 1, y: 0, duration: 1 });
          labTl.to('#lab-box-3', { opacity: 0, y: -20, duration: 0.5 }, '+=1');
          labTl.to('#lab-box-4', { opacity: 1, y: 0, duration: 1 });
          labTl.to({}, { duration: 1 });
        });
      }

      // Glass card 3D tilt
      document.querySelectorAll('.glass-card').forEach(function (card: Element) {
        card.addEventListener('mousemove', function (e) {
          const me = e as MouseEvent;
          const rect = (card as HTMLElement).getBoundingClientRect();
          const x = (me.clientX - rect.left) / rect.width - 0.5;
          const y = (me.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, duration: 0.4, ease: 'power2.out', transformPerspective: 600 });
          const shine = card.querySelector('.glass-card-shine');
          if (shine) gsap.to(shine, { x: x * 60, y: y * 60, duration: 0.4 });
        });
        card.addEventListener('mouseleave', function () {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
          const shine = card.querySelector('.glass-card-shine');
          if (shine) gsap.to(shine, { x: 0, y: 0, duration: 0.6 });
        });
      });

      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const href = anchor.getAttribute('href');
          if (!href) return;
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    };

    // Wait for GSAP to load from CDN
    loadAnimations();
  }, []);

  return (
    <>
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
          <button
            onClick={toggleLang}
            aria-label="Switch language"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,255,136,0.35)',
              color: '#00FF88',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '.08em',
              cursor: 'pointer',
              marginRight: '12px',
              transition: 'all .2s',
            }}
          >
            {t.langToggle}
          </button>
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
          <a href="#hero" className="mobile-link">{t.nav.home}</a>
          <a href="#problem" className="mobile-link">{t.nav.problem}</a>
          <a href="#hardware" className="mobile-link">{t.nav.hardware}</a>
          <a href="#rag" className="mobile-link">{t.nav.intelligence}</a>
          <a href="#operation" className="mobile-link">{t.nav.operation}</a>
          <a href="#security" className="mobile-link">{t.nav.security}</a>
          <a href="#vision" className="mobile-link mobile-link-cta">{t.nav.join}</a>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="section hero-section">
        <div className="hero-video-container">
          <img src="/drone.jpeg" className="hero-video" id="heroVideo" alt="Drone view" />
          <div className="hero-video-overlay"></div>
        </div>
        <div className="hero-particles" id="heroParticles"></div>
        <div className="hero-content" id="heroContent">
          <h1 className="hero-title" id="heroTitle">
            <span className="title-line title-line-top">To be, or</span>
            <span className="title-line title-line-bottom">
              <span className="highlight-nat" id="heroNatTrigger">NAT</span>
              <br id="natBreak" style={{ display: 'none' }} />
              <span id="toBeText"> to be.</span>
            </span>
          </h1>
          <p className="hero-subtitle" id="heroSubtitle">{t.hero.subtitle}</p>
          <div className="hero-cta-row">
            <a href="#core-vision" className="hero-cta" id="heroCta">
              <span className="hero-cta-text">{t.hero.exploreBtn}</span>
              <i className="fa-solid fa-arrow-right hero-cta-arrow"></i>
              <span className="hero-cta-glow"></span>
            </a>
            <a href={t.hero.pdf} className="hero-cta-secondary" download>
              <i className="fa-solid fa-file-pdf"></i>
              <span>{t.hero.pitchBtn}</span>
            </a>
          </div>
          <div className="hero-float hero-float-1" data-speed="0.3"></div>
          <div className="hero-float hero-float-2" data-speed="-0.5"></div>
          <div className="hero-float hero-float-3" data-speed="0.7"></div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="section problem-section">
        <div className="section-watermark">PROBLEM</div>
        <div className="bg-geometry shape-circle scroll-spin" data-scrub-speed="1.2"></div>
        <div className="bg-geometry shape-triangle scroll-float" data-scrub-speed="-0.8"></div>
        <div className="container">
          <span className="section-tag"><i className="fa-solid fa-triangle-exclamation"></i> {t.problem.tag}</span>
          <h2 className="section-title anim-reveal">{t.problem.title}</h2>
          <p className="section-desc anim-reveal" dangerouslySetInnerHTML={{ __html: t.problem.desc }} />
          <div className="water-drops" id="waterDrops">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="water-drop">
                <svg viewBox="0 0 40 56">
                  <path d="M20 2C20 2 2 24 2 36C2 46 10 54 20 54C30 54 38 46 38 36C38 24 20 2 20 2Z" fill={`url(#wg${i})`} />
                  <defs>
                    <linearGradient id={`wg${i}`} x1="20" y1="2" x2="20" y2="54">
                      <stop offset="0%" stopColor="#4FC3F7" />
                      <stop offset="100%" stopColor="#0288D1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            ))}
          </div>
          <div className="problem-grid">
            <div className="glass-card problem-card" data-speed="0.15">
              <div className="glass-card-shine"></div>
              <div className="card-icon-wrap"><i className="fa-solid fa-droplet-slash"></i></div>
              <h4>{t.problem.card1Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.problem.card1Desc }} />
            </div>
            <div className="glass-card problem-card" data-speed="-0.2">
              <div className="glass-card-shine"></div>
              <div className="card-icon-wrap warn"><i className="fa-solid fa-temperature-arrow-up"></i></div>
              <h4>{t.problem.card2Title}</h4>
              <p>{t.problem.card2Desc}</p>
            </div>
            <div className="glass-card problem-card" data-speed="0.25">
              <div className="glass-card-shine"></div>
              <div className="card-icon-wrap info"><i className="fa-solid fa-link-slash"></i></div>
              <h4>{t.problem.card3Title}</h4>
              <p>{t.problem.card3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Vision Section */}
      <section id="core-vision" className="section hardware-section" style={{ background: 'var(--dark)', paddingBottom: '4rem' }}>
        <div className="container">
          <span className="section-tag tag-green"><i className="fa-solid fa-earth-americas"></i> {t.coreVision.tag}</span>
          <h2 className="section-title anim-reveal" dangerouslySetInnerHTML={{ __html: t.coreVision.title.replace('\n', '<br/>') }} />
          <p className="section-desc anim-reveal" dangerouslySetInnerHTML={{ __html: t.coreVision.desc }} />
          <div className="features-grid">
            <div className="glass-card feature-card">
              <div className="glass-card-shine"></div>
              <div className="feature-icon-wrap"><i className="fa-solid fa-temperature-arrow-up"></i></div>
              <h4>{t.coreVision.feat1Title}</h4>
              <p>{t.coreVision.feat1Desc}</p>
            </div>
            <div className="glass-card feature-card">
              <div className="glass-card-shine"></div>
              <div className="feature-icon-wrap"><i className="fa-solid fa-droplet"></i></div>
              <h4>{t.coreVision.feat2Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.coreVision.feat2Desc }} />
            </div>
            <div className="glass-card feature-card">
              <div className="glass-card-shine"></div>
              <div className="feature-icon-wrap"><i className="fa-solid fa-microchip"></i></div>
              <h4>{t.coreVision.feat3Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.coreVision.feat3Desc }} />
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Section */}
      <section id="hardware" className="section hardware-section" style={{ paddingTop: '4rem' }}>
        <div className="section-watermark">{t.hardware.watermark}</div>
        <div className="bg-geometry shape-ring scroll-scale" data-scrub-speed="0.5"></div>
        <div className="bg-geometry shape-ring scroll-scale-reverse" data-scrub-speed="-0.3"></div>
        <div className="container">
          <span className="section-tag tag-green"><i className="fa-solid fa-microchip"></i> {t.hardware.tag}</span>
          <h2 className="section-title anim-reveal">{t.hardware.title}</h2>
          <p className="section-desc anim-reveal">{t.hardware.desc}</p>
          <div className="devices-showcase">
            <div className="device-float" data-speed="-0.3">
              <div className="glass-card device-card green-glow">
                <div className="glass-card-shine"></div>
                <img src="/assets/sensTree.png" alt="sensTree" className="device-image" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'cover' }} />
                <h2 className="sensor-title" data-shadow="sensTree">sensTree</h2>
                <p dangerouslySetInnerHTML={{ __html: t.hardware.sensTreeDesc }} />
              </div>
            </div>
            <div className="device-float" data-speed="0.2">
              <div className="glass-card device-card green-glow">
                <div className="glass-card-shine"></div>
                <img src="/assets/sensSoil.png" alt="sensSoil" className="device-image" style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'cover' }} />
                <h2 className="sensor-title" data-shadow="sensSoil">sensSoil</h2>
                <p dangerouslySetInnerHTML={{ __html: t.hardware.sensSoilDesc }} />
              </div>
            </div>
            <div className="device-float" data-speed="-0.15">
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

      {/* RAG Section */}
      <section id="rag" className="section rag-section">
        <div className="section-watermark">{t.rag.watermark}</div>
        <canvas id="networkCanvas" className="network-canvas"></canvas>
        <div className="bg-geometry shape-hex scroll-spin" data-scrub-speed="-1"></div>
        <div className="container rag-container">
          <span className="section-tag tag-green"><i className="fa-solid fa-brain"></i> {t.rag.tag}</span>
          <h2 className="section-title anim-reveal">{t.rag.title}</h2>
          <p className="section-desc anim-reveal">{t.rag.desc}</p>
          <div className="glass-card prediction-card green-glow">
            <div className="glass-card-shine"></div>
            <div className="pred-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
            <div className="pred-text">
              <h4>{t.rag.pred1Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.rag.pred1Desc }} />
            </div>
          </div>
          <div className="glass-card prediction-card green-glow" style={{ marginTop: '1rem' }}>
            <div className="glass-card-shine"></div>
            <div className="pred-icon"><i className="fa-solid fa-network-wired"></i></div>
            <div className="pred-text">
              <h4>{t.rag.pred2Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.rag.pred2Desc }} />
            </div>
          </div>
        </div>
      </section>

      {/* Operation Section */}
      <section id="operation" className="section operation-section">
        <div className="section-watermark">{t.operation.watermark}</div>
        <div className="container">
          <span className="section-tag tag-green"><i className="fa-solid fa-robot"></i> {t.operation.tag}</span>
          <h2 className="section-title anim-reveal">{t.operation.title}</h2>
          <p className="section-desc anim-reveal">{t.operation.desc}</p>
          <div className="op-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', maxWidth: '900px', margin: '0 auto 3rem' }}>
            <div className="glass-card op-card" data-speed="0.2">
              <div className="glass-card-shine"></div>
              <div className="op-icon-wrap"><i className="fa-solid fa-tower-cell"></i></div>
              <h4>{t.operation.card1Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.operation.card1Desc }} />
            </div>
            <div className="glass-card op-card" data-speed="-0.15">
              <div className="glass-card-shine"></div>
              <div className="op-icon-wrap"><i className="fa-solid fa-leaf"></i></div>
              <h4>{t.operation.card2Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.operation.card2Desc }} />
            </div>
          </div>
        </div>
      </section>

      {/* Lab Test Section */}
      <section id="lab-test" className="lab-pin-section">
        <div className="lab-pin-container">
          <div className="lab-pin-title">
            <h2>{t.lab.title}</h2>
            <p>{t.lab.subtitle}</p>
          </div>
          <div className="lab-video-bg">
            <img src="/lab.jpg" className="lab-video-element" alt="Lab view" />
            <div className="lab-video-overlay"></div>
          </div>
          <div className="lab-glasses-track">
            <div className="glass-card lab-text-box box-tl anim-box" id="lab-box-1" style={{ borderRadius: '40px 10px 40px 10px', borderWidth: '2px' }}>
              <div className="glass-card-shine"></div>
              <div className="box-number-wrap">1</div>
              <h4>{t.lab.box1Title}</h4>
              <p>{t.lab.box1Desc}</p>
            </div>
            <div className="glass-card lab-text-box box-rm anim-box" id="lab-box-2" style={{ borderRadius: '10px 40px 10px 40px', borderWidth: '3px' }}>
              <div className="glass-card-shine"></div>
              <div className="box-number-wrap">2</div>
              <h4>{t.lab.box2Title}</h4>
              <p>{t.lab.box2Desc}</p>
            </div>
            <div className="glass-card lab-text-box box-bl anim-box" id="lab-box-3" style={{ borderRadius: '35px 35px 0 35px', borderWidth: '2px' }}>
              <div className="glass-card-shine"></div>
              <div className="box-number-wrap">3</div>
              <h4>{t.lab.box3Title}</h4>
              <p>{t.lab.box3Desc}</p>
            </div>
            <div className="glass-card lab-text-box box-tr anim-box" id="lab-box-4" style={{ borderRadius: '10px 0 35px 10px', borderWidth: '4px' }}>
              <div className="glass-card-shine"></div>
              <div className="box-number-wrap">4</div>
              <h4>{t.lab.box4Title}</h4>
              <p>{t.lab.box4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="section security-section">
        <div className="section-watermark">{t.security.watermark}</div>
        <canvas id="shieldCanvas" className="shield-canvas"></canvas>
        <div className="container security-container">
          <span className="section-tag tag-green"><i className="fa-solid fa-shield-halved"></i> {t.security.tag}</span>
          <h2 className="section-title anim-reveal">{t.security.title}<br />{t.security.title2}</h2>
          <p className="section-desc anim-reveal" dangerouslySetInnerHTML={{ __html: t.security.desc }} />
          <div className="sec-grid">
            <div className="glass-card sec-card green-glow" data-speed="0.15">
              <div className="glass-card-shine"></div>
              <div className="sec-icon-wrap"><i className="fa-solid fa-lock"></i></div>
              <h4>{t.security.card1Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.security.card1Desc }} />
              <div className="sec-detail"><i className="fa-solid fa-eye-slash"></i> {t.security.card1Badge}</div>
            </div>
            <div className="glass-card sec-card green-glow" data-speed="-0.2">
              <div className="glass-card-shine"></div>
              <div className="sec-icon-wrap"><i className="fa-solid fa-fingerprint"></i></div>
              <h4>{t.security.card2Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.security.card2Desc }} />
              <div className="sec-detail"><i className="fa-solid fa-barcode"></i> {t.security.card2Badge}</div>
            </div>
            <div className="glass-card sec-card green-glow" data-speed="0.25">
              <div className="glass-card-shine"></div>
              <div className="sec-icon-wrap"><i className="fa-solid fa-database"></i></div>
              <h4>{t.security.card3Title}</h4>
              <p dangerouslySetInnerHTML={{ __html: t.security.card3Desc }} />
              <div className="sec-detail"><i className="fa-solid fa-clock-rotate-left"></i> {t.security.card3Badge}</div>
            </div>
          </div>
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="section vision-section">
        <div className="vision-bg">
          <div className="vbg-shape vbg-1"></div>
          <div className="vbg-shape vbg-2"></div>
          <div className="vbg-shape vbg-3"></div>
          <div className="bg-geometry shape-hexa scroll-spin" data-scrub-speed="1.5"></div>
        </div>
        <div className="container vision-container">
          <span className="section-tag tag-green" style={{ marginBottom: '1rem' }}>
            <i className="fa-solid fa-rocket"></i> {t.vision.tag}
          </span>
          <h2 className="section-title anim-reveal vision-title">
            {t.vision.title}<br />{t.vision.title2}
          </h2>
          <p className="section-desc anim-reveal">
            {t.vision.desc1}
            <br /><br />
            {t.vision.desc2}
          </p>
          <Link href="/iletisim" className="cta-button" id="ctaButton" style={{ marginTop: '2rem' }}>
            <span className="cta-btn-text">{t.vision.cta}</span>
            <i className="fa-solid fa-arrow-right cta-btn-icon"></i>
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
              <a href="#hardware"><i className="fa-solid fa-microchip"></i> sensSeries</a>
              <a href="#rag"><i className="fa-solid fa-brain"></i> RAG</a>
              <a href="#operation"><i className="fa-solid fa-robot"></i> {t.operation.tag}</a>
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
