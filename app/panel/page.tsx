import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/tenant';
import { loadMemberships } from '@/lib/auth';

/** Punto de entrada tras el login: cada rol va a su panel. */
export const instant = false;

export default async function PanelRedirectPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  if (user.role === 'superadmin') {
    redirect('/administracion');
  }

  const memberships = await loadMemberships(user.id);
  const first = memberships[0];

  if (first) {
    redirect(`/tienda/${first.slug}/administracion`);
  }

  redirect('/crear-tienda');
}
