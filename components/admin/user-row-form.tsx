'use client';

import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { updateUserAction, type AdminFormState } from '@/lib/actions/admin';
import { GLOBAL_ROLES, USER_STATUSES, type GlobalRole, type UserStatus } from '@/lib/enums';

const initialState: AdminFormState = {};

const ROLE_LABELS: Record<GlobalRole, string> = {
  superadmin: 'Superadmin',
  owner: 'Propietario',
  staff: 'Trabajador',
  customer: 'Cliente',
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Activa',
  suspended: 'Suspendida',
};

export function UserRowForm({
  userId,
  role,
  status,
  isSelf,
}: {
  userId: string;
  role: GlobalRole;
  status: UserStatus;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateUserAction, initialState);

  if (isSelf) {
    return <p className="text-xs text-muted-foreground">Tu propia cuenta</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none"
        aria-label="Rol global"
      >
        {GLOBAL_ROLES.map((value) => (
          <option key={value} value={value}>
            {ROLE_LABELS[value]}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={status}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none"
        aria-label="Estado de la cuenta"
      >
        {USER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Save className="size-3" aria-hidden />}
        Guardar
      </button>
      {state.error ? <span className="w-full text-[11px] text-red-600">{state.error}</span> : null}
      {state.ok ? <span className="w-full text-[11px] text-emerald-700">{state.message}</span> : null}
    </form>
  );
}
