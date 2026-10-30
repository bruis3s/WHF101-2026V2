import { HeaderNav } from './HeaderNav';

interface WebsiteShellProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

export function WebsiteShell({ children, showLogo = true }: WebsiteShellProps) {
  return (
    <div className="website-shell">
      <div className="texture-overlay" aria-hidden="true" />
      <HeaderNav showLogo={showLogo} />
      <div className="texture-wrapper">{children}</div>
    </div>
  );
}
