import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/site-header';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export const instant = false;

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
