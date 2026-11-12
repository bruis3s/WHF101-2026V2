'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

function ArrowSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 6 10"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      style={{ width: '7px', height: '11.66px', display: 'block' }}
    >
      <path d="M6 10l-6-5 6-5 0 10z" fill="currentColor" />
    </svg>
  );
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function MenuToggle() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const shouldReduceMotion = useReducedMotion();

  const [menuOpen, setMenuOpen] = useState(false);
  const [werksOpen, setWerksOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 809.98px)').matches
      : false
  );

  const containerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({
    buttonWidth: 86,
    buttonHeight: 39.2,
    fullWidth: 420,
    fullHeight: 200,
  });

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setWerksOpen(false);
  }

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 809.98px)');
    const updateMobile = () => setIsMobile(mql.matches);
    updateMobile();
    mql.addEventListener('change', updateMobile);
    return () => mql.removeEventListener('change', updateMobile);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      const btn = menuButtonRef.current;
      const list = listRef.current;
      if (!btn || !list) return;

      const btnW = btn.offsetWidth;
      const btnH = btn.offsetHeight;
      const listW = list.scrollWidth;
      const listH = list.scrollHeight;

      setDimensions({
        buttonWidth: btnW,
        buttonHeight: btnH,
        fullWidth: btnW + 2 + listW,
        fullHeight: btnH + 2 + listH,
      });
    };

    updateDimensions();

    const ro = new ResizeObserver(updateDimensions);
    if (menuButtonRef.current) ro.observe(menuButtonRef.current);
    if (listRef.current) ro.observe(listRef.current);

    return () => ro.disconnect();
  }, [isHome, werksOpen, isMobile]);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      if (!next) {
        setTimeout(() => setWerksOpen(false), 700);
      }
      return next;
    });
  };

  const toggleWerks = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWerksOpen((prev) => !prev);
  };

  // Smooth ease-out slide transition
  const slideTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: 0.45,
        ease: EASE_OUT,
      };

  const targetWidth = menuOpen
    ? dimensions.fullWidth
    : dimensions.buttonWidth;

  const targetHeight = dimensions.buttonHeight;

  const totalItems = isHome ? 3 : 4;

  const getIndex = (item: 'home' | 'werks' | 'archive' | 'information') => {
    if (item === 'home') return 0;
    const offset = isHome ? 0 : 1;
    if (item === 'werks') return offset;
    if (item === 'archive') return offset + 1;
    if (item === 'information') return offset + 2;
    return 0;
  };

  const getItemAnimation = (item: 'home' | 'werks' | 'archive' | 'information') => {
    if (!isMobile) {
      return {};
    }
    const index = getIndex(item);
    const reverseIndex = totalItems - 1 - index;
    const delay = (menuOpen ? index : reverseIndex) * 0.06;

    return {
      animate: {
        x: menuOpen ? 0 : 'calc(100% + 60px)',
      },
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            duration: 0.45,
            ease: EASE_OUT,
            delay,
          },
    };
  };

  return (
    <div className="menuFixed">
      <motion.nav
        ref={containerRef}
        className={`menuContainer ${menuOpen ? 'menuOpen' : 'menuClosed'}`}
        id="mainMenu"
        aria-label="Main Navigation"
        animate={
          isMobile
            ? undefined
            : {
                width: targetWidth,
                height: targetHeight,
              }
        }
        initial={false}
        transition={slideTransition}
        style={{
          overflow: isMobile ? 'visible' : 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Main Toggle Button */}
        <button
          ref={menuButtonRef}
          type="button"
          className="navButton menuToggleButton"
          id="menuToggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{ flexShrink: 0 }}
        >
          <span
            className={`menuArrow ${menuOpen ? 'arrowOpen' : 'arrowClosed'}`}
            id="menuArrow"
          >
            <ArrowSvg />
          </span>
          <span id="menuText">{menuOpen ? 'Close' : 'Menu'}</span>
        </button>

        {/* Nav Items Container */}
        <div
          ref={listRef}
          className="navItemsList"
          style={{
            pointerEvents: menuOpen ? 'auto' : 'none',
          }}
        >
          {/* Home Link (rendered on all pages except Homepage) */}
          {!isHome && (
            <motion.div
              className="navItemWrapper"
              {...getItemAnimation('home')}
              initial={false}
            >
              <Link href="/" className="navButton" onClick={handleLinkClick}>
                Home
              </Link>
            </motion.div>
          )}

          {/* Desktop-only Werks Link */}
          <div className="navItemWrapper desktopOnly">
            <Link href="/werks" className="navButton" onClick={handleLinkClick}>
              Werks
            </Link>
          </div>

          {/* Mobile-only Werks Accordion */}
          <motion.div
            className="navItemWrapper mobileOnly mobileWerksAccordion"
            {...getItemAnimation('werks')}
            initial={false}
          >
            <button
              type="button"
              className="navButton werksAccordionToggle"
              onClick={toggleWerks}
              aria-expanded={werksOpen}
            >
              <span>Werks</span>
              <span
                className={`accordionArrow ${werksOpen ? 'accordionOpen' : 'accordionClosed'}`}
              >
                <ArrowSvg />
              </span>
            </button>
            <AnimatePresence>
              {werksOpen && (
                <motion.div
                  className="accordionSubItems"
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { height: 'auto', opacity: 1 }
                  }
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={slideTransition}
                  style={{ overflow: 'hidden' }}
                >
                  <Link
                    href="/werks/list"
                    className="navButton accordionSubItem"
                    onClick={handleLinkClick}
                  >
                    List
                  </Link>
                  <Link
                    href="/werks"
                    className="navButton accordionSubItem"
                    onClick={handleLinkClick}
                  >
                    Grid
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Archive Link */}
          <motion.div
            className="navItemWrapper"
            {...getItemAnimation('archive')}
            initial={false}
          >
            <Link href="/archive" className="navButton" onClick={handleLinkClick}>
              Archive
            </Link>
          </motion.div>

          {/* Information Link */}
          <motion.div
            className="navItemWrapper"
            {...getItemAnimation('information')}
            initial={false}
          >
            <Link href="/information" className="navButton" onClick={handleLinkClick}>
              Information
            </Link>
          </motion.div>
        </div>
      </motion.nav>
    </div>
  );
}
