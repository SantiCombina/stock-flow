import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    token: z.string({
      required_error: 'El token es requerido.',
      invalid_type_error: 'El token debe ser una cadena de texto.',
    }),
    password: z
      .string({
        required_error: 'La contraseña es requerida.',
        invalid_type_error: 'La contraseña debe ser una cadena de texto.',
      })
      .trim()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
      .max(100, { message: 'La contraseña es demasiado larga.' })
      .refine((val) => !val.includes(' '), {
        message: 'La contraseña no puede contener espacios.',
      }),
    confirmPassword: z.string({
      required_error: 'Confirma tu contraseña.',
      invalid_type_error: 'La confirmación debe ser una cadena de texto.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
