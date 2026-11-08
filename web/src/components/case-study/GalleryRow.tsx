import Image from 'next/image';
import { sanitizeImageUrl } from '@/lib/images';
import type { CaseStudyRow } from '@/lib/types';

interface GalleryRowProps {
  row: CaseStudyRow;
  projectTitle: string;
  isHero?: boolean;
  startIndex?: number;
}

export function GalleryRow({
  row,
  projectTitle,
  isHero = false,
  startIndex = 0,
}: GalleryRowProps) {
  const cols = row.columns || [];
  if (cols.length === 0) return null;

  const isFullBleedHero =
    isHero &&
    cols.length === 1 &&
    (!cols[0].widthPercent || cols[0].widthPercent === 100) &&
    cols[0].fit !== 'contain';

  const sectionHeight = row.sectionHeight || '100vh';
  const sectionClass = isFullBleedHero ? 'heroSection' : 'editorialRow';

  return (
    <section
      id={row.id}
      className={sectionClass}
      style={{
        width: '100%',
        height: sectionHeight,
        gap: isFullBleedHero ? '0px' : (row.gap || (cols.length > 1 ? '30px' : '0px')),
        justifyContent: isFullBleedHero ? 'center' : (row.justifyContent || 'flex-start'),
        alignItems: isFullBleedHero ? 'stretch' : (row.verticalAlign || 'stretch'),
        paddingTop: isFullBleedHero ? '0px' : (row.paddingTop || '0px'),
        paddingBottom: isFullBleedHero ? '0px' : (row.paddingBottom || '0px'),
      }}
    >
      {cols.map((col, idx) => {
        const imageUrl = sanitizeImageUrl(col.image);
        if (!imageUrl) return null;

        const fit = col.fit || row.sizingMode || (isFullBleedHero ? 'cover' : 'cover');
        const wrapperClass =
          fit === 'cover'
            ? 'coverWrapper'
            : fit === 'contain'
              ? 'containWrapper'
              : 'fitWidthWrapper';
        const imgClass =
          fit === 'cover'
            ? 'coverImg'
            : fit === 'contain'
              ? 'containImg'
              : 'fitWidthImg';

        const widthStyle = col.widthPercent ? `${col.widthPercent}%` : undefined;

        // Image wrapper styles depending on aspect ratio & sizing
        const wrapperStyle: React.CSSProperties = {
          position: 'relative',
        };

        if (isFullBleedHero && fit === 'cover') {
          wrapperStyle.width = '100%';
          wrapperStyle.height = '100%';
          (wrapperStyle as Record<string, string>)['--mobile-aspect-ratio'] = String(col.aspectRatio || '3 / 2');
        } else if (fit === 'contain') {
          wrapperStyle.width = '100%';
          wrapperStyle.height = '100%';
        } else if (col.aspectRatio && !isFullBleedHero) {
          wrapperStyle.aspectRatio = String(col.aspectRatio);
          wrapperStyle.width = '100%';
          wrapperStyle.height = 'auto';
        } else if (fit === 'fit-width') {
          wrapperStyle.height = '100%';
          wrapperStyle.width = 'auto';
        } else {
          wrapperStyle.width = '100%';
          wrapperStyle.height = '100%';
        }

        const imageIndex = startIndex + idx;

        return (
          <div
            key={idx}
            className="editorialCol"
            style={{
              flex: isFullBleedHero ? '1 1 100%' : (widthStyle ? `0 0 ${widthStyle}` : 1),
              width: isFullBleedHero ? '100%' : (widthStyle || undefined),
              maxWidth: isFullBleedHero ? '100%' : (widthStyle || '100%'),
              height: '100%',
              justifyContent: col.verticalAlign || row.verticalAlign || 'flex-start',
            }}
          >
            <div
              className={`imageWrapper ${wrapperClass} imageClickable`}
              style={wrapperStyle}
              data-image-index={imageIndex}
              role="button"
              tabIndex={0}
              aria-label={`View larger image ${imageIndex + 1}`}
            >
              <Image
                src={imageUrl}
                alt={col.caption || `${projectTitle} image ${idx + 1}`}
                fill
                className={imgClass}
                sizes={col.widthPercent ? `${col.widthPercent}vw` : '100vw'}
                priority={col.priority || startIndex === 0}
              />
            </div>
            {col.caption && <span className="caption">{col.caption}</span>}
          </div>
        );
      })}
    </section>
  );
}

