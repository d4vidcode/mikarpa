export const instant = false;
import type { Metadata } from 'next';
import { StoreMember, User } from '@/models';
import { can, requireStoreAccess } from '@/lib/tenant';
import { TeamManager, type TeamMemberRow } from '@/components/admin/team-manager';

export const metadata: Metadata = { title: 'Trabajadores' };

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await requireStoreAccess(slug, 'team');
  const writable = !access.readOnly && can(access, 'team');

  const memberships = await StoreMember.find({ storeId: access.store._id })
    .sort({ role: 1, createdAt: 1 })
    .lean();

  const users = await User.find({ _id: { $in: memberships.map((member) => member.userId) } })
    .select('name email')
    .lean();

  const userById = new Map(users.map((user) => [String(user._id), user]));

  const rows: TeamMemberRow[] = memberships.map((membership) => {
    const user = userById.get(String(membership.userId));
    return {
      memberId: String(membership._id),
      name: user?.name ?? 'Usuario',
      email: user?.email ?? '—',
      role: membership.role,
      permissions: membership.permissions ?? [],
      status: membership.status,
    };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trabajadores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Da acceso limitado a tu equipo. Cada permiso habilita un módulo del panel.
        </p>
      </div>

      <TeamManager storeSlug={slug} members={rows} writable={writable} />
    </div>
  );
}
