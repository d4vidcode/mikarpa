'use client';

import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { updatePlatformSettingsAction, type AdminFormState } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';

const initialState: AdminFormState = {};

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

export function PlatformSettingsForm({
  initial,
}: {
  initial: {
    brandingName: string;
    brandingTagline: string;
    supportEmail: string;
    allowOwnerSignup: boolean;
    maintenanceEnabled: boolean;
    maintenanceMessage: string;
  };
}) {
  const [state, formAction, pending] = useActionState(updatePlatformSettingsAction, initialState);
  const fields = state.fields ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nombre de la plataforma</span>
          <input name="brandingName" defaultValue={initial.brandingName} maxLength={60} className={inputClass} />
          {fields.brandingName ? <span className="mt-1 block text-xs text-red-600">{fields.brandingName}</span> : null}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Correo de soporte</span>
          <input name="supportEmail" type="email" defaultValue={initial.supportEmail} className={inputClass} />
          {fields.supportEmail ? <span className="mt-1 block text-xs text-red-600">{fields.supportEmail}</span> : null}
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Lema</span>
          <input name="brandingTagline" defaultValue={initial.brandingTagline} maxLength={140} className={inputClass} />
        </label>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="allowOwnerSignup"
            defaultChecked={initial.allowOwnerSignup}
            className="size-4 accent-[var(--color-primary)]"
          />
          Permitir registro de nuevos propietarios
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="maintenanceEnabled"
            defaultChecked={initial.maintenanceEnabled}
            className="size-4 accent-[var(--color-primary)]"
          />
          Modo mantenimiento
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Mensaje de mantenimiento</span>
          <textarea
            name="maintenanceMessage"
            defaultValue={initial.maintenanceMessage}
            rows={2}
            maxLength={300}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          />
        </label>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
        {pending ? 'Guardando…' : 'Guardar configuración'}
      </Button>
    </form>
  );
}
