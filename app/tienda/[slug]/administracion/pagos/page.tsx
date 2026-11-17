export const instant = false;
import type { Metadata } from 'next';
import { CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { requireStoreAccess } from '@/lib/tenant';
import { PaymentConnectForm } from '@/components/admin/payment-connect-form';

export const metadata: Metadata = { title: 'Pagos' };

const PROVIDER_LABELS: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  culqi: 'Culqi',
  stripe: 'Stripe',
};

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  disconnected: 'No conectado',
  pending: 'Pendiente',
  active: 'Activo',
  restricted: 'Restringido',
};

export default async function PaymentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await requireStoreAccess(slug, 'payments');
  const store = access.store;

  const whatsapp = store.paymentConfig?.whatsapp;
  const online = store.paymentConfig?.online;
  const onlineStatus = online?.status ?? 'disconnected';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pagos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cómo cobras hoy y qué pasarelas vas a poder conectar.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-emerald-600" aria-hidden />
            <h2 className="text-sm font-semibold">WhatsApp</h2>
          </div>
          <Badge variant={whatsapp?.enabled && whatsapp?.phone ? 'success' : 'warning'}>
            {whatsapp?.enabled && whatsapp?.phone ? 'Activo' : 'Sin configurar'}
          </Badge>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {whatsapp?.enabled && whatsapp?.phone
            ? `Los pedidos se envían a ${whatsapp.phone}. El cliente confirma y coordina el pago contigo.`
            : 'Activa los pedidos por WhatsApp y define el número donde quieres recibirlos.'}
        </p>

        <Link
          href={`/tienda/${slug}/administracion/configuracion`}
          className="mt-4 inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
        >
          Configurar WhatsApp
        </Link>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold">Pagos online</h2>
          </div>
          <Badge variant={onlineStatus === 'active' ? 'success' : 'outline'}>
            {ACCOUNT_STATUS_LABELS[onlineStatus] ?? onlineStatus}
          </Badge>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Próximamente podrás cobrar con tarjeta, Yape y otros medios desde el carrito. La pasarela
          principal será <strong>{PROVIDER_LABELS[online?.provider ?? 'mercadopago']}</strong>, con
          Culqi como alternativa local.
        </p>

        <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="font-medium text-foreground">Mercado Pago</p>
            <p className="mt-0.5">Checkout Pro y Marketplace. Cobertura en Perú.</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="font-medium text-foreground">Culqi</p>
            <p className="mt-0.5">Tarjetas, Yape y PagoEfectivo (opcional).</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="font-medium text-foreground">Stripe</p>
            <p className="mt-0.5">Solo países donde opera. No disponible en Perú.</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            Los datos de tu cuenta se guardan cifrados (AES-256-GCM) y nunca se muestran en el
            navegador. El cobro online se habilita en la Fase 3 del proyecto.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Canales disponibles</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <li>· WhatsApp: pedido + mensaje pre-armado (activo ahora).</li>
          <li>· Pago online con Mercado Pago (en preparación).</li>
          <li>· Cobro contra entrega o transferencia: se coordina por WhatsApp.</li>
        </ul>
      </section>
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Conectar Mercado Pago</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Pega tu access token (de prueba o producción). Se valida contra la API y se guarda cifrado.
        </p>
        <div className="mt-4">
          <PaymentConnectForm storeSlug={slug} />
        </div>
      </section>
    </div>
  );
}
