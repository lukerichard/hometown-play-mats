import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.5;

const ImageLightbox = ({ src, alt, onClose }) => {
  const viewportRef = useRef(null);
  const dragStartRef = useRef(null);
  const [scale, setScale] = useState(MIN_SCALE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const clampScale = (value) => Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);

  const resetZoom = useCallback(() => {
    setScale(MIN_SCALE);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomTo = useCallback((nextScale, anchorEvent = null) => {
    setScale((currentScale) => {
      const clampedScale = clampScale(nextScale);

      if (clampedScale === MIN_SCALE) {
        setOffset({ x: 0, y: 0 });
        return clampedScale;
      }

      if (!anchorEvent || !viewportRef.current) return clampedScale;

      const rect = viewportRef.current.getBoundingClientRect();
      const anchorX = anchorEvent.clientX - rect.left - rect.width / 2;
      const anchorY = anchorEvent.clientY - rect.top - rect.height / 2;
      const ratio = clampedScale / currentScale;

      setOffset((currentOffset) => ({
        x: anchorX - (anchorX - currentOffset.x) * ratio,
        y: anchorY - (anchorY - currentOffset.y) * ratio,
      }));

      return clampedScale;
    });
  }, []);

  const zoomBy = useCallback((delta, anchorEvent = null) => {
    zoomTo(scale + delta, anchorEvent);
  }, [scale, zoomTo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === '+' || event.key === '=') zoomBy(ZOOM_STEP);
      if (event.key === '-') zoomBy(-ZOOM_STEP);
      if (event.key === '0') resetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, resetZoom, zoomBy]);

  const handleWheel = (event) => {
    event.preventDefault();
    event.stopPropagation();
    zoomBy(event.deltaY < 0 ? 0.35 : -0.35, event);
  };

  const handlePointerDown = (event) => {
    event.stopPropagation();
    if (scale <= MIN_SCALE) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragStartRef.current) return;

    event.stopPropagation();
    setOffset({
      x: dragStartRef.current.offsetX + event.clientX - dragStartRef.current.pointerX,
      y: dragStartRef.current.offsetY + event.clientY - dragStartRef.current.pointerY,
    });
  };

  const handlePointerEnd = (event) => {
    event.stopPropagation();
    dragStartRef.current = null;
    setIsDragging(false);
  };

  const handleDoubleClick = (event) => {
    event.stopPropagation();
    zoomTo(scale > MIN_SCALE ? MIN_SCALE : 2.5, event);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[10001] flex items-center justify-center p-6 bg-[#191c1e]/85 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Enlarged image'}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-11 h-11 border-none bg-white/15 text-white rounded-full cursor-pointer text-2xl flex items-center justify-center transition-colors duration-200 hover:bg-white/25 font-bold"
        aria-label="Close"
      >
        X
      </button>

      <div
        className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-white/15 p-1.5 text-white backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/15 text-xl font-bold text-white hover:bg-white/25"
          onClick={() => zoomBy(-ZOOM_STEP)}
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          type="button"
          className="flex h-9 min-w-14 items-center justify-center rounded-full border-0 bg-white/15 px-3 text-xs font-bold text-white hover:bg-white/25"
          onClick={resetZoom}
          aria-label="Reset zoom"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/15 text-xl font-bold text-white hover:bg-white/25"
          onClick={() => zoomBy(ZOOM_STEP)}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      <div
        ref={viewportRef}
        onClick={(event) => event.stopPropagation()}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDoubleClick={handleDoubleClick}
        className="max-w-[92vw] max-h-[92vh] overflow-hidden rounded-2xl"
        style={{
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
          cursor: scale > MIN_SCALE ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          touchAction: 'none',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="block max-h-[92vh] max-w-[92vw] object-contain select-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 120ms ease-out',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
