'use client';

import { type ComponentProps } from 'react';

/** Botón de envío con confirmación nativa (evita borrados accidentales). */
export function ConfirmButton({
  message,
  children,
  ...props
}: ComponentProps<'button'> & { message: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
