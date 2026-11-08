import type { Metadata } from 'next';
import { getEditorialRows } from '@/lib/data';
import { WerksGrid } from '@/components/werks/WerksGrid';
import { ViewSwitcher } from '@/components/shell/ViewSwitcher';

export const metadata: Metadata = {
  title: 'Werks',
  description:
    'an Explorative Architecture, Objects and Spatial Design Practice. Werks overview.',
};

export default function WerksPage() {
  const rows = getEditorialRows();

  return (
    <main className="werksPage" data-page="werks-grid">
      <h1 className="visuallyHidden">Werks — HAF WERKS</h1>
      <WerksGrid rows={rows} />
      <ViewSwitcher activeView="grid" />
    </main>
  );
}

