'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AdminNavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  hint?: string;
};

function isActive(pathname: string, href: string) {
  if (href === '/administracion' || href.endsWith('/administracion')) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({
  items,
  label = 'Navegación del panel',
  orientation = 'vertical',
  className,
}: {
  items: AdminNavItem[];
  label?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}) {
  const pathname = usePathname();
  const horizontal = orientation === 'horizontal';

  return (
    <nav
      className={cn(
        horizontal
          ? 'flex gap-1 overflow-x-auto'
          : 'flex flex-col gap-0.5',
        className,
      )}
      aria-label={label}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex shrink-0 items-center gap-2.5 rounded-[var(--r-sm)] text-[12px] font-medium transition-colors duration-150',
              horizontal ? 'h-9 px-3' : 'h-9 px-2.5',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {!horizontal && active ? (
              <span
                aria-hidden
                className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-primary"
              />
            ) : null}
            {item.icon ? (
              <span className="grid size-4 shrink-0 place-items-center opacity-80">{item.icon}</span>
            ) : null}
            <span className="truncate">{item.label}</span>
            {item.hint ? (
              <span className="ml-auto font-mono text-[10px] opacity-60">{item.hint}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminBreadcrumb({
  items,
  rootLabel,
}: {
  items: AdminNavItem[];
  rootLabel: string;
}) {
  const pathname = usePathname();
  const current = items
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <div className="crumb" aria-label="Ruta de navegación">
      <span className="max-w-40 truncate">{rootLabel}</span>
      <ChevronRight className="size-3 shrink-0 opacity-50" aria-hidden />
      <span aria-current="page" className="truncate">
        {current?.label ?? 'Resumen'}
      </span>
    </div>
  );
}
