import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-20 w-full rounded-[var(--r-sm)] border border-input bg-card px-2.5 py-2 text-[12px] shadow-[0_1px_2px_color-mix(in_oklab,var(--ink)_4%,transparent)] transition-colors outline-none',
        'placeholder:text-muted-foreground hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
