'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { sanitizeImageUrl } from '@/lib/images';
import type { EditorialItem } from '@/lib/types';

interface WorkCardProps {
  item: EditorialItem;
  priority?: boolean;
}

// Framer motion spring: Time-based, 0.6s duration, 0.1 bounce, 0s delay
const SPRING_TRANSITION = {
  type: 'spring' as const,
  duration: 0.6,
  bounce: 0.1,
  delay: 0,
};

export function WorkCard({ item, priority = false }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const imageUrl = sanitizeImageUrl(item.imgUrl);
  const href = `/werks/${item.slug}`;

  // Format status for desktop: e.g. "Finished, 2026", "Conceptual, 2024"
  const statusText = (item.status || item.year || '').replace(/,(\S)/g, ', $1');

  // Format mobile subtitle as "<Category>, <Year>" (e.g. "Installation, 2026")
  const yearMatch = item.year.match(/\b\d{4}\b/);
  const year = yearMatch ? yearMatch[0] : item.year;
  const mobileMetaText =
    item.category && year ? `${item.category}, ${year}` : item.category || year;

  const ariaDescription = `${item.title} — ${item.category ? `${item.category}, ` : ''}${statusText}`;

  const activeTransition = shouldReduceMotion
    ? { duration: 0 }
    : SPRING_TRANSITION;

  return (
    <LayoutGroup id={item.slug}>
      <Link
        href={href}
        className="cardLink"
        style={{ width: item.width || '45%' }}
        aria-label={ariaDescription}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <div
          className="imageContainer"
          style={{ aspectRatio: item.aspectRatio ? String(item.aspectRatio) : '1.5' }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              className="cardImage"
              sizes="(max-width: 809.98px) 100vw, 50vw"
              priority={priority}
            />
          ) : (
            <div className="placeholderBox">
              <span>{item.title}</span>
            </div>
          )}
        </div>

        <motion.div
          className="captionOverlay"
          initial={false}
          animate={{ x: isHovered ? '0%' : '-101%' }}
          transition={activeTransition}
        >
          <motion.div
            layout="position"
            transition={activeTransition}
            className="captionInner"
            style={{
              alignItems: isHovered ? 'flex-start' : 'flex-end',
            }}
          >
            <motion.div
              layout="position"
              transition={activeTransition}
              className="captionLine"
            >
              <span className="captionTitle">{item.title}</span>
            </motion.div>

            {/* Desktop only: Type */}
            {item.category && (
              <motion.div
                layout="position"
                transition={activeTransition}
                className="captionLine captionDesktopOnly"
              >
                <span className="captionMeta">{item.category}</span>
              </motion.div>
            )}

            {/* Desktop only: Status (Finished, Year) */}
            {statusText && (
              <motion.div
                layout="position"
                transition={activeTransition}
                className="captionLine captionDesktopOnly"
              >
                <span className="captionMeta">{statusText}</span>
              </motion.div>
            )}

            {/* Mobile only: Combined Category, Year */}
            {mobileMetaText && (
              <div className="captionLine captionMobileOnly">
                <span className="captionMeta">{mobileMetaText}</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </Link>
    </LayoutGroup>
  );
}
