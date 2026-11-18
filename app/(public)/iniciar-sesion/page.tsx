export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { auth } from '@/lib/auth';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Ingresar',
  description: 'Entra a tu panel de mikarpa para gestionar tu tienda y tus pedidos.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  await connection();
  const session = await auth();
  if (session?.user) {
    redirect('/panel');
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.startsWith('/') ? params.callbackUrl : '';

  return (
    <main id="contenido" className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <h1 className="text-3xl font-semibold tracking-tight">Vuelve a tu tienda</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Entra para revisar pedidos, actualizar tu catálogo y ajustar la apariencia de tu tienda.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
          <li>· Pedidos de WhatsApp en un solo lugar.</li>
          <li>· Catálogo con variantes y stock.</li>
          <li>· Tu enlace público listo para compartir.</li>
        </ul>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Ingresar</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Usa el correo con el que te registraste.
          </p>
          <LoginForm callbackUrl={callbackUrl} />
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
