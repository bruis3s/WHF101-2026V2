import Link from 'next/link';

export function Logo() {
  return (
    <div className="logoFixed">
      <Link href="/" className="navButton logoButton" aria-label="HAF WERKS Home">
        <span>H A F WERKS</span>
      </Link>
    </div>
  );
}
