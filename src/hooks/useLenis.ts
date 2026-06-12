import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Custom hook to initialize Lenis smooth scrolling and synchronize it with GSAP ScrollTrigger.
 * Decouples DOM event listeners and cleans up scroll contexts on unmount.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // ScrollTrigger needs to synchronize with Lenis wheel animations
    const lenis = new Lenis({
      duration: 0.5,
      easing: (t) => 1 - Math.pow(1 - t, 3), // smooth cubic ease-out with faster convergence
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Connect Lenis events to GSAP ScrollTrigger updates
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    // Use native requestAnimationFrame loop for Lenis to ensure precise timestamp alignment
    let rafId: number;
    const tick = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      // Cleanup events and callbacks
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
export default useLenis;
