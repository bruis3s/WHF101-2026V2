import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCaseStudy, getCaseStudySlugs } from '@/lib/data';
import { SpecList } from '@/components/case-study/SpecList';
import { GalleryRow } from '@/components/case-study/GalleryRow';
import { CaseStudyLightbox } from '@/components/case-study/CaseStudyLightbox';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    return {
      title: 'Project Not Found',
    };
  }

  const title = `${study.title} — HAF WERKS`;
  const description =
    study.subtitle ||
    `${study.title} (${study.projectType || study.category || 'Architecture & Object'}) — HAF WERKS`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: study.coverImageUrl ? [{ url: study.coverImageUrl }] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    notFound();
  }

  const rows = study.layoutRows || [];

  // Flatten all valid images in sequential order for lightbox
  const allImages = rows.flatMap((row) =>
    (row.columns || [])
      .filter((col) => Boolean(col.image))
      .map((col) => ({
        src: col.image,
        alt: col.caption || `${study.title} photo`,
        caption: col.caption,
        aspectRatio: col.aspectRatio,
      }))
  );

  // Precompute row start indices using pure functional mapping
  const rowCounts = rows.map((r) => (r.columns || []).filter((c) => Boolean(c.image)).length);
  const rowStartIndices = rowCounts.map((_, i) =>
    rowCounts.slice(0, i).reduce((sum, count) => sum + count, 0)
  );

  return (
    <main className="caseStudyPage" data-page="case-study">
      <h1 className="visuallyHidden">{study.title} — HAF WERKS</h1>

      <SpecList
        specs={study.specs}
        title={study.title}
        projectType={study.projectType || study.category}
        location={study.location}
        status={study.status}
      />

      <CaseStudyLightbox images={allImages}>
        <div className="gallery" id="galleryContainer">
          {rows.map((row, idx) => (
            <GalleryRow
              key={row.id || idx}
              row={row}
              projectTitle={study.title}
              isHero={idx === 0}
              startIndex={rowStartIndices[idx]}
            />
          ))}
        </div>
      </CaseStudyLightbox>
    </main>
  );
}


