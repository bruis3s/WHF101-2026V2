import editorial from '@/content/editorial-rows.json';
import list from '@/content/framer-list.json';
import archive from '@/content/archive.json';
import information from '@/content/information.json';
import caseStudies from '@/content/case-studies.json';
import projects from '@/content/projects.json';
import type { EditorialRow, WerksListItem, CaseStudy } from '@/lib/types';

export function getEditorialRows(): EditorialRow[] {
  return editorial as EditorialRow[];
}

export function getWerksList(): WerksListItem[] {
  return list as WerksListItem[];
}

export function getArchive() {
  return archive;
}

export function getInformation() {
  return information;
}

export function getCaseStudy(slug: string): CaseStudy | null {
  const matched = (caseStudies as CaseStudy[]).find(
    (c) =>
      c.slug === slug ||
      ((slug === 'sosco-diner-gathering' || slug === 'sosco-dinner-gathering') &&
        c.slug === 'sosco-dinner-gathering-ss27')
  );
  if (matched) return matched;

  // Fallback: minimal placeholder from projects.json so published cards don't 404
  const project = (projects as Array<{
    slug: string;
    code?: string;
    title: string;
    category?: string;
    location?: string;
    status?: string;
    coverImageUrl?: string;
  }>).find((p) => p.slug === slug);

  if (!project) return null;

  return {
    slug: project.slug,
    code: project.code,
    title: project.title,
    projectType: project.category,
    location: project.location,
    status: project.status || 'Completed',
    coverImageUrl: project.coverImageUrl,
    specs: [
      { label: 'Project', value: project.title },
      { label: 'Type', value: project.category || '—' },
      { label: 'Location', value: project.location || '—' },
      { label: 'Status', value: project.status || 'Completed' },
    ],
    layoutRows: project.coverImageUrl
      ? [
          {
            id: 'row-hero',
            sectionHeight: '100vh',
            sizingMode: 'cover',
            columns: [
              {
                image: project.coverImageUrl,
                widthPercent: 100,
                fit: 'cover',
                priority: true,
              },
            ],
          },
        ]
      : [],
  };
}

export function getCaseStudySlugs(): string[] {
  const fromCaseStudies = (caseStudies as CaseStudy[]).map((c) => c.slug);
  const fromProjects = (projects as Array<{ slug: string }>).map((p) => p.slug);
  return Array.from(
    new Set([...fromCaseStudies, ...fromProjects, 'sosco-diner-gathering', 'sosco-dinner-gathering'])
  );
}

