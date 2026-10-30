'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
                aria-label={`Sort by ${col.label}${
                  isActive ? (sortDir === 'asc' ? ', ascending' : ', descending') : ''
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
        {filteredItems.map((item) => (
          <Link
            key={item.slug}
            href={`/werks/${item.slug}`}
            className="listRow"
            aria-label={`${item.title}, ${item.category}, ${item.year}`}
          >
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
        ))}
      </div>
    </div>
  );
}
