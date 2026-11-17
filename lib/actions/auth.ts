'use server';

import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { AuthError } from 'next-auth';
import { User } from '@/models';
import { recordAudit } from '@/lib/audit';
import { signIn, signOut } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { registerSchema, passwordResetRequestSchema, passwordResetSchema } from '@/lib/validators/auth';
import { fieldErrors, formDataToObject } from '@/lib/validators/common';

export type AuthFormState = {
  error?: string;
  fields?: Record<string, string>;
  ok?: boolean;
  message?: string;
};

const BCRYPT_ROUNDS = 12;

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`register:${ip}`, 5, 10 * 60 * 1000);

  if (!limit.ok) {
    return { error: `Demasiados intentos. Espera ${limit.retryAfterSeconds} segundos.` };
  }

  const parsed = registerSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { error: 'Revisa los datos del formulario.', fields: fieldErrors(parsed.error) };
  }

  await connectDB();

  const existing = await User.findOne({ email: parsed.data.email }).select('_id').lean();
  if (existing) {
    return {
      error: 'Ese correo ya está registrado.',
      fields: { email: 'Ese correo ya está registrado.' },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: 'customer',
    emailVerifiedAt: null,
  });

  await recordAudit({
    action: 'user.register',
    entityType: 'User',
    entityId: String(user._id),
    after: { email: user.email, role: user.role },
  });

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/crear-tienda',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: 'Creamos tu cuenta, pero el inicio de sesión automático falló. Entra manualmente.',
      };
    }
    throw error;
  }

  return {};
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`login:${ip}`, 10, 10 * 60 * 1000);

  if (!limit.ok) {
    return { error: `Demasiados intentos. Espera ${limit.retryAfterSeconds} segundos.` };
  }

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const callbackUrl = String(formData.get('callbackUrl') ?? '');

  if (!email || !password) {
    return { error: 'Escribe tu correo y contraseña.' };
  }

  const redirectTo =
    callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/panel';

  try {
    await signIn('credentials', { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Correo o contraseña incorrectos.' };
    }
    throw error;
  }

  return {};
}

export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`password-reset:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return { error: `Demasiados intentos. Espera ${limit.retryAfterSeconds} segundos.` };
  }

  const parsed = passwordResetRequestSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Revisa el correo.', fields: fieldErrors(parsed.error) };
  }

  await connectDB();

  const user = await User.findOne({ email: parsed.data.email, deletedAt: null })
    .select('_id name email')
    .lean();

  // Respuesta genérica para no revelar si el correo existe.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      { $set: { passwordReset: { tokenHash, expiresAt } } },
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const resetUrl = `${appUrl}/restablecer-contrasena?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM ?? 'mikarpa <onboarding@resend.dev>',
            to: user.email,
            subject: 'Restablece tu contraseña en mikarpa',
            html: `<p>Hola ${user.name},</p><p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${resetUrl}">Restablecer contraseña</a></p><p>El enlace caduca en 1 hora. Si no fuiste tú, ignora este mensaje.</p>`,
          }),
        });
      } catch (error) {
        console.error('[password-reset] email', error);
      }
    } else {
      console.info('[password-reset] enlace (sin Resend configurado):', resetUrl);
    }

    await recordAudit({
      action: 'user.password_reset_request',
      entityType: 'User',
      entityId: String(user._id),
      after: { email: user.email },
    });
  }

  return {
    ok: true,
    message: 'Si el correo existe, te enviamos un enlace para restablecer la contraseña.',
  };
}

export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`password-reset-confirm:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return { error: `Demasiados intentos. Espera ${limit.retryAfterSeconds} segundos.` };
  }

  const parsed = passwordResetSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Revisa los datos.', fields: fieldErrors(parsed.error) };
  }

  await connectDB();

  const tokenHash = crypto.createHash('sha256').update(parsed.data.token).digest('hex');

  const user = await User.findOne({
    'passwordReset.tokenHash': tokenHash,
    deletedAt: null,
  })
    .select('+passwordReset.tokenHash +passwordReset.expiresAt _id passwordReset')
    .lean();

  if (!user || !user.passwordReset?.expiresAt || user.passwordReset.expiresAt < new Date()) {
    return { error: 'El enlace no es válido o ya caducó.' };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash,
        passwordReset: { tokenHash: null, expiresAt: null },
      },
      $inc: { tokenVersion: 1 },
    },
  );

  await recordAudit({
    action: 'user.password_reset',
    entityType: 'User',
    entityId: String(user._id),
  });

  return { ok: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
