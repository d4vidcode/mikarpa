import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('mb-1 block text-sm font-medium leading-none', className)}
      {...props}
    />
  );
}

export { Label };
