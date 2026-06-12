import { CachedFrame } from './frameLoader';

interface RenderOptions {
  fit?: 'cover' | 'contain';
}

/**
 * Adjusts the canvas back-buffer resolution to match the physical screen pixels.
 * This prevents pixelation on high-DPI / Retina displays.
 * 
 * @param canvas The target HTMLCanvasElement.
 * @param width Layout width (CSS pixels).
 * @param height Layout height (CSS pixels).
 * @returns The resolved devicePixelRatio used.
 */
export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): number {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const targetWidth = Math.floor(width * dpr);
  const targetHeight = Math.floor(height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Style coordinates represent layout space
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
  
  return dpr;
}

/**
 * Draws a decoded frame onto the canvas using high-performance covering/containment aspect ratio logic.
 * Decouples main thread operations where possible.
 *
 * @param canvas The target HTMLCanvasElement.
 * @param frame The decoded image frame (ImageBitmap or HTMLImageElement).
 * @param options Styling configurations (defaulting to cover fit).
 */
export function drawFrame(
  canvas: HTMLCanvasElement,
  frame: CachedFrame,
  options: RenderOptions = {}
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { fit = 'cover' } = options;

  // Clear previous frame to avoid frame bleeding or blending artifacts
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imageWidth = frame.width;
  const imageHeight = frame.height;

  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (fit === 'cover') {
    if (imageRatio > canvasRatio) {
      // Image is wider than canvas: match height and crop horizontal margins
      drawWidth = canvasHeight * imageRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    } else {
      // Image is taller than canvas: match width and crop vertical margins
      drawHeight = canvasWidth / imageRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    }
  } else {
    // contain fit
    if (imageRatio > canvasRatio) {
      // Image is wider than canvas: match width, add letterboxes on top/bottom
      drawHeight = canvasWidth / imageRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      // Image is taller than canvas: match height, add letterboxes on sides
      drawWidth = canvasHeight * imageRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }
  }

  // Disable smoothing for sharpest look if rendering pixel-perfect bitmaps
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(frame, offsetX, offsetY, drawWidth, drawHeight);
}
