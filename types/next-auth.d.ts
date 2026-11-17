import type { DefaultSession } from 'next-auth';
import type { GlobalRole } from '@/lib/enums';
import type { SessionMembership } from './index';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: GlobalRole;
      memberships: SessionMembership[];
    } & DefaultSession['user'];
  }

  interface User {
    role: GlobalRole;
    memberships: SessionMembership[];
  }
}

declare module '@auth/core/types' {
  interface Session {
    user: {
      id: string;
      role: GlobalRole;
      memberships: SessionMembership[];
    } & DefaultSession['user'];
  }

  interface User {
    role: GlobalRole;
    memberships: SessionMembership[];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: GlobalRole;
    memberships?: SessionMembership[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: GlobalRole;
    memberships?: SessionMembership[];
  }
}
