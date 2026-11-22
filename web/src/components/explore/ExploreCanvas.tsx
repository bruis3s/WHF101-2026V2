'use client';

import { useEffect, useRef, useCallback, useState, startTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ExploreLayoutData, ExploreLayoutItem } from '@/lib/types';
import { sanitizeImageUrl } from '@/lib/images';

interface ExploreCanvasProps {
  layout: ExploreLayoutData;
}

export function ExploreCanvas({ layout }: ExploreCanvasProps) {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Entrance snap wave: clean up after all cards appear
  const [hasEntered, setHasEntered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasEntered(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  // 2 Distinct Scroll States: 'normal' (default ground view) & 'high' (overview)
  const viewStateRef = useRef<'normal' | 'high'>('normal');
  const targetStateRef = useRef<'normal' | 'high'>('normal');

  // Transform state: current pan and scale
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1.0);

  // Animation lock and RAF ID
  const isTransitioningRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // Pointer drag tracking (1:1 direct tracking, no momentum)
  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const startPanRef = useRef({ x: 0, y: 0 });
  const targetSlugRef = useRef<string | null>(null);
  const touchCountRef = useRef(0);

  // Touch pinch tracking
  const touchPinchDistRef = useRef<number | null>(null);

  // Viewport frustum culling: keep active DOM elements under ~30-50 cards instead of 789
  const lastCullPanRef = useRef({ x: 0, y: 0 });
  const lastCullScaleRef = useRef(1.0);
  const cullTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialCardIdsRef = useRef<Set<string>>(new Set());

  // Scale calculations for the 2 discrete states
  const getNormalScale = useCallback((vw: number) => {
    return vw < 810 ? 0.85 : 1.0;
  }, []);

  const getHighScale = useCallback((vw: number) => {
    // Balanced high-altitude view so cards remain clearly visible, tactile, and not tiny
    return vw < 810 ? 0.38 : 0.42;
  }, []);

  // Spatial frustum check: which cards intersect screen viewport (with generous buffer)
  const calculateVisibleItems = useCallback(
    (pan: { x: number; y: number }, scale: number, vw: number, vh: number, buffer = 400) => {
      // Scale-aware buffer so high zoom doesn't inadvertently mount 500+ items on mobile
      const effectiveBuffer = Math.min(buffer, Math.max(120, Math.round(buffer * scale)));
      const minCanvasX = (-pan.x - effectiveBuffer) / scale;
      const maxCanvasX = (vw - pan.x + effectiveBuffer) / scale;
      const minCanvasY = (-pan.y - effectiveBuffer) / scale;
      const maxCanvasY = (vh - pan.y + effectiveBuffer) / scale;

      return layout.items.filter((item) => {
        const itemRight = item.x + item.w;
        const itemBottom = item.y + item.h;
        return (
          itemRight >= minCanvasX &&
          item.x <= maxCanvasX &&
          itemBottom >= minCanvasY &&
          item.y <= maxCanvasY
        );
      });
    },
    [layout.items]
  );

  // Initial visible cluster (< 1400px radius) so SSR and initial hydration match deterministically
  const [visibleItems, setVisibleItems] = useState<ExploreLayoutItem[]>(() => {
    const initCx = layout.initialCenterX ?? layout.canvasWidth / 2;
    const initCy = layout.initialCenterY ?? layout.canvasHeight / 2;
    return layout.items.filter((item) => {
      const cardCenterX = item.x + item.w / 2;
      const cardCenterY = item.y + item.h / 2;
      const dist = Math.hypot(cardCenterX - initCx, (cardCenterY - initCy) * 1.15);
      return dist < 1400;
    });
  });

  // Dynamic culling updater with movement deadband and non-blocking background render
  const updateCulling = useCallback(
    (force = false, overridePan?: { x: number; y: number }, overrideScale?: number) => {
      if (typeof window === 'undefined') return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const currentPan = overridePan ?? panRef.current;
      const currentScale = overrideScale ?? scaleRef.current;

      if (!force) {
        const distMoved = Math.hypot(
          currentPan.x - lastCullPanRef.current.x,
          currentPan.y - lastCullPanRef.current.y
        );
        const scaleDiff = Math.abs(currentScale - lastCullScaleRef.current);
        if (distMoved < 350 && scaleDiff < 0.04) return;
      }

      lastCullPanRef.current = { ...currentPan };
      lastCullScaleRef.current = currentScale;

      const nextVisible = calculateVisibleItems(currentPan, currentScale, vw, vh, 800);
      startTransition(() => {
        setVisibleItems(nextVisible);
      });
    },
    [calculateVisibleItems]
  );

  // Directly apply current transform to the canvas DOM element
  const applyTransform = useCallback(() => {
    if (!canvasRef.current) return;
    const { x, y } = panRef.current;
    const s = scaleRef.current;
    canvasRef.current.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(${s})`;
  }, []);

  // Butter-smooth RAF camera transition between the 2 states
  const animateTransition = useCallback(
    (targetPan: { x: number; y: number }, targetScale: number, nextState: 'normal' | 'high') => {
      if (!canvasRef.current) return;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      isTransitioningRef.current = true;
      targetStateRef.current = nextState;
      if (viewportRef.current) {
        viewportRef.current.classList.add('isTransitioning');
      }

      // Pre-mount incoming cards for target state so zooming has zero blank cards
      if (typeof window !== 'undefined') {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const targetVisible = calculateVisibleItems(targetPan, targetScale, vw, vh, 450);
        setVisibleItems((prev) => {
          const existing = new Set(prev.map((it) => it.id || it.slug));
          const additions = targetVisible.filter((it) => !existing.has(it.id || it.slug));
          return additions.length > 0 ? [...prev, ...additions] : prev;
        });
      }

      const startPan = { ...panRef.current };
      const startScale = scaleRef.current;
      const startTime = performance.now();
      const duration = 750; // ms

      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progressRaw = Math.min(1, elapsed / duration);
        const progress = easeInOutCubic(progressRaw);

        const curX = startPan.x + (targetPan.x - startPan.x) * progress;
        const curY = startPan.y + (targetPan.y - startPan.y) * progress;
        const curScale = startScale + (targetScale - startScale) * progress;

        panRef.current = { x: curX, y: curY };
        scaleRef.current = curScale;

        if (canvasRef.current) {
          canvasRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0px) scale(${curScale})`;
        }

        if (progressRaw < 1) {
          rafIdRef.current = requestAnimationFrame(step);
        } else {
          rafIdRef.current = null;
          viewStateRef.current = nextState;
          targetStateRef.current = nextState;
          isTransitioningRef.current = false;
          if (viewportRef.current) {
            viewportRef.current.classList.remove('isTransitioning');
          }
          updateCulling(true, targetPan, targetScale);
        }
      };

      rafIdRef.current = requestAnimationFrame(step);
    },
    [calculateVisibleItems, updateCulling]
  );

  // Transition to State 2: High View (Overview) - Pure center zoom, no lateral drift
  const transitionToHighView = useCallback(() => {
    setHasEntered(true);
    targetStateRef.current = 'high';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const highScale = getHighScale(vw);
    const currentScale = scaleRef.current;

    // Symmetrical zoom directly from the viewport center
    const focal = { x: vw / 2, y: vh / 2 };
    const worldX = (focal.x - panRef.current.x) / currentScale;
    const worldY = (focal.y - panRef.current.y) / currentScale;

    const targetPan = {
      x: focal.x - worldX * highScale,
      y: focal.y - worldY * highScale,
    };

    animateTransition(targetPan, highScale, 'high');
  }, [getHighScale, animateTransition]);

  // Transition to State 1: Normal View (Default ground view) - Pure center zoom
  const transitionToNormalView = useCallback(() => {
    targetStateRef.current = 'normal';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const normalScale = getNormalScale(vw);
    const currentScale = scaleRef.current;

    // Symmetrical zoom directly into the viewport center
    const focal = { x: vw / 2, y: vh / 2 };
    const worldX = (focal.x - panRef.current.x) / currentScale;
    const worldY = (focal.y - panRef.current.y) / currentScale;

    const targetPan = {
      x: focal.x - worldX * normalScale,
      y: focal.y - worldY * normalScale,
    };

    animateTransition(targetPan, normalScale, 'normal');
  }, [getNormalScale, animateTransition]);

  // Initial mount: Set camera to Normal View centered on cluster
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const normalScale = getNormalScale(vw);
    const targetCenterX = layout.initialCenterX ?? layout.canvasWidth / 2;
    const targetCenterY = layout.initialCenterY ?? layout.canvasHeight / 2;

    scaleRef.current = normalScale;
    viewStateRef.current = 'normal';

    const initialPan = {
      x: vw / 2 - targetCenterX * normalScale,
      y: vh / 2 - targetCenterY * normalScale,
    };
    panRef.current = initialPan;
    lastCullPanRef.current = { ...initialPan };
    lastCullScaleRef.current = normalScale;

    if (canvasRef.current) {
      canvasRef.current.style.transition = 'none';
    }
    applyTransform();

    const initialVisible = calculateVisibleItems(initialPan, normalScale, vw, vh, 400);
    initialCardIdsRef.current = new Set(initialVisible.map((it) => it.id || it.slug));
    setVisibleItems(initialVisible);

    // On resize: preserve current viewState and pan instead of violently resetting to start
    const handleResize = () => {
      if (isTransitioningRef.current) return;
      const currentVw = window.innerWidth;
      const currentScale =
        viewStateRef.current === 'high' ? getHighScale(currentVw) : getNormalScale(currentVw);
      scaleRef.current = currentScale;
      applyTransform();
      updateCulling(true, panRef.current, currentScale);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout, getNormalScale, getHighScale, applyTransform, calculateVisibleItems, updateCulling]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (cullTimerRef.current) {
        clearTimeout(cullTimerRef.current);
      }
    };
  }, []);

  // 2-State Scroll Listener:
  // - Smooth accumulation handles both notched mouse wheels and smooth trackpads
  // - Checks targetStateRef so multiple wheel events glide seamlessly without resetting or stuttering
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let wheelAcc = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      wheelAcc += e.deltaY;

      if (wheelTimer) {
        clearTimeout(wheelTimer);
      }
      wheelTimer = setTimeout(() => {
        wheelAcc = 0;
      }, 180);

      if (wheelAcc > 16) {
        wheelAcc = 0;
        if (targetStateRef.current !== 'high') {
          transitionToHighView();
        }
      } else if (wheelAcc < -16) {
        wheelAcc = 0;
        if (targetStateRef.current !== 'normal') {
          transitionToNormalView();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      if (wheelTimer) clearTimeout(wheelTimer);
      el.removeEventListener('wheel', onWheel);
    };
  }, [transitionToHighView, transitionToNormalView]);

  // Pointer drag to move the canvas (1:1 direct tracking, NO momentum)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only accept left click for mouse; accept touch events
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // Multi-touch / pinch isolation: if already tracking a pointer, ignore new pointer for dragging
    if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) {
      return;
    }

    if (rafIdRef.current !== null) {
      // If a transition is running, interrupt only for intentional mouse click, never during touch pinch
      if (e.pointerType === 'mouse') {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
        isTransitioningRef.current = false;
        const vw = window.innerWidth;
        const normalScale = getNormalScale(vw);
        const isCloserToHigh = scaleRef.current < (normalScale + 0.4) / 2;
        targetStateRef.current = isCloserToHigh ? 'high' : 'normal';
        viewStateRef.current = isCloserToHigh ? 'high' : 'normal';
        if (viewportRef.current) {
          viewportRef.current.classList.remove('isTransitioning');
        }
      } else {
        return;
      }
    }

    activePointerIdRef.current = e.pointerId;
    const target = e.target as HTMLElement;
    const cardEl = target.closest('[data-slug]');
    targetSlugRef.current = cardEl ? cardEl.getAttribute('data-slug') : null;

    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...panRef.current };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      !isPointerDownRef.current ||
      !pointerStartRef.current ||
      isTransitioningRef.current ||
      e.pointerId !== activePointerIdRef.current ||
      touchCountRef.current > 1
    ) {
      return;
    }

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

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
      applyTransform();

      // Debounce culling check during active swipe so dragging runs at full hardware frame rate
      if (cullTimerRef.current) {
        clearTimeout(cullTimerRef.current);
      }
      cullTimerRef.current = setTimeout(() => {
        cullTimerRef.current = null;
        updateCulling(false);
      }, 160);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current)) {
      return;
    }

    activePointerIdRef.current = null;

    if (cullTimerRef.current) {
      clearTimeout(cullTimerRef.current);
      cullTimerRef.current = null;
    }
    updateCulling(true);

    const slugToNavigate = !isDraggingRef.current && touchCountRef.current <= 1 ? targetSlugRef.current : null;

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

    if (slugToNavigate) {
      router.push(`/werks/${slugToNavigate}`);
    }

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
  };

  // Touch pinch gesture: pinch in = High View, pinch out = Normal View
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    // Prevent Safari native pinch page-zoom on iOS
    const onGesture = (e: Event) => {
      e.preventDefault();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      if (e.touches.length >= 2) {
        // Multi-touch: disable single-finger pointer drag tracking immediately
        isDraggingRef.current = false;
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        if (viewportRef.current) {
          viewportRef.current.classList.remove('isDragging');
        }
      }
      if (e.touches.length === 2 && !isTransitioningRef.current) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchPinchDistRef.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      if (e.touches.length === 2 && touchPinchDistRef.current !== null && !isTransitioningRef.current) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const distDiff = currentDist - touchPinchDistRef.current;

        if (Math.abs(distDiff) > 25) {
          if (distDiff < 0 && targetStateRef.current === 'normal') {
            transitionToHighView();
            touchPinchDistRef.current = currentDist;
          } else if (distDiff > 0 && targetStateRef.current === 'high') {
            transitionToNormalView();
            touchPinchDistRef.current = currentDist;
          }
        }
      }
    };

    let lastTapTime = 0;
    const onTouchEnd = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      if (e.touches.length < 2) {
        touchPinchDistRef.current = null;
      }

      // Mobile double-tap on canvas to toggle between Normal and High view
      if (e.changedTouches.length === 1 && !isDraggingRef.current && !isTransitioningRef.current) {
        const now = performance.now();
        if (now - lastTapTime < 320) {
          if (targetStateRef.current === 'normal') {
            transitionToHighView();
          } else {
            transitionToNormalView();
          }
          lastTapTime = 0;
          return;
        }
        lastTapTime = now;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('gesturestart', onGesture);
    el.addEventListener('gesturechange', onGesture);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('gesturestart', onGesture);
      el.removeEventListener('gesturechange', onGesture);
    };
  }, [transitionToHighView, transitionToNormalView]);

  // Double click on empty canvas to toggle between Normal and High View
  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-slug]')) return;

    if (targetStateRef.current === 'normal') {
      transitionToHighView();
    } else {
      transitionToNormalView();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current || isTransitioningRef.current) {
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
      onDoubleClick={handleDoubleClick}
      onDragStart={(e) => e.preventDefault()}
      role="region"
      aria-label="Circular free roam project gallery. Scroll to toggle between Normal and High View. Drag to pan."
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
        {visibleItems.map((item: ExploreLayoutItem, idx: number) => {
          const imageUrl = sanitizeImageUrl(item.coverImageUrl);
          const videoUrl = item.videoUrl ? sanitizeImageUrl(item.videoUrl) : null;
          const href = `/werks/${item.slug}`;
          const left = Math.round(item.x);
          const top = Math.round(item.y);
          const width = Math.round(item.w);
          const height = Math.round(item.h);
          const key = item.id || `${item.slug}-${idx}`;

          // Radial circular ripple delay: starts at center of screen, snapping outward
          const initCx = layout.initialCenterX ?? layout.canvasWidth / 2;
          const initCy = layout.initialCenterY ?? layout.canvasHeight / 2;
          const cardCenterX = item.x + item.w / 2;
          const cardCenterY = item.y + item.h / 2;
          const distFromCenter = Math.hypot(cardCenterX - initCx, (cardCenterY - initCy) * 1.15);
          const entranceDelay = Math.min(0.75, 0.02 + (distFromCenter / 1800) * 0.55);

          const isCenterHero = distFromCenter < 350;
          const isInitialCard = initialCardIdsRef.current.has(item.id || item.slug);

          return (
            <Link
              key={key}
              href={href}
              data-slug={item.slug}
              className="exploreCard"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
              onClick={handleCardClick}
              aria-label={item.title}
            >
              <div
                className="exploreCardImageWrapper"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={
                  !hasEntered && isInitialCard
                    ? {
                        animation: `circularCardEntrance 1ms step-end ${entranceDelay.toFixed(3)}s both`,
                      }
                    : undefined
                }
              >
                {item.mediaType === 'video' && videoUrl ? (
                  <video
                    suppressHydrationWarning
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="exploreCardMedia"
                  />
                ) : item.mediaType === 'gif' && imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    loading="eager"
                    priority={isCenterHero}
                    sizes="(max-width: 809.98px) 70vw, 420px"
                    className="exploreCardImage"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    loading="eager"
                    priority={isCenterHero}
                    sizes="(max-width: 809.98px) 70vw, 420px"
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

              {/* Grid-style Slide-in Title Badge Overlay on Hover */}
              <div className="captionOverlay">
                <div className="captionInner">
                  <div className="captionLine">
                    <span className="captionTitle">{item.title}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
