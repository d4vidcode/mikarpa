export const instant = false;
import type { Metadata } from 'next';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Nueva contraseña</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Elige una contraseña segura para tu cuenta.
      </p>
      <div className="mt-6">
        <ResetPasswordForm token={token ?? ''} />
      </div>
    </main>
  );
}