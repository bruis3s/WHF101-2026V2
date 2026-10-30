import type { Metadata } from 'next';
import { getWerksList } from '@/lib/data';
import { WerksListClient } from '@/components/werks/WerksListClient';
import { ViewSwitcher } from '@/components/shell/ViewSwitcher';

export const metadata: Metadata = {
  title: 'Werks — List',
  description:
    'an Explorative Architecture, Objects and Spatial Design Practice. Werks list directory.',
};

export default function WerksListPage() {
  const items = getWerksList();

  return (
    <main className="listPage" data-page="werks-list">
      <h1 className="visuallyHidden">Werks List — HAF WERKS</h1>
      <WerksListClient items={items} />
      <ViewSwitcher activeView="list" />
    </main>
  );
}

