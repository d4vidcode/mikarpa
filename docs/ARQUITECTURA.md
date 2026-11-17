# mikarpa — Arquitectura, modelo de datos y plan de implementación

> Estado: **Fase 0 completada** (scaffold, conexión a Mongo, seed, índices, health y guía de
> deploy verificados). Siguiente: **Fase 1** (auth, onboarding, catálogo, storefront y checkout),
> pendiente de arranque.
>
> Decisiones cerradas: Next.js 16 (última estable), PEN/Soles, Perú primero, español,
> Mercado Pago como pasarela principal, Cloudinary para imágenes, rich text en descripciones
> y variantes básicas de producto.

---

## 1. Resumen

SaaS multi-tenant de tiendas virtuales:

- Un usuario se registra y puede crear **N tiendas** (`owner`).
- Cada tienda tiene su storefront público en `/tienda/[slug]`, catálogo y pedidos.
- Cobro por **WhatsApp** (`wa.me`, sin comisiones) o **pasarela online** por tienda.
- **Mercado Pago** (Perú y LATAM) como pasarela principal; Culqi como alternativa local y
  Stripe solo para países donde opera (no Perú).
- Un **superadmin** administra plataforma, tiendas, usuarios, temas y rubros maestros.
- Los **staff** acceden solo a los módulos habilitados por el owner.

Aislamiento multi-tenant estricto: toda query de negocio filtra por `storeId` derivado del slug
y de una membresía validada en servidor. El `storeId` nunca se acepta como dato confiable del cliente.

---

## 2. Stack y versiones objetivo

| Pieza | Elección | Notas |
| --- | --- | --- |
| Framework | **Next.js 16.4.6** (App Router, RSC, Turbopack) | Última estable (verificado en npm, nov 2026). `params`/`searchParams` son `Promise`. |
| Runtime | Node.js ≥ 20.9 | Requisito de Next 16. |
| Lenguaje | TypeScript **strict** | `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`. |
| UI | TailwindCSS 4 + shadcn/ui + lucide-react | Tokens de tema como CSS variables. |
| Editor rich text | **Tiptap** (core MIT) + `sanitize-html` | HTML saneado en servidor antes de guardar. |
| DB | MongoDB Atlas + **Mongoose 9.12** | Esquemas ya validados con 9.12.2. |
| Auth | **Auth.js v5** (`next-auth@5.0.0-beta.32`) + Credentials + JWT | v5 sigue en beta (el tag `latest` es v4). Se fija la versión exacta. |
| Estado | Zustand 5 (carrito, persist por tienda) + Context de sesión | Carrito namespaced por `storeId`; línea = producto + variante. |
| Validación | Zod 4 | Formularios, Route Handlers y Server Actions. |
| Imágenes | **Cloudinary** (free) tras `lib/storage.ts` | Alternativa: Vercel Blob, mismo contrato. |
| Email | Resend (opcional) | Recuperación de contraseña e invitaciones. |
| Pagos | **Mercado Pago** (Checkout Pro/Bricks + OAuth Marketplace) | Perú primero; adapters para Culqi/Stripe. |
| Deploy | Vercel + Atlas | Hobby para desarrollo; Pro cuando el SaaS facture. |

### Notas de Next 16 que afectan el plan

- `middleware.ts` **fue renombrado a `proxy.ts`** en Next 16 y el runtime por defecto pasó a
  Node.js. El requisito de "middleware obligatorio" se cumple con `proxy.ts` (mismo mecanismo,
  nuevo nombre). Existe codemod: `npx @next/codemod@canary middleware-to-proxy .`.
- Aunque `proxy.ts` corre en Node, **no se usa para consultar Mongo**: se ejecuta en cada
  navegación y la documentación desaconseja depender de módulos compartidos. Sigue siendo un
  filtro grueso; la autorización real va en layouts/acciones.
- Auth.js v5 beta es la única línea v5; se aísla tras `lib/auth.ts` para poder cambiar de
  versión sin tocar los módulos.

---

## 3. Decisiones de arquitectura (ADR cortas)

| # | Decisión | Motivo / consecuencia |
| --- | --- | --- |
| ADR-01 | **Dinero en enteros (unidad menor)** | `price: 1999` = `S/ 19,99`. `lib/money.ts` formatea con `Intl.NumberFormat('es-PE', {currency:'PEN'})`. |
| ADR-02 | **`StoreMember` es la fuente de verdad del tenant** | `Store.ownerId` es denormalización. Invariante: siempre existe membresía owner activa. |
| ADR-03 | **JWT con snapshot de membresías + verificación autoritativa en servidor** | `proxy.ts` no consulta DB. Layout/Server Action/Route Handler validan contra Mongo. |
| ADR-04 | **Temas y secciones son registries de código + metadatos en DB** | Añadir tema/sección no requiere migración. La DB dice *qué* está activo; el código *cómo* se renderiza. |
| ADR-05 | **Feature flags embebidos en `Store.featureFlags`** | Cero queries extra; `store.featureFlags[k] ?? DEFAULT_FEATURE_FLAGS[k]`. |
| ADR-06 | **Slugs únicos globales y reservados** | `/tienda/[slug]` es ruta plana. `slugHistory` para 301 al cambiarlo. |
| ADR-07 | **Pedidos invitados permitidos** | `customerId` nullable; `customerInfo` es snapshot. |
| ADR-08 | **Precios y totales se recalculan en el servidor** | El checkout recibe `{productId, variantId?, qty}`; relee precio/stock. El modelo valida los totales. |
| ADR-09 | **Pasarela provider-agnostic con Mercado Pago por defecto** | Stripe no opera en Perú. `PaymentProvider` + `PaymentAccount`: cada tienda cobra en su cuenta vía OAuth. |
| ADR-10 | **Secretos de pago cifrados en colección aparte** | `PaymentAccount.accessTokenEnc` con AES-256-GCM (`PAYMENT_TOKEN_KEY`), `select:false`, nunca en `Store` ni en logs. |
| ADR-11 | **Soft delete en tiendas/usuarios; `archived` en productos** | Preserva órdenes y auditoría. Borrado duro solo superadmin explícito. |
| ADR-12 | **`autoIndex: false` en producción** | Índices con `npm run db:indexes`, no en cada cold start. |
| ADR-13 | **Auditoría append-only** | `AuditLog` bloquea `update*`/`delete*`; se escribe en acciones sensibles. |
| ADR-14 | **Rich text saneado en servidor** | Tiptap en el editor; `sanitize-html` con allowlist al guardar; `descriptionText` derivado para SEO/búsqueda. |
| ADR-15 | **Variantes básicas desde el día 1** | `Product.options` + `Product.variants` (precio/stock/imagen por variante). La UI avanzada (generador masivo, imagen por combinación) queda para Fase 2. |
| ADR-16 | **Perú primero, LATAM después** | `PEN`, `es-PE`, `America/Lima` por defecto; multi-moneda/multi-idioma preparados, no implementados. |

---

## 4. Modelo de datos

### 4.1 Relaciones

```text
User 1───N StoreMember N───1 Store
User 1───N Store (ownerId)
Store 1───N Category ──┐
Store 1───N Product ───┴── categoryId (opcional)
Store 1───N Product.variants (embebido)
Store 1───N Order 1───N OrderItem (snapshot, con variante)
Store 1───1 Theme (themeKey → Theme.key)
Store 1───1 PaymentAccount (token cifrado)
Store N───1 StoreCategory (category → slug maestro)
User 1───N Order (customerId, opcional)
AuditLog → storeId | actorId | entityType+entityId
Counter  → _id = "order:<storeId>"
```

### 4.2 `User`

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `name` | string | 2–80, requerido |
| `email` | string | único global, lowercase, regex |
| `passwordHash` | string | requerido, **`select: false`** |
| `role` | enum | `superadmin \| owner \| staff \| customer`, default `customer` |
| `status` | enum | `active \| suspended` |
| `image`, `phone` | string | opcionales |
| `emailVerifiedAt`, `lastLoginAt` | Date | — |
| `tokenVersion` | number | Invalida JWT al cambiar rol/estado |
| `passwordReset` | subdoc | `tokenHash` (select false) + `expiresAt` |
| `deletedAt` | Date | Soft delete / anonimización |

Índices: `email` (unique), `role`, `{status, createdAt}`.

### 4.3 `Store`

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `name` | string | requerido, ≤80 |
| `slug` | string | **único global**, lowercase, `SLUG_REGEX`, 3–48, no reservado (Zod) |
| `slugHistory` | string[] | Redirecciones 301 |
| `description`, `logoUrl`, `logoPublicId` | string | — |
| `category` | string | slug de `StoreCategory` (rubro maestro) |
| `ownerId` | ObjectId → User | requerido |
| `theme` | `{themeKey, tokens{colors,fonts,radius}}` | `themeKey` debe existir en el registry |
| `sections` | `{key,type,enabled,order,config}[]` | `key` único por tienda; `type` libre (registry) |
| `contact` | `{phone,email,address,city,country}` | — |
| `social` | `{instagram,facebook,tiktok,x,website}` | — |
| `businessHours` | `{day,closed,open,close}[]` | un registro por día (0–6) |
| `currency` / `locale` / `timezone` | string | `PEN` / `es-PE` / `America/Lima` por defecto |
| `paymentConfig` | ver abajo | — |
| `featureFlags` | `Map<string,boolean>` | defaults en `DEFAULT_FEATURE_FLAGS` |
| `seo` | `{title,description,ogImageUrl}` | — |
| `status` | enum | `active \| suspended \| archived` |
| `suspension` | `{reason,at,by}` | auditoría de suspensión |
| `onboardingCompletedAt`, `publishedAt`, `deletedAt` | Date | — |

```ts
paymentConfig: {
  whatsapp: { enabled, phone, messageTemplate },
  online: {
    enabled: boolean,
    provider: 'mercadopago' | 'culqi' | 'stripe',
    status: 'disconnected' | 'pending' | 'active' | 'restricted',
    accountId: string | null,   // collector_id / merchant id / acct_, público
    connectedAt: Date | null,
  },
  defaultChannel: 'whatsapp' | 'online',
}
```

Los tokens de la pasarela **no** viven aquí: van cifrados en `PaymentAccount`.

Índices: `slug` (unique), `{status, category, createdAt}` (directorio), `{ownerId, status}`,
texto `{name, description}` con `default_language: spanish`.

### 4.4 `StoreMember`

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `storeId`, `userId` | ObjectId | **único compuesto** |
| `role` | enum | `owner \| staff` |
| `permissions` | string[] | subconjunto de `STORE_PERMISSIONS`; owner = todas (hook) |
| `status` | enum | `invited \| active \| revoked` |
| `invitedEmail`, `invitedBy`, `inviteTokenHash`, `inviteExpiresAt`, `acceptedAt`, `lastAccessAt` | — | Invitaciones (Fase 2) |

Índices: `{storeId,userId}` unique, `{userId,status}`, `{storeId,role,status}`,
`inviteTokenHash` unique parcial.

Permisos: `products, categories, orders, messages, appearance, payments, team, settings, analytics`.

### 4.5 `Category` (por tienda)

`storeId`, `name`, `slug`, `description`, `imageUrl`, `parentId?`, `order`, `status`.
Índices: `{storeId,slug}` unique, `{storeId,status,order}`, `{storeId,parentId}`.

### 4.6 `Product`

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `storeId`, `categoryId?` | ObjectId | categoría validada contra la misma tienda |
| `name`, `slug` | string | slug único **por tienda** |
| `description` | string (HTML) | rich text saneado, ≤20k |
| `descriptionText` | string | texto plano derivado, ≤5k; alimenta SEO y búsqueda |
| `price`, `compareAtPrice` | int | unidad menor; `compareAtPrice > price` |
| `sku` | string | único por tienda cuando existe (índice parcial) |
| `stock`, `trackStock` | number/boolean | stock del producto base (sin variantes) |
| `options` | `{name, values[]}[]` | máx. 3 opciones, 20 valores; sin nombres repetidos |
| `variants` | `{sku?, options[{name,value}], price?, compareAtPrice?, stock, imageUrl?, active}` | máx. 100; combinaciones únicas; `price` override |
| `status` | enum | `draft \| active \| archived` + `archivedAt` |
| `images` | media[] | máx. 10; `{url,publicId,alt,width,height}` |
| `tags`, `featured`, `position`, `soldCount`, `seo` | — | `featured` alimenta "Destacados" |

Semántica de stock: **si `variants.length > 0`, el stock autoritativo es el de cada variante**;
`Product.stock` solo aplica a productos sin variantes. El checkout valida y descuenta contra la
variante (o el producto base) de forma atómica.

Índices: `{storeId,slug}` unique, `{storeId,status,createdAt}`,
`{storeId,categoryId,status,position}`, `{storeId,featured,status,position}`, texto
`{name,descriptionText,tags}`, `{storeId,sku}` unique parcial.

### 4.7 `Order`

- `storeId`, `orderNumber` (entero, único por tienda, `Counter` atómico), `currency` (snapshot).
- `customerId?` + `customerInfo {name,phone,email,address,city,documentId}`.
- `items [{productId, variantId?, variantLabel?, name, sku, imageUrl, price, qty}]` — snapshot;
  sin líneas duplicadas (misma pareja producto+variante).
- `totals {subtotal,shipping,tax,discount,total}` — validados aritméticamente.
- `channel: 'whatsapp' | 'online'` + `paymentProvider?: 'mercadopago'|'culqi'|'stripe'`.
- `status` (7 estados), `paymentStatus` (5 estados).
- `payment {provider, externalId, preferenceId, checkoutUrl, receiptUrl, paidAt}`.
- `whatsapp {message, openedAt, confirmedAt}`, `couponCode`, notas, `source`, `externalRef`.

Índices: `{storeId,orderNumber}` unique, `{storeId,createdAt}`, `{storeId,status,createdAt}`,
`{storeId,paymentStatus,createdAt}`, `{customerId,createdAt}`,
`{storeId,'payment.provider','payment.externalId'}` unique parcial, `externalRef` unique parcial.

### 4.8 `PaymentAccount` (nuevo)

Una cuenta de cobro por tienda y pasarela:

`storeId` (unique), `provider`, `providerUserId`, `status`, `liveMode`, `scope`,
`accessTokenEnc` (**select:false**), `refreshTokenEnc` (**select:false**), `tokenExpiresAt`,
`connectedAt`, `disconnectedAt`, `lastSyncAt`, `metadata` (no sensible).

Índices: `storeId` unique, `{provider, providerUserId}`, `{status}`.
Cifrado AES-256-GCM con `PAYMENT_TOKEN_KEY`; el descifrado ocurre solo en `lib/payments/*`.

### 4.9 `Theme`

`key` (unique, = carpeta en `/themes`), `name`, `description`, `previewImageUrl`, `status`,
`version`, `tokens` (colores/fuentes/radius), `sectionsAvailable[]`, `defaultSections[]`.
La DB nunca define componentes.

### 4.10 `StoreCategory` (rubro maestro)

`slug` unique, `name`, `icon` (lucide), `description`, `order`, `active`.

### 4.11 `PlatformSettings` (singleton `key: 'platform'`)

`branding`, `defaults {currency:'PEN', locale:'es-PE', timezone:'America/Lima', featureFlags}`,
`signup`, `maintenance`, `updatedBy`.

### 4.12 `AuditLog` (append-only)

`actorId`, `actorEmail`, `actorRole`, `storeId?`, `action`, `entityType`, `entityId`,
`before`, `after`, `metadata {ip,userAgent,requestId,reason}`. Sin `updatedAt`; hooks bloquean
updates/deletes. Acciones de pago (`payment.connect`, `payment.disconnect`) **nunca** guardan tokens.

### 4.13 `Counter`

`_id` (`order:<storeId>`), `seq`. `findOneAndUpdate({_id}, {$inc:{seq:1}}, {upsert:true,new:true})`.

### 4.14 Invariantes multi-tenant (checklist de code review)

1. Toda query de panel/tienda incluye `storeId` derivado del Store validado, nunca del body.
2. Las mutaciones por id usan `updateOne({_id, storeId}, …)` (anti-IDOR).
3. `productId`/`variantId`/`categoryId` se validan contra `storeId` antes de usarse.
4. `orderNumber` se genera con `Counter`, no con `count()`.
5. Precios y stock se releen de Mongo; el cliente solo envía `{productId, variantId?, qty}`.
6. Un `staff` sin permiso recibe 403 en servidor; ocultar el botón no es autorización.
7. Tienda suspendida: fuera de `/explorar`, storefront 410, checkout bloqueado.
8. Nunca se devuelven `passwordHash`, `inviteTokenHash`, `passwordReset.tokenHash` ni
   `PaymentAccount.*TokenEnc`.
9. El HTML de descripciones se sanea antes de guardar y se renderiza con allowlist.

---

## 5. Autorización en 3 capas

```text
Request
  │
  ├─ 1. proxy.ts (Next 16, filtro grueso)
  │     · sin sesión + /administracion/**        → /iniciar-sesion
  │     · sin sesión + /tienda/*/administracion  → /iniciar-sesion
  │     · rol ≠ superadmin + /administracion/**  → 403
  │     · membresía de tienda ausente en JWT     → /explorar?denied=slug
  │
  ├─ 2. layout.tsx / page.tsx (RSC, Node)
  │     · requireSuperadmin()
  │     · requireStoreAccess(slug, permission) → DB real
  │
  └─ 3. Server Action / Route Handler
        · misma validación + Zod + scoping por storeId
        · AuditLog en acciones sensibles
```

**JWT** (Auth.js, estrategia `jwt`):

```ts
{
  sub: userId,
  role: 'owner',
  tokenVersion: 3,
  memberships: [{ storeId, slug, role, permissions: ['products','orders'] }],
  iat, exp
}
```

- `authorize()` corre en Node: `bcrypt.compare` + carga de membresías activas.
- `proxy.ts` solo lee el token. Si se revoca una membresía, la capa 2 corta el acceso de inmediato;
  el token se refresca al siguiente login o con `unstable_update`.
- `tokenVersion` permite invalidar sesiones al cambiar rol/estado.
- Si un usuario tuviera muchísimas tiendas, el middleware solo valida `sub` y la capa 2 resuelve
  todo desde DB (ya lo hace).

Contrato del helper:

```ts
// lib/tenant.ts
export const getStoreBySlug = cache(async (slug: string) => { /* … */ });

export async function requireStoreAccess(slug: string, permission?: StorePermission) {
  // 404 si no existe / suspendida (no filtrar información)
  // 404 si no es miembro (no revelar que la tienda existe)
  // 403 si es staff y no tiene el permiso
  // superadmin: lectura total, sin escritura por defecto
}
```

---

## 6. Temas y secciones (extensibilidad)

### 6.1 Contrato de tema

```ts
// themes/types.ts
export type ThemeDefinition = {
  key: string;                       // 'minimal' | 'boutique' | ...
  name: string;
  defaultSections: SectionInstance[];
  tokens: ThemeTokens;               // defaults, sobreescribibles por tienda
  Shell: React.ComponentType<ThemeShellProps>;
};
```

### 6.2 Contrato de sección

```ts
// themes/sections/types.ts
export type SectionDefinition<TConfig> = {
  type: string;                      // 'hero' | 'featured' | ...
  label: string;
  schema: z.ZodType<TConfig>;        // valida config al guardar
  defaultConfig: TConfig;
  Component: React.ComponentType<SectionProps<TConfig>>;
};
```

Reglas:

- `themes/registry.ts` y `sections/registry.ts` son la única fuente de tipos disponibles.
- El renderer público ordena por `order`, ignora `enabled:false` y **omite** tipos desconocidos
  (permite retirar secciones sin migrar datos).
- El editor valida la config con el `schema` de la sección; si falla, conserva la última válida.
- Los tokens se inyectan como CSS variables (`--brand-primary`, `--brand-bg`, `--font-heading`…).
- Secciones MVP: `hero`, `featured`, `categories`, `newArrivals`, `footer`, `whatsappFloat`.
- Temas MVP: `minimal` (limpio) y `boutique` (cálido, serif).

---

## 7. Estructura de carpetas

```text
mikarpa/
├─ app/
│  ├─ layout.tsx
│  ├─ globals.css
│  ├─ not-found.tsx
│  ├─ error.tsx
│  ├─ (public)/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                              # landing /
│  │  ├─ iniciar-sesion/page.tsx
│  │  ├─ registrarse/page.tsx
│  │  ├─ explorar/page.tsx
│  │  └─ recuperar-contrasena/page.tsx         # F2
│  ├─ (onboarding)/
│  │  └─ crear-tienda/page.tsx                 # wizard owner
│  ├─ tienda/[slug]/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                              # storefront
│  │  ├─ producto/[id]/page.tsx
│  │  ├─ carrito/page.tsx
│  │  ├─ pedido/[orderNumber]/page.tsx         # confirmación
│  │  └─ administracion/
│  │     ├─ layout.tsx                         # guard owner/staff
│  │     ├─ page.tsx
│  │     ├─ productos/page.tsx
│  │     ├─ productos/nuevo/page.tsx
│  │     ├─ productos/[id]/page.tsx
│  │     ├─ categorias/page.tsx
│  │     ├─ pedidos/page.tsx
│  │     ├─ pedidos/[id]/page.tsx
│  │     ├─ apariencia/page.tsx
│  │     ├─ pagos/page.tsx
│  │     ├─ trabajadores/page.tsx
│  │     └─ configuracion/page.tsx
│  ├─ administracion/
│  │  ├─ layout.tsx                            # guard superadmin
│  │  ├─ page.tsx
│  │  ├─ tiendas/page.tsx
│  │  ├─ tiendas/[id]/page.tsx
│  │  ├─ usuarios/page.tsx
│  │  └─ configuracion/page.tsx
│  └─ api/
│     ├─ auth/[...nextauth]/route.ts
│     ├─ auth/registro/route.ts
│     ├─ auth/recuperar/route.ts               # F2
│     ├─ auth/restablecer/route.ts             # F2
│     ├─ health/route.ts
│     ├─ stores/route.ts
│     ├─ stores/[storeId]/route.ts
│     ├─ stores/[storeId]/members/route.ts
│     ├─ stores/[storeId]/members/[memberId]/route.ts
│     ├─ stores/[storeId]/categories/route.ts
│     ├─ stores/[storeId]/products/route.ts
│     ├─ stores/[storeId]/products/[productId]/route.ts
│     ├─ stores/[storeId]/orders/route.ts
│     ├─ stores/[storeId]/orders/[orderId]/route.ts
│     ├─ stores/[storeId]/checkout/route.ts
│     ├─ stores/[storeId]/payments/connect/route.ts        # F3
│     ├─ payments/mercadopago/callback/route.ts            # F3
│     ├─ payments/mercadopago/webhook/route.ts             # F3
│     ├─ uploads/sign/route.ts
│     └─ admin/metrics/route.ts
├─ components/
│  ├─ ui/                      # shadcn
│  ├─ layout/ · landing/ · stores/ · storefront/
│  ├─ products/                # product-form, image-uploader, rich-text-editor, variant-editor
│  ├─ categories/ · orders/
│  ├─ dashboard/ · appearance/ · admin/ · auth/ · shared/
├─ lib/
│  ├─ db.ts                    # conexión cacheada (globalThis)
│  ├─ auth.ts                  # NextAuth() con Credentials (Node)
│  ├─ auth.config.ts           # config Edge-safe (sin mongoose/bcrypt)
│  ├─ permissions.ts           # can(), assertStorePermission()
│  ├─ tenant.ts                # getStoreBySlug, requireStoreAccess (cacheado)
│  ├─ audit.ts
│  ├─ storage.ts               # Cloudinary | Vercel Blob
│  ├─ crypto.ts                # AES-256-GCM para tokens de pago
│  ├─ payments/
│  │  ├─ index.ts              # PaymentProvider interface + factory
│  │  ├─ mercadopago.ts
│  │  ├─ culqi.ts              # F3 opcional
│  │  └─ stripe.ts             # F3 opcional (países soportados)
│  ├─ email.ts · rate-limit.ts · money.ts · slugs.ts · api.ts · enums.ts
│  ├─ sanitize.ts              # allowlist de HTML del rich text
│  └─ validators/
│     ├─ common.ts · auth.ts · store.ts · product.ts · category.ts
│     ├─ order.ts · member.ts · payment.ts · admin.ts
├─ models/                     # ✅ en el repo
│  ├─ common.ts
│  ├─ User.ts · Store.ts · StoreMember.ts · StoreCategory.ts
│  ├─ Category.ts · Product.ts · Order.ts
│  ├─ Theme.ts · AuditLog.ts · Settings.ts · Counter.ts
│  ├─ PaymentAccount.ts
│  └─ index.ts
├─ themes/
│  ├─ registry.ts · types.ts
│  ├─ minimal/{index.tsx,theme.config.ts,components/}
│  ├─ boutique/{index.tsx,theme.config.ts,components/}
│  └─ sections/{registry.ts,types.ts,hero/,featured/,categories/,new-arrivals/,footer/,whatsapp-float/}
├─ types/{index,dto,next-auth.d}.ts
├─ scripts/{seed,sync-indexes,reset-db}.ts
├─ tests/{unit,e2e}/
├─ docs/ARQUITECTURA.md
├─ proxy.ts                    # antiguo middleware.ts (Next 16)
├─ .env.example · .prettierrc · eslint.config.mjs
├─ components.json · next.config.ts · postcss.config.mjs · tsconfig.json · package.json
└─ README.md
```

---

## 8. Superficie HTTP

Server Actions para formularios del panel. Route Handlers para auth, webhooks, uploads,
checkout y endpoints consumidos por cliente.

| Método + ruta | Auth | Uso |
| --- | --- | --- |
| `POST /api/auth/registro` | público + rate limit | Alta de usuario (Zod, bcrypt) |
| `/api/auth/[...nextauth]` | — | Login/logout/sesión |
| `POST /api/auth/recuperar` · `POST /api/auth/restablecer` | público | Reset por email (F2) |
| `GET /api/health` | público | Ping DB |
| `POST /api/stores` | owner | Crear tienda (transacción Store + Member + rol) |
| `PATCH /api/stores/[storeId]` | owner/superadmin | Datos, slug, horarios, redes |
| `GET/POST /api/stores/[storeId]/products` | permiso `products` | Listado/creación |
| `PATCH/DELETE /api/stores/[storeId]/products/[productId]` | permiso `products` | Edición/archivado |
| `GET/POST /api/stores/[storeId]/categories` | permiso `categories` | CRUD |
| `POST /api/stores/[storeId]/checkout` | público | Recalcula precios/stock, crea la orden |
| `GET /api/stores/[storeId]/orders` | permiso `orders` | Pedidos paginados/filtrados |
| `PATCH /api/stores/[storeId]/orders/[orderId]` | permiso `orders` | Cambio de estado + historial |
| `POST /api/stores/[storeId]/members` | permiso `team` | Invitar staff |
| `PATCH/DELETE /api/stores/[storeId]/members/[memberId]` | permiso `team` | Permisos/revocar |
| `POST /api/uploads/sign` | autenticado | Firma de subida |
| `POST /api/stores/[storeId]/payments/connect` | permiso `payments` | OAuth Mercado Pago (F3) |
| `GET /api/payments/mercadopago/callback` | state firmado | Vinculación de cuenta (F3) |
| `POST /api/payments/mercadopago/webhook` | firma MP | Pago aprobado → orden `paid` (F3) |
| `GET /api/admin/metrics` | superadmin | KPIs globales |
| `PATCH /api/admin/stores/[id]/status` | superadmin | Suspender/reactivar |
| `PATCH /api/admin/users/[id]` | superadmin | Rol/estado global |

Respuestas: `{ ok: true, data }` o `{ ok: false, error: { code, message, fields? } }`.

---

## 9. Flujo de pagos (Fase 3)

```text
Tienda                               Plataforma                        Mercado Pago
  │ PATCH /pagos (provider)              │                                   │
  ├─────────────────────────────────────►│                                   │
  │                                      │ OAuth Marketplace (state firmado) │
  │                                      ├──────────────────────────────────►│
  │                                      │◄──── code ────────────────────────┤
  │                                      │ token exchange                    │
  │                                      ├──────────────────────────────────►│
  │                                      │◄──── access_token ────────────────┤
  │                                      │ cifra AES-GCM → PaymentAccount    │
  │                                      │                                   │
Comprador                               │                                   │
  ├─ checkout (channel=online) ─────────►│ crea Order pending                │
  │                                      ├─ preference (external_reference) ─►│
  │◄──── redirect init_point ────────────┤                                   │
  │────────────────── paga ──────────────────────────────────────────────────►│
  │                                      │◄──── webhook (payment_id) ────────┤
  │                                      │ valida firma + consulta payment   │
  │                                      │ idempotencia por payment.externalId
  │                                      │ marca paid + descuenta stock      │
  │◄──── /pedido/[n] ────────────────────┤                                   │
```

Reglas:

- La preferencia usa precios recalculados, no los del cliente.
- `external_reference` = `orderId`; `notification_url` = webhook público.
- El webhook **siempre** re-consulta el pago a la API (no confía en el body).
- Estado terminal idempotente: si la orden ya está `paid`, no se vuelve a descontar stock.
- Comisión de plataforma (`marketplace_fee`) opcional por plan; se define en Fase 3.
- Reembolsos: manuales desde el panel de Mercado Pago en el MVP.

---

## 10. Plan por fases

> Estimación en días efectivos. Cada fase termina con deploy verde y
> `lint + typecheck + build` en verde.

### Fase 0 — Fundaciones (1 día) ✅ completada

1. Scaffold **Next 16.4.6** + TS strict + ESLint/Prettier + Tailwind 4 + shadcn/ui.
2. `lib/db.ts` (conexión cacheada, `bufferCommands:false`, `autoIndex:false` en prod).
3. Modelos (ya escritos) + `scripts/sync-indexes.ts`.
4. `scripts/seed.ts` idempotente (+ `scripts/reset-db.ts` con guardas).
5. `GET /api/health` con ping a Mongo.
6. `.env.example`, README de deploy, Vercel + Atlas M0, Cloudinary free.

**Aceptación:** `/api/health` responde `db: ok` en local y Vercel; seed dos veces no duplica;
los índices existen en Atlas.

**Verificado en local:** `typecheck`, `lint` y `build` en verde; seed ejecutado dos veces sin
duplicar (owner con los 9 permisos, staff solo `orders`); 12/12 modelos con índices
sincronizados (texto y únicos parciales incluidos); `/api/health` `503 unconfigured` sin
variables y `200 db: ok` con base conectada; `db:reset` rechaza sin `CONFIRM_RESET=1`.
Pendiente de credenciales reales: repetir índices/seed contra Atlas y verificar el health
en Vercel.

---

### Fase 1 — MVP (6–8 días)

1. **Auth**: registro (Zod + bcrypt), login Credentials, logout, `requireUser`,
   `SessionProvider`, `types/next-auth.d.ts`, `proxy.ts` + guard por layout.
2. **Onboarding** `/crear-tienda`: nombre, slug con disponibilidad, rubro, tema. Transacción
   `Store` + `StoreMember(owner)` + `User.role='owner'` + secciones default.
3. **RBAC**: `lib/permissions.ts`, `requireStoreAccess`, menú filtrado por permisos.
4. **CRUD productos**: tabla, form con **rich text Tiptap** (saneado), galería de imágenes,
   **variantes básicas** (opciones + variantes con precio/stock/SKU), destacados, archivado.
   **CRUD categorías**.
5. **Storefront `minimal`**: shell + secciones, grid con filtro por categoría, detalle con
   selector de variante, metadata SEO.
6. **Carrito Zustand** (clave producto+variante) + **checkout WhatsApp**:
   - recalcula precios/stock en servidor,
   - crea `Order` (`pending`, `unpaid`, `whatsapp`) con `Counter`,
   - devuelve `wa.me` con mensaje pre-armado y abre WhatsApp,
   - página de confirmación con `orderNumber`.
7. **Superadmin**: métricas básicas, tiendas (suspender/reactivar + motivo), usuarios
   (rol/estado), feature flags, branding y rubros maestros.
8. **Landing `/`** + **`/explorar`** (activas, búsqueda, rubro).
9. **Auditoría** en suspensión, cambio de rol, archivado de producto, cambio de permisos.
10. Suspensión efectiva: storefront 410 y exclusión de `/explorar`.

**Aceptación:** owner crea tienda y publica producto en <5 min; `customer` bloqueado en paneles;
owner A no lee/muta datos de tienda B (probado con IDs); checkout WhatsApp con totales correctos;
total manipulado por el cliente se ignora; build de producción limpio.

---

### Fase 2 — Personalización, staff y operación (5–7 días)

1. Tema **boutique** + editor de tokens con preview y contraste AA.
2. Editor de secciones: activar/desactivar, reordenar ↑↓ + `@dnd-kit`, config validada con Zod.
3. **Staff**: invitación por email (token hash + expiración), aceptación, permisos granulares,
   revocación, guard por permiso, auditoría.
4. **Pedidos**: filtros, detalle con historial, transiciones válidas, descuento de stock atómico
   (producto o variante, sin sobreventa), plantillas WhatsApp.
5. **Variantes avanzadas**: generador de combinaciones, imagen por variante, SKU masivo.
6. **Configuración**: datos, horarios, redes, SEO, cambio de slug con 301.
7. Recuperación de contraseña con Resend + rate limiting en login/registro/checkout.
8. Accesibilidad: foco, labels, contraste, `aria-*` en menús/diálogos.

**Aceptación:** staff con solo `orders` no accede a productos ni apariencia; reordenar secciones
se refleja tras revalidar; invitación expirada falla; confirmar pedido descuenta stock una sola vez.

---

### Fase 3 — Pagos, métricas y hardening (6–9 días)

1. **Mercado Pago**: OAuth Marketplace, `PaymentAccount` cifrado, Checkout Pro, webhook
   idempotente, orden `paid`, stock descontado una vez, link a comprobante.
2. **Culqi** (opcional): adapter para Yape/agentes con la misma interfaz.
3. `/explorar` con filtros combinados, orden y paginación; búsqueda con índice de texto.
4. Métricas owner (ventas, ticket, top productos, conversión) y globales superadmin.
5. UI de auditoría con filtros.
6. i18n opcional (es/en) y multi-moneda preparada (no activa).
7. Tests: unitarios (validators, permisos, money, slug, variantes) y e2e smoke
   (registro → tienda → producto → checkout → pedido); CI.
8. Seguridad: CSP, headers, allowlist del rich text, límites de subida, revisión IDOR.

**Aceptación:** pago de prueba aprueba la orden y descuenta stock una vez; webhook duplicado no
duplica; `/explorar` <300 ms con 1.000 tiendas; cobertura crítica ≥80%.

---

## 11. Seed (`scripts/seed.ts`)

Idempotente (upsert por clave única), `npm run db:seed`:

| Entidad | Datos |
| --- | --- |
| Superadmin | `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` |
| Owner demo | `demo@mikarpa.xyz` / `demo1234`, `role: owner` |
| Tienda demo | `tienda-demo`, rubro `ropa`, tema `minimal`, secciones default, WhatsApp activo |
| Categorías maestras | ropa, belleza, tecnología, hogar, comida, mascotas, deportes, infantil |
| Temas | `minimal`, `boutique` con tokens y `defaultSections` |
| Catálogo demo | 3 categorías + 8 productos (2 con variantes y rich text) |
| Pedido demo | 1 orden WhatsApp `pending` con historial |
| Settings | `platform` con defaults PEN / es-PE / America/Lima |

Salida: resumen con credenciales y advertencia de cambiar claves en producción.

---

## 12. Variables de entorno

```bash
# --- Obligatorias ---
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mikarpa
MONGODB_DB=mikarpa
AUTH_SECRET=            # openssl rand -base64 32
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000        # alias compatible
NEXT_PUBLIC_APP_URL=http://localhost:3000

# --- Imágenes (Cloudinary free) ---
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# BLOB_READ_WRITE_TOKEN=                  # alternativa Vercel Blob

# --- Pagos: Mercado Pago (Fase 3) ---
MP_CLIENT_ID=
MP_CLIENT_SECRET=
MP_REDIRECT_URI=https://mikarpa.xyz/api/payments/mercadopago/callback
MP_WEBHOOK_SECRET=
PAYMENT_TOKEN_KEY=      # 32 bytes base64: cifra los tokens OAuth por tienda

# --- Alternativas de pago (opcionales) ---
CULQI_PUBLIC_KEY=
CULQI_SECRET_KEY=
STRIPE_SECRET_KEY=      # solo países donde Stripe opera
STRIPE_WEBHOOK_SECRET=

# --- Email (opcional, Fase 2) ---
RESEND_API_KEY=
EMAIL_FROM="mikarpa <no-reply@mikarpa.xyz>"

# --- Seed (solo local / una vez) ---
SEED_SUPERADMIN_EMAIL=admin@mikarpa.xyz
SEED_SUPERADMIN_PASSWORD=CambiarEstaClave123!
```

`AUTH_SECRET` es el nombre de Auth.js v5; el código acepta
`process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET`.

---

## 13. Costos reales del MVP (todo gratuito hasta facturar)

| Servicio | Plan free | Cuándo pasar a pago |
| --- | --- | --- |
| Vercel | Hobby (100 GB transferencia, 1M invocaciones) | Al operar comercialmente: **Pro US$20/mes** |
| MongoDB Atlas | M0 (512 MB) | >512 MB o backups: M10 (~US$57/mes) |
| Cloudinary | Free: 25 créditos/mes (≈25 GB o 25k transformaciones) | Al crecer el catálogo: Plus US$99/mes (o Vercel Blob) |
| Resend | Free: 3.000 emails/mes, 100/día | Al superar el límite |
| Mercado Pago | Sin costo fijo | Comisión por transacción (verificar tarifario vigente; ~4% + IGV) |
| Dominio | — | `mikarpa.xyz` ~US$10–15/año |

**Sobre "todo free":** Vercel Hobby está pensado para proyectos personales; un SaaS que cobra
debe usar Pro. Para construir y validar el MVP no necesitas pagar nada salvo el dominio. Si
buscas evitar Vercel Pro a toda costa, la alternativa sería Cloudflare Workers (free comercial)
o un VPS, pero ambos complican Mongoose/Auth y no los recomiendo para este proyecto.

**Cloudinary vs Vercel Blob:** para imágenes de producto, Cloudinary free gana (transformaciones,
optimización y 25 GB). Blob es más simple pero no transforma imágenes y su free tier es más justo.

---

## 14. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Agotar conexiones Atlas en serverless | Conexión cacheada + `maxPoolSize` bajo + `bufferCommands:false` |
| Cold starts con índices | `autoIndex:false`; `npm run db:indexes` |
| Sobreventa de stock con variantes | `findOneAndUpdate` atómico sobre el stock de la variante con guardia; idempotencia de webhooks |
| IDOR entre tiendas | Scoping por `storeId` + tests negativos |
| Tokens de sesión obsoletos | Verificación autoritativa + `tokenVersion` |
| Tokens de pago filtrados | `PaymentAccount` separado, AES-256-GCM, `select:false`, nunca en logs/auditoría |
| Next 16 + Auth.js v5 beta | Versión fijada; auth aislado en `lib/auth.ts`; tests de login |
| XSS en descripciones | `sanitize-html` con allowlist al guardar; sin `script/style/iframe`; imágenes solo galería |
| Migración a Next 17 | `proxy.ts` ya es el estándar; evitar dependencias del runtime Edge |
| Spam de pedidos | Rate limit por IP + honeypot + Zod estricto |
| Slug squatting | Reservados + rate limit + revisión superadmin |
| Coste de Atlas M0 | Paginación obligatoria, índices acotados, sin `count()` en listados grandes |

---

## 15. Fuera de alcance del MVP (y cómo se extiende)

- **Variantes avanzadas**: generador masivo, imagen por combinación, códigos de barras.
- **Cupones**: `Coupon` por tienda + `Order.couponCode` ya previsto.
- **Reseñas**: `Review` con moderación.
- **Dominios propios**: `Store.customDomain` + verificación DNS; flag `customDomain`.
- **Multi-moneda**: precios por moneda o conversión diaria; hoy `Store.currency`.
- **Multi-idioma**: diccionarios + rutas localizadas (Fase 3).
- **Suscripciones/planes**: `Plan` + límites; los flags permiten gating.
- **Culqi**: adapter listo para tiendas que prefieran Yape/agentes.

---

## 16. Decisiones cerradas

1. **Pasarela**: Mercado Pago como principal (OAuth Marketplace, sin costo fijo). Culqi queda
   como adapter opcional para la Fase 3; Stripe se mantiene en la interfaz pero no se usa
   porque no opera en Perú.
2. **Imágenes**: Cloudinary free (25 créditos/mes) tras `lib/storage.ts`. Vercel Blob como
   alternativa con el mismo contrato.
3. **Hosting**: Vercel Hobby para desarrollo; Pro (US$20/mes) al empezar a facturar.
4. **Variantes en Fase 1**: opciones + variantes con precio/stock/SKU; el generador masivo y
   la imagen por variante se posponen a la Fase 2.
5. **Descripciones**: rich text Tiptap saneado con allowlist; sin imágenes inline.
6. **Alcance geográfico**: Perú primero (PEN, `es-PE`, `America/Lima`), LATAM después.
