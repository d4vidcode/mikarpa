'use server';

import { revalidatePath } from 'next/cache';
import { Order } from '@/models';
import { recordAudit } from '@/lib/audit';
import { requireStoreAccess, toActionResultError } from '@/lib/tenant';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/enums';

export type OrderFormState = {
  error?: string;
  ok?: boolean;
  message?: string;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const slug = text(formData, 'slug');
  const orderId = text(formData, 'orderId');
  const status = text(formData, 'status');
  const note = text(formData, 'note') || null;

  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    return;
  }

  const access = await requireStoreAccess(slug, 'orders', { write: true });

  const order = await Order.findOne({ _id: orderId, storeId: access.store._id })
    .select('_id orderNumber status statusHistory')
    .lean();

  if (!order || order.status === status) {
    return;
  }

  await Order.updateOne(
    { _id: order._id, storeId: access.store._id },
    {
      $set: { status },
      $push: {
        statusHistory: {
          status: status as OrderStatus,
          at: new Date(),
          byUserId: access.user.id,
          note,
        },
      },
    },
  );

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'order.status_change',
    entityType: 'Order',
    entityId: orderId,
    before: { status: order.status },
    after: { status, note },
  });

  revalidatePath(`/tienda/${slug}/administracion/pedidos`);
  revalidatePath(`/tienda/${slug}/administracion/pedidos/${orderId}`);
  revalidatePath(`/tienda/${slug}/administracion`);
}

export async function updateOrderNotesAction(
  _prevState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const slug = text(formData, 'slug');
  const orderId = text(formData, 'orderId');
  const internalNotes = text(formData, 'internalNotes') || null;

  let access;
  try {
    access = await requireStoreAccess(slug, 'orders', { write: true });
  } catch (error) {
    return toActionResultError(error);
  }

  const result = await Order.updateOne(
    { _id: orderId, storeId: access.store._id },
    { $set: { internalNotes } },
  );

  if (result.matchedCount === 0) {
    return { error: 'El pedido no existe.' };
  }

  revalidatePath(`/tienda/${slug}/administracion/pedidos/${orderId}`);
  return { ok: true, message: 'Notas guardadas.' };
}
