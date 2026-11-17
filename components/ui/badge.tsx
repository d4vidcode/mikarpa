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
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-border text-foreground',
  };

  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
