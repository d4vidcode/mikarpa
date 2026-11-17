'use client';

import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { connectMercadoPagoAction, type StoreFormState } from '@/lib/actions/stores';
import { Button } from '@/components/ui/button';

const initialState: StoreFormState = {};

export function PaymentConnectForm({ storeSlug }: { storeSlug: string }) {
  const [state, formAction, pending] = useActionState(connectMercadoPagoAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="slug" value={storeSlug} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Access token de Mercado Pago</span>
        <input
          name="accessToken"
          type="password"
          required
          placeholder="APP_USR-... o TEST-..."
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          Se guarda cifrado (AES-256-GCM). Nunca se muestra de nuevo.
        </span>
      </label>

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
        {pending ? 'Conectando…' : 'Conectar Mercado Pago'}
      </Button>
    </form>
  );
}