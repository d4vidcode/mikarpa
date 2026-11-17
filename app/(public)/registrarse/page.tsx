export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta gratis en mikarpa y arma tu tienda virtual en minutos.',
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/panel');
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <h1 className="text-3xl font-semibold tracking-tight">Tu tienda en minutos</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Crea tu cuenta, define el nombre y el enlace de tu tienda, y publica tu primer producto.
          Sin tarjeta y sin comisiones por pedidos de WhatsApp.
        </p>

        <ol className="mt-8 space-y-4 text-sm">
          {[
            'Crea tu cuenta gratis',
            'Elige nombre, enlace y rubro',
            'Sube tus productos y comparte tu enlace',
          ].map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Crear cuenta</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Después de registrarte te llevamos a crear tu tienda.
          </p>
          <RegisterForm />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
