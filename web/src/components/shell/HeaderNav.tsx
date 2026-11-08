import { Logo } from './Logo';
import { MenuToggle } from './MenuToggle';

export function HeaderNav({ showLogo = true }: { showLogo?: boolean }) {
  return (
    <>
      {showLogo ? <Logo /> : null}
      <MenuToggle />
    </>
  );
}
