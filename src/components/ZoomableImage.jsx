import { useRef, useState } from 'react';
import ImageLightbox from './ImageLightbox';

const ZoomableImage = ({ src, alt, className = '', style = {}, zoomScale = 2.2 }) => {
  const wrapperRef = useRef(null);
  const [isZooming, setIsZooming] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const updateOrigin = (e) => {
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setOrigin(`${x}% ${y}%`);
  };

  const openLightbox = () => setLightboxOpen(true);

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative overflow-hidden rounded-xl w-full h-full"
        style={{ cursor: 'zoom-in' }}
        onMouseEnter={() => setIsZooming(true)}
        onMouseMove={updateOrigin}
        onMouseLeave={() => setIsZooming(false)}
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        aria-label={`${alt || 'Image'} — click to view full size`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox();
          }
        }}
      >
        <img
          src={src}
          alt={alt}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            ...style,
            transformOrigin: origin,
            transform: isZooming ? `scale(${zoomScale})` : 'scale(1)',
            transition: isZooming ? 'transform 0.06s ease-out' : 'transform 0.25s ease-out'
          }}
          draggable={false}
        />
        <span
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold pointer-events-none transition-opacity duration-150"
          style={{
            background: 'rgba(25, 28, 30, 0.78)',
            color: 'white',
            opacity: isZooming ? 0 : 1
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Click to enlarge
        </span>
      </div>

      {lightboxOpen && (
        <ImageLightbox src={src} alt={alt} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
};

export default ZoomableImage;
