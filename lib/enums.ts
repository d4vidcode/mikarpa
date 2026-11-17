/**
 * Enumeraciones de dominio.
 *
 * Fuente única de verdad compartida por Mongoose (modelos) y Zod (validadores).
 * Regla: si un valor puede cambiar en runtime (temas, secciones, feature flags nuevos),
 * NO va aquí. Solo se versiona en código lo que forma parte del contrato de datos.
 */

/* ------------------------------------------------------------------ */
/* Usuarios y roles                                                    */
/* ------------------------------------------------------------------ */

export const GLOBAL_ROLES = ['superadmin', 'owner', 'staff', 'customer'] as const;
export type GlobalRole = (typeof GLOBAL_ROLES)[number];

export const USER_STATUSES = ['active', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* Tiendas y membresías                                                */
/* ------------------------------------------------------------------ */

export const STORE_ROLES = ['owner', 'staff'] as const;
export type StoreRole = (typeof STORE_ROLES)[number];

/**
 * Permisos granulares de un miembro `staff`.
 * Los `owner` siempre tienen todos (se normaliza en el modelo StoreMember).
 */
export const STORE_PERMISSIONS = [
  'products',
  'categories',
  'orders',
  'messages',
  'appearance',
  'payments',
  'team',
  'settings',
  'analytics',
] as const;
export type StorePermission = (typeof STORE_PERMISSIONS)[number];

export const STORE_STATUSES = ['active', 'suspended', 'archived'] as const;
export type StoreStatus = (typeof STORE_STATUSES)[number];

export const MEMBER_STATUSES = ['invited', 'active', 'revoked'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* Catálogo                                                            */
/* ------------------------------------------------------------------ */

export const PRODUCT_STATUSES = ['draft', 'active', 'archived'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const CATEGORY_STATUSES = ['active', 'archived'] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* Pedidos                                                             */
/* ------------------------------------------------------------------ */

export const ORDER_CHANNELS = ['whatsapp', 'online'] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

/**
 * Pasarelas de pago. El diseño es provider-agnostic:
 *  - mercadopago: principal en Perú y con cobertura LATAM (Checkout Pro / Bricks).
 *  - culqi: alternativa local peruana (tarjetas, Yape, PagoEfectivo, agentes).
 *  - stripe: para países donde Stripe opera (no Perú). Se activa por tienda.
 */
export const PAYMENT_PROVIDERS = ['mercadopago', 'culqi', 'stripe'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const DEFAULT_PAYMENT_PROVIDER: PaymentProvider = 'mercadopago';

export const PAYMENT_ACCOUNT_STATUSES = [
  'disconnected',
  'pending',
  'active',
  'restricted',
] as const;
export type PaymentAccountStatus = (typeof PAYMENT_ACCOUNT_STATUSES)[number];

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_SOURCES = ['storefront', 'manual'] as const;
export type OrderSource = (typeof ORDER_SOURCES)[number];

/* ------------------------------------------------------------------ */
/* Temas                                                               */
/* ------------------------------------------------------------------ */

export const THEME_STATUSES = ['active', 'beta', 'deprecated'] as const;
export type ThemeStatus = (typeof THEME_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* Feature flags (embebidos en Store.featureFlags)                     */
/* ------------------------------------------------------------------ */

export const FEATURE_FLAG_KEYS = [
  'stripeCheckout',
  'coupons',
  'reviews',
  'inventoryTracking',
  'analytics',
  'customDomain',
  'multiLanguage',
] as const;
export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = {
  stripeCheckout: false,
  coupons: false,
  reviews: false,
  inventoryTracking: true,
  analytics: false,
  customDomain: false,
  multiLanguage: false,
};

/* ------------------------------------------------------------------ */
/* Catálogos maestros de la plataforma                                 */
/* ------------------------------------------------------------------ */

export const MASTER_CATEGORY_ICONS = [
  'shirt',
  'sparkles',
  'laptop',
  'home',
  'utensils',
  'flower-2',
  'dumbbell',
  'baby',
  'paw-print',
  'package',
] as const;

/* ------------------------------------------------------------------ */
/* Slugs y dinero                                                      */
/* ------------------------------------------------------------------ */

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 48;

/** Slugs que chocan con rutas del sistema o con la marca. */
export const RESERVED_SLUGS = [
  'administracion',
  'admin',
  'api',
  'app',
  'ayuda',
  'blog',
  'carrito',
  'checkout',
  'dashboard',
  'explorar',
  'iniciar-sesion',
  'login',
  'mail',
  'mikarpa',
  'onboarding',
  'panel',
  'registrarse',
  'signup',
  'soporte',
  'static',
  'tienda',
  'www',
] as const;

/**
 * TODO el dinero se persiste como entero en la unidad menor de la moneda
 * (centavos). Nunca floats: 1999 = $19,99.
 */
export const MONEY_MIN = 0;
export const MONEY_MAX = 100_000_000_00;

/** ISO 4217. Se valida con regex para no bloquear monedas nuevas. */
export const CURRENCY_REGEX = /^[A-Z]{3}$/;
/** MVP: Perú. Soles. */
export const DEFAULT_CURRENCY = 'PEN';
export const DEFAULT_LOCALE = 'es-PE';
export const DEFAULT_TIMEZONE = 'America/Lima';

/** Plantilla de código de pedido visible: #1001 */
export const ORDER_NUMBER_START = 1001;
