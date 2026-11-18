'use client';

import Link from 'next/link';
import { motion, MotionConfig, type Variants } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
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
  Zap,
  type LucideIcon,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Motion presets                                                            */
/* -------------------------------------------------------------------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  badge: string;
};

const features: Feature[] = [
  {
    icon: Zap,
    title: 'Lista en minutos',
    description: 'Nombre, enlace, rubro y colores. Tu tienda queda publicada sin escribir una línea de código.',
    accent: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
    badge: 'Sin código',
  },
  {
    icon: MessageCircle,
    title: 'Checkout por WhatsApp',
    description: 'El carrito arma el pedido con productos y total. Tu cliente confirma contigo en un clic.',
    accent: 'bg-emerald-50 text-emerald-600 group-hover:bg-[#25D366]',
    badge: '#25D366',
  },
  {
    icon: Link2,
    title: 'Tu propio enlace',
    description: 'mikarpa.xyz/tienda/tu-marca. Compártelo en Instagram, TikTok, Facebook o tu bio.',
    accent: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600',
    badge: 'Tu marca',
  },
  {
    icon: ShieldCheck,
    title: 'Sin comisiones por venta',
    description: 'Pagas la plataforma, no un porcentaje de cada pedido. Lo que vendes se queda contigo.',
    accent: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500',
    badge: '0% venta',
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
    title: 'Crea tu tienda',
    description: 'Elige nombre, enlace y rubro. En un minuto tu tienda ya está online y lista para compartir.',
  },
  {
    number: '02',
    icon: Package,
    title: 'Sube tus productos',
    description: 'Agrega fotos, precios en soles, stock y variantes. Todo desde un panel simple y rápido.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Comparte y vende',
    description: 'Envía tu enlace. Los pedidos llegan directo a tu WhatsApp, listos para coordinar y cobrar.',
  },
];

type MockProduct = {
  name: string;
  price: string;
  discount?: string;
  gradient: string;
  icon: LucideIcon;
};

const mockProducts: MockProduct[] = [
  { name: 'Polo oversize algodón', price: 'S/ 49.90', discount: '-20%', gradient: 'from-amber-100 to-orange-200', icon: Shirt },
  { name: 'Pantalón cargo beige', price: 'S/ 89.00', gradient: 'from-slate-100 to-slate-200', icon: ShoppingBag },
  { name: 'Gorra trucker negra', price: 'S/ 35.00', discount: 'Nuevo', gradient: 'from-blue-100 to-indigo-200', icon: BadgeCheck },
  { name: 'Tote bag de lona', price: 'S/ 42.00', gradient: 'from-emerald-100 to-teal-200', icon: Package },
];

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function LiveDot() {
  return (
    <span className="relative flex size-2 shrink-0" aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
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
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className="mx-auto max-w-2xl text-center"
    >
      <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
        <span className="h-px w-6 bg-blue-500/60" />
        {eyebrow}
        <span className="h-px w-6 bg-blue-500/60" />
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p> : null}
    </motion.div>
  );
}

function StoreMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-emerald-400/15 blur-3xl"
      />

      {/* Floating order notification */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="absolute -top-4 -left-5 z-10 hidden w-52 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-emerald-50">
            <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900">¡Pedido confirmado!</p>
            <p className="text-[11px] text-slate-500">Moda Lino · hace 2 min</p>
          </div>
        </div>
        <p className="mt-2 border-t border-slate-100 pt-2 text-xs font-medium text-slate-700">
          S/ 49.90 <span className="font-normal text-slate-400">· Polo oversize</span>
        </p>
      </motion.div>

      {/* Floating WhatsApp bubble */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="absolute -right-5 bottom-24 z-10 hidden items-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-white shadow-xl shadow-emerald-600/25 sm:flex"
      >
        <MessageCircle className="size-4" aria-hidden />
        <div>
          <p className="text-xs font-semibold">Nuevo pedido</p>
          <p className="text-[11px] text-white/80">Recibido por WhatsApp</p>
        </div>
      </motion.div>

      {/* Browser window with the store inside */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-24px_rgba(37,99,235,0.35)] ring-1 ring-white/60">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-red-300" />
            <span className="size-2.5 rounded-full bg-amber-300" />
            <span className="size-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex flex-1 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-500">
            <LockKeyhole className="size-3 text-emerald-500" aria-hidden />
            mikarpa.xyz/tienda/moda-lino
          </div>
          <span className="size-3" aria-hidden />
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-bold text-white">
              ML
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">Moda Lino</p>
              <p className="truncate text-[11px] text-slate-500">Moda peruana · Envíos a todo el Perú</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <LiveDot />
            Abierto
          </span>
        </div>

        <div className="relative m-4 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 px-5 py-5 text-white">
          <Sparkles className="absolute top-4 right-4 size-9 text-white/20" aria-hidden />
          <p className="text-[10px] font-medium tracking-[0.18em] text-blue-100 uppercase">Nueva colección</p>
          <p className="mt-1.5 text-lg font-semibold">Lino peruano, edición corta</p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur">
            Ver colección <ArrowUpRight className="size-3" aria-hidden />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {mockProducts.map((product) => (
            <motion.div
              key={product.name}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
            >
              <div className={`relative grid aspect-square place-items-center bg-gradient-to-br ${product.gradient}`}>
                <product.icon className="size-10 text-slate-700/35" strokeWidth={1.25} aria-hidden />
                {product.discount ? (
                  <span className="absolute top-2 left-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {product.discount}
                  </span>
                ) : null}
              </div>
              <div className="p-2.5">
                <p className="truncate text-[11px] font-medium text-slate-800">{product.name}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-slate-100 bg-white px-4 py-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">2 productos en tu carrito</span>
            <span className="font-semibold tabular-nums text-slate-900">S/ 134.90</span>
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/25 active:scale-[0.99]"
          >
            <MessageCircle className="size-4" aria-hidden />
            Pedir por WhatsApp
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate overflow-hidden bg-white">
        {/* Top status strip */}
        <div className="relative border-b border-blue-100/70 bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/70">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-2 text-[11px] font-medium tracking-wide text-slate-600 sm:text-xs">
            <LiveDot />
            <span>Perú · Soles · WhatsApp directo</span>
            <span className="hidden text-slate-300 sm:inline">•</span>
            <span className="hidden sm:inline">0% comisión por venta</span>
          </div>
        </div>

        {/* Ambient background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(148,163,184,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.13) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse at top, black, transparent 65%)',
              WebkitMaskImage: 'radial-gradient(ellipse at top, black, transparent 65%)',
            }}
          />
          <div className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute top-40 -right-24 size-[26rem] rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        {/* Hero */}
        <section className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1 text-xs font-medium text-blue-700">
                  <Sparkles className="size-3.5" aria-hidden />
                  Hecho para emprendedores peruanos
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.65rem]"
              >
                Tu tienda virtual,
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  lista en minutos.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Crea tu catálogo, comparte tu enlace y recibe pedidos por WhatsApp. Sin comisiones por
                venta, sin código y sin complicaciones.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/registrarse"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
                >
                  Crear mi tienda gratis
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <Link
                  href="/explorar"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                >
                  Explorar tiendas
                  <ArrowUpRight className="size-4 text-slate-400" aria-hidden />
                </Link>
              </motion.div>

              <motion.ul variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                {[
                  { icon: Check, label: 'Sin tarjeta de crédito' },
                  { icon: Check, label: '0% comisión por venta' },
                  { icon: Check, label: 'Tu propio enlace' },
                ].map((item) => (
                  <li key={item.label} className="inline-flex items-center gap-1.5">
                    <span className="grid size-4 place-items-center rounded-full bg-emerald-50">
                      <item.icon className="size-3 text-emerald-600" strokeWidth={3} aria-hidden />
                    </span>
                    {item.label}
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <StoreMockup />
          </div>
        </section>

        {/* Trust strip */}
        <section className="relative border-y border-slate-100 bg-slate-50/60">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4">
            {[
              { icon: Globe2, value: 'Perú & LATAM', label: 'Pensado para tu mercado' },
              { icon: Wallet, value: 'Soles (S/)', label: 'Precios en tu moneda' },
              { icon: MessageCircle, value: 'WhatsApp', label: 'Checkout directo' },
              { icon: ShieldCheck, value: '0% comisión', label: 'Por cada venta' },
            ].map((item) => (
              <div key={item.value} className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
                  <item.icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.value}</p>
                  <p className="truncate text-xs text-slate-500">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="caracteristicas" className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:py-24">
          <SectionHeading
            eyebrow="Todo lo que necesitas"
            title="Vende como los grandes, sin su complejidad."
            description="Mikarpa reúne las herramientas esenciales para convertir visitas en pedidos, en un solo lugar."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.article
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-blue-500/10"
              >
                <span className={`grid size-11 place-items-center rounded-xl transition-colors duration-200 ${feature.accent}`}>
                  <feature.icon className="size-5 transition-colors duration-200 group-hover:text-white" strokeWidth={1.7} aria-hidden />
                </span>
                <span className="mt-5 w-fit rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                  {feature.badge}
                </span>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                <span className="mt-auto pt-5 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
                  <ArrowUpRight className="size-4" />
                </span>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* Steps */}
        <section id="pasos" className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-4 pb-20 sm:pb-24">
          <SectionHeading eyebrow="De cero a vendiendo" title="Tres pasos. Sin fricción." />

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div
              aria-hidden
              className="absolute top-10 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent md:block"
            />
            {steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-2xl font-semibold tracking-tight text-blue-600 ring-1 ring-blue-100/70">
                    {step.number}
                  </span>
                  <span className="grid size-10 place-items-center rounded-xl bg-slate-50 text-slate-500">
                    <step.icon className="size-5" strokeWidth={1.6} aria-hidden />
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                {index < steps.length - 1 ? (
                  <ArrowRight className="absolute top-11 -right-4 hidden size-4 text-blue-300 md:block" aria-hidden />
                ) : null}
              </motion.article>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center sm:px-12 sm:py-20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% -10%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(circle at 85% 110%, rgba(16,185,129,0.18), transparent 50%)',
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100">
                <LiveDot />
                Empieza hoy · 0% comisión
              </span>
              <h2 className="mx-auto mt-6 max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
                Tu próxima venta empieza hoy.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                Crea tu tienda gratis en minutos. Sin tarjeta de crédito, sin comisiones por venta y con
                tu enlace listo para compartir.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/registrarse"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                >
                  Empezar gratis
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <Link
                  href="/explorar"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Ver tiendas reales
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-slate-200/80 bg-slate-50/70">
          <div className="mx-auto w-full max-w-6xl px-4 py-14">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Link href="/" className="flex items-center gap-2" aria-label="mikarpa, inicio">
                  <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
                    <Store className="size-[18px]" aria-hidden />
                  </span>
                  <span className="text-lg font-semibold tracking-tight text-slate-900">mikarpa</span>
                </Link>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
                  Tiendas virtuales para emprendedores que venden por WhatsApp. Rápido, simple y sin
                  comisiones por venta.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <MapPin className="size-3.5" aria-hidden />
                  Hecho en Perú para LATAM
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">Producto</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li><Link className="transition-colors hover:text-blue-600" href="/registrarse">Crear mi tienda</Link></li>
                  <li><Link className="transition-colors hover:text-blue-600" href="/explorar">Explorar tiendas</Link></li>
                  <li><Link className="transition-colors hover:text-blue-600" href="#caracteristicas">Características</Link></li>
                  <li><Link className="transition-colors hover:text-blue-600" href="#pasos">Cómo funciona</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">Plataforma</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-1.5"><MessageCircle className="size-3.5 text-emerald-500" aria-hidden /> Checkout por WhatsApp</li>
                  <li className="flex items-center gap-1.5"><Wallet className="size-3.5 text-blue-500" aria-hidden /> Sin comisiones por venta</li>
                  <li className="flex items-center gap-1.5"><Globe2 className="size-3.5 text-blue-500" aria-hidden /> Precios en soles</li>
                  <li className="flex items-center gap-1.5"><BadgeCheck className="size-3.5 text-blue-500" aria-hidden /> Tu propio enlace</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">Contacto</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li>
                    <a className="transition-colors hover:text-blue-600" href="mailto:hola@mikarpa.xyz">
                      hola@mikarpa.xyz
                    </a>
                  </li>
                  <li>Atención en español · Perú y LATAM</li>
                  <li>
                    <Link className="inline-flex items-center gap-1 transition-colors hover:text-blue-600" href="/iniciar-sesion">
                      Ingresar a mi cuenta <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
              <p>© 2026 mikarpa · Todos los derechos reservados.</p>
              <p className="inline-flex items-center gap-2">
                <LiveDot />
                Perú · Soles · WhatsApp directo
              </p>
            </div>
          </div>
        </footer>
      </main>
    </MotionConfig>
  );
}
