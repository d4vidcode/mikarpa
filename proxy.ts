import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

/**
 * Filtro grueso de autenticación (Next 16 renombró middleware → proxy).
 * La autorización real se hace contra MongoDB en layouts y acciones.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/administracion/:path*', '/tienda/:slug/administracion/:path*', '/crear-tienda'],
};
