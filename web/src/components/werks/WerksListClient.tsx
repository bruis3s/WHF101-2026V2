'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import type { WerksListItem } from '@/lib/types';

type SortKey = 'code' | 'title' | 'category' | 'location' | 'year';
type SortDir = 'asc' | 'desc';

interface WerksListClientProps {
  items: WerksListItem[];
}

interface ColumnConfig {
  key: SortKey;
  label: string;
  className: string;
}

interface HoverSpec {
  width: number;
  x: number;
  y: number;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'code', label: 'Id', className: 'colId' },
  { key: 'title', label: 'Title', className: 'colTitle' },
  { key: 'category', label: 'Typology', className: 'colType' },
  { key: 'location', label: 'Location', className: 'colLocation' },
  { key: 'year', label: 'Year', className: 'colYear' },
];

const CATEGORIES = ['All', 'Architecture', 'Interior', 'Installation'];

const THUMBNAILS: Record<string, string> = {
  '180spm-aeon-bsd': '/images/thumbnails/list/180spm-aeon-bsd.webp',
  'apple-condovilla': '/images/thumbnails/list/apple-condovilla.webp',
  'besarati-kynd-office': '/images/thumbnails/list/besarati-kynd-office.webp',
  'better-goods': '/images/thumbnails/list/better-goods.webp',
  'brightspot-agora-2025': '/images/thumbnails/list/brightspot-agora-2025.webp',
  'brightspot-agora-2026': '/images/thumbnails/list/brightspot-agora-2026.webp',
  'brightspot-agora': '/images/thumbnails/list/brightspot-agora.webp',
  'brightspot-foodpark': '/images/thumbnails/list/brightspot-foodpark.webp',
  'daniel-s-room': '/images/thumbnails/list/daniel-s-room.webp',
  'dave-s-residence': '/images/thumbnails/list/dave-s-residence.webp',
  'demie-bakmie-blok-m': '/images/thumbnails/list/demie-bakmie-blok-m.webp',
  'demie-bakmie-depok': '/images/thumbnails/list/demie-bakmie-depok.webp',
  'dickies-central-gi': '/images/thumbnails/list/dickies-central-gi.webp',
  'dickies-fw25': '/images/thumbnails/list/dickies-fw25.webp',
  'dickies-photobox': '/images/thumbnails/list/dickies-photobox.webp',
  'dickies': '/images/thumbnails/list/dickies.webp',
  'guess': '/images/thumbnails/list/guess.webp',
  'j-germeister-booth': '/images/thumbnails/list/j-germeister-booth.webp',
  'j-germeister-x-ardneks': '/images/thumbnails/list/j-germeister-x-ardneks.webp',
  'masshiro': '/images/thumbnails/list/masshiro.webp',
  'norda-seek-grand-indonesia': '/images/thumbnails/list/norda-seek-grand-indonesia.webp',
  'norda-seek-plaza-senayan': '/images/thumbnails/list/norda-seek-plaza-senayan.webp',
  'real-heavy': '/images/thumbnails/list/real-heavy.webp',
  'salomon': '/images/thumbnails/list/salomon.webp',
  'saucony-aw25': '/images/thumbnails/list/saucony-aw25.webp',
  'saucony-ss26': '/images/thumbnails/list/saucony-ss26.webp',
  'saucony-x-jd-id': '/images/thumbnails/list/saucony-x-jd-id.webp',
  'seek-office': '/images/thumbnails/list/seek-office.webp',
  'sideroom': '/images/thumbnails/list/sideroom.webp',
  'sonaa-cafe': '/images/thumbnails/list/sonaa-cafe.webp',
  'sosco-dinner-gathering-ss27': '/images/thumbnails/list/sosco-dinner-gathering-ss27.webp',
  'sporting-supply-co': '/images/thumbnails/list/sporting-supply-co.webp',
  'the-goods-diner': '/images/thumbnails/list/the-goods-diner.webp',
  'toko-misteri': '/images/thumbnails/list/toko-misteri.webp',
  'uss-24-dickies': '/images/thumbnails/list/uss-24-dickies.webp',
  'uss-24-saucony': '/images/thumbnails/list/uss-24-saucony.webp',
  'yesterday-backyard': '/images/thumbnails/list/yesterday-backyard.webp',
  'zodiac': '/images/thumbnails/list/zodiac.webp',
  'haf242-kultura': '/images/thumbnails/list/haf242-kultura.webp',
  'haf235-nasgero-scbd': '/images/thumbnails/list/haf235-nasgero-scbd.webp',
};

// Exact Framer specifications: [width, X position, Y position]
const HOVER_SPECS: Record<string, HoverSpec> = {
  'yesterday-backyard': { width: 500, x: 33.55, y: -2.74 },
  'besarati-kynd-office': { width: 300, x: 33.55, y: -2.74 },
  'daniel-s-room': { width: 300, x: 33.55, y: -92.74 },
  'sporting-supply-co': { width: 500, x: 230.55, y: 84.37 },
  'dave-s-residence': { width: 500, x: 167.88, y: 6.72 },
  'seek-office': { width: 400, x: 413.55, y: 47.26 },
  'sonaa-cafe': { width: 300, x: -358.5, y: -128.47 },
  'toko-misteri': { width: 400, x: 73.55, y: -92.74 },
  'zodiac': { width: 500, x: 73.55, y: -92.74 },
  'apple-condovilla': { width: 500, x: 167.88, y: 6.72 },
  'better-goods': { width: 300, x: 73.55, y: -92.74 },
  'sideroom': { width: 400, x: -257.24, y: -312.15 },
  'dickies': { width: 500, x: 138.27, y: 53.72 },
  'salomon': { width: 300, x: -46.31, y: -434.14 },
  'dickies-central-gi': { width: 300, x: 374.56, y: -403.37 },
  'the-goods-diner': { width: 500, x: -94.31, y: -373.06 },
  '180spm-aeon-bsd': { width: 500, x: -209.29, y: -90.51 },
  'real-heavy': { width: 500, x: -266.31, y: -260.57 },
  'demie-bakmie-depok': { width: 500, x: 319.69, y: -151.55 },
  'demie-bakmie-blok-m': { width: 600, x: 14.35, y: -364.86 },
  'masshiro': { width: 500, x: 324.35, y: -434.86 },
  'j-germeister-booth': { width: 500, x: 224.35, y: -404.86 },
  'j-germeister-x-ardneks': { width: 500, x: -52.29, y: -200.42 },
  'brightspot-foodpark': { width: 450, x: -174.99, y: -550.95 },
  'guess': { width: 600, x: 140.81, y: -300.67 },
  'brightspot-agora': { width: 600, x: 20.81, y: -150.67 },
  'uss-24-dickies': { width: 500, x: 105.45, y: -225.65 },
  'uss-24-saucony': { width: 600, x: -205.11, y: -388.91 },
  'dickies-fw25': { width: 500, x: 230.94, y: -369.81 },
  'saucony-aw25': { width: 300, x: -62.53, y: -475.03 },
  'dickies-photobox': { width: 300, x: 300.87, y: -568.39 },
  'saucony-x-jd-id': { width: 500, x: 170.87, y: -518.39 },
  'norda-seek-grand-indonesia': { width: 300, x: 30.87, y: -438.39 },
  'norda-seek-plaza-senayan': { width: 300, x: 340.87, y: -538.39 },
  'saucony-ss26': { width: 500, x: 100.87, y: -548.39 },
  'brightspot-agora-2025': { width: 300, x: 460.87, y: -438.39 },
  'brightspot-agora-2026': { width: 500, x: 257.68, y: -390.93 },
  'sosco-dinner-gathering-ss27': { width: 500, x: 117.68, y: -380.93 },
  'haf242-kultura': { width: 500, x: 140.0, y: -350.0 },
  'haf235-nasgero-scbd': { width: 500, x: -100.0, y: -320.0 },
};

// Framer animation spec: Spring, Time-based, 0.4s duration, 0.2 bounce, 0 delay
const SPRING_TRANSITION = {
  type: 'spring' as const,
  duration: 0.4,
  bounce: 0.2,
  delay: 0,
};

export function WerksListClient({ items }: WerksListClientProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'year' ? 'desc' : 'asc');
    }
  };

  const filteredItems = useMemo(() => {
    let result = items;
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const valA = (a[sortKey] || '').toLowerCase();
        const valB = (b[sortKey] || '').toLowerCase();
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (selectedCategory && selectedCategory !== 'All') {
      const selected = selectedCategory.toLowerCase();
      const matching: WerksListItem[] = [];
      const nonMatching: WerksListItem[] = [];
      for (const item of result) {
        if (item.category?.toLowerCase() === selected) {
          matching.push(item);
        } else {
          nonMatching.push(item);
        }
      }
      return [...matching, ...nonMatching];
    }

    return result;
  }, [items, selectedCategory, sortKey, sortDir]);

  return (
    <div className="listView" role="region" aria-label="Werks list">
      {/* Mobile Category Filters (list-mobile.html) */}
      <div className="listMobileFiltersContainer" aria-label="Category filters">
        <div className="listMobileFilters">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`filterButton ${isActive ? 'filterActive' : ''}`}
                onClick={() =>
                  setSelectedCategory((prev) => (prev === cat ? 'All' : cat))
                }
                aria-pressed={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sortable Architectural Header (Desktop-only) */}
      <div className="listHeader" role="row">
        {COLUMNS.map((col) => {
          const isActive = sortKey === col.key;
          const sortAria = isActive
            ? sortDir === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none';

          return (
            <div
              key={col.key}
              className={col.className}
              role="columnheader"
              aria-sort={sortAria}
            >
              <button
                type="button"
                className="headerButton"
                onClick={() => handleSort(col.key)}
                aria-label={`Sort by ${col.label}${
                  isActive ? ` (${sortDir})` : ''
                }`}
              >
                <span>{col.label}</span>
                <span
                  className="sortIconWrapper"
                  aria-hidden="true"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <svg
                    viewBox="0 0 11.16 8.58"
                    className={`sortArrow ${isActive ? 'sortArrowActive' : ''}`}
                    style={{
                      transform:
                        isActive && sortDir === 'desc'
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                    }}
                  >
                    <path
                      d="M11.158 8.583l-11.158 0 5.802-8.583 5.356 8.583z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Rows Container */}
      <div id="listRowsContainer">
        {filteredItems.map((item, index) => {
          const thumbUrl = THUMBNAILS[item.slug];
          const spec = HOVER_SPECS[item.slug] || { width: 500, x: 0, y: 0 };
          const isMuted =
            selectedCategory !== 'All' &&
            item.category?.toLowerCase() !== selectedCategory.toLowerCase();

          return (
            <motion.div
              key={item.slug}
              layout="position"
              transition={SPRING_TRANSITION}
              style={{ width: '100%' }}
            >
              <Link
                href={`/werks/${item.slug}`}
                className={`listRow ${isMuted ? 'rowMuted' : ''}`}
                aria-label={`${item.title}, ${item.category}, ${item.year}`}
                style={
                  {
                    '--hover-x': `${spec.x}px`,
                    '--hover-y': `${spec.y}px`,
                    '--hover-width': `${spec.width}px`,
                  } as React.CSSProperties
                }
              >
                {thumbUrl && (
                  <div className="listRowHoverImage" aria-hidden="true">
                    <Image
                      src={thumbUrl}
                      alt=""
                      width={spec.width}
                      height={spec.width}
                      className="hoverThumbImg"
                      unoptimized
                      priority={index < 4}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                )}
                <div className="colId">
                  <div className="cellBox">
                    <span>{item.code || '—'}</span>
                  </div>
                </div>
                <div className="colTitle">
                  <div className="cellBox">
                    <span>{item.title || '—'}</span>
                  </div>
                </div>
                <div className="colType">
                  <div className="cellBox">
                    <span>{item.category || '—'}</span>
                  </div>
                </div>
                <div className="colLocation">
                  <div className="cellBox">
                    <span>{item.location || '—'}</span>
                  </div>
                </div>
                <div className="colYear">
                  <div className="cellBox">
                    <span>{item.year || '—'}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
