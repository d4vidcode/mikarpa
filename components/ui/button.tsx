import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--r-btn)] text-[12px] font-medium whitespace-nowrap outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-[0_1px_2px_color-mix(in_oklab,var(--ink)_14%,transparent)] hover:brightness-95',
        destructive:
          'bg-destructive text-white shadow-sm hover:brightness-95 focus-visible:ring-destructive/25',
        outline:
          'border border-line-strong bg-card shadow-[0_1px_2px_color-mix(in_oklab,var(--ink)_5%,transparent)] hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:brightness-95',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-3.5 max-sm:h-11 has-[>svg]:px-3',
        sm: 'h-8 px-3 max-sm:h-10 has-[>svg]:px-2.5',
        lg: 'h-10 px-5 text-[13px] max-sm:h-11 has-[>svg]:px-4',
        icon: 'size-9 max-sm:size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      data-size={size ?? 'default'}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
