import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Archive',
  description: 'HAF WERKS — Archive. Coming Soon.',
};

export default function ArchivePage() {
  return (
    <main className="archivePage" data-page="archive">
      <h1 className="visuallyHidden">Archive — HAF WERKS</h1>
      <div className="archiveCenterContainer">
        <span className="archiveComingSoonBadge">Coming Soon</span>
      </div>
    </main>
  );
}
