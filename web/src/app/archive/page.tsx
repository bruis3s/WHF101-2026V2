import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Archive',
  description:
    'HAF WERKS — Objects, spatial research, and physical artifacts archive. Coming Soon.',
};

export default function ArchivePage() {
  return (
    <main className="archivePage" data-page="archive">
      <h1 className="visuallyHidden">Archive — HAF WERKS</h1>

      <div className="archiveTitleBar">
        <span className="archiveSectionLabel">archive</span>
      </div>

      <div className="archiveComingSoonContainer">
        <div className="archiveComingSoonBlock">
          <span className="archiveComingSoonStatus">Coming Soon</span>
          <p className="archiveComingSoonText">
            Physical artifacts, spatial experiments, and object design archive in development.
          </p>
          <Link href="/werks" className="archiveComingSoonLink">
            Return to Werks →
          </Link>
        </div>
      </div>
    </main>
  );
}
