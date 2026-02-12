import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'brand', 'category', 'quality', 'owner'],
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { owner: { equals: user.id } };
    },
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Código único del producto',
      },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'quality',
      type: 'relationship',
      relationTo: 'qualities',
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        condition: () => false,
      },
    },
  ],
};
