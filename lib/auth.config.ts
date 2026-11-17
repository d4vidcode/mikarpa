import type { NextAuthConfig } from 'next-auth';

/**
 * Configuración compartida entre `proxy.ts` y `lib/auth.ts`.
 *
 * Regla de oro: este archivo NO importa mongoose ni bcrypt, para que el
 * proxy pueda cargarlo sin arrastrar código de Node/base de datos.
 *
 * El proxy hace un filtro GRUESO con lo que ya está en el JWT. La
 * autorización real (membresía y permisos vigentes) se valida en layouts,
 * páginas y Server Actions contra MongoDB.
 */

const STORE_ADMIN_REGEX = /^\/tienda\/([^/]+)\/administracion(?:\/.*)?$/;

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith('/administracion') || pathname.startsWith('/crear-tienda');
}

export const authConfig = {
  pages: {
    signIn: '/iniciar-sesion',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.memberships = user.memberships ?? [];
      }
      return token;
    },

    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      if (token.role) {
        session.user.role = token.role;
      }
      session.user.memberships = token.memberships ?? [];
      return session;
    },

    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Sesión expirada: `/api/auth/*` no se toca.
      const storeAdminMatch = STORE_ADMIN_REGEX.exec(pathname);
      const isGlobalAdmin = pathname.startsWith('/administracion');
      const isProtected = storeAdminMatch !== null || isProtectedPath(pathname);

      if (!isProtected) {
        return true;
      }

      if (!auth?.user) {
        return false; // Auth.js redirige a /iniciar-sesion con callbackUrl.
      }

      if (isGlobalAdmin) {
        if (auth.user.role === 'superadmin') {
          return true;
        }
        return Response.redirect(new URL('/explorar?denied=admin', request.nextUrl));
      }

      if (isProtectedPath(pathname)) {
        return true; // /crear-tienda: cualquier usuario autenticado.
      }

      const slug = storeAdminMatch?.[1];
      if (!slug) {
        return true;
      }

      const membership = auth.user.memberships?.find((item) => item.slug === slug);
      if (membership) {
        return true;
      }

      // Superadmin puede leer paneles de tienda (sin escribir).
      if (auth.user.role === 'superadmin') {
        return true;
      }

      return Response.redirect(new URL(`/explorar?denied=${encodeURIComponent(slug)}`, request.nextUrl));
    },
  },
} satisfies NextAuthConfig;
