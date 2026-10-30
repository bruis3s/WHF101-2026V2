import Link from 'next/link';

interface ViewSwitcherProps {
  activeView?: 'grid' | 'list';
}

export function ViewSwitcher({ activeView = 'grid' }: ViewSwitcherProps) {
  return (
    <div className="bottomBar" role="navigation" aria-label="View mode">
      <Link
        href="/werks"
        className="switcherButton"
        aria-current={activeView === 'grid' ? 'page' : undefined}
      >
        <span
          className={`radioCircle${activeView === 'grid' ? ' radioCircleActive' : ''}`}
          aria-hidden="true"
        />
        <span>Grid</span>
      </Link>
      <Link
        href="/werks/list"
        className="switcherButton"
        aria-current={activeView === 'list' ? 'page' : undefined}
      >
        <span
          className={`radioCircle${activeView === 'list' ? ' radioCircleActive' : ''}`}
          aria-hidden="true"
        />
        <span>List</span>
      </Link>
    </div>
  );
}

