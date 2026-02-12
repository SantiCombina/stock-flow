import type { CollectionConfig } from 'payload';

export const ProductVariants: CollectionConfig = {
  slug: 'product-variants',
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['sku', 'product', 'presentation', 'stock', 'price', 'owner'],
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
      name: 'sku',
      type: 'text',
      required: false,
      admin: {
        description: 'Código interno o SKU de la variante',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'presentation',
      type: 'relationship',
      relationTo: 'presentations',
      required: true,
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Precio de venta de la variante',
      },
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
