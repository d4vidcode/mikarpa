'use client';

import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { updateOrderNotesAction, type OrderFormState } from '@/lib/actions/orders';
import { Button } from '@/components/ui/button';

const initialState: OrderFormState = {};

export function OrderNotesForm({
  storeSlug,
  orderId,
  initialNotes,
}: {
  storeSlug: string;
  orderId: string;
  initialNotes: string;
}) {
  const [state, formAction, pending] = useActionState(updateOrderNotesAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="slug" value={storeSlug} />
      <input type="hidden" name="orderId" value={orderId} />
      <textarea
        name="internalNotes"
        defaultValue={initialNotes}
        rows={4}
        maxLength={2000}
        placeholder="Notas privadas: coordinaciones, datos de envío, incidencias…"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
      />
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-xs text-emerald-700">{state.message}</p> : null}
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Save className="size-3.5" aria-hidden />}
        Guardar notas
      </Button>
    </form>
  );
}
