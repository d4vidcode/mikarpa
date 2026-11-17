import { NextResponse } from 'next/server';

type ApiErrorBody = {
  ok: false;
  error: { code: string; message: string; fields?: Record<string, string> };
};

export function apiOk<T>(data: T, init: ResponseInit = {}): NextResponse {
  return NextResponse.json(
    { ok: true, data },
    { ...init, headers: { 'cache-control': 'no-store', ...init.headers } },
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  fields?: Record<string, string>,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(fields ? { fields } : {}) } },
    { status, headers: { 'cache-control': 'no-store' } },
  );
}

/** Mapa de códigos de error de Mongo a mensajes de formulario. */
export function duplicateKeyMessage(field: 'slug' | 'email' | 'sku'): string {
  switch (field) {
    case 'email':
      return 'Ese correo ya está registrado.';
    case 'sku':
      return 'Ese SKU ya existe en esta tienda.';
    default:
      return 'Ese identificador ya está en uso. Prueba con otro.';
  }
}

export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
