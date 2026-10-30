import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { WebsiteShell } from '@/components/shell/WebsiteShell';

import '@/styles/globals.css';
import '@/styles/navigation.css';
import '@/styles/home.css';
import '@/styles/werks.css';
import '@/styles/case-study.css';
import '@/styles/information.css';
import '@/styles/archive.css';

const helvetica = localFont({
  src: [
    {
      path: '../../public/fonts/HelveticaNeue-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeue-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-helvetica',
  adjustFontFallback: 'Arial',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hafwerks.com'),
  title: {
    default: 'HAF WERKS — Explorative Architecture, Objects and Spatial Design Practice',
    template: '%s — HAF WERKS',
  },
  description: 'an Explorative Architecture, Objects and Spatial Design Practice.',
  openGraph: {
    type: 'website',
    locale: 'en',
    title: 'HAF WERKS — Explorative Architecture, Objects and Spatial Design Practice',
    description: 'an Explorative Architecture, Objects and Spatial Design Practice.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={helvetica.variable}>
      <body>
        <SmoothScroll>
          <WebsiteShell>{children}</WebsiteShell>
        </SmoothScroll>
      </body>
    </html>
  );
}
