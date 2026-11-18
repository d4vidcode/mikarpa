import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Globe2,
  Link2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Contenido                                                                 */
/* -------------------------------------------------------------------------- */

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  meta: string;
};

const features: Feature[] = [
  {
    icon: Store,
    title: 'Catálogo en minutos',
    description: 'Nombre, enlace, rubro y colores. Tu tienda queda publicada sin escribir código.',
    meta: 'Sin código',
  },
  {
    icon: MessageCircle,
    title: 'Pedidos por WhatsApp',
    description: 'El carrito arma el pedido con productos y total. Tu cliente confirma contigo en un clic.',
    meta: 'Checkout directo',
  },
  {
    icon: Link2,
    title: 'Tu propio enlace',
    description: 'mikarpa.xyz/tienda/tu-marca. Compártelo en Instagram, TikTok o el bio de tu perfil.',
    meta: 'Tu marca',
  },
  {
    icon: ShieldCheck,
    title: 'Sin comisiones',
    description: 'Pagas la plataforma, no un porcentaje de cada pedido. Lo que vendes se queda contigo.',
    meta: '0% por venta',
  },
];

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: '01',
    icon: Store,
    title: 'Crea la tienda',
    description: 'Elige nombre, enlace y rubro. En un minuto tu tienda ya está online y lista para compartir.',
  },
  {
    number: '02',
    icon: Package,
    title: 'Agrega productos',
    description: 'Sube fotos, precios en soles, stock y variantes desde un panel simple y rápido.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Comparte el enlace',
    description: 'Envía tu enlace. Los pedidos llegan directo a tu WhatsApp, listos para coordinar y cobrar.',
  },
];

const mockProducts = [
  { name: 'Polo oversize algodón', price: 'S/ 49.90', tag: '-20%', tone: 'bg-[#e9edf4]', icon: Shirt },
  { name: 'Pantalón cargo beige', price: 'S/ 89.00', tag: null, tone: 'bg-[#f1ece3]', icon: ShoppingBag },
  { name: 'Gorra trucker negra', price: 'S/ 35.00', tag: 'Nuevo', tone: 'bg-[#e6ebf3]', icon: ShoppingBag },
  { name: 'Tote bag de lona', price: 'S/ 42.00', tag: null, tone: 'bg-[#e7efe9]', icon: Package },
] as const;

const closeStatement = 'SIN COMISIONES';

/* -------------------------------------------------------------------------- */
/*  Piezas pequeñas                                                           */
/* -------------------------------------------------------------------------- */

function LiveDot() {
  return (
    <span className="relative flex size-2 shrink-0" aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.16em] text-primary uppercase">
      <span className="h-px w-5 bg-primary/50" />
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-[var(--t-h2)] leading-[1.1]">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

/** UI collage recortado por el marco, con una tarjeta de resultado encima. */
function StoreMockup() {
  return (
    <div aria-hidden className="dealt-enter dealt-enter--delay relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="relative h-[440px] overflow-hidden rounded-[var(--r-lg)] border border-line bg-[#e8eef7] sm:h-[520px]">
        <div className="absolute -top-24 left-6 size-80 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-0 bottom-0 size-64 rounded-full bg-[#d5e4f5] blur-3xl" />

        <div className="absolute top-12 left-12 w-[calc(100%-24px)] min-h-[560px] overflow-hidden rounded-[var(--r-md)] border border-line bg-card shadow-[0_28px_60px_-24px_color-mix(in_oklab,var(--ink)_35%,transparent)]">
          <div className="flex items-center gap-3 border-b border-line bg-surface/70 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#f3b8b8]" />
              <span className="size-2.5 rounded-full bg-[#f0d9a6]" />
              <span className="size-2.5 rounded-full bg-[#b8dcc4]" />
            </div>
            <div className="flex flex-1 items-center gap-1.5 rounded-full border border-line bg-background px-3 py-1 font-mono text-[10px] text-muted-foreground">
              <LockKeyhole className="size-3 text-emerald-600" />
              mikarpa.xyz/tienda/moda-lino
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-btn)] bg-foreground text-[11px] font-medium text-background">
                ML
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Moda Lino</p>
                <p className="truncate text-[11px] text-muted-foreground">Moda peruana · Envíos a todo el Perú</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[10px] text-emerald-700">
              <LiveDot />
              Abierto
            </span>
          </div>

          <div className="relative m-4 overflow-hidden rounded-[var(--r-btn)] bg-primary px-5 py-5 text-primary-foreground">
            <Sparkles className="absolute top-4 right-4 size-9 opacity-20" />
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase opacity-80">Nueva colección</p>
            <p className="mt-1.5 text-lg font-medium">Lino peruano, edición corta</p>
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur">
              Ver colección <ArrowUpRight className="size-3" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            {mockProducts.map((product) => (
              <div key={product.name} className="overflow-hidden rounded-[var(--r-btn)] border border-line bg-card">
                <div className={`relative grid aspect-square place-items-center ${product.tone}`}>
                  <product.icon className="size-10 text-foreground/25" strokeWidth={1.25} />
                  {product.tag ? (
                    <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-medium text-primary-foreground">
                      {product.tag}
                    </span>
                  ) : null}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-[11px] font-medium">{product.name}</p>
                  <p className="mt-0.5 font-mono text-xs font-medium tabular-nums">{product.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-line px-4 py-4">
            <div className="mb-3 flex items-center justify-between font-mono text-[11px]">
              <span className="text-muted-foreground">2 productos en tu carrito</span>
              <span className="font-medium tabular-nums">S/ 134.90</span>
            </div>
            <div className="flex w-full items-center justify-center gap-2 rounded-[var(--r-btn)] bg-[#25D366] py-3 text-sm font-medium text-white">
              <MessageCircle className="size-4" />
              Pedir por WhatsApp
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 z-10 w-56 rounded-[var(--r-md)] border border-line bg-card p-3 shadow-[0_16px_36px_-16px_color-mix(in_oklab,var(--ink)_40%,transparent)]">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-4 text-emerald-600" />
            </span>
            <div>
              <p className="text-xs font-medium">Pedido confirmado</p>
              <p className="font-mono text-[10px] text-muted-foreground">Moda Lino · hace 2 min</p>
            </div>
          </div>
          <p className="mt-2 border-t border-line pt-2 font-mono text-[11px] tabular-nums">
            S/ 49.90 <span className="font-sans text-muted-foreground">· Polo oversize</span>
          </p>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 hidden items-center gap-2 rounded-[var(--r-md)] bg-[#25D366] px-4 py-3 text-white shadow-lg sm:flex">
        <MessageCircle className="size-4" />
        <div>
          <p className="text-xs font-medium">Nuevo pedido</p>
          <p className="text-[11px] text-white/80">Recibido por WhatsApp</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Página                                                                    */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <main id="contenido" className="relative isolate overflow-hidden bg-background">
      {/* Filtro del momento liquid-type: solo se ve al pasar el puntero */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id="dealt-liquid">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="1" seed="7" result="noise">
            <animate
              attributeName="baseFrequency"
              dur="1.2s"
              values="0.012 0.03; 0.02 0.05; 0.012 0.03"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Estado del producto */}
      <div className="relative border-b border-line bg-surface/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-2 font-mono text-[11px] tracking-wide text-muted-foreground">
          <LiveDot />
          <span>Perú · Soles · WhatsApp directo</span>
          <span className="hidden text-line-strong sm:inline">/</span>
          <span className="hidden sm:inline">0% comisión por venta</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[calc(100svh-90px)] w-full max-w-6xl items-center px-4 py-16 sm:py-24">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="flex flex-col">
            <div className="dealt-enter">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Hecho para emprendedores peruanos
              </span>
            </div>

            <h1 className="dealt-liquid dealt-enter mt-6 max-w-xl text-[clamp(2.6rem,4.6vw,4.25rem)] leading-[1.02] font-medium tracking-[-0.045em] text-balance">
              Tiendas virtuales que venden por WhatsApp
            </h1>

            <p className="dealt-enter mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Crea tu catálogo, comparte tu enlace y recibe pedidos por WhatsApp. Sin comisiones por venta.
            </p>

            <div className="dealt-enter mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/registrarse"
                data-slot="button"
                data-size="lg"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-[var(--r-btn)] bg-primary px-6 text-[15px] font-medium text-primary-foreground shadow-sm"
              >
                Crear mi tienda
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/explorar"
                data-slot="button"
                data-size="lg"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--r-btn)] border border-line-strong bg-background px-6 text-[15px] font-medium"
              >
                Explorar tiendas
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            </div>

            <ul className="dealt-enter mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted-foreground">
              {['Sin tarjeta de crédito', 'Precios en soles', 'Tu propio enlace'].map((label) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <span className="grid size-4 place-items-center rounded-full bg-emerald-50">
                    <Check className="size-3 text-emerald-600" strokeWidth={3} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <StoreMockup />
        </div>
      </section>

      {/* Datos del mercado */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4">
          {[
            { icon: Globe2, value: 'Perú y LATAM', label: 'Pensado para tu mercado' },
            { icon: Wallet, value: 'Soles (S/)', label: 'Precios en tu moneda' },
            { icon: MessageCircle, value: 'WhatsApp', label: 'Checkout directo' },
            { icon: ShieldCheck, value: '0% comisión', label: 'Por cada venta' },
          ].map((item) => (
            <div key={item.value} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-btn)] bg-surface text-primary">
                <item.icon className="size-[18px]" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.value}</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Funciones */}
      <section id="caracteristicas" className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-24">
        <SectionHeading
          eyebrow="Tu tienda, completa"
          title="Las herramientas para vender, en un solo lugar."
          description="Mikarpa reúne lo esencial para convertir visitas en pedidos, sin configuraciones largas."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="dealt-card flex h-full flex-col rounded-[var(--r-lg)] border border-line bg-card p-6"
            >
              <span className="grid size-11 place-items-center rounded-[var(--r-btn)] bg-surface text-primary">
                <feature.icon className="size-5" strokeWidth={1.7} />
              </span>
              <span className="mt-5 w-fit font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                {feature.meta}
              </span>
              <h3 className="mt-3 text-base font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Pasos */}
      <section id="pasos" className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-4 pb-24">
        <SectionHeading eyebrow="De cero a vendiendo" title="Tres pasos y tu tienda está abierta." />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="dealt-card rounded-[var(--r-lg)] border border-line bg-card p-6">
              <div className="flex items-start justify-between">
                <span className="grid size-16 place-items-center rounded-[var(--r-md)] bg-surface font-mono text-2xl font-medium text-primary">
                  {step.number}
                </span>
                <span className="grid size-10 place-items-center rounded-[var(--r-btn)] bg-surface text-muted-foreground">
                  <step.icon className="size-5" strokeWidth={1.6} />
                </span>
              </div>
              <h3 className="mt-6 text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-[var(--r-lg)] border border-line bg-surface/60 px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-base font-medium">Tu tienda lista en minutos.</p>
            <p className="mt-1 text-sm text-muted-foreground">Sin comisiones por venta. Precios en soles.</p>
          </div>
          <Link
            href="/registrarse"
            data-slot="button"
            data-size="lg"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-[var(--r-btn)] bg-primary px-6 text-[15px] font-medium text-primary-foreground shadow-sm"
          >
            Crear mi tienda
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Cierre + pie de página: un solo momento oscuro */}
      <footer className="bg-[var(--p-inv-bg)] text-[var(--p-inv-ink)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:py-32">
          <div className="text-center">
            <Eyebrow>
              <span className="text-[var(--p-inv-accent)]">Empieza hoy</span>
            </Eyebrow>

            {/* Momento letters-assemble */}
            <p
              aria-label="Sin comisiones por venta"
              className="mt-8 flex flex-wrap justify-center gap-x-[0.22em] font-display text-[clamp(3.2rem,10vw,8.5rem)] leading-[0.92] font-medium tracking-[-0.055em]"
            >
              {closeStatement.split('').map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  aria-hidden
                  className="dealt-letter"
                  style={{ '--i': index } as React.CSSProperties}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </p>

            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-[var(--p-inv-muted)]">
              Crea tu tienda gratis en minutos. Sin tarjeta de crédito y con tu enlace listo para compartir.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/registrarse"
                data-slot="button"
                data-size="lg"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-[var(--r-btn)] bg-primary px-7 text-[15px] font-medium text-primary-foreground shadow-sm"
              >
                Crear mi tienda
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/explorar"
                data-slot="button"
                data-size="lg"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--r-btn)] border border-white/20 px-6 text-[15px] font-medium"
              >
                Ver tiendas reales
              </Link>
            </div>
          </div>

          <div className="mt-24 grid gap-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2.5" aria-label="mikarpa, inicio">
                <span className="grid size-9 place-items-center rounded-[var(--r-btn)] bg-[var(--p-inv-action)] text-[var(--p-inv-action-ink)]">
                  <Store className="size-[18px]" />
                </span>
                <span className="text-lg font-medium tracking-[-0.035em]">mikarpa</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--p-inv-muted)]">
                Tiendas virtuales para emprendedores que venden por WhatsApp. Rápido, simple y sin comisiones.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] text-[var(--p-inv-muted)]">
                <MapPin className="size-3.5" />
                Hecho en Perú para LATAM
              </span>
            </div>

            <div>
              <h3 className="font-mono text-[11px] tracking-[0.14em] text-[var(--p-inv-muted)] uppercase">Producto</h3>
              <ul className="mt-4 space-y-3 text-sm text-[var(--p-inv-muted)]">
                <li><Link className="transition-colors duration-150 hover:text-[var(--p-inv-ink)]" href="/registrarse">Crear mi tienda</Link></li>
                <li><Link className="transition-colors duration-150 hover:text-[var(--p-inv-ink)]" href="/explorar">Explorar tiendas</Link></li>
                <li><Link className="transition-colors duration-150 hover:text-[var(--p-inv-ink)]" href="#caracteristicas">Características</Link></li>
                <li><Link className="transition-colors duration-150 hover:text-[var(--p-inv-ink)]" href="#pasos">Cómo funciona</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-[11px] tracking-[0.14em] text-[var(--p-inv-muted)] uppercase">Plataforma</h3>
              <ul className="mt-4 space-y-3 text-sm text-[var(--p-inv-muted)]">
                <li className="flex items-center gap-2"><MessageCircle className="size-3.5 text-[var(--p-inv-accent)]" /> Checkout por WhatsApp</li>
                <li className="flex items-center gap-2"><Wallet className="size-3.5 text-[var(--p-inv-accent)]" /> Sin comisiones por venta</li>
                <li className="flex items-center gap-2"><Globe2 className="size-3.5 text-[var(--p-inv-accent)]" /> Precios en soles</li>
                <li className="flex items-center gap-2"><Link2 className="size-3.5 text-[var(--p-inv-accent)]" /> Tu propio enlace</li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-[11px] tracking-[0.14em] text-[var(--p-inv-muted)] uppercase">Contacto</h3>
              <ul className="mt-4 space-y-3 text-sm text-[var(--p-inv-muted)]">
                <li>
                  <a className="transition-colors duration-150 hover:text-[var(--p-inv-ink)]" href="mailto:hola@mikarpa.xyz">
                    hola@mikarpa.xyz
                  </a>
                </li>
                <li>Atención en español · Perú y LATAM</li>
                <li>
                  <Link className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-[var(--p-inv-ink)]" href="/iniciar-sesion">
                    Ingresar a mi cuenta <ArrowUpRight className="size-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 font-mono text-[11px] text-[var(--p-inv-muted)] sm:flex-row">
            <p>© 2026 mikarpa · Todos los derechos reservados.</p>
            <p className="inline-flex items-center gap-2">
              <LiveDot />
              Perú · Soles · WhatsApp directo
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
