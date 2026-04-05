'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;

// ── Timeline constants ────────────────────────────────────────────────────────
const TITLE_EXIT_END = 0.45;
const CARD_START = 0.55;
const CARD_STAGGER = 0.42;
const ENTER_DUR = 0.32;

const benefits = [
  { number: '01', title: 'Rich in Antioxidants', description: 'Packed with natural antioxidants that support overall health and well-being.' },
  { number: '02', title: 'Natural Energy Booster', description: 'A great source of natural sugars for a quick and sustained energy boost.' },
  { number: '03', title: 'Soothes Throat & Cough', description: 'A natural remedy for throat irritation and coughs, known for its soothing properties.' },
  { number: '04', title: 'Supports Digestive Health', description: 'Contains enzymes that aid in digestion and promote a healthy gut.' },
  { number: '05', title: 'Skin Nourishment', description: 'Used in skincare routines for its moisturizing and healing properties.' },
  { number: '06', title: 'Sustainable Choice', description: 'Supports eco-friendly beekeeping practices and the preservation of pollinators.' },
];

const leftBenefits = [benefits[0], benefits[2], benefits[4]];
const rightBenefits = [benefits[1], benefits[3], benefits[5]];

function getFramePath(index: number): string {
  return `/images/banner-sequence/ezgif-frame-${String(index).padStart(3, '0')}.webp`;
}

function animateCardIn(
  tl: gsap.core.Timeline,
  el: HTMLDivElement,
  enterAt: number,
  fromX: number,
) {
  tl.fromTo(
    el,
    { x: fromX, y: 30, opacity: 0, filter: 'blur(10px)' },
    { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: ENTER_DUR, ease: 'power3.out' },
    enterAt,
  );

  const line = el.querySelector<HTMLElement>('.b-line');
  const num = el.querySelector<HTMLElement>('.b-num');
  const title = el.querySelector<HTMLElement>('.b-title');
  const desc = el.querySelector<HTMLElement>('.b-desc');

  if (line) tl.fromTo(line, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: ENTER_DUR * 0.7, ease: 'power3.out' }, enterAt + 0.04);
  if (num) tl.fromTo(num, { opacity: 0, x: fromX * 0.3 }, { opacity: 1, x: 0, duration: ENTER_DUR * 0.7 }, enterAt + 0.07);
  if (title) tl.fromTo(title, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: ENTER_DUR * 0.8, ease: 'power2.out' }, enterAt + 0.11);
  if (desc) tl.fromTo(desc, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: ENTER_DUR * 0.7, ease: 'power2.out' }, enterAt + 0.17);
}

export default function BannerSequence() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Detect mobile once on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setMounted(true);
  }, []);

  // Desktop-only GSAP animation setup
  useEffect(() => {
    if (!mounted || isMobile) return;

    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const title = titleRef.current;
    const scrollHint = scrollHintRef.current;
    if (!canvas || !container || !title) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames: HTMLImageElement[] = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image();
      img.src = getFramePath(i + 1);
      return img;
    });

    const state = { frame: 0 };

    function renderFrame(index: number) {
      const img = frames[index];
      if (!img?.complete || !canvas) return;
      const { naturalWidth, naturalHeight } = img;
      const dpr = window.devicePixelRatio || 1;
      const displayW = canvas.offsetWidth;
      const displayH = canvas.offsetHeight;
      const imgAspect = naturalWidth / naturalHeight;
      const canvasAspect = displayW / displayH;

      let drawW: number, drawH: number, offsetX: number, offsetY: number;
      if (imgAspect > canvasAspect) {
        drawH = displayH; drawW = drawH * imgAspect;
        offsetX = (displayW - drawW) / 2; offsetY = 0;
      } else {
        drawW = displayW; drawH = drawW / imgAspect;
        offsetX = 0; offsetY = (displayH - drawH) / 2;
      }

      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      ctx?.scale(dpr, dpr);
      ctx?.clearRect(0, 0, displayW, displayH);
      ctx?.drawImage(img, offsetX, offsetY, drawW, drawH);
    }

    frames[0].onload = () => renderFrame(0);
    if (frames[0].complete) renderFrame(0);

    const frameTrigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: () => container.offsetTop + window.innerHeight * 4,
      scrub: 1,
      onUpdate: (self) => {
        const idx = Math.min(FRAME_COUNT - 1, Math.floor(self.progress * FRAME_COUNT));
        if (idx !== state.frame) { state.frame = idx; renderFrame(idx); }
      },
    });

    gsap.fromTo(
      title,
      { filter: 'blur(28px)', opacity: 0, y: 40 },
      { filter: 'blur(0px)', opacity: 1, y: 0, duration: 1.8, ease: 'power3.out', delay: 0.3 },
    );
    if (scrollHint) {
      gsap.fromTo(
        scrollHint,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 2.2 },
      );
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 3,
      },
    });

    tl.to(title, { y: -220, opacity: 0, filter: 'blur(20px)', duration: TITLE_EXIT_END, ease: 'power2.inOut' }, 0);
    if (scrollHint) tl.to(scrollHint, { opacity: 0, duration: 0.25 }, 0);

    const revealOrder: { ref: HTMLDivElement | null; fromX: number }[] = [
      { ref: leftRefs.current[0], fromX: -90 },
      { ref: rightRefs.current[0], fromX: 90 },
      { ref: leftRefs.current[1], fromX: -90 },
      { ref: rightRefs.current[1], fromX: 90 },
      { ref: leftRefs.current[2], fromX: -90 },
      { ref: rightRefs.current[2], fromX: 90 },
    ];

    revealOrder.forEach(({ ref, fromX }, i) => {
      if (!ref) return;
      animateCardIn(tl, ref, CARD_START + i * CARD_STAGGER, fromX);
    });

    const totalDuration = CARD_START + revealOrder.length * CARD_STAGGER + 0.8;
    tl.to({}, {}, totalDuration);

    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    const handleResize = () => renderFrame(state.frame);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      frameTrigger.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, isMobile]);

  // Pre-hydration placeholder prevents layout shift
  if (!mounted) {
    return <div className="h-screen bg-black" />;
  }

  // ── Mobile: static last frame + all cards visible ─────────────────────────
  if (isMobile) {
    return (
      <section>
        {/* Full-screen hero with last frame */}
        <div className="relative h-screen bg-black overflow-hidden">
          <img
            src={getFramePath(FRAME_COUNT)}
            alt="Wildflower honey"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/38 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
            <span className="text-[10px] tracking-[0.55em] uppercase text-primary-extra-light mb-6 font-light">
              Sadheeya
            </span>
            <h1
              className="font-black tracking-tighter leading-[0.88] uppercase"
              style={{ fontSize: 'clamp(3rem,15vw,5.5rem)' }}
            >
              Wild Flower
              <br />
              <span className="text-primary-extra-light">Honey</span>
            </h1>
            <p className="mt-4 text-white/40 text-xs tracking-[0.4em] uppercase font-light">
              100% Raw · Unfiltered · Pure
            </p>
          </div>
        </div>

        {/* All benefit cards — single column, full opacity */}
        <div className="bg-black px-6 py-12">
          <div className="flex flex-col gap-10 max-w-sm mx-auto">
            {benefits.map((b) => (
              <div key={b.number}>
                <div className="h-px bg-primary-extra-light mb-4" style={{ width: 56 }} />
                <p
                  className="font-black leading-none mb-2 select-none"
                  style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.3)' }}
                >
                  {b.number}
                </p>
                <h2 className="font-bold text-white leading-tight mb-2 text-lg">
                  {b.title}
                </h2>
                <p className="text-white/55 text-sm leading-relaxed font-light">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Desktop: full scroll-driven animation ─────────────────────────────────
  return (
    <section ref={containerRef} className="relative h-[550vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute inset-0 bg-black/38 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

        <div
          ref={titleRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6"
          style={{ opacity: 0 }}
        >
          <span className="text-[10px] md:text-xs tracking-[0.55em] uppercase text-primary-extra-light mb-6 font-light">
            Sadheeya
          </span>
          <h1 className="font-black tracking-tighter leading-[0.88] uppercase" style={{ fontSize: 'clamp(3.5rem,10vw,8rem)' }}>
            Wild Flower
            <br />
            <span className="text-primary-extra-light">Honey</span>
          </h1>
          <p className="mt-4 text-white/40 text-xs md:text-sm tracking-[0.4em] uppercase font-light">
            100% Raw &nbsp;·&nbsp; Unfiltered &nbsp;·&nbsp; Pure
          </p>
          <div
            ref={scrollHintRef}
            className="absolute bottom-10 flex flex-col items-center gap-2"
            style={{ opacity: 0 }}
          >
            <span className="text-white/40 text-[10px] tracking-[0.45em] uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center px-8 md:px-14 lg:px-24">
          <div className="w-full max-w-5xl flex gap-0">

            <div className="flex-1 flex flex-col gap-10 pr-8 md:pr-14 lg:pr-20">
              {leftBenefits.map((b, i) => (
                <div
                  key={b.number}
                  ref={(el) => { leftRefs.current[i] = el; }}
                  style={{ opacity: 0 }}
                >
                  <div className="b-line h-px bg-primary-extra-light mb-4 origin-left" style={{ width: 56 }} />
                  <p className="b-num font-black leading-none mb-1 select-none" style={{ fontSize: 'clamp(2.8rem,5vw,4.5rem)', color: 'rgba(255,255,255,0.3)' }}>
                    {b.number}
                  </p>
                  <h2 className="b-title font-bold text-white leading-tight mb-2" style={{ fontSize: 'clamp(1.1rem,2vw,1.6rem)' }}>
                    {b.title}
                  </h2>
                  <p className="b-desc text-white/55 text-sm md:text-[0.9rem] leading-relaxed font-light">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>

            <div
              ref={dividerRef}
              className="hidden md:block w-px bg-white/15 flex-shrink-0 self-stretch origin-center"
              style={{ opacity: 0 }}
            />

            <div className="flex-1 flex flex-col gap-10 pl-8 md:pl-14 lg:pl-20">
              {rightBenefits.map((b, i) => (
                <div
                  key={b.number}
                  ref={(el) => { rightRefs.current[i] = el; }}
                  style={{ opacity: 0 }}
                >
                  <div className="b-line h-px bg-primary-extra-light mb-4 origin-left" style={{ width: 56 }} />
                  <p className="b-num font-black leading-none mb-1 select-none" style={{ fontSize: 'clamp(2.8rem,5vw,4.5rem)', color: 'rgba(255,255,255,0.3)' }}>
                    {b.number}
                  </p>
                  <h2 className="b-title font-bold text-white leading-tight mb-2" style={{ fontSize: 'clamp(1.1rem,2vw,1.6rem)' }}>
                    {b.title}
                  </h2>
                  <p className="b-desc text-white/55 text-sm md:text-[0.9rem] leading-relaxed font-light">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
