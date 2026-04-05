'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;

// ── Timeline constants ────────────────────────────────────────────────────────
const TITLE_EXIT_END = 0.45;
const CHAPTER_START = 0.55;  // first chapter enters right after title leaves
const CHAPTER_STAGGER = 0.5;  // tight stagger — all 4 done by ~2.6 units
const ENTER_DUR = 0.38;

const chapters = [
  {
    number: '01',
    tag: 'The Essence',
    title: 'Pure Golden Nectar',
    text: 'Immerse yourself in the pure, golden essence of nature with our Wildflower Honey — a sweet treasure that captures the untamed beauty of blooming meadows and lush forests. Crafted with care and reverence for the natural world, it is a delicious embodiment of the diverse, vibrant blossoms that flourish in the wild.',
  },
  {
    number: '02',
    tag: 'The Flavor',
    title: 'A Symphony of Wildflowers',
    text: 'This exquisite honey is a harmonious blend of nectars collected from a variety of wildflowers, creating a symphony of flavors that evolves with every spoonful. Each jar reflects the changing seasons and the unique floral tapestry of our surroundings, offering a truly authentic taste of nature.',
  },
  {
    number: '03',
    tag: 'The Purity',
    title: 'Raw & Unadulterated',
    text: 'Free from additives, preservatives, or artificial processing — raw, unfiltered, and packed with natural goodness. Whether drizzled over yogurt, stirred into tea, or used as a natural sweetener in baking, this honey brings a touch of wild elegance to every dish.',
  },
  {
    number: '04',
    tag: 'The Commitment',
    title: 'Sustainably Crafted',
    text: 'We are committed to sustainable beekeeping practices that prioritize the well-being of our pollinators and the ecosystems they inhabit. By choosing our Wildflower Honey, you are not only enjoying a premium product but also supporting responsible stewardship of nature\'s resources.',
  },
];

function getFramePath(index: number): string {
  return `/images/process-sequence/ezgif-frame-${String(index).padStart(3, '0')}.webp`;
}

/** Animate a chapter card in and leave it there. */
function animateChapterIn(
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

  const tag = el.querySelector<HTMLElement>('.c-tag');
  const num = el.querySelector<HTMLElement>('.c-num');
  const title = el.querySelector<HTMLElement>('.c-title');
  const line = el.querySelector<HTMLElement>('.c-line');
  const text = el.querySelector<HTMLElement>('.c-text');

  if (tag) tl.fromTo(tag, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: ENTER_DUR * 0.6, ease: 'power2.out' }, enterAt + 0.04);
  if (num) tl.fromTo(num, { opacity: 0 }, { opacity: 1, duration: ENTER_DUR * 0.7 }, enterAt + 0.04);
  if (title) tl.fromTo(title, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: ENTER_DUR * 0.8, ease: 'power2.out' }, enterAt + 0.1);
  if (line) tl.fromTo(line, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: ENTER_DUR * 0.6, ease: 'power3.out' }, enterAt + 0.14);
  if (text) tl.fromTo(text, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: ENTER_DUR * 0.8, ease: 'power2.out' }, enterAt + 0.18);
}

export default function ProcessSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // ── Prevent broken state after refresh at scrolled position ──────────────
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

    // Preload frames
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

    // ── Title: blur-in on mount ───────────────────────────────────────────────
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

    // Title exits
    tl.to(title, { y: -220, opacity: 0, filter: 'blur(20px)', duration: TITLE_EXIT_END, ease: 'power2.inOut' }, 0);
    if (scrollHint) tl.to(scrollHint, { opacity: 0, duration: 0.25 }, 0);

    // Chapters reveal: 01(top-left) → 02(top-right) → 03(bottom-left) → 04(bottom-right)
    const fromXMap = [-90, 90, -90, 90];
    chapterRefs.current.forEach((el, i) => {
      if (!el) return;
      animateChapterIn(tl, el, CHAPTER_START + i * CHAPTER_STAGGER, fromXMap[i]);
    });

    // Breathing room at the end
    const totalDuration = CHAPTER_START + chapters.length * CHAPTER_STAGGER + 0.8;
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
  }, []);

  return (
    <section ref={containerRef} className="relative h-[600vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/* Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

        {/* ── Section title ─────────────────────────────────────────────────── */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6"
          style={{ opacity: 0 }}
        >


          <h2
            className="font-black tracking-tighter leading-[0.88] uppercase text-white"
            style={{ fontSize: 'clamp(3rem,8vw,6.5rem)' }}
          >
            The Story of
            <br />
            <span className="text-primary-extra-light">Wild Honey</span>
          </h2>

          <p className="mt-5 text-white/40 text-xs md:text-sm tracking-[0.4em] uppercase font-light max-w-xs">
            Nature · Purity · Craftsmanship
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

        {/* ── Story chapters — 2 × 2 editorial grid ─────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center px-8 md:px-12 lg:px-16">
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

            {chapters.map((ch, i) => (
              <div
                key={ch.number}
                ref={(el) => { chapterRefs.current[i] = el; }}
                style={{ opacity: 0 }}
                className="group relative h-full"
              >
                {/* Glass card */}
                <div className="relative h-full rounded-2xl border border-white/8 bg-white/[0.2] backdrop-blur-sm px-7 py-6 overflow-hidden">

                  {/* Faint watermark number */}
                  <span
                    className="c-num absolute -top-3 -right-2 font-black leading-none select-none pointer-events-none"
                    style={{
                      fontSize: 'clamp(6rem,10vw,9rem)',
                      color: 'rgba(255,255,255,0.04)',
                      lineHeight: 1,
                    }}
                  >
                    {ch.number}
                  </span>

                  {/* Chapter tag */}
                  <div className="c-tag flex items-center gap-3 mb-3">
                    <span
                      className="text-[10px] tracking-[0.5em] uppercase font-medium"
                      style={{ color: 'var(--color-primary-extra-light, #e8c97a)' }}
                    >
                      {ch.tag}
                    </span>
                    <span className="text-white/20 text-[10px] font-light">— {ch.number}</span>
                  </div>

                  {/* Title */}
                  <h3
                    className="c-title font-bold text-white leading-tight mb-3"
                    style={{ fontSize: 'clamp(1.1rem,2vw,1.45rem)' }}
                  >
                    {ch.title}
                  </h3>

                  {/* Decorative line */}
                  <div
                    className="c-line mb-4 origin-left"
                    style={{
                      height: 1.5,
                      width: 48,
                      background: 'linear-gradient(to right, var(--color-primary-extra-light, #e8c97a), transparent)',
                    }}
                  />

                  {/* Paragraph */}
                  <p className="c-text text-white/90 text-sm leading-relaxed font-light">
                    {ch.text}
                  </p>

                  {/* Subtle corner accent */}
                  <div
                    className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at bottom right, rgba(232,201,122,0.07), transparent 70%)',
                    }}
                  />
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
}
