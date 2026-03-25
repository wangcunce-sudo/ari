'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Props {
  src: string;
  onClose: () => void;
}

export default function MVLightbox({ src, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Open animation
  useEffect(() => {
    const ov = overlayRef.current;
    if (!ov) return;
    requestAnimationFrame(() => {
      ov.style.opacity = '1';
      ov.style.pointerEvents = 'all';
    });

    // Autoplay
    const vid = videoRef.current;
    if (vid) vid.play().catch(() => {});

    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = useCallback(() => {
    const ov = overlayRef.current;
    const vid = videoRef.current;
    if (vid) vid.pause();
    if (ov) {
      ov.style.opacity = '0';
      setTimeout(onClose, 350);
    } else {
      onClose();
    }
  }, [onClose]);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'rgba(20,18,16,0.82)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.35s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-8 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close video"
      >
        <span className="material-symbols-outlined text-4xl">close</span>
      </button>

      {/* Video wrapper */}
      <div
        className="w-[min(92vw,1080px)] aspect-video rounded-2xl overflow-hidden bg-black"
        style={{ transform: 'scale(1)', transition: 'transform 0.35s ease' }}
      >
        <video
          ref={videoRef}
          src={src}
          controls
          className="w-full h-full object-contain bg-black"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
