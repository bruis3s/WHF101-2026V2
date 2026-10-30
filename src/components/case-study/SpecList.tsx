import type { CaseStudySpec } from '@/lib/types';

interface SpecListProps {
  specs?: CaseStudySpec[];
  title?: string;
  projectType?: string;
  location?: string;
  status?: string;
}

export function SpecList({
  specs,
  title,
  projectType,
  location,
  status,
}: SpecListProps) {
  const items: CaseStudySpec[] =
    specs && specs.length > 0
      ? specs
      : [
          { label: 'Project', value: title || '—' },
          { label: 'Type', value: projectType || '—' },
          { label: 'Location', value: location || '—' },
          { label: 'Status', value: status || '—' },
        ];

  return (
    <aside className="specList" id="specList" aria-label="Project Specifications">
      {items.map((spec, idx) => (
        <div key={idx} className="specRow">
          <span className="specKey">{spec.label}</span>
          <span className="specValue">{spec.value}</span>
        </div>
      ))}
    </aside>
  );
}

