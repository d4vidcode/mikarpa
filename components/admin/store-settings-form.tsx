'use client';

import { useActionState, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { updateStoreSettingsAction, type StoreFormState } from '@/lib/actions/stores';
import { Button } from '@/components/ui/button';

export type StoreSettingsValues = {
  slug: string;
  name: string;
  description: string;
  logoUrl: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  city: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  whatsappEnabled: boolean;
  whatsappPhone: string;
  whatsappTemplate: string;
  seoTitle: string;
  seoDescription: string;
  businessHours: { day: number; closed: boolean; open: string; close: string }[];
};

const initialState: StoreFormState = {};

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function StoreSettingsForm({
  storeSlug,
  initial,
  readOnly,
}: {
  storeSlug: string;
  initial: StoreSettingsValues;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateStoreSettingsAction, initialState);
  const [whatsappEnabled, setWhatsappEnabled] = useState(initial.whatsappEnabled);
  const [businessHours, setBusinessHours] = useState(
    Array.from({ length: 7 }, (_, day) => {
      const existing = initial.businessHours.find((item) => item.day === day);
      return existing ?? { day, closed: day === 0, open: '09:00', close: '18:00' };
    }),
  );
  const fields = state.fields ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="slug" value={storeSlug} />
      <input type="hidden" name="businessHours" value={JSON.stringify(businessHours)} />

      <fieldset disabled={readOnly} className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Datos de la tienda</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nombre" error={fields.name}>
                <input name="name" defaultValue={initial.name} required maxLength={80} className={inputClass} />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                label="Enlace (slug)"
                hint="Cambiarlo redirige el enlace anterior automáticamente."
                error={fields.slug}
              >
                <input
                  name="slug"
                  defaultValue={initial.slug}
                  required
                  maxLength={48}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Descripción" hint="Máximo 500 caracteres." error={fields.description}>
                <textarea
                  name="description"
                  defaultValue={initial.description}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Logo (URL)" hint="Pega la URL de tu logo o usa una imagen cuadrada." error={fields.logoUrl}>
                <input name="logoUrl" defaultValue={initial.logoUrl} placeholder="https://…" className={inputClass} />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Contacto</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono" error={fields.contactPhone}>
              <input name="contactPhone" defaultValue={initial.contactPhone} inputMode="tel" className={inputClass} />
            </Field>
            <Field label="Correo" error={fields.contactEmail}>
              <input name="contactEmail" type="email" defaultValue={initial.contactEmail} className={inputClass} />
            </Field>
            <Field label="Dirección" error={fields.address}>
              <input name="address" defaultValue={initial.address} maxLength={200} className={inputClass} />
            </Field>
            <Field label="Ciudad" error={fields.city}>
              <input name="city" defaultValue={initial.city} maxLength={80} className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Pedidos por WhatsApp</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            El carrito arma un mensaje con los productos y el total, y lo abre en WhatsApp.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="whatsappEnabled"
                  checked={whatsappEnabled}
                  onChange={(event) => setWhatsappEnabled(event.target.checked)}
                  className="size-4 accent-[var(--color-primary)]"
                />
                Aceptar pedidos por WhatsApp
              </label>
            </div>

            <Field
              label="Número de WhatsApp"
              hint="Formato: 987654321 o +51987654321"
              error={fields.whatsappPhone}
            >
              <input
                name="whatsappPhone"
                defaultValue={initial.whatsappPhone}
                inputMode="tel"
                className={inputClass}
                required={whatsappEnabled}
              />
            </Field>

            <Field
              label="Plantilla del mensaje"
              hint="Opcional. Variables: {pedido}, {tienda}, {cliente}, {total}"
              error={fields.whatsappTemplate}
            >
              <input
                name="whatsappTemplate"
                defaultValue={initial.whatsappTemplate}
                maxLength={1000}
                className={inputClass}
                placeholder="Hola, quiero confirmar mi pedido {pedido}"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Redes sociales</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Instagram" error={fields.instagram}>
              <input name="instagram" defaultValue={initial.instagram} placeholder="https://instagram.com/…" className={inputClass} />
            </Field>
            <Field label="Facebook" error={fields.facebook}>
              <input name="facebook" defaultValue={initial.facebook} className={inputClass} />
            </Field>
            <Field label="TikTok" error={fields.tiktok}>
              <input name="tiktok" defaultValue={initial.tiktok} className={inputClass} />
            </Field>
            <Field label="Sitio web" error={fields.website}>
              <input name="website" defaultValue={initial.website} className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Horarios de atención</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Se muestran en tu tienda para que los clientes sepan cuándo responderás.
          </p>

          <div className="mt-4 space-y-2">
            {businessHours.map((hour, index) => (
              <div key={hour.day} className="grid grid-cols-[110px_1fr] items-center gap-3">
                <span className="text-sm font-medium">{DAY_LABELS[hour.day]}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={hour.closed}
                      onChange={(event) =>
                        setBusinessHours(
                          businessHours.map((item, position) =>
                            position === index ? { ...item, closed: event.target.checked } : item,
                          ),
                        )
                      }
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    Cerrado
                  </label>
                  <input
                    type="time"
                    value={hour.open}
                    disabled={hour.closed}
                    onChange={(event) =>
                      setBusinessHours(
                        businessHours.map((item, position) =>
                          position === index ? { ...item, open: event.target.value } : item,
                        ),
                      )
                    }
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none disabled:opacity-50"
                  />
                  <span className="text-xs text-muted-foreground">a</span>
                  <input
                    type="time"
                    value={hour.close}
                    disabled={hour.closed}
                    onChange={(event) =>
                      setBusinessHours(
                        businessHours.map((item, position) =>
                          position === index ? { ...item, close: event.target.value } : item,
                        ),
                      )
                    }
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">SEO</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Título para buscadores" hint="Máximo 70 caracteres." error={fields.seoTitle}>
              <input name="seoTitle" defaultValue={initial.seoTitle} maxLength={70} className={inputClass} />
            </Field>
            <Field label="Descripción para buscadores" hint="Máximo 160 caracteres." error={fields.seoDescription}>
              <textarea
                name="seoDescription"
                defaultValue={initial.seoDescription}
                rows={2}
                maxLength={160}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
              />
            </Field>
          </div>
        </section>
      </fieldset>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.message}</p>
      ) : null}

      {readOnly ? null : (
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      )}
    </form>
  );
}
