import { useState, useEffect, useRef } from 'react';
import { loadAndDecodeFrame, CachedFrame } from '../lib/frameLoader';

interface PreloaderResult {
  frames: CachedFrame[];
  progress: number;
  isLoaded: boolean;
  error: string | null;
}

/**
 * Custom React hook to preload and cache image frames with concurrency control.
 *
 * @param totalFrames The total count of frames in the sequence.
 * @param getFrameUrl A callback function generating the absolute frame URL from a 1-indexed number.
 * @param concurrencyLimit Number of concurrent requests to fetch/decode frames. Defaults to 6.
 * @returns An object containing the cache list, preloading progress (0-100), and state flags.
 */
export function useImagePreloader(
  totalFrames: number,
  getFrameUrl: (index: number) => string,
  concurrencyLimit: number = 6
): PreloaderResult {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep cache in ref to prevent React re-renders during frame-swapping / canvas loops
  const framesRef = useRef<CachedFrame[]>([]);

  useEffect(() => {
    let active = true;
    setProgress(0);
    setIsLoaded(false);
    setError(null);
    framesRef.current = [];

    const urls = Array.from({ length: totalFrames }, (_, i) => getFrameUrl(i + 1));
    const cache: CachedFrame[] = new Array(totalFrames);
    let currentTaskIndex = 0;
    let loadedCount = 0;

    const runLoaderPool = async () => {
      const worker = async () => {
        while (active && currentTaskIndex < urls.length) {
          const index = currentTaskIndex++;
          const url = urls[index];

          try {
            const frame = await loadAndDecodeFrame(url);
            if (active) {
              cache[index] = frame;
              loadedCount++;
              setProgress(Math.round((loadedCount / totalFrames) * 100));
            }
          } catch (err) {
            console.error(`[Preloader] Error preloading frame ${index + 1}:`, err);
            if (active) {
              setError(`Failed loading frame ${index + 1}`);
            }
          }
        }
      };

      // Create pool of concurrent workers
      const workers = Array.from(
        { length: Math.min(concurrencyLimit, totalFrames) },
        worker
      );

      await Promise.all(workers);

      if (active) {
        // Filter out empty indices if any failed, keeping the sequence compact and safe
        const successfulFrames = cache.filter((f): f is CachedFrame => !!f);
        if (successfulFrames.length === 0) {
          setError('All frames failed to load.');
        } else {
          framesRef.current = successfulFrames;
          setIsLoaded(true);
        }
      }
    };

    runLoaderPool();

    return () => {
      active = false;
    };
  }, [totalFrames, getFrameUrl, concurrencyLimit]);

  return {
    frames: framesRef.current,
    progress,
    isLoaded,
    error,
  };
}
export default useImagePreloader;
