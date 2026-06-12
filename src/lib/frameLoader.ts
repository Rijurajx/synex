/**
 * Type representing a fully decoded, render-ready frame.
 * Using ImageBitmap provides zero-copy transfers to GPU, avoiding main-thread decoding during renders.
 */
export type CachedFrame = ImageBitmap | HTMLImageElement;

/**
 * Checks if the browser supports the high-performance `createImageBitmap` API.
 */
export function hasImageBitmapSupport(): boolean {
  return typeof window !== 'undefined' && 'createImageBitmap' in window;
}

/**
 * Load and decode a single frame.
 * Utilizes createImageBitmap when supported to decode images asynchronously off the main thread.
 * Falls back to HTMLImageElement.decode() to prevent UI layout/rendering freezes.
 *
 * @param url Absolute path to the WebP frame asset.
 * @returns Promise resolving to the decoded CachedFrame.
 */
export async function loadAndDecodeFrame(url: string): Promise<CachedFrame> {
  if (hasImageBitmapSupport()) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch frame: ${url} (status ${response.status})`);
      }
      const blob = await response.blob();
      return await createImageBitmap(blob);
    } catch (error) {
      console.warn(`[FrameLoader] High-performance createImageBitmap failed for ${url}, using standard fallback:`, error);
      // Fall back to standard image loader
    }
  }

  // Robust HTMLImageElement loader that cannot hang
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Decode image asynchronously to avoid main-thread jank during render
      if ('decode' in img) {
        img.decode()
          .then(() => resolve(img))
          .catch((err) => {
            console.warn(`[FrameLoader] Image decode failed for ${url}, resolving anyway:`, err);
            resolve(img); // Resolve anyway since the image is loaded and can still be drawn
          });
      } else {
        resolve(img);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image at: ${url}`));
    };

    img.src = url;
  });
}
