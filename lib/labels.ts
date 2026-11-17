import type {
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  StoreStatus,
} from './enums';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  pending: 'warning',
  confirmed: 'success',
  processing: 'secondary',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
  refunded: 'outline',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Sin pagar',
  pending: 'Pago pendiente',
  paid: 'Pagado',
  failed: 'Pago fallido',
  refunded: 'Reembolsado',
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Borrador',
  active: 'Publicado',
  archived: 'Archivado',
};

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  active: 'Activa',
  suspended: 'Suspendida',
  archived: 'Archivada',
};
