import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { drawFrame, resizeCanvasToDisplaySize } from '../lib/canvasRenderer';
import { CachedFrame } from '../lib/frameLoader';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface RendererOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  frames: CachedFrame[];
  isLoaded: boolean;
  totalFrames: number;
  smoothingFactor?: number; // Inertia coefficient (defaults to 0.12)
  scrollLength?: string;     // Scroll height/duration (defaults to '+=300%')
}

/**
 * Custom hook managing the high-performance ScrollTrigger to Canvas render loop.
 * Implements Apple-style frame interpolation (inertia scrolling) to eliminate stepping.
 * Uses the GSAP ticker for rendering, avoiding React re-renders completely.
 */
  export function useSequenceRenderer({
  canvasRef,
  containerRef,
  frames,
  isLoaded,
  totalFrames,
  smoothingFactor = 0.4, // Default snappy smooth easing during active scroll
  scrollLength = '+=300%',
}: RendererOptions) {
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container || !isLoaded || frames.length === 0) return;

    // Track scroll-driven target frame versus current interpolated frame state
    const state = {
      targetFrame: 0,
      currentFrame: 0,
    };

    let lastRenderedFrame = -1;

    // 1. Initial size calibration
    const calibrateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
      resizeCanvasToDisplaySize(canvas, width, height);

      // Force instant redraw of current frame on resize to prevent flashes
      const currentIdx = Math.round(state.currentFrame);
      if (frames[currentIdx]) {
        drawFrame(canvas, frames[currentIdx]);
      }
    };

    // Calibrate sizes immediately
    calibrateCanvasSize();

    // Debounce window resizes to prevent layout thrashing
    let resizeTimeout: number;
    const handleResize = () => {
      cancelAnimationFrame(resizeTimeout);
      resizeTimeout = requestAnimationFrame(calibrateCanvasSize);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // 2. Setup GSAP ScrollTrigger timeline to smoothly scrub targetFrame with a 15% static buffer at the end
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: scrollLength,
        pin: true,
        scrub: true, // Bind directly to smooth scroll
      },
    });

    tl.to(state, {
      targetFrame: totalFrames - 1,
      ease: 'none',
      duration: 8.5,
    });
    tl.addLabel("bufferEnd", 10);

    const animation = tl;

    // Track if rendering is currently frozen during low-velocity scroll tail
    let isFrozen = false;

    // 3. Apple-style continuous rendering tick loop with dynamic catch-up speed
    const tick = () => {
      const diff = state.targetFrame - state.currentFrame;
      const absDiff = Math.abs(diff);

      // Query the active scroll velocity from GSAP ScrollTrigger
      const scrollTrigger = animation.scrollTrigger;
      const velocity = scrollTrigger ? Math.abs(scrollTrigger.getVelocity()) : 0;

      // Unfreeze if velocity rises (user started scrolling again)
      if (isFrozen && velocity > 150) {
        isFrozen = false;
      }

      // If frozen, we do not perform any frame updates or renders
      if (isFrozen) {
        return;
      }

      if (absDiff > 0.01) {
        // If scroll velocity is extremely low, we are in the trailing crawl.
        // If we are close enough to the target, snap and freeze to eliminate the crawl.
        if (velocity < 100 && absDiff < 2.5) {
          state.currentFrame = state.targetFrame;
          isFrozen = true;
        } else {
          // Normal rendering update
          const isScrolling = velocity > 100;
          if (isScrolling) {
            // Smooth easing during active scrolling
            state.currentFrame += diff * smoothingFactor;
          } else {
            // Play through remaining frames at high speed (2.5 frames per tick) to eliminate trailing lag
            const stepSize = 2.5;
            const step = Math.sign(diff) * Math.min(absDiff, stepSize);
            state.currentFrame += step;
          }
        }
      } else {
        state.currentFrame = state.targetFrame;
      }

      // Determine integer index for cache retrieval
      const roundedFrame = Math.round(state.currentFrame);

      // Render only if the target index has changed and frame is available
      if (roundedFrame !== lastRenderedFrame && frames[roundedFrame]) {
        drawFrame(canvas, frames[roundedFrame]);
        lastRenderedFrame = roundedFrame;
      }
    };

    // Register tick handler to the high-performance GSAP Ticker
    gsap.ticker.add(tick);

    // Render the first frame immediately
    drawFrame(canvas, frames[0]);

    // 4. Cleanup on component unmount / update
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(resizeTimeout);
      
      gsap.ticker.remove(tick);
      animation.kill();
    };
  }, [canvasRef, containerRef, frames, isLoaded, totalFrames, smoothingFactor, scrollLength]);
}

export default useSequenceRenderer;
