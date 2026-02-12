import type { CollectionConfig } from 'payload';

export const ProductCustomFields: CollectionConfig = {
  slug: 'product-custom-fields',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'owner', 'product'],
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
      admin: {
        description: 'Nombre del campo personalizado (ej: Proteína)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Texto', value: 'text' },
        { label: 'Número', value: 'number' },
        { label: 'Booleano', value: 'boolean' },
        { label: 'Select', value: 'select' },
      ],
    },
    {
      name: 'value',
      type: 'json',
      required: false,
      admin: {
        description: 'Valor del campo personalizado',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
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
