'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: string | number;
}

interface CaseStudyLightboxProps {
  images: LightboxImage[];
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};

export function CaseStudyLightbox({ images, children }: CaseStudyLightboxProps) {
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < images.length;
  const activeImage = isOpen ? images[activeIndex] : null;

  const close = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const next = useCallback(() => {
    if (images.length === 0) return;
    setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % images.length));
  }, [images.length]);

  const prev = useCallback(() => {
    if (images.length === 0) return;
    setActiveIndex((prev) =>
      prev === null ? 0 : (prev - 1 + images.length) % images.length
    );
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowRight') {
        next();
      } else if (e.key === 'ArrowLeft') {
        prev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, next, prev]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Event delegation on gallery container for images
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-image-index]');
    if (target) {
      const idxAttr = target.getAttribute('data-image-index');
      if (idxAttr !== null) {
        const idx = parseInt(idxAttr, 10);
        if (!isNaN(idx) && idx >= 0 && idx < images.length) {
          setActiveIndex(idx);
        }
      }
    }
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = (e.target as HTMLElement).closest('[data-image-index]');
      if (target) {
        const idxAttr = target.getAttribute('data-image-index');
        if (idxAttr !== null) {
          const idx = parseInt(idxAttr, 10);
          if (!isNaN(idx) && idx >= 0 && idx < images.length) {
            e.preventDefault();
            setActiveIndex(idx);
          }
        }
      }
    }
  };

  // Touch swipe support on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        prev();
      } else {
        next();
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      onClick={handleContainerClick}
      onKeyDown={handleContainerKeyDown}
      className="caseStudyGalleryWrapper"
    >
      {children}

      {isClient && isOpen && activeImage &&
        createPortal(
          <div
            className="lightboxOverlay"
            role="dialog"
            aria-modal="true"
            aria-label="Image preview overlay"
            data-lenis-prevent
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                close();
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header Bar */}
            <div className="lightboxHeader">
              <span className="lightboxCounter">
                {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={close}
                className="navButton lightboxClose"
                aria-label="Close preview (Escape)"
              >
                <span>Close</span>
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            {/* Central Image Viewport */}
            <div
              className="lightboxStage"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  close();
                }
              }}
            >
              <div
                className="lightboxImageWrapper"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                title="Click for next image"
              >
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  priority
                  className="lightboxImg"
                  sizes="100vw"
                />
              </div>
            </div>

            {/* Previous / Next Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="navButton lightboxNavBtn lightboxPrev"
                  aria-label="Previous image (Left arrow)"
                >
                  <span>◀</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="navButton lightboxNavBtn lightboxNext"
                  aria-label="Next image (Right arrow)"
                >
                  <span>▶</span>
                </button>
              </>
            )}

            {/* Optional Caption at bottom */}
            {activeImage.caption && (
              <div className="lightboxFooter">
                <span className="lightboxCaption">{activeImage.caption}</span>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

