'use client';

import React from 'react';

interface SequenceCanvasProps {
  className?: string;
}

/**
 * Standard canvas component. Uses forwardRef to expose the HTMLCanvasElement ref.
 * Kept entirely stateless to prevent React re-renders from interrupting the WebGL or 2D rendering loop.
 */
export const SequenceCanvas = React.forwardRef<HTMLCanvasElement, SequenceCanvasProps>(
  ({ className }, ref) => {
    return (
      <canvas
        ref={ref}
        className={`w-full h-full block select-none pointer-events-none will-change-transform ${className || ''}`}
      />
    );
  }
);

SequenceCanvas.displayName = 'SequenceCanvas';

export default SequenceCanvas;
