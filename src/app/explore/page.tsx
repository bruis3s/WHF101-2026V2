import type { Metadata } from 'next';
import { getExploreLayout } from '@/lib/data';
import { ExploreCanvas } from '@/components/explore/ExploreCanvas';
import { ViewSwitcher } from '@/components/shell/ViewSwitcher';

export const metadata: Metadata = {
  title: 'Explore',
  description:
    'an Explorative Architecture, Objects and Spatial Design Practice. Free roam canvas.',
};

export default function ExplorePage() {
  const layout = getExploreLayout();

  return (
    <main className="explorePage" data-page="explore">
      <h1 className="visuallyHidden">Explore — HAF WERKS</h1>
      <ExploreCanvas layout={layout} />
      <ViewSwitcher activeView="explore" />
    </main>
  );
}

