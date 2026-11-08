import { Reveal } from '@/components/motion/Reveal';
import { WorkCard } from './WorkCard';
import { sanitizeImageUrl } from '@/lib/images';
import type { EditorialRow } from '@/lib/types';

interface WerksGridProps {
  rows: EditorialRow[];
}

export function WerksGrid({ rows }: WerksGridProps) {
  // Determine the first two items with valid images across the grid to set priority
  const prioritySlugs = new Set<string>();
  for (const row of rows) {
    for (const item of row.items) {
      if (sanitizeImageUrl(item.imgUrl)) {
        prioritySlugs.add(item.slug);
        if (prioritySlugs.size >= 2) break;
      }
    }
    if (prioritySlugs.size >= 2) break;
  }

  return (
    <div className="worksContainer" id="worksContainer">
      {rows.map((row) => (
        <Reveal
          key={row.rowIndex}
          className="workRow"
          style={{
            justifyContent: row.justify || 'space-between',
            gap: row.gap || '0px',
          }}
        >
          {row.items.map((item) => (
            <WorkCard
              key={item.slug}
              item={item}
              priority={prioritySlugs.has(item.slug)}
            />
          ))}
        </Reveal>
      ))}
    </div>
  );
}

