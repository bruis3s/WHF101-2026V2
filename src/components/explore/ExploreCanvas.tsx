'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ExploreLayoutData, ExploreLayoutItem } from '@/lib/types';
import { sanitizeImageUrl } from '@/lib/images';

interface ExploreCanvasProps {
  layout: ExploreLayoutData;
}

const MIN_SCALE = 0.28;
const MAX_SCALE = 2.5;

export function ExploreCanvas({ layout }: ExploreCanvasProps) {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Transform state: pan X, pan Y, scale
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1.0);

  // Interaction tracking
  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const startPanRef = useRef({ x: 0, y: 0 });
  const targetSlugRef = useRef<string | null>(null);

  // Touch pinch tracking
  const touchPinchDistRef = useRef<number | null>(null);
  const touchStartCenterRef = useRef<{ x: number; y: number } | null>(null);

  // Animation frame id
  const rafIdRef = useRef<number | null>(null);

  const applyTransform = useCallback(() => {
    if (!canvasRef.current) return;
    const { x, y } = panRef.current;
    const s = scaleRef.current;
    canvasRef.current.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(${s})`;
  }, []);

  const requestUpdate = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      applyTransform();
      rafIdRef.current = null;
    });
  }, [applyTransform]);

  // Center camera on circular cluster center upon mount
  useEffect(() => {
    const centerCamera = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const targetCenterX = layout.initialCenterX ?? layout.canvasWidth / 2;
      const targetCenterY = layout.initialCenterY ?? layout.canvasHeight / 2;

      panRef.current = {
        x: vw / 2 - targetCenterX * scaleRef.current,
        y: vh / 2 - targetCenterY * scaleRef.current,
      };
      applyTransform();
    };

    centerCamera();
    window.addEventListener('resize', centerCamera);
    return () => window.removeEventListener('resize', centerCamera);
  }, [layout, applyTransform]);

  // Wheel listener: scroll up = zoom in, scroll down = zoom out (centered at cursor)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      const prevScale = scaleRef.current;
      // Exponential zoom factor for smooth proportional zooming
      const zoomFactor = Math.exp(-e.deltaY * 0.0018);
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevScale * zoomFactor));

      if (Math.abs(nextScale - prevScale) < 0.0001) return;

      // Keep world coordinates under cursor consistent
      const worldX = (pointerX - panRef.current.x) / prevScale;
      const worldY = (pointerY - panRef.current.y) / prevScale;

      const nextPanX = pointerX - worldX * nextScale;
      const nextPanY = pointerY - worldY * nextScale;

      scaleRef.current = nextScale;
      panRef.current = { x: nextPanX, y: nextPanY };

      requestUpdate();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [requestUpdate]);

  // Pointer drag to move the canvas (works everywhere, including on top of images)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    const cardEl = target.closest('[data-slug]');
    targetSlugRef.current = cardEl ? cardEl.getAttribute('data-slug') : null;

    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...panRef.current };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !pointerStartRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    // Threshold check: only treat as a drag once moved > 4px
    if (!isDraggingRef.current && Math.hypot(dx, dy) > 4) {
      isDraggingRef.current = true;

      if (viewportRef.current) {
        viewportRef.current.classList.add('isDragging');
      }

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // fallback
      }
    }

    if (isDraggingRef.current) {
      panRef.current = {
        x: startPanRef.current.x + dx,
        y: startPanRef.current.y + dy,
      };

      requestUpdate();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const slugToNavigate = !isDraggingRef.current ? targetSlugRef.current : null;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // fallback
    }

    isPointerDownRef.current = false;
    pointerStartRef.current = null;
    targetSlugRef.current = null;

    if (viewportRef.current) {
      viewportRef.current.classList.remove('isDragging');
    }

    // If it was a clean click without dragging, navigate to the case study
    if (slugToNavigate) {
      router.push(`/werks/${slugToNavigate}`);
    }

    // Keep isDraggingRef true momentarily so native Link onClick doesn't double-fire
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
  };

  // Touch pinch-to-zoom & two-finger pan support
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchPinchDistRef.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        touchStartCenterRef.current = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchPinchDistRef.current !== null && touchStartCenterRef.current) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];

        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const currentCenter = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };

        const zoomFactor = currentDist / touchPinchDistRef.current;
        const prevScale = scaleRef.current;
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevScale * zoomFactor));

        const rect = el.getBoundingClientRect();
        const pointerX = currentCenter.x - rect.left;
        const pointerY = currentCenter.y - rect.top;

        const worldX = (pointerX - panRef.current.x) / prevScale;
        const worldY = (pointerY - panRef.current.y) / prevScale;

        const nextPanX = pointerX - worldX * nextScale;
        const nextPanY = pointerY - worldY * nextScale;

        scaleRef.current = nextScale;
        panRef.current = { x: nextPanX, y: nextPanY };
        touchPinchDistRef.current = currentDist;
        touchStartCenterRef.current = currentCenter;

        requestUpdate();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchPinchDistRef.current = null;
        touchStartCenterRef.current = null;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [requestUpdate]);

  // Click handler on Link element as secondary guard
  const handleCardClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={viewportRef}
      className="exploreViewport"
      data-lenis-prevent="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDragStart={(e) => e.preventDefault()}
      role="region"
      aria-label="Circular free roam project gallery. Drag to move, scroll up/down to zoom."
    >
      <div
        ref={canvasRef}
        className="exploreCanvas"
        onDragStart={(e) => e.preventDefault()}
        style={{
          width: `${layout.canvasWidth}px`,
          height: `${layout.canvasHeight}px`,
        }}
      >
        {layout.items.map((item: ExploreLayoutItem) => {
          const imageUrl = sanitizeImageUrl(item.coverImageUrl);
          const href = `/werks/${item.slug}`;

          return (
            <Link
              key={item.slug}
              href={href}
              data-slug={item.slug}
              className="exploreCard"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: `${item.w}px`,
                height: `${item.h}px`,
              }}
              onClick={handleCardClick}
              aria-label={item.title}
            >
              <div
                className="exploreCardImageWrapper"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 809.98px) 70vw, 500px"
                    className="exploreCardImage"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : (
                  <div className="explorePlaceholder">
                    <span>{item.title}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
