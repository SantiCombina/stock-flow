import { z } from 'zod';

export const variantSchema = z.object({
  id: z.number().optional(),
  presentationId: z.string().optional(),
  code: z.string().optional(),
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  minStock: z.number().min(0, 'El stock mínimo no puede ser negativo'),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  qualityId: z.string().optional(),
  isActive: z.boolean(),
  variants: z.array(variantSchema).min(1, 'Debe agregar al menos una presentación'),
});

export type ProductFormData = z.infer<typeof productSchema>;
