'use client';

import { useEffect } from 'react';
import ReactLenis, { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lives inside <ReactLenis> so useLenis() can access the instance.
 * Drives Lenis via GSAP's RAF ticker (not its own) so GSAP animations
 * and ScrollTrigger always share the exact same clock as Lenis.
 */
function GSAPBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Forward every Lenis scroll tick to ScrollTrigger so scrub progress stays in sync
    lenis.on('scroll', ScrollTrigger.update);

    // GSAP drives Lenis — no double RAF, no drift
    function onTick(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(onTick);
    // Disable lag smoothing so ScrollTrigger reacts to every Lenis frame
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(onTick);
    };
  }, [lenis]);

  return null;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        lerp: 0.055,          // low lerp = long glide → "floating in air" feel
        smoothWheel: true,
        wheelMultiplier: 0.8, // gentler per-notch distance keeps it controlled
        touchMultiplier: 1.2,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        normalizeWheel: true, // consistent speed across all wheels/trackpads
      }}
    >
      <GSAPBridge />
      {children}
    </ReactLenis>
  );
}
