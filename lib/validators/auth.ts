import { z } from 'zod';
import { emailSchema } from './common';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Escribe tu contraseña').max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Escribe tu nombre').max(80, 'Máximo 80 caracteres'),
    email: emailSchema,
    password: z
      .string()
      .min(8, 'La contraseña necesita al menos 8 caracteres')
      .max(72, 'Máximo 72 caracteres')
      .regex(/[A-Za-z]/, 'Incluye al menos una letra')
      .regex(/\d/, 'Incluye al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z
  .object({
    token: z.string().trim().min(10, 'Token inválido').max(256),
    password: z
      .string()
      .min(8, 'La contraseña necesita al menos 8 caracteres')
      .max(72, 'Máximo 72 caracteres')
      .regex(/[A-Za-z]/, 'Incluye al menos una letra')
      .regex(/\d/, 'Incluye al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
