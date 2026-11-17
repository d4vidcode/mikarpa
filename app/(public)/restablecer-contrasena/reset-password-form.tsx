'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { resetPasswordAction, type AuthFormState } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';

const initialState: AuthFormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (!token) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        El enlace no es válido. Solicita uno nuevo.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        {state.fields?.password ? (
          <p className="mt-1 text-xs text-red-600">{state.fields.password}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
          Repite la contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        {state.fields?.confirmPassword ? (
          <p className="mt-1 text-xs text-red-600">{state.fields.confirmPassword}</p>
        ) : null}
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok && state.message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.message}</p>
      ) : null}

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar contraseña'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/iniciar-sesion" className="font-medium text-foreground underline-offset-4 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}