import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Badge({
  className,
  variant = 'default',
  ...props
}: ComponentProps<'span'> & {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}) {
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15',
    warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/15',
    destructive: 'bg-red-50 text-red-700 ring-1 ring-red-600/15',
    outline: 'border border-line-strong text-foreground',
  };

  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
