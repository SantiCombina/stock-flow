import { z } from 'zod';

const passwordField = z
  .string({
    required_error: 'La contraseña es requerida.',
    invalid_type_error: 'La contraseña debe ser una cadena de texto.',
  })
  .trim()
  .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  .max(100, { message: 'La contraseña es demasiado larga.' })
  .refine((val) => !val.includes(' '), {
    message: 'La contraseña no puede contener espacios.',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: 'La contraseña actual es requerida.',
        invalid_type_error: 'La contraseña debe ser una cadena de texto.',
      })
      .trim()
      .min(1, { message: 'Ingresá tu contraseña actual.' })
      .max(100, { message: 'La contraseña es demasiado larga.' }),
    newPassword: passwordField,
    confirmNewPassword: z.string({
      required_error: 'Confirma tu nueva contraseña.',
      invalid_type_error: 'La confirmación debe ser una cadena de texto.',
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
