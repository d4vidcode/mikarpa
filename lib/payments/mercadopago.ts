const MP_API = 'https://api.mercadopago.com';

export type MPPreferenceItem = {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
};

export async function createMPPreference(params: {
  accessToken: string;
  items: MPPreferenceItem[];
  externalReference: string;
  backUrls: { success: string; failure: string; pending: string };
  notificationUrl: string;
}): Promise<{ id: string; initPoint: string }> {
  const response = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: params.items,
      external_reference: params.externalReference,
      back_urls: params.backUrls,
      auto_return: 'approved',
      notification_url: params.notificationUrl,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mercado Pago: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { id: string; init_point: string };
  return { id: data.id, initPoint: data.init_point };
}

export async function getMPPayment(accessToken: string, paymentId: string): Promise<{
  status: string;
  externalReference: string | null;
  transactionAmount: number;
}> {
  const response = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago payment: ${response.status}`);
  }

  const data = (await response.json()) as {
    status: string;
    external_reference?: string;
    transaction_amount: number;
  };

  return {
    status: data.status,
    externalReference: data.external_reference ?? null,
    transactionAmount: data.transaction_amount,
  };
}