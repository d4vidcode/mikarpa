export const instant = false;
import type { Metadata } from 'next';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
};

export default function ForgotPasswordPage() {
  return (
    <main id="contenido" className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Te enviamos un enlace para crear una nueva contraseña.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}