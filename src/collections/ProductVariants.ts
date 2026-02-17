import type { CollectionConfig } from 'payload';

export const ProductVariants: CollectionConfig = {
  slug: 'product-variants',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'product', 'presentation', 'stock', 'minStock', 'price'],
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role === 'owner') {
        return { owner: { equals: user.id } };
      }
      if (user.role === 'seller' && user.owner) {
        return { owner: { equals: user.owner } };
      }
      return false;
    },
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'owner',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: false,
      label: 'Código',
      admin: {
        description: 'Código único del producto con esta presentación (opcional)',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'Producto',
    },
    {
      name: 'presentation',
      type: 'relationship',
      relationTo: 'presentations',
      required: false,
      label: 'Presentación',
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Stock actual',
      admin: {
        description: 'Cantidad disponible en inventario',
      },
    },
    {
      name: 'minStock',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Stock mínimo',
      admin: {
        description: 'Alerta cuando el stock esté por debajo de este valor',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Precio de venta',
      admin: {
        description: 'Precio de venta de esta presentación',
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
  hooks: {
    beforeChange: [
      async ({ req: { user, payload }, data }) => {
        if (user && !data.owner) {
          if (data.product) {
            try {
              const product = await payload.findByID({
                collection: 'products',
                id: data.product,
              });
              if (product && product.owner) {
                return {
                  ...data,
                  owner: product.owner,
                };
              }
            } catch {}
          }
          return {
            ...data,
            owner: user.id,
          };
        }
        return data;
      },
    ],
  },
};
