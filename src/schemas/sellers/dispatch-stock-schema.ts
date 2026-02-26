import { z } from 'zod';

export const dispatchStockSchema = z.object({
  sellerId: z.number({ required_error: 'El vendedor es requerido.' }),
  items: z
    .array(
      z.object({
        variantId: z.number(),
        quantity: z
          .number()
          .int({ message: 'La cantidad debe ser un número entero.' })
          .positive({ message: 'La cantidad debe ser mayor a 0.' }),
      }),
    )
    .min(1, { message: 'Debe seleccionar al menos un producto.' }),
});

export type DispatchStockValues = z.infer<typeof dispatchStockSchema>;
