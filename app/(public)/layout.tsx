import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/site-header';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

import { connection } from 'next/server';

export const instant = false;

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
