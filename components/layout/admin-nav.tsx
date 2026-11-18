'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function AdminNav({ items, className }: { items: AdminNavItem[]; className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex gap-1 overflow-x-auto rounded-[var(--r-lg)] border border-border bg-card p-2 lg:sticky lg:top-4 lg:flex-col lg:overflow-visible',
        className,
      )}
      aria-label="Navegación del panel"
    >
      {items.map((item) => {
        const active =
          item.href.endsWith('/administracion') || item.href === '/administracion'
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex shrink-0 items-center gap-2.5 rounded-[var(--r-btn)] px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
