import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { STORE_PERMISSIONS } from '@/lib/enums';
import type { SessionMembership } from '@/types';
import { authConfig } from './auth.config';
import { connectDB } from './db';
import { Store, StoreMember, User } from '@/models';
import { loginSchema } from './validators/auth';

/**
 * Auth.js v5 con Credentials + JWT.
 *
 * El JWT guarda un snapshot de membresías para que el proxy pueda filtrar
 * sin tocar la base. El acceso real se re-valida en cada layout/acción
 * (lib/tenant.ts), así que revocar una membresía surte efecto de inmediato.
 */

export async function loadMemberships(userId: string): Promise<SessionMembership[]> {
  const memberships = await StoreMember.find({ userId, status: 'active' })
    .select('storeId role permissions')
    .lean();

  if (memberships.length === 0) {
    return [];
  }

  const stores = await Store.find({
    _id: { $in: memberships.map((membership) => membership.storeId) },
    deletedAt: null,
    status: { $ne: 'archived' },
  })
    .select('slug name status')
    .lean();

  const storeById = new Map(stores.map((store) => [String(store._id), store]));

  return memberships.flatMap((membership) => {
    const store = storeById.get(String(membership.storeId));
    if (!store) {
      return [];
    }

    return [
      {
        storeId: String(membership.storeId),
        slug: store.slug,
        name: store.name,
        role: membership.role,
        permissions:
          membership.role === 'owner'
            ? [...STORE_PERMISSIONS]
            : membership.permissions.filter((permission): permission is (typeof STORE_PERMISSIONS)[number] =>
                (STORE_PERMISSIONS as readonly string[]).includes(permission),
              ),
      },
    ];
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Correo y contraseña',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          email: parsed.data.email,
          deletedAt: null,
        })
          .select('+passwordHash')
          .lean();

        if (!user || user.status !== 'active' || !user.passwordHash) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

        const memberships = await loadMemberships(String(user._id));

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          memberships,
        };
      },
    }),
  ],
});
