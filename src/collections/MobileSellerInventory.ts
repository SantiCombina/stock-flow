import type { CollectionConfig, Where } from 'payload';

export const MobileSellerInventory: CollectionConfig = {
  slug: 'mobile-seller-inventory',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['seller', 'variant', 'quantity', 'updatedAt'],
    description: 'Stock actual de cada vendedor móvil por variante de producto',
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role === 'owner') {
        const query: Where = { owner: { equals: user.id } };
        return query;
      }
      if (user.role === 'seller') {
        const query: Where = { seller: { equals: user.id } };
        return query;
      }
      return false;
    },
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
  },
  fields: [
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Vendedor móvil',
    },
    {
      name: 'variant',
      type: 'relationship',
      relationTo: 'product-variants',
      required: true,
      label: 'Variante de producto',
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Cantidad',
      admin: {
        description: 'Cantidad de esta variante que lleva actualmente el vendedor móvil',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Propietario',
      admin: {
        condition: () => false,
      },
    },
  ],
  timestamps: true,
};
