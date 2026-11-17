import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MessageCircle,
  Palette,
  ShieldCheck,
  Smartphone,
  Store,
} from 'lucide-react';

const benefits = [
  {
    icon: Smartphone,
    title: 'Listo para Perú',
    description: 'Precios en soles, WhatsApp como canal principal y catálogo desde el celular.',
  },
  {
    icon: Palette,
    title: 'Tu marca, tu estilo',
    description: 'Elige tema, colores y secciones. Sin tocar código ni contratar a nadie.',
  },
  {
    icon: ShieldCheck,
    title: 'Pedidos sin fricción',
    description: 'El carrito arma el mensaje de WhatsApp con productos, cantidades y total.',
  },
  {
    icon: BarChart3,
    title: 'Control real',
    description: 'Productos, variantes, stock, categorías y pedidos en un mismo panel.',
  },
];

const steps = [
  { title: 'Crea tu cuenta', detail: 'Solo necesitas correo y contraseña.' },
  { title: 'Arma tu tienda', detail: 'Nombre, enlace, rubro y tema en un paso.' },
  { title: 'Sube tu catálogo', detail: 'Fotos, precios, stock y variantes.' },
  { title: 'Comparte y vende', detail: 'Tu enlace queda en /tienda/tu-marca.' },
];

export const instant = false;

export default function LandingPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55rem_30rem_at_50%_-10%,oklch(0.95_0.03_250),transparent)]"
        />
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              Perú · Soles · WhatsApp
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Tu tienda virtual, lista para vender en minutos.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
              mikarpa crea el catálogo, el carrito y el mensaje de WhatsApp por ti. Tú te enfocas
              en vender y en atender a tus clientes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/registrarse"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Crear mi tienda gratis
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/explorar"
                className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-medium transition-colors hover:bg-accent"
              >
                Ver tiendas
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['Sin tarjeta', 'Sin comisiones por WhatsApp', 'Tu enlace propio'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-auto w-full max-w-sm rotate-1 rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Store className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">Tienda Demo</p>
                <p className="text-xs text-muted-foreground">mikarpa.xyz/tienda/tienda-demo</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { name: 'Polo oversize de algodón', price: 'S/ 49,90', tag: '2 variantes' },
                { name: 'Vestido midi de lino', price: 'S/ 99,90', tag: 'Destacado' },
                { name: 'Pantalón cargo utility', price: 'S/ 89,90', tag: 'Nuevo' },
              ].map((product) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
                >
                  <div>
                    <p className="text-xs font-medium">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.tag}</p>
                  </div>
                  <span className="text-xs font-semibold">{product.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white">
              <MessageCircle className="size-4" aria-hidden />
              Pedir por WhatsApp
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Todo lo que necesitas</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-xl border border-border bg-card p-5">
              <benefit.icon className="size-5 text-muted-foreground" aria-hidden />
              <h3 className="mt-3 text-sm font-semibold">{benefit.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">De cero a vendiendo</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-border bg-background p-5">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Empieza hoy, sin costo
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Crea tu tienda, publica tu catálogo y comparte tu enlace. Los pedidos llegan directo a tu
          WhatsApp.
        </p>
        <Link
          href="/registrarse"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Crear mi tienda
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 mikarpa · Hecho para Perú y LATAM.</p>
          <div className="flex gap-4">
            <Link href="/explorar" className="hover:text-foreground">
              Explorar
            </Link>
            <Link href="/iniciar-sesion" className="hover:text-foreground">
              Ingresar
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
