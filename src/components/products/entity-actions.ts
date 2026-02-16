'use server';

import { z } from 'zod';

import {
  createBrand,
  updateBrand,
  createCategory,
  updateCategory,
  createQuality,
  updateQuality,
  createPresentation,
  updatePresentation,
  getBrands,
  getCategories,
  getQualities,
  getPresentations,
} from '@/app/services/entities';
import { getCurrentUser } from '@/lib/payload';
import { actionClient } from '@/lib/safe-action';

export const createBrandAction = actionClient
  .schema(z.object({ name: z.string().min(1, 'El nombre es requerido') }))
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'owner') {
      throw new Error('No autorizado');
    }

    const brand = await createBrand(parsedInput.name, user.id);
    return { success: true, brand };
  });

export const updateBrandAction = actionClient
  .schema(z.object({ id: z.number(), name: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'owner') {
      throw new Error('No autorizado');
    }

    const brand = await updateBrand(parsedInput.id, parsedInput.name);
    return { success: true, brand };
  });

export const createCategoryAction = actionClient
  .schema(z.object({ name: z.string().min(1, 'El nombre es requerido') }))
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'owner') {
      throw new Error('No autorizado');
    }

    const category = await createCategory(parsedInput.name, user.id);
    return { success: true, category };
  });

export const updateCategoryAction = actionClient
  .schema(z.object({ id: z.number(), name: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'owner') {
      throw new Error('No autorizado');
    }

    const category = await updateCategory(parsedInput.id, parsedInput.name);
    return { success: true, category };
  });

export const createQualityAction = actionClient
  .schema(z.object({ name: z.string().min(1, 'El nombre es requerido') }))
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'owner') {
      throw new Error('No autorizado');
    }

    const quality = await createQuality(parsedInput.name, user.id);
    return { success: true, quality };
  });

export const updateQualityAction = actionClient
  .schema(z.object({ id: z.number(), name: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'owner') {
      throw new Error('No autorizado');
    }

    const quality = await updateQuality(parsedInput.id, parsedInput.name);
    return { success: true, quality };
  });

export const createPresentationAction = actionClient
  .schema(z.object({ label: z.string().min(1, 'El nombre es requerido') }))
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'owner') {
      throw new Error('No autorizado');
    }

    const presentation = await createPresentation(parsedInput.label, user.id);
    return { success: true, presentation };
  });

export const updatePresentationAction = actionClient
  .schema(z.object({ id: z.number(), label: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'owner') {
      throw new Error('No autorizado');
    }

    const presentation = await updatePresentation(parsedInput.id, parsedInput.label);
    return { success: true, presentation };
  });
