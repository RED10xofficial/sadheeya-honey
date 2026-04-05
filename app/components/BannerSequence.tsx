'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;

// ── Timeline constants ────────────────────────────────────────────────────────
// Each "unit" of scroll time is a fraction of the total scroll distance.
// Frame sequence covers the first ~4/5 of the scroll (frameTrigger ends at
// containerTop + 4×100vh; total scroll ≈ 500vh with a 600vh section).
// All 6 cards must appear before ~80% of scroll, so we keep total ≤ 4.0 units.
const TITLE_EXIT_END = 0.45;  // title exits fast
const CARD_START = 0.55;  // benefits begin right after title leaves
const CARD_STAGGER = 0.42;  // tight — 6 cards done by ~3.1 units (77% of 4.0)
const ENTER_DUR = 0.32;  // snappy entrance
const DIVIDER_AT = CARD_START - 0.08;

const benefits = [
  {
    number: '01',
    title: 'Rich in Antioxidants',
    description: 'Packed with natural antioxidants that support overall health and well-being.',
  },
  {
    number: '02',
    title: 'Natural Energy Booster',
    description: 'A great source of natural sugars for a quick and sustained energy boost.',
  },
  {
    number: '03',
    title: 'Soothes Throat & Cough',
    description: 'A natural remedy for throat irritation and coughs, known for its soothing properties.',
  },
  {
    number: '04',
    title: 'Supports Digestive Health',
    description: 'Contains enzymes that aid in digestion and promote a healthy gut.',
  },
  {
    number: '05',
    title: 'Skin Nourishment',
    description: 'Used in skincare routines for its moisturizing and healing properties.',
  },
  {
    number: '06',
    title: 'Sustainable Choice',
    description: 'Supports eco-friendly beekeeping practices and the preservation of pollinators.',
  },
];

// Left column: 01, 03, 05  |  Right column: 02, 04, 06
const leftBenefits = [benefits[0], benefits[2], benefits[4]];
const rightBenefits = [benefits[1], benefits[3], benefits[5]];

function getFramePath(index: number): string {
  return `/images/banner-sequence/ezgif-frame-${String(index).padStart(3, '0')}.png`;
}

/** Animate a single benefit card into view and leave it there. */
function animateCardIn(
  tl: gsap.core.Timeline,
  el: HTMLDivElement,
  enterAt: number,
  fromX: number,
) {
  // Card container slides + blurs in
  tl.fromTo(
    el,
    { x: fromX, y: 30, opacity: 0, filter: 'blur(10px)' },
    { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: ENTER_DUR, ease: 'power3.out' },
    enterAt,
  );

  // Internal elements stagger
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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  // leftRefs[0]=top-left (01), [1]=mid-left (03), [2]=bottom-left (05)
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  // rightRefs[0]=top-right (02), [1]=mid-right (04), [2]=bottom-right (06)
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // ── Prevent broken state after refresh at scrolled position ─────────────
    // Browser scroll-restoration puts us mid-page before GSAP initialises,
    // causing fromTo scrub animations to get stuck in their "from" state.
    // Disabling it and jumping to top guarantees a clean starting point.
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const title = titleRef.current;
    const scrollHint = scrollHintRef.current;
    if (!canvas || !container || !title) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preload all frames
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

    // ── Frame scroll animation ────────────────────────────────────────────────
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

    // ── Title blur-in on mount ────────────────────────────────────────────────
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

    // ── Scroll-driven timeline ────────────────────────────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 3,
      },
    });

    // Title + scroll hint exit
    tl.to(title, { y: -220, opacity: 0, filter: 'blur(20px)', duration: TITLE_EXIT_END, ease: 'power2.inOut' }, 0);
    if (scrollHint) tl.to(scrollHint, { opacity: 0, duration: 0.25 }, 0);

    // Divider fades in just before cards start
    // const divider = dividerRef.current;
    // if (divider) {
    //   tl.fromTo(
    //     divider,
    //     { opacity: 0, scaleY: 0 },
    //     { opacity: 1, scaleY: 1, duration: 0.4, ease: 'power2.out' },
    //     DIVIDER_AT,
    //   );
    // }

    // ── Benefits reveal order ────────────────────────────────────────────────
    // Row by row: 01 → 02 → 03 → 04 → 05 → 06
    const revealOrder: { ref: HTMLDivElement | null; fromX: number }[] = [
      { ref: leftRefs.current[0], fromX: -90 }, // 01 top-left
      { ref: rightRefs.current[0], fromX: 90 }, // 02 top-right
      { ref: leftRefs.current[1], fromX: -90 }, // 03 mid-left
      { ref: rightRefs.current[1], fromX: 90 }, // 04 mid-right
      { ref: leftRefs.current[2], fromX: -90 }, // 05 bottom-left
      { ref: rightRefs.current[2], fromX: 90 }, // 06 bottom-right
    ];

    revealOrder.forEach(({ ref, fromX }, i) => {
      if (!ref) return;
      animateCardIn(tl, ref, CARD_START + i * CARD_STAGGER, fromX);
    });

    // Pad so the final state breathes before section ends
    // Keep total ≤ 4.2 so all cards appear well before the frame sequence ends
    const totalDuration = CARD_START + revealOrder.length * CARD_STAGGER + 0.8;
    tl.to({}, {}, totalDuration);

    // After forced scroll-to-top, let the browser settle then recalculate
    // all ScrollTrigger boundaries so scrub progress starts correctly.
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());

    const handleResize = () => renderFrame(state.frame);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      frameTrigger.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-[550vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/* Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/38 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

        {/* ── Hero title ───────────────────────────────────────────────────── */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6"
          style={{ opacity: 0 }}
        >
          <span className="text-[10px] md:text-xs tracking-[0.55em] uppercase text-primary-extra-light mb-6 font-light">
            By Sadheeya
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

        {/* ── Benefits grid ──────────────────────────────────────────────────
             All 6 cards live here permanently; GSAP reveals them one by one.
             Layout: 3 rows × 2 columns with a vertical centre divider.
        ─────────────────────────────────────────────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center px-8 md:px-14 lg:px-24">
          <div className="w-full max-w-5xl flex gap-0">

            {/* ── Left column ── */}
            <div className="flex-1 flex flex-col gap-10 pr-8 md:pr-14 lg:pr-20">
              {leftBenefits.map((b, i) => (
                <div
                  key={b.number}
                  ref={(el) => { leftRefs.current[i] = el; }}
                  style={{ opacity: 0 }}
                >
                  <div className="b-line h-px bg-primary-extra-light mb-4 origin-left" style={{ width: 56 }} />
                  <p
                    className="b-num font-black leading-none mb-1 select-none"
                    style={{ fontSize: 'clamp(2.8rem,5vw,4.5rem)', color: 'rgba(255,255,255,0.3)' }}
                  >
                    {b.number}
                  </p>
                  <h2
                    className="b-title font-bold text-white leading-tight mb-2"
                    style={{ fontSize: 'clamp(1.1rem,2vw,1.6rem)' }}
                  >
                    {b.title}
                  </h2>
                  <p className="b-desc text-white/55 text-sm md:text-[0.9rem] leading-relaxed font-light">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Centre divider ── */}
            <div
              ref={dividerRef}
              className="hidden md:block w-px bg-white/15 flex-shrink-0 self-stretch origin-center"
              style={{ opacity: 0 }}
            />

            {/* ── Right column ── */}
            <div className="flex-1 flex flex-col gap-10 pl-8 md:pl-14 lg:pl-20">
              {rightBenefits.map((b, i) => (
                <div
                  key={b.number}
                  ref={(el) => { rightRefs.current[i] = el; }}
                  style={{ opacity: 0 }}
                >
                  <div className="b-line h-px bg-primary-extra-light mb-4 origin-left" style={{ width: 56 }} />
                  <p
                    className="b-num font-black leading-none mb-1 select-none"
                    style={{ fontSize: 'clamp(2.8rem,5vw,4.5rem)', color: 'rgba(255,255,255,0.3)' }}
                  >
                    {b.number}
                  </p>
                  <h2
                    className="b-title font-bold text-white leading-tight mb-2"
                    style={{ fontSize: 'clamp(1.1rem,2vw,1.6rem)' }}
                  >
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
