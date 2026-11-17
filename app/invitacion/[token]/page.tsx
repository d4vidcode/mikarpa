import { redirect, notFound } from 'next/navigation';
import crypto from 'node:crypto';
import { connectDB } from '@/lib/db';
import { getSessionUser } from '@/lib/tenant';
import { Store, StoreMember } from '@/models';

export const instant = false;

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length < 10) {
    notFound();
  }

  await connectDB();

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const membership = await StoreMember.findOne({
    inviteTokenHash: tokenHash,
  })
    .select('+inviteTokenHash storeId userId invitedEmail inviteExpiresAt status role permissions')
    .lean();

  if (!membership || !membership.inviteExpiresAt || membership.inviteExpiresAt < new Date()) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Invitación no válida</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          El enlace caducó o ya fue usado. Pide una nueva invitación al propietario.
        </p>
      </main>
    );
  }

  const user = await getSessionUser();

  if (!user) {
    redirect(`/iniciar-sesion?callbackUrl=${encodeURIComponent(`/invitacion/${token}`)}`);
  }

  if (membership.invitedEmail && user.email.toLowerCase() !== membership.invitedEmail.toLowerCase()) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Correo no coincide</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta invitación es para {membership.invitedEmail}. Inicia sesión con esa cuenta.
        </p>
      </main>
    );
  }

  if (membership.status !== 'invited') {
    // Ya aceptada: redirige igual.
  } else {
    await StoreMember.updateOne(
      { _id: membership._id },
      {
        $set: {
          status: 'active',
          acceptedAt: new Date(),
          inviteTokenHash: null,
          inviteExpiresAt: null,
          lastAccessAt: new Date(),
        },
      },
    );
  }

  const store = await Store.findOne({ _id: membership.storeId }).select('slug').lean();
  if (!store) {
    notFound();
  }

  redirect(`/tienda/${store.slug}/administracion`);
}