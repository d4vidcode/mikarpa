'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { registerAction, type AuthFormState } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';

const initialState: AuthFormState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const fields = state.fields ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Tu nombre
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(fields.name)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        <FieldError message={fields.name} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(fields.email)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        <FieldError message={fields.email} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={Boolean(fields.password)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          />
          <FieldError message={fields.password} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Repetir contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(fields.confirmPassword)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          />
          <FieldError message={fields.confirmPassword} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Mínimo 8 caracteres, con al menos una letra y un número.
      </p>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? 'Creando cuenta…' : 'Crear mi cuenta'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/iniciar-sesion" className="font-medium text-foreground underline-offset-4 hover:underline">
          Ingresar
        </Link>
      </p>
    </form>
  );
}
