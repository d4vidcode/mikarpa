import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full min-w-0 rounded-[var(--r-btn)] border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none',
        'placeholder:text-muted-foreground hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
