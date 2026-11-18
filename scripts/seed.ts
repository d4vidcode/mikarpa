import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';
import {
  Category,
  Counter,
  Order,
  Product,
  PlatformSettings,
  Store,
  StoreCategory,
  StoreMember,
  Theme,
  User,
} from '@/models';
import { connectDB, disconnectDB } from '@/lib/db';
import { ORDER_NUMBER_START, STORE_PERMISSIONS } from '@/lib/enums';

/**
 * Seed idempotente de mikarpa.
 *
 * Ejecutar: npm run db:seed
 * Requiere MONGODB_URI (y opcionalmente SEED_SUPERADMIN_* / SEED_OWNER_*).
 *
 * No sobreescribe contraseñas ni datos existentes: usa `$setOnInsert` o
 * crea solo si el documento no existe. Se puede correr N veces.
 */

/* ------------------------------------------------------------------ */
/* Datos base                                                          */
/* ------------------------------------------------------------------ */

const BCRYPT_ROUNDS = 12;

const MASTER_CATEGORIES = [
  { slug: 'ropa', name: 'Ropa y moda', icon: 'shirt', order: 1 },
  { slug: 'belleza', name: 'Belleza', icon: 'sparkles', order: 2 },
  { slug: 'tecnologia', name: 'Tecnología', icon: 'laptop', order: 3 },
  { slug: 'hogar', name: 'Hogar', icon: 'home', order: 4 },
  { slug: 'comida', name: 'Comida y bebidas', icon: 'utensils', order: 5 },
  { slug: 'mascotas', name: 'Mascotas', icon: 'paw-print', order: 6 },
  { slug: 'deportes', name: 'Deportes', icon: 'dumbbell', order: 7 },
  { slug: 'infantil', name: 'Infantil', icon: 'baby', order: 8 },
] as const;

const SECTIONS_AVAILABLE = [
  'hero',
  'featured',
  'categories',
  'newArrivals',
  'footer',
  'whatsappFloat',
] as const;

const THEMES = [
  {
    key: 'minimal',
    name: 'Minimal',
    description: 'Limpio, tipografía grande y mucho aire. Ideal para marcas modernas.',
    status: 'active' as const,
    version: '1.0.0',
    tokens: {
      colors: {
        primary: '#111827',
        secondary: '#6b7280',
        accent: '#2563eb',
        background: '#ffffff',
        foreground: '#111827',
        muted: '#f3f4f6',
      },
      fonts: { heading: 'Inter', body: 'Inter' },
      radius: '0.5rem',
    },
    sectionsAvailable: [...SECTIONS_AVAILABLE],
    defaultSections: [
      {
        key: 'hero',
        type: 'hero',
        enabled: true,
        order: 0,
        config: {
          title: 'Bienvenido a nuestra tienda',
          subtitle: 'Descubre nuestra selección de productos.',
          ctaLabel: 'Ver productos',
        },
      },
      {
        key: 'featured',
        type: 'featured',
        enabled: true,
        order: 1,
        config: { title: 'Destacados', limit: 8 },
      },
      {
        key: 'categories',
        type: 'categories',
        enabled: true,
        order: 2,
        config: { title: 'Categorías' },
      },
      {
        key: 'newArrivals',
        type: 'newArrivals',
        enabled: true,
        order: 3,
        config: { title: 'Novedades', limit: 8 },
      },
      {
        key: 'whatsappFloat',
        type: 'whatsappFloat',
        enabled: true,
        order: 4,
        config: { message: 'Hola, quiero más información' },
      },
      {
        key: 'footer',
        type: 'footer',
        enabled: true,
        order: 5,
        config: { showSocial: true },
      },
    ],
  },
  {
    key: 'boutique',
    name: 'Boutique',
    description: 'Cálido y editorial, con serif y tarjetas suaves. Para marcas con carácter.',
    status: 'active' as const,
    version: '1.0.0',
    tokens: {
      colors: {
        primary: '#7c2d12',
        secondary: '#a16207',
        accent: '#be123c',
        background: '#fffbf5',
        foreground: '#292524',
        muted: '#f5efe6',
      },
      fonts: { heading: 'Familjen Grotesk', body: 'Familjen Grotesk' },
      radius: '20px',
    },
    sectionsAvailable: [...SECTIONS_AVAILABLE],
    defaultSections: [
      {
        key: 'hero',
        type: 'hero',
        enabled: true,
        order: 0,
        config: {
          title: 'Piezas elegidas con cariño',
          subtitle: 'Una colección pequeña, pensada para durar.',
          ctaLabel: 'Explorar colección',
        },
      },
      {
        key: 'featured',
        type: 'featured',
        enabled: true,
        order: 1,
        config: { title: 'Favoritos', limit: 6 },
      },
      {
        key: 'newArrivals',
        type: 'newArrivals',
        enabled: true,
        order: 2,
        config: { title: 'Recién llegado', limit: 6 },
      },
      {
        key: 'footer',
        type: 'footer',
        enabled: true,
        order: 3,
        config: { showSocial: true },
      },
    ],
  },
];

type DemoProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  featured?: boolean;
  description: string;
  descriptionText: string;
  tags: string[];
  options?: { name: string; values: string[] }[];
  variants?: {
    sku: string;
    options: { name: string; value: string }[];
    stock: number;
    price?: number;
  }[];
};

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    slug: 'polo-oversize-algodon',
    name: 'Polo oversize de algodón',
    category: 'polos',
    price: 4990,
    compareAtPrice: 6990,
    featured: true,
    description:
      '<p>Polo de algodón peruano peinado, corte <strong>oversize</strong> y hombros caídos.</p><ul><li>100% algodón</li><li>Lavado a máquina en frío</li><li>Hecho en Perú</li></ul>',
    descriptionText:
      'Polo de algodón peruano peinado, corte oversize y hombros caídos. 100% algodón. Hecho en Perú.',
    tags: ['polo', 'algodón', 'oversize'],
    options: [
      { name: 'Talla', values: ['S', 'M', 'L'] },
      { name: 'Color', values: ['Negro', 'Blanco'] },
    ],
    variants: [
      {
        sku: 'POLO-S-NEG',
        options: [
          { name: 'Talla', value: 'S' },
          { name: 'Color', value: 'Negro' },
        ],
        stock: 5,
      },
      {
        sku: 'POLO-S-BLA',
        options: [
          { name: 'Talla', value: 'S' },
          { name: 'Color', value: 'Blanco' },
        ],
        stock: 4,
      },
      {
        sku: 'POLO-M-NEG',
        options: [
          { name: 'Talla', value: 'M' },
          { name: 'Color', value: 'Negro' },
        ],
        stock: 7,
      },
      {
        sku: 'POLO-M-BLA',
        options: [
          { name: 'Talla', value: 'M' },
          { name: 'Color', value: 'Blanco' },
        ],
        stock: 6,
      },
      {
        sku: 'POLO-L-NEG',
        options: [
          { name: 'Talla', value: 'L' },
          { name: 'Color', value: 'Negro' },
        ],
        stock: 3,
      },
      {
        sku: 'POLO-L-BLA',
        options: [
          { name: 'Talla', value: 'L' },
          { name: 'Color', value: 'Blanco' },
        ],
        stock: 2,
      },
    ],
  },
  {
    slug: 'pantalon-cargo-utility',
    name: 'Pantalón cargo utility',
    category: 'pantalones',
    price: 8990,
    featured: true,
    description:
      '<p>Pantalón cargo de drill con bolsillos laterales y cintura ajustable.</p><p><em>Fit relajado, unisex.</em></p>',
    descriptionText: 'Pantalón cargo de drill con bolsillos laterales y cintura ajustable.',
    tags: ['pantalón', 'cargo', 'unisex'],
  },
  {
    slug: 'casaca-denim-clasica',
    name: 'Casaca denim clásica',
    category: 'pantalones',
    price: 12990,
    description:
      '<p>Casaca de denim rígido con botones metálicos y bolsillos frontales.</p>',
    descriptionText: 'Casaca de denim rígido con botones metálicos y bolsillos frontales.',
    tags: ['casaca', 'denim'],
  },
  {
    slug: 'vestido-midi-lino',
    name: 'Vestido midi de lino',
    category: 'polos',
    price: 9990,
    compareAtPrice: 12990,
    featured: true,
    description:
      '<p>Vestido midi de lino con tirantes ajustables y forro interior.</p><p>Perfecto para clima cálido.</p>',
    descriptionText: 'Vestido midi de lino con tirantes ajustables y forro interior.',
    tags: ['vestido', 'lino'],
  },
  {
    slug: 'gorra-bordada',
    name: 'Gorra bordada',
    category: 'accesorios',
    price: 3990,
    description: '<p>Gorra de sarga con bordado frontal y cierre ajustable.</p>',
    descriptionText: 'Gorra de sarga con bordado frontal y cierre ajustable.',
    tags: ['gorra', 'accesorio'],
  },
  {
    slug: 'tote-bag-lona',
    name: 'Tote bag de lona',
    category: 'accesorios',
    price: 2990,
    description:
      '<p>Bolso de lona gruesa con asas reforzadas. Entra laptop de 14".</p>',
    descriptionText: 'Bolso de lona gruesa con asas reforzadas. Entra laptop de 14".',
    tags: ['bolso', 'tote'],
  },
  {
    slug: 'conjunto-deportivo',
    name: 'Conjunto deportivo',
    category: 'pantalones',
    price: 11990,
    description:
      '<p>Conjunto de jogger y top deportivo en tela de secado rápido.</p><ul><li>Elasticidad en cuatro direcciones</li><li>Bolsillo oculto</li></ul>',
    descriptionText:
      'Conjunto de jogger y top deportivo en tela de secado rápido, con bolsillo oculto.',
    tags: ['deportivo', 'conjunto'],
    options: [
      { name: 'Talla', values: ['S', 'M'] },
      { name: 'Color', values: ['Negro', 'Arena'] },
    ],
    variants: [
      {
        sku: 'CONJ-S-NEG',
        options: [
          { name: 'Talla', value: 'S' },
          { name: 'Color', value: 'Negro' },
        ],
        stock: 4,
      },
      {
        sku: 'CONJ-S-ARE',
        options: [
          { name: 'Talla', value: 'S' },
          { name: 'Color', value: 'Arena' },
        ],
        stock: 3,
      },
      {
        sku: 'CONJ-M-NEG',
        options: [
          { name: 'Talla', value: 'M' },
          { name: 'Color', value: 'Negro' },
        ],
        stock: 5,
        price: 12490,
      },
      {
        sku: 'CONJ-M-ARE',
        options: [
          { name: 'Talla', value: 'M' },
          { name: 'Color', value: 'Arena' },
        ],
        stock: 2,
        price: 12490,
      },
    ],
  },
  {
    slug: 'blusa-satinada',
    name: 'Blusa satinada',
    category: 'polos',
    price: 7990,
    description: '<p>Blusa de satén con manga larga y caída fluida.</p>',
    descriptionText: 'Blusa de satén con manga larga y caída fluida.',
    tags: ['blusa', 'satén'],
  },
];

const DEMO_CATEGORIES = [
  { slug: 'polos', name: 'Polos y camisas' },
  { slug: 'pantalones', name: 'Pantalones y abrigos' },
  { slug: 'accesorios', name: 'Accesorios' },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function imageFor(slug: string, alt: string) {
  return [
    {
      url: `https://picsum.photos/seed/mikarpa-${slug}/900/900`,
      publicId: null,
      alt,
      width: 900,
      height: 900,
    },
  ];
}

function logSection(title: string) {
  console.log(`\n${title}`);
  console.log('─'.repeat(title.length));
}

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  loadEnvConfig(process.cwd());

  const superadminEmail = process.env.SEED_SUPERADMIN_EMAIL ?? 'admin@mikarpa.xyz';
  const superadminPassword = process.env.SEED_SUPERADMIN_PASSWORD;

  if (!superadminPassword) {
    throw new Error(
      'Define SEED_SUPERADMIN_PASSWORD en .env.local antes de ejecutar el seed.',
    );
  }

  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? 'demo@mikarpa.xyz';
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? 'demo1234';
  const staffEmail = 'staff@mikarpa.xyz';
  const staffPassword = 'demo1234';

  await connectDB();
  console.log('✓ MongoDB conectado');

  /* -------------------- Settings global -------------------- */
  const settings = await PlatformSettings.findOneAndUpdate(
    { key: 'platform' },
    {
      $setOnInsert: {
        key: 'platform',
        branding: {
          name: 'mikarpa',
          tagline: 'Tu tienda virtual, lista en minutos',
          supportEmail: 'hola@mikarpa.xyz',
        },
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );

  if (!settings) {
    throw new Error('No se pudo crear PlatformSettings');
  }

  /* -------------------- Rubros maestros -------------------- */
  for (const category of MASTER_CATEGORIES) {
    await StoreCategory.updateOne(
      { slug: category.slug },
      { $setOnInsert: { ...category, active: true } },
      { upsert: true },
    );
  }
  console.log(`✓ ${MASTER_CATEGORIES.length} rubros maestros`);

  /* -------------------- Temas -------------------- */
  const themeDocs = new Map<string, { defaultSections: unknown[] }>();

  for (const theme of THEMES) {
    const doc = await Theme.findOneAndUpdate(
      { key: theme.key },
      { $setOnInsert: theme },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    if (!doc) {
      throw new Error(`No se pudo crear el tema ${theme.key}`);
    }

    themeDocs.set(theme.key, {
      defaultSections: (doc.defaultSections ?? []).map((section) => ({
        key: section.key,
        type: section.type,
        enabled: section.enabled ?? true,
        order: section.order ?? 0,
        config: section.config ?? {},
      })),
    });
  }
  console.log(`✓ ${THEMES.length} temas (${THEMES.map((theme) => theme.key).join(', ')})`);

  /* -------------------- Usuarios -------------------- */
  const superadmin = await User.findOne({ email: superadminEmail });
  if (!superadmin) {
    await User.create({
      name: 'Super Admin',
      email: superadminEmail,
      passwordHash: await bcrypt.hash(superadminPassword, BCRYPT_ROUNDS),
      role: 'superadmin',
      emailVerifiedAt: new Date(),
    });
    console.log(`✓ Superadmin creado: ${superadminEmail}`);
  } else {
    console.log(`• Superadmin ya existía: ${superadminEmail}`);
  }

  let owner = await User.findOne({ email: ownerEmail });
  if (!owner) {
    owner = await User.create({
      name: 'Demo Owner',
      email: ownerEmail,
      passwordHash: await bcrypt.hash(ownerPassword, BCRYPT_ROUNDS),
      role: 'owner',
      emailVerifiedAt: new Date(),
    });
    console.log(`✓ Owner demo creado: ${ownerEmail}`);
  } else {
    console.log(`• Owner demo ya existía: ${ownerEmail}`);
  }

  let staff = await User.findOne({ email: staffEmail });
  if (!staff) {
    staff = await User.create({
      name: 'Demo Staff',
      email: staffEmail,
      passwordHash: await bcrypt.hash(staffPassword, BCRYPT_ROUNDS),
      role: 'staff',
      emailVerifiedAt: new Date(),
    });
    console.log(`✓ Staff demo creado: ${staffEmail}`);
  } else if (staff.role !== 'staff') {
    console.log('• Staff demo ya existía');
  }

  /* -------------------- Tienda demo -------------------- */
  const minimalTheme = themeDocs.get('minimal');
  if (!minimalTheme) {
    throw new Error('El tema minimal no está disponible');
  }

  let store = await Store.findOne({ slug: 'tienda-demo' });

  if (!store) {
    const businessHours = Array.from({ length: 7 }, (_, day) => ({
      day,
      closed: day === 0,
      open: '09:00',
      close: '19:00',
    }));

    store = await Store.create({
      name: 'Tienda Demo',
      slug: 'tienda-demo',
      description:
        'Tienda de ejemplo de mikarpa: prendas de algodón peruano, ediciones cortas y envíos a todo el Perú.',
      category: 'ropa',
      ownerId: owner._id,
      theme: { themeKey: 'minimal', tokens: {} },
      sections: minimalTheme.defaultSections,
      contact: {
        phone: '+51987654321',
        email: 'hola@tiendademo.pe',
        address: 'Av. Larco 123',
        city: 'Lima',
        country: 'PE',
      },
      social: {
        instagram: 'https://instagram.com/tiendademo',
        website: 'https://mikarpa.xyz',
      },
      businessHours,
      currency: 'PEN',
      locale: 'es-PE',
      timezone: 'America/Lima',
      paymentConfig: {
        whatsapp: {
          enabled: true,
          phone: '+51987654321',
          messageTemplate: 'Hola, quiero confirmar mi pedido',
        },
        online: { enabled: false, provider: 'mercadopago', status: 'disconnected' },
        defaultChannel: 'whatsapp',
      },
      status: 'active',
      onboardingCompletedAt: new Date(),
      publishedAt: new Date(),
      seo: {
        title: 'Tienda Demo — algodón peruano',
        description: 'Prendas de algodón peruano con envíos a todo el Perú.',
      },
    });
    console.log('✓ Tienda demo creada: /tienda/tienda-demo');
  } else {
    console.log('• Tienda demo ya existía: /tienda/tienda-demo');
  }

  await StoreMember.updateOne(
    { storeId: store._id, userId: owner._id },
    {
      $setOnInsert: {
        storeId: store._id,
        userId: owner._id,
        role: 'owner',
        // `updateOne` no ejecuta el hook de documento que normaliza al owner:
        // se escriben los permisos explícitamente para respetar el invariante.
        permissions: [...STORE_PERMISSIONS],
        status: 'active',
        acceptedAt: new Date(),
      },
    },
    { upsert: true },
  );

  await StoreMember.updateOne(
    { storeId: store._id, userId: staff._id },
    {
      $setOnInsert: {
        storeId: store._id,
        userId: staff._id,
        role: 'staff',
        permissions: ['orders'],
        status: 'active',
        invitedBy: owner._id,
        invitedEmail: staffEmail,
        acceptedAt: new Date(),
      },
    },
    { upsert: true },
  );
  console.log('✓ Membresías: owner (todo) + staff (pedidos)');

  /* -------------------- Categorías de la tienda -------------------- */
  const categoryIds = new Map<string, string>();

  for (const [index, category] of DEMO_CATEGORIES.entries()) {
    const doc = await Category.findOneAndUpdate(
      { storeId: store._id, slug: category.slug },
      {
        $setOnInsert: {
          storeId: store._id,
          name: category.name,
          slug: category.slug,
          order: index,
          status: 'active',
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    if (!doc) {
      throw new Error(`No se pudo crear la categoría ${category.slug}`);
    }

    categoryIds.set(category.slug, String(doc._id));
  }
  console.log(`✓ ${DEMO_CATEGORIES.length} categorías de tienda`);

  /* -------------------- Productos -------------------- */
  for (const product of DEMO_PRODUCTS) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) {
      throw new Error(`Categoría desconocida en seed: ${product.category}`);
    }

    await Product.updateOne(
      { storeId: store._id, slug: product.slug },
      {
        $setOnInsert: {
          storeId: store._id,
          categoryId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          descriptionText: product.descriptionText,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? null,
          images: imageFor(product.slug, product.name),
          tags: product.tags,
          options: product.options ?? [],
          variants: product.variants ?? [],
          stock: product.variants ? 0 : 10,
          trackStock: true,
          status: 'active',
          featured: product.featured ?? false,
          position: DEMO_PRODUCTS.indexOf(product),
        },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${DEMO_PRODUCTS.length} productos (2 con variantes)`);

  /* -------------------- Pedido demo -------------------- */
  const demoProduct = await Product.findOne({
    storeId: store._id,
    slug: 'pantalon-cargo-utility',
  });

  if (!demoProduct) {
    throw new Error('No se encontró el producto del pedido demo');
  }

  const existingOrder = await Order.findOne({
    storeId: store._id,
    orderNumber: ORDER_NUMBER_START,
  });

  if (!existingOrder) {
    await Order.create({
      storeId: store._id,
      orderNumber: ORDER_NUMBER_START,
      customerInfo: {
        name: 'Ana Quispe',
        phone: '+51912345678',
        email: 'ana@example.com',
        address: 'Av. Larco 456, dpto. 302',
        city: 'Lima',
        documentId: '45678912',
      },
      items: [
        {
          productId: demoProduct._id,
          name: demoProduct.name,
          sku: demoProduct.sku ?? null,
          imageUrl: demoProduct.images?.[0]?.url ?? null,
          price: demoProduct.price,
          qty: 1,
        },
      ],
      totals: { subtotal: demoProduct.price, shipping: 0, tax: 0, discount: 0, total: demoProduct.price },
      currency: 'PEN',
      channel: 'whatsapp',
      status: 'pending',
      paymentStatus: 'unpaid',
      customerNotes: 'Por favor confirmar disponibilidad antes de enviar.',
      whatsapp: {
        message: `Hola, quiero confirmar mi pedido #${ORDER_NUMBER_START}: 1x ${demoProduct.name}`,
        openedAt: new Date(),
      },
      source: 'storefront',
    });
    console.log(`✓ Pedido demo #${ORDER_NUMBER_START}`);
  } else {
    console.log(`• Pedido demo #${ORDER_NUMBER_START} ya existía`);
  }

  await Counter.updateOne(
    { _id: `order:${store._id}` },
    { $max: { seq: ORDER_NUMBER_START } },
    { upsert: true },
  );

  /* -------------------- Resumen -------------------- */
  logSection('Seed completado');
  console.log(`Superadmin : ${superadminEmail}  (contraseña en SEED_SUPERADMIN_PASSWORD)`);
  console.log(`Owner demo : ${ownerEmail} / ${ownerPassword}`);
  console.log(`Staff demo : ${staffEmail} / ${staffPassword}  (solo pedidos)`);
  console.log(`Tienda     : /tienda/tienda-demo`);
  console.log(`Admin      : /administracion`);
  console.log('\n⚠ Cambia las contraseñas antes de desplegar a producción.');
}

void main()
  .catch((error: unknown) => {
    console.error('\n✗ Seed falló');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
