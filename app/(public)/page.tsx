import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Globe2,
  Link2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  ShieldCheck,
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
    title: 'Tu catálogo en minutos',
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
    title: 'Enlace mikarpa.xyz/tu-tienda',
    description: 'mikarpa.xyz/tienda/tu-marca. Compártelo en Instagram, TikTok o el bio de tu perfil.',
    meta: 'Tu marca',
  },
  {
    icon: ShieldCheck,
    title: '0% de comisión por venta',
    description: 'Pagas la plataforma, no un porcentaje de cada pedido. Lo que vendes se queda contigo.',
    meta: '0% por venta',
  },
];

const steps = [
  {
    number: '01',
    title: 'Crea la tienda',
    description: 'Nombre, enlace y rubro. Tu tienda queda online en un minuto.',
  },
  {
    number: '02',
    title: 'Carga el catálogo',
    description: 'Fotos, precios en soles, stock y variantes desde el panel.',
  },
  {
    number: '03',
    title: 'Comparte y cobra',
    description: 'El pedido llega a tu WhatsApp, listo para coordinar y cobrar.',
  },
];

const included = [
  ['Sin comisión por venta', 'Incluido'],
  ['Precios en soles (PEN)', 'Incluido'],
  ['Checkout por WhatsApp', 'Incluido'],
  ['Enlace propio con tu marca', 'Incluido'],
  ['Panel de pedidos y catálogo', 'Incluido'],
  ['Personalización de colores y tipografía', 'Incluido'],
] as const;

const closeStatement = 'SIN COMISIONES';

/* -------------------------------------------------------------------------- */
/*  Piezas                                                                    */
/* -------------------------------------------------------------------------- */

function LiveDot() {
  return (
    <span className="relative flex size-1.5 shrink-0" aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.16em] text-primary uppercase">
      <span className="h-px w-4 bg-primary/60" />
      {children}
    </span>
  );
}

function CtaPrimary({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/registrarse"
      data-slot="button"
      data-size="lg"
      className={`group inline-flex h-10 items-center justify-center gap-2 rounded-[var(--r-btn)] bg-primary px-5 text-[13px] font-medium text-primary-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      Crear mi tienda
      <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Consola real del producto, mostrada dentro del hero. */
function ConsoleMock() {
  const orders = [
    { id: '#1042', client: 'Camila R.', total: 'S/ 89.00', status: 'Nuevo', tone: 'warning' },
    { id: '#1041', client: 'Diego M.', total: 'S/ 49.90', status: 'Listo', tone: 'success' },
    { id: '#1040', client: 'Valeria P.', total: 'S/ 134.90', status: 'En curso', tone: 'secondary' },
    { id: '#1039', client: 'Joel A.', total: 'S/ 35.00', status: 'Entregado', tone: 'outline' },
  ] as const;

  return (
    <div
      aria-hidden
      className="dealt-enter dealt-enter--delay w-full overflow-hidden rounded-[var(--r-lg)] border border-line-strong bg-card shadow-[0_24px_60px_-28px_color-mix(in_oklab,var(--ink)_42%,transparent)]"
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface/70 px-3 py-2">
        <div className="flex gap-1">
          <span className="size-2 rounded-full bg-[#f3b8b8]" />
          <span className="size-2 rounded-full bg-[#f0d9a6]" />
          <span className="size-2 rounded-full bg-[#b8dcc4]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[var(--r-xs)] border border-line bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground">
          <LockKeyhole className="size-2.5 text-emerald-600" />
          mikarpa.xyz/tienda/moda-lino/administracion
        </div>
        <span className="kbd">⌘K</span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
        <div className="p-3">
          <p className="section-label">Ventas hoy</p>
          <p className="stat-value mt-1.5 text-[18px]">S/ 1,280</p>
          <p className="mt-1 font-mono text-[10px] text-emerald-600">+12.4%</p>
        </div>
        <div className="p-3">
          <p className="section-label">Pedidos</p>
          <p className="stat-value mt-1.5 text-[18px]">18</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">4 por atender</p>
        </div>
        <div className="p-3">
          <p className="section-label">Productos</p>
          <p className="stat-value mt-1.5 text-[18px]">42</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">3 sin stock</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.5fr_1fr]">
        <div className="border-b border-line md:border-r md:border-b-0">
          <div className="panel-head border-b-0 pb-1.5">
            <h3 className="text-[12px] font-semibold">Últimos pedidos</h3>
            <span className="font-mono text-[10px] text-muted-foreground">Ver todos ↗</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="num font-medium">{order.id}</td>
                  <td className="whitespace-nowrap">{order.client}</td>
                  <td className="num whitespace-nowrap">{order.total}</td>
                  <td>
                    <span className="inline-flex rounded-[var(--r-xs)] bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3">
          <p className="section-label">Actividad · WhatsApp</p>
          <div className="mt-2.5 space-y-2.5">
            {[
              { who: 'Camila R.', message: 'Hola, ¿el polo oversize hay talla M?', time: '2m' },
              { who: 'Diego M.', message: 'Listo, confirmo el pedido 🙌', time: '14m' },
              { who: 'Valeria P.', message: '¿Hacen envíos a Arequipa?', time: '31m' },
            ].map((item) => (
              <div key={item.who} className="flex gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-50 font-mono text-[9px] font-medium text-emerald-700">
                  {item.who.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-medium">{item.who}</p>
                    <span className="font-mono text-[9px] text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="truncate text-[10px] text-muted-foreground">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-[#25D366]/10 px-3 py-2">
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#128C4C]">
          <MessageCircle className="size-3.5" />
          Pedidos conectados a WhatsApp
        </div>
        <span className="kbd">En vivo</span>
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
      {/* Filtro del momento liquid-type */}
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
      <div className="relative border-b border-line bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-1.5 font-mono text-[10px] tracking-wide text-muted-foreground sm:justify-between">
          <span className="hidden items-center gap-2 sm:inline-flex">
            <LiveDot />
            Plataforma operativa
          </span>
          <span>Perú · Soles (PEN) · WhatsApp directo</span>
          <span className="hidden sm:inline">0% comisión por venta</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[calc(100svh-82px)] w-full max-w-6xl items-center px-4 py-12 sm:py-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
          <div>
            <div className="dealt-enter">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 font-mono text-[10px] font-medium tracking-wide text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                Hecho para emprendedores peruanos
              </span>
            </div>

            <h1 className="dealt-liquid dealt-enter mt-5 max-w-lg text-[clamp(2.5rem,3.8vw,3.75rem)] leading-[1.05] font-semibold tracking-[-0.045em] text-balance">
              Tu tienda virtual, lista para vender por WhatsApp
            </h1>

            <p className="dealt-enter mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Crea tu catálogo, comparte tu enlace y recibe pedidos directo en WhatsApp. Sin comisiones por venta.
            </p>

            <div className="dealt-enter mt-7 flex flex-wrap items-center gap-2.5">
              <CtaPrimary />
              <Link
                href="/explorar"
                data-slot="button"
                data-size="lg"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--r-btn)] border border-line-strong bg-card px-5 text-[13px] font-medium transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Explorar tiendas
                <ArrowUpRight className="size-3.5 text-muted-foreground" />
              </Link>
            </div>

            <ul className="dealt-enter mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] text-muted-foreground">
              {['Sin tarjeta de crédito', 'Precios en soles', 'Tu propio enlace'].map((label) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <span className="grid size-3.5 place-items-center rounded-full bg-emerald-50">
                    <Check className="size-2.5 text-emerald-600" strokeWidth={3} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <ConsoleMock />
        </div>
      </section>

      {/* Métricas del mercado */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-x divide-line px-0 sm:grid-cols-4">
          {[
            { icon: Globe2, value: 'Perú y LATAM', label: 'Tu mercado' },
            { icon: Wallet, value: 'Soles (S/)', label: 'Tu moneda' },
            { icon: MessageCircle, value: 'WhatsApp', label: 'Tu checkout' },
            { icon: ShieldCheck, value: '0% comisión', label: 'Por cada venta' },
          ].map((item, index) => (
            <div
              key={item.value}
              className={`flex items-center gap-2.5 px-4 py-4 ${index > 1 ? 'border-t border-line sm:border-t-0' : ''} ${index % 2 === 1 ? 'border-l border-line sm:border-l-0' : ''}`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[var(--r-sm)] bg-surface text-primary">
                <item.icon className="size-3.5" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold">{item.value}</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bento de capacidades */}
      <section id="caracteristicas" className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Capacidades</Eyebrow>
            <h2 className="mt-3 max-w-xl text-[var(--t-h2)] leading-[1.12]">
              Tu catálogo, tu enlace y tus pedidos en un solo lugar.
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Mikarpa reúne lo esencial para convertir visitas en pedidos, sin configuraciones largas.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tarjeta grande con fragmento de producto */}
          <article className="dealt-card panel p-5 sm:col-span-2 sm:row-span-2">
            <div className="flex items-center justify-between">
              <span className="grid size-8 place-items-center rounded-[var(--r-sm)] bg-primary/10 text-primary">
                <MessageCircle className="size-4" />
              </span>
              <span className="kbd">Flujo real</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold">El pedido llega armado a tu WhatsApp</h3>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
              Productos, variantes, total y datos del cliente. Tu cliente confirma en un clic y tú respondes desde donde ya estás.
            </p>

            <div className="mt-6 rounded-[var(--r-md)] border border-line bg-background p-3">
              <div className="flex items-center gap-2 border-b border-line pb-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-[#25D366] text-white">
                  <MessageCircle className="size-3" />
                </span>
                <div>
                  <p className="text-[11px] font-medium">Moda Lino · Pedido #1042</p>
                  <p className="font-mono text-[9px] text-muted-foreground">Enviado hace 2 min</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="ml-auto max-w-[85%] rounded-[var(--r-sm)] rounded-tr-none bg-[#e7f7ee] px-2.5 py-2 text-[11px] leading-relaxed">
                  Hola, quiero llevar el polo oversize talla M y el tote bag de lona.
                </div>
                <div className="max-w-[85%] rounded-[var(--r-sm)] rounded-tl-none bg-secondary px-2.5 py-2 text-[11px] leading-relaxed">
                  ¡Listo! Tu pedido es <span className="num font-medium">S/ 91.90</span>. Te confirmo el envío 👍
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 font-mono text-[10px] text-muted-foreground">
                <span>2 productos</span>
                <span className="num font-medium text-foreground">S/ 91.90</span>
              </div>
            </div>
          </article>

          {features.slice(0, 2).map((feature) => (
            <article key={feature.title} className="dealt-card panel flex flex-col p-5">
              <span className="grid size-8 place-items-center rounded-[var(--r-sm)] bg-surface text-primary">
                <feature.icon className="size-4" strokeWidth={1.7} />
              </span>
              <span className="section-label mt-5">{feature.meta}</span>
              <h3 className="mt-2 text-[15px] font-semibold">{feature.title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{feature.description}</p>
            </article>
          ))}

          {features.slice(2).map((feature) => (
            <article key={feature.title} className="dealt-card panel flex flex-col p-5">
              <span className="grid size-8 place-items-center rounded-[var(--r-sm)] bg-surface text-primary">
                <feature.icon className="size-4" strokeWidth={1.7} />
              </span>
              <span className="section-label mt-5">{feature.meta}</span>
              <h3 className="mt-2 text-[15px] font-semibold">{feature.title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Pasos */}
      <section id="pasos" className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20">
        <Eyebrow>De cero a vendiendo</Eyebrow>
        <h2 className="mt-3 text-[var(--t-h2)] leading-[1.12]">Tres pasos y tu tienda mikarpa está abierta.</h2>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="panel p-5">
              <div className="flex items-center justify-between">
                <span className="num text-2xl font-medium text-primary">{step.number}</span>
                <ChevronRight className="size-3.5 text-line-strong" aria-hidden />
              </div>
              <h3 className="mt-5 text-[15px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Inclusiones: tabla de producto */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <Eyebrow>Incluido desde el día uno</Eyebrow>
            <h2 className="mt-3 text-[var(--t-h2)] leading-[1.12]">Todo incluido en tu tienda mikarpa.</h2>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Todo lo que tu tienda necesita para empezar a vender ya está en la plataforma.
            </p>
            <div className="mt-6">
              <CtaPrimary />
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3 className="text-[12px] font-semibold">Qué obtienes</h3>
              <span className="kbd">MVP</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Capacidad</th>
                  <th className="text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {included.map(([label, status]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className="text-right">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-700">
                        <Check className="size-3" strokeWidth={3} />
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Cierre + pie */}
      <footer className="bg-[var(--p-inv-bg)] text-[var(--p-inv-ink)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center">
            <Eyebrow>
              <span className="text-[var(--p-inv-accent)]">Empieza hoy</span>
            </Eyebrow>

            <p
              aria-label="Sin comisiones por venta"
              className="mt-6 flex flex-wrap justify-center gap-x-[0.18em] font-display text-[clamp(2.6rem,7.5vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.05em]"
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

            <p className="mx-auto mt-5 max-w-lg text-[13px] leading-relaxed text-[var(--p-inv-muted)]">
              Crea tu tienda gratis en minutos. Sin tarjeta de crédito y con tu enlace listo para compartir.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <CtaPrimary />
              <Link
                href="/explorar"
                data-slot="button"
                data-size="lg"
                className="inline-flex h-10 items-center justify-center rounded-[var(--r-btn)] border border-white/20 px-5 text-[13px] font-medium transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[var(--p-inv-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--p-inv-bg)]"
              >
                Ver tiendas reales
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 rounded-[var(--r-sm)] focus-visible:ring-2 focus-visible:ring-[var(--p-inv-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--p-inv-bg)]" aria-label="mikarpa, inicio">
                <span className="grid size-7 place-items-center rounded-[var(--r-sm)] bg-[var(--p-inv-action)] text-[var(--p-inv-action-ink)]">
                  <Store className="size-3.5" />
                </span>
                <span className="text-[15px] font-semibold tracking-tight">mikarpa</span>
              </Link>
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-[var(--p-inv-muted)]">
                Tiendas virtuales para emprendedores que venden por WhatsApp. Rápido, simple y sin comisiones.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] text-[var(--p-inv-muted)]">
                <MapPin className="size-3" />
                Hecho en Perú para LATAM
              </span>
            </div>

            <div>
              <h3 className="font-mono text-[10px] tracking-[0.14em] text-[var(--p-inv-muted)] uppercase">Producto</h3>
              <ul className="mt-3 space-y-2 text-[12px] text-[var(--p-inv-muted)]">
                <li><Link className="hover:text-[var(--p-inv-ink)]" href="/registrarse">Crear mi tienda</Link></li>
                <li><Link className="hover:text-[var(--p-inv-ink)]" href="/explorar">Explorar tiendas</Link></li>
                <li><Link className="hover:text-[var(--p-inv-ink)]" href="#caracteristicas">Características</Link></li>
                <li><Link className="hover:text-[var(--p-inv-ink)]" href="#pasos">Cómo funciona</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-[10px] tracking-[0.14em] text-[var(--p-inv-muted)] uppercase">Plataforma</h3>
              <ul className="mt-3 space-y-2 text-[12px] text-[var(--p-inv-muted)]">
                <li className="flex items-center gap-1.5"><MessageCircle className="size-3 text-[var(--p-inv-accent)]" /> Checkout por WhatsApp</li>
                <li className="flex items-center gap-1.5"><Wallet className="size-3 text-[var(--p-inv-accent)]" /> Sin comisiones</li>
                <li className="flex items-center gap-1.5"><Globe2 className="size-3 text-[var(--p-inv-accent)]" /> Precios en soles</li>
                <li className="flex items-center gap-1.5"><Link2 className="size-3 text-[var(--p-inv-accent)]" /> Enlace propio</li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-[10px] tracking-[0.14em] text-[var(--p-inv-muted)] uppercase">Contacto</h3>
              <ul className="mt-3 space-y-2 text-[12px] text-[var(--p-inv-muted)]">
                <li><a className="hover:text-[var(--p-inv-ink)]" href="mailto:hola@mikarpa.xyz">hola@mikarpa.xyz</a></li>
                <li>Atención en español · Perú y LATAM</li>
                <li>
                  <Link className="inline-flex items-center gap-1 hover:text-[var(--p-inv-ink)]" href="/iniciar-sesion">
                    Ingresar a mi cuenta <ArrowUpRight className="size-3" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-5 font-mono text-[10px] text-[var(--p-inv-muted)] sm:flex-row">
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
