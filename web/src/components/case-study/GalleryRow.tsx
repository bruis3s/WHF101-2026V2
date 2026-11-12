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
  const hasRowHeader = Boolean(row.figureNumber || row.title);
  const hasRowCaption = Boolean(row.caption);
  const hasHeaderOrFooter = hasRowHeader || hasRowCaption;

  const renderedColumns = cols.map((col, idx) => {
    const imageUrl = sanitizeImageUrl(col.image);
    if (!imageUrl) return null;

    const fit = col.fit || row.sizingMode || (isFullBleedHero ? 'cover' : 'cover');
    const isFillHeight = Boolean(col.fillHeight);
    const isFill = Boolean(col.fill);

    const wrapperClass = isFillHeight
      ? 'fitWidthWrapper'
      : fit === 'cover'
        ? 'coverWrapper'
        : fit === 'contain'
          ? 'containWrapper'
          : 'fitWidthWrapper';

    const imgClass = isFillHeight
      ? 'fitWidthImg'
      : fit === 'cover'
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
    } else if (isFillHeight) {
      wrapperStyle.height = '100%';
      wrapperStyle.width = 'auto';
      wrapperStyle.aspectRatio = String(col.aspectRatio || '2 / 3');
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
    const isTopCaption = col.captionPosition === 'top';
    const hasColText = Boolean(col.caption || col.figureNumber);

    const captionElement = hasColText ? (
      <div className={`captionBlock ${isTopCaption ? 'captionTop' : 'captionBottom'}`}>
        {col.figureNumber && <span className="figureNumber">{col.figureNumber}</span>}
        {col.caption && <span className="caption">{col.caption}</span>}
      </div>
    ) : null;

    const isVideo = Boolean(col.video) || imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm');
    const mediaSrc = col.video ? sanitizeImageUrl(col.video) : imageUrl;
    const isGif = imageUrl.endsWith('.gif');

    const mediaElement = isVideo && mediaSrc ? (
      <div
        className={`imageWrapper ${wrapperClass} imageClickable`}
        style={wrapperStyle}
        data-image-index={imageIndex}
        tabIndex={0}
        aria-label={`${projectTitle} video ${idx + 1}`}
      >
        <video
          src={mediaSrc}
          autoPlay
          loop
          muted
          playsInline
          className={imgClass}
          style={{ width: '100%', height: '100%', objectFit: fit === 'contain' ? 'contain' : 'cover', display: 'block' }}
        />
      </div>
    ) : (
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
          sizes={isFillHeight ? '(max-height: 100vh) 66vh, 600px' : (col.widthPercent ? `${col.widthPercent}vw` : '100vw')}
          priority={col.priority || startIndex === 0}
          unoptimized={isGif}
        />
      </div>
    );

    const columnContent = hasColText ? (
      <div className="captionCard">
        {isTopCaption && captionElement}
        {mediaElement}
        {!isTopCaption && captionElement}
      </div>
    ) : (
      mediaElement
    );

    return (
      <div
        key={idx}
        className={`editorialCol ${isFillHeight ? 'fillHeightCol' : ''} ${isFill ? 'fillCol' : ''}`}
        style={{
          flex: isFullBleedHero
            ? '1 1 100%'
            : isFillHeight
              ? '0 0 auto'
              : isFill
                ? '1 1 0'
                : (widthStyle ? `0 0 ${widthStyle}` : 1),
          width: isFullBleedHero
            ? '100%'
            : isFillHeight
              ? 'auto'
              : isFill
                ? 'auto'
                : (widthStyle || undefined),
          maxWidth: isFullBleedHero
            ? '100%'
            : isFillHeight
              ? undefined
              : isFill
                ? '100%'
                : (widthStyle || '100%'),
          height: hasRowCaption ? 'auto' : '100%',
          justifyContent: col.verticalAlign || row.verticalAlign || 'flex-start',
          paddingTop: col.paddingTop || undefined,
          paddingBottom: col.paddingBottom || undefined,
        }}
      >
        {columnContent}
      </div>
    );
  });

  return (
    <section
      id={row.id}
      className={sectionClass}
      style={{
        width: '100%',
        height: sectionHeight,
        display: 'flex',
        flexDirection: hasHeaderOrFooter ? 'column' : undefined,
        gap: isFullBleedHero ? '0px' : (row.gap || (cols.length > 1 ? '30px' : '0px')),
        justifyContent: hasRowCaption
          ? (row.justifyContent || 'flex-start')
          : hasHeaderOrFooter
            ? 'space-between'
            : isFullBleedHero
              ? 'center'
              : (row.justifyContent || 'flex-start'),
        alignItems: hasHeaderOrFooter
          ? 'flex-start'
          : isFullBleedHero
            ? 'stretch'
            : (row.verticalAlign || 'stretch'),
        ...(isFullBleedHero ? { paddingTop: '0px', paddingBottom: '0px' } : {}),
        ...(row.paddingTop ? { paddingTop: row.paddingTop } : {}),
        ...(row.paddingBottom ? { paddingBottom: row.paddingBottom } : {}),
      }}
    >
      {hasRowHeader && (
        <div className="rowHeader">
          {row.figureNumber && <span className="figureNumber">{row.figureNumber}</span>}
          {row.title && <span className="rowTitle">{row.title}</span>}
        </div>
      )}

      {hasRowCaption ? (
        <div className="rowImageTextContainer">
          <div
            className="editorialColumnsRow"
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: 'fit-content',
              gap: row.gap || (cols.length > 1 ? '10px' : '0px'),
              justifyContent: row.justifyContent || 'flex-start',
              alignItems: 'flex-start',
            }}
          >
            {renderedColumns}
          </div>
          <div className="rowCaptionBottom">
            <span className="caption">{row.caption}</span>
          </div>
        </div>
      ) : hasHeaderOrFooter ? (
        <div
          className="editorialColumnsRow"
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            gap: row.gap || (cols.length > 1 ? '30px' : '0px'),
            justifyContent: row.justifyContent || 'flex-start',
            alignItems: row.verticalAlign || 'stretch',
          }}
        >
          {renderedColumns}
        </div>
      ) : (
        renderedColumns
      )}
    </section>
  );
}

