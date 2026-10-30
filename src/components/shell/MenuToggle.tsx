'use client';

import { useState } from 'react';
import Link from 'next/link';

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

export function MenuToggle() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [werksOpen, setWerksOpen] = useState(false);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      if (!next) {
        setWerksOpen(false);
      }
      return next;
    });
  };

  const toggleWerks = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWerksOpen((prev) => !prev);
  };

  return (
    <div className="menuFixed">
      <nav
        className={`menuContainer ${menuOpen ? 'menuOpen' : 'menuClosed'}`}
        id="mainMenu"
        aria-label="Main Navigation"
      >
        <button
          type="button"
          className="navButton menuToggleButton"
          id="menuToggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`menuArrow ${menuOpen ? 'arrowOpen' : 'arrowClosed'}`} id="menuArrow">
            <ArrowSvg />
          </span>
          <span id="menuText">{menuOpen ? 'Close' : 'Menu'}</span>
        </button>

        <div className="navItemsList">
          {/* Mobile-only Home Link */}
          <div className="navItemWrapper mobileOnly">
            <Link href="/" className="navButton" onClick={handleLinkClick}>
              Home
            </Link>
          </div>

          {/* Desktop-only Werks Link */}
          <div className="navItemWrapper desktopOnly">
            <Link href="/werks" className="navButton" onClick={handleLinkClick}>
              Werks
            </Link>
          </div>

          {/* Mobile-only Werks Accordion */}
          <div className="navItemWrapper mobileOnly mobileWerksAccordion">
            <button
              type="button"
              className="navButton werksAccordionToggle"
              onClick={toggleWerks}
              aria-expanded={werksOpen}
            >
              <span>Werks</span>
              <span className={`accordionArrow ${werksOpen ? 'accordionOpen' : 'accordionClosed'}`}>
                <ArrowSvg />
              </span>
            </button>
            {werksOpen && (
              <div className="accordionSubItems">
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
              </div>
            )}
          </div>

          {/* Archive Link */}
          <div className="navItemWrapper">
            <Link href="/archive" className="navButton" onClick={handleLinkClick}>
              Archive
            </Link>
          </div>

          {/* Information Link */}
          <div className="navItemWrapper">
            <Link href="/information" className="navButton" onClick={handleLinkClick}>
              Information
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
