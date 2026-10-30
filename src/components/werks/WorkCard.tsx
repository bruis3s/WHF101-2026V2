import Image from 'next/image';
import Link from 'next/link';
import { sanitizeImageUrl } from '@/lib/images';
import type { EditorialItem } from '@/lib/types';

interface WorkCardProps {
  item: EditorialItem;
  priority?: boolean;
}

export function WorkCard({ item, priority = false }: WorkCardProps) {
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

  return (
    <Link
      href={href}
      className="cardLink"
      style={{ width: item.width || '45%' }}
      aria-label={ariaDescription}
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
      <div className="captionOverlay">
        <div className="captionLine">
          <span className="captionTitle">{item.title}</span>
        </div>
        {/* Desktop only: Type */}
        {item.category && (
          <div className="captionLine captionDesktopOnly">
            <span className="captionMeta">{item.category}</span>
          </div>
        )}
        {/* Desktop only: Status (Finished, Year) */}
        {statusText && (
          <div className="captionLine captionDesktopOnly">
            <span className="captionMeta">{statusText}</span>
          </div>
        )}
        {/* Mobile only: Combined Category, Year */}
        {mobileMetaText && (
          <div className="captionLine captionMobileOnly">
            <span className="captionMeta">{mobileMetaText}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

