import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: 'El email es requerido.',
      invalid_type_error: 'El email debe ser una cadena de texto.',
    })
    .trim()
    .email({ message: 'Proporciona un email válido.' })
    .max(200, { message: 'El email es demasiado largo.' }),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
