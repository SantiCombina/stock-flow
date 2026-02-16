'use server';

import { getPayloadClient } from '@/lib/payload';
import type { Brand, Category, Quality, Presentation } from '@/payload-types';

export async function getBrands(ownerId: number): Promise<Brand[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'brands',
    where: { owner: { equals: ownerId } },
    sort: 'name',
    limit: 1000,
    overrideAccess: true,
  });

  return result.docs as Brand[];
}

export async function createBrand(name: string, ownerId: number): Promise<Brand> {
  const payload = await getPayloadClient();

  const brand = await payload.create({
    collection: 'brands',
    data: {
      name,
      owner: ownerId,
    },
    overrideAccess: true,
  });

  return brand as Brand;
}

export async function updateBrand(id: number, name: string): Promise<Brand> {
  const payload = await getPayloadClient();

  const brand = await payload.update({
    collection: 'brands',
    id,
    data: { name },
    overrideAccess: true,
  });

  return brand as Brand;
}

export async function getCategories(ownerId: number): Promise<Category[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'categories',
    where: { owner: { equals: ownerId } },
    sort: 'name',
    limit: 1000,
    overrideAccess: true,
  });

  return result.docs as Category[];
}

export async function createCategory(name: string, ownerId: number): Promise<Category> {
  const payload = await getPayloadClient();

  const category = await payload.create({
    collection: 'categories',
    data: {
      name,
      owner: ownerId,
    },
    overrideAccess: true,
  });

  return category as Category;
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const payload = await getPayloadClient();

  const category = await payload.update({
    collection: 'categories',
    id,
    data: { name },
    overrideAccess: true,
  });

  return category as Category;
}

export async function getQualities(ownerId: number): Promise<Quality[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'qualities',
    where: { owner: { equals: ownerId } },
    sort: 'name',
    limit: 1000,
    overrideAccess: true,
  });

  return result.docs as Quality[];
}

export async function createQuality(name: string, ownerId: number): Promise<Quality> {
  const payload = await getPayloadClient();

  const quality = await payload.create({
    collection: 'qualities',
    data: {
      name,
      owner: ownerId,
    },
    overrideAccess: true,
  });

  return quality as Quality;
}

export async function updateQuality(id: number, name: string): Promise<Quality> {
  const payload = await getPayloadClient();

  const quality = await payload.update({
    collection: 'qualities',
    id,
    data: { name },
    overrideAccess: true,
  });

  return quality as Quality;
}

export async function getPresentations(ownerId: number): Promise<Presentation[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'presentations',
    where: { owner: { equals: ownerId } },
    sort: 'label',
    limit: 1000,
    overrideAccess: true,
  });

  return result.docs as Presentation[];
}

export async function createPresentation(label: string, ownerId: number): Promise<Presentation> {
  const payload = await getPayloadClient();

  const presentation = await payload.create({
    collection: 'presentations',
    data: {
      label,
      amount: 1,
      unit: 'unidad',
      owner: ownerId,
    },
    overrideAccess: true,
  });

  return presentation as Presentation;
}

export async function updatePresentation(id: number, label: string): Promise<Presentation> {
  const payload = await getPayloadClient();

  const presentation = await payload.update({
    collection: 'presentations',
    id,
    data: { label },
    overrideAccess: true,
  });

  return presentation as Presentation;
}
