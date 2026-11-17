'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck, Store, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const features = [
  {
    icon: Zap,
    title: 'Lista en minutos',
    description: 'Nombre, enlace, rubro y tema. Tu tienda queda publicada sin tocar código.',
  },
  {
    icon: MessageCircle,
    title: 'Checkout por WhatsApp',
    description: 'El carrito arma el mensaje con productos y total. El cliente confirma contigo.',
  },
  {
    icon: Store,
    title: 'Tu propio enlace',
    description: 'mikarpa.xyz/tienda/tu-marca. Compártelo en Instagram, TikTok o tu bio.',
  },
  {
    icon: ShieldCheck,
    title: 'Sin comisiones por venta',
    description: 'Pagas la plataforma, no un porcentaje de cada pedido. Lo que vendes es tuyo.',
  },
];

const steps = [
  { number: '01', title: 'Crea tu tienda', description: 'Elige nombre, enlace, rubro y un tema. En un minuto está online.' },
  { number: '02', title: 'Sube tus productos', description: 'Fotos, precios, stock y variantes. Descripciones con editor rico.' },
  { number: '03', title: 'Comparte y vende', description: 'Envía tu enlace. Los pedidos llegan por WhatsApp, listos para coordinar.' },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.62_0.18_260/0.18),transparent_70%)] blur-2xl"
      />

      {/* Hero */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Perú · Soles · WhatsApp directo
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Tu tienda virtual,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                lista en minutos.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Crea tu catálogo, comparte tu enlace y recibe pedidos por WhatsApp. Sin comisiones por
              venta, sin código, sin complicaciones.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/registrarse"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-150 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
              >
                Crear mi tienda gratis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/explorar"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Explorar tiendas
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden />
                Sin tarjeta de crédito
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden />
                0% comisión por venta
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden />
                Tu propio enlace
              </span>
            </div>
          </motion.div>

          {/* Floating mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-emerald-500/10 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl shadow-blue-500/10">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    ML
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Moda Lino</p>
                    <p className="text-xs text-slate-500">mikarpa.xyz/tienda/moda-lino</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  En línea
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">
                {[
                  { name: 'Polo oversize algodón', price: 'S/ 49.90', image: 'https://picsum.photos/seed/mikarpa1/400/400' },
                  { name: 'Pantalón cargo beige', price: 'S/ 89.00', image: 'https://picsum.photos/seed/mikarpa2/400/400' },
                  { name: 'Gorra trucker negra', price: 'S/ 35.00', image: 'https://picsum.photos/seed/mikarpa3/400/400' },
                  { name: 'Tote bag canvas', price: 'S/ 42.00', image: 'https://picsum.photos/seed/mikarpa4/400/400' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={400}
                        height={400}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-xs font-medium text-slate-800">{item.name}</p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Pedir por WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Todo lo que necesitas</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Vende como los grandes, sin su complejidad.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Mikarpa te da las herramientas esenciales para convertir visitas en pedidos, en un solo lugar.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-blue-500/5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <feature.icon className="size-5" strokeWidth={1.5} aria-hidden />
              </span>
              <h3 className="mt-5 text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Steps */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">De cero a vendiendo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Tres pasos. Sin fricción.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <span className="text-4xl font-semibold tracking-tight text-blue-600/20">{step.number}</span>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
        <div className="overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.62_0.18_260/0.25),transparent_60%)]"
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Tu próxima venta empieza hoy.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
              Crea tu tienda gratis en minutos. Sin tarjeta, sin comisiones por venta.
            </p>
            <Link
              href="/registrarse"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-7 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            >
              Empezar gratis
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 mikarpa · Hecho para Perú y LATAM.</p>
          <div className="flex gap-4">
            <Link href="/explorar" className="transition-colors hover:text-slate-900">
              Explorar
            </Link>
            <Link href="/iniciar-sesion" className="transition-colors hover:text-slate-900">
              Ingresar
            </Link>
            <Link href="/registrarse" className="transition-colors hover:text-slate-900">
              Crear tienda
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
