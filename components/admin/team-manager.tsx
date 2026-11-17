'use client';

import { useActionState } from 'react';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import {
  inviteTeamMemberAction,
  removeTeamMemberAction,
  updateTeamMemberAction,
  type TeamFormState,
} from '@/lib/actions/stores';
import { STORE_PERMISSIONS } from '@/lib/enums';
import { PERMISSION_LABELS } from '@/lib/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';

export type TeamMemberRow = {
  memberId: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  permissions: string[];
  status: 'invited' | 'active' | 'revoked';
};

const initialState: TeamFormState = {};

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

export function TeamManager({
  storeSlug,
  members,
  writable,
}: {
  storeSlug: string;
  members: TeamMemberRow[];
  writable: boolean;
}) {
  const [state, formAction, pending] = useActionState(inviteTeamMemberAction, initialState);

  return (
    <div className="space-y-5">
      {writable ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <UserPlus className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold">Añadir trabajador</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Debe tener una cuenta en mikarpa. Tú decides a qué módulos entra.
          </p>

          <form action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="slug" value={storeSlug} />
            <div className="max-w-sm">
              <label htmlFor="team-email" className="mb-1 block text-sm font-medium">
                Correo del trabajador
              </label>
              <input
                id="team-email"
                name="email"
                type="email"
                required
                placeholder="persona@correo.com"
                className={inputClass}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Permisos</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {STORE_PERMISSIONS.map((permission) => (
                  <label key={permission} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="permissions"
                      value={permission}
                      defaultChecked={permission === 'products' || permission === 'orders'}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {PERMISSION_LABELS[permission]}
                  </label>
                ))}
              </div>
            </div>

            {state.error ? (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {state.error}
              </p>
            ) : null}
            {state.ok ? (
              <div className="space-y-2">
                <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  {state.message}
                </p>
                {state.inviteUrl ? (
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <p className="font-medium">Enlace de invitación</p>
                    <p className="mt-1 break-all text-muted-foreground">{state.inviteUrl}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <UserPlus className="size-3.5" aria-hidden />}
              {pending ? 'Añadiendo…' : 'Añadir al equipo'}
            </Button>
          </form>
        </section>
      ) : null}

      <ul className="space-y-3">
        {members.map((member) => (
          <li key={member.memberId} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <Badge variant={member.role === 'owner' ? 'success' : 'secondary'}>
                    {member.role === 'owner' ? 'Propietario' : 'Trabajador'}
                  </Badge>
                  {member.status === 'revoked' ? <Badge variant="destructive">Revocado</Badge> : null}
                </div>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>

              {member.role === 'owner' ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Acceso total
                </span>
              ) : null}
            </div>

            {member.role === 'staff' && writable ? (
              <div className="mt-4 border-t border-border pt-3">
                <form action={updateTeamMemberAction} className="space-y-3">
                  <input type="hidden" name="slug" value={storeSlug} />
                  <input type="hidden" name="memberId" value={member.memberId} />
                  <input type="hidden" name="status" value="active" />

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {STORE_PERMISSIONS.map((permission) => (
                      <label key={permission} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="permissions"
                          value={permission}
                          defaultChecked={member.permissions.includes(permission)}
                          className="size-4 accent-[var(--color-primary)]"
                        />
                        {PERMISSION_LABELS[permission]}
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="submit" size="sm" variant="outline">
                      Guardar permisos
                    </Button>
                  </div>
                </form>

                <form action={removeTeamMemberAction} className="mt-2">
                  <input type="hidden" name="slug" value={storeSlug} />
                  <input type="hidden" name="memberId" value={member.memberId} />
                  <ConfirmButton
                    message={`¿Quitar a ${member.name} del equipo? Perderá acceso al panel.`}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Quitar del equipo
                  </ConfirmButton>
                </form>
              </div>
            ) : null}

            {member.role === 'staff' && !writable ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Permisos: {member.permissions.map((permission) => PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS] ?? permission).join(', ') || 'Sin permisos'}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
