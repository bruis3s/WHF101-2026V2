'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  'better-goods': '/images/thumbnails/list/better-goods.webp',
  'brightspot-agora-2025': '/images/thumbnails/list/brightspot-agora-2025.webp',
  'brightspot-agora-2026': '/images/thumbnails/list/brightspot-agora-2026.webp',
  'brightspot-agora': '/images/thumbnails/list/brightspot-agora.webp',
  'brightspot-foodpark': '/images/thumbnails/list/brightspot-foodpark.webp',
  'daniel-s-room': '/images/thumbnails/list/daniel-s-room.webp',
  'demie-bakmie-blok-m': '/images/thumbnails/list/demie-bakmie-blok-m.webp',
  'demie-bakmie-depok': '/images/thumbnails/list/demie-bakmie-depok.webp',
  'dickies-central-gi': '/images/thumbnails/list/dickies-central-gi.webp',
  'dickies-fw25': '/images/thumbnails/list/dickies-fw25.webp',
  'dickies-photobox': '/images/thumbnails/list/dickies-photobox.webp',
  'dickies': '/images/thumbnails/list/dickies.webp',
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
  'sosco-dinner-gathering-ss27': '/images/thumbnails/list/sosco-dinner-gathering-ss27.webp',
  'sporting-supply-co': '/images/thumbnails/list/sporting-supply-co.webp',
  'the-goods-diner': '/images/thumbnails/list/the-goods-diner.webp',
  'uss-24-dickies': '/images/thumbnails/list/uss-24-dickies.webp',
  'uss-24-saucony': '/images/thumbnails/list/uss-24-saucony.webp',
  'zodiac': '/images/thumbnails/list/zodiac.webp',
};

const LANDSCAPE_SLUGS = new Set([
  '180spm-aeon-bsd',
  'brightspot-agora-2026',
  'brightspot-agora',
  'demie-bakmie-blok-m',
  'demie-bakmie-depok',
  'dickies-fw25',
  'dickies',
  'j-germeister-x-ardneks',
  'saucony-ss26',
  'saucony-x-jd-id',
  'seek-office',
  'sosco-dinner-gathering-ss27',
  'sporting-supply-co',
  'the-goods-diner',
  'uss-24-dickies',
  'uss-24-saucony',
  'zodiac',
]);

function getRandomLeft(slug: string, index: number) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) & 0xffffffff;
  }
  const absH = Math.abs(h);

  // Distribute across 5 zones across the table width:
  // Zone 0: Far-Left (6% - 14%)
  // Zone 1: Mid-Left (18% - 26%)
  // Zone 2: Center (30% - 38%)
  // Zone 3: Mid-Right (42% - 50%)
  // Zone 4: Far-Right (54% - 62%)
  const zoneCycle = [0, 3, 1, 4, 2, 0, 4, 1, 3, 2];
  const zone = zoneCycle[index % zoneCycle.length];

  let leftBase = 30;
  if (zone === 0) leftBase = 6 + (absH % 9);
  else if (zone === 1) leftBase = 18 + (absH % 9);
  else if (zone === 2) leftBase = 30 + (absH % 9);
  else if (zone === 3) leftBase = 42 + (absH % 9);
  else leftBase = 54 + (absH % 9);

  return `${leftBase}%`;
}

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
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (!sortKey) return result;
    return [...result].sort((a, b) => {
      const valA = (a[sortKey] || '').toLowerCase();
      const valB = (b[sortKey] || '').toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
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
                onClick={() => setSelectedCategory(cat)}
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
                aria-label={`Sort by ${col.label}${isActive ? (sortDir === 'asc' ? ', ascending' : ', descending') : ''
                  }`}
              >
                <span>{col.label}</span>
                <span className="sortIconWrapper" id={`sort-${col.key}`} aria-hidden="true">
                  <svg
                    viewBox="0 0 11.16 8.58"
                    className={`sortArrow${isActive ? ' sortArrowActive' : ''}`}
                    style={{
                      transform: isActive && sortDir === 'desc' ? 'rotate(180deg)' : 'none',
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
          const isLandscape = LANDSCAPE_SLUGS.has(item.slug);
          const hoverLeft = getRandomLeft(item.slug, index);

          return (
            <Link
              key={item.slug}
              href={`/werks/${item.slug}`}
              className="listRow"
              aria-label={`${item.title}, ${item.category}, ${item.year}`}
              style={{ '--hover-left': hoverLeft } as React.CSSProperties}
            >
              {thumbUrl && (
                <div
                  className={`listRowHoverImage ${
                    isLandscape ? 'hoverImageLandscape' : 'hoverImagePortrait'
                  }`}
                  aria-hidden="true"
                >
                  <Image
                    src={thumbUrl}
                    alt=""
                    width={isLandscape ? 500 : 360}
                    height={isLandscape ? 333 : 480}
                    className="hoverThumbImg"
                    unoptimized
                    priority={index < 4}
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
          );
        })}
      </div>
    </div>
  );
}
