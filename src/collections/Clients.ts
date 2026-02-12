import type { CollectionConfig, Where } from 'payload';

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email', 'createdBy', 'owner'],
  },
  access: {
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin' || user.role === 'owner' || user.role === 'seller';
    },
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Owner ve todos los clientes de su negocio
      if (user.role === 'owner') {
        const query: Where = { owner: { equals: user.id } };
        return query;
      }
      // Seller ve solo los clientes que él creó
      if (user.role === 'seller') {
        const query: Where = { createdBy: { equals: user.id } };
        return query;
      }
      return false;
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Owner puede editar clientes de su negocio
      if (user.role === 'owner') {
        const query: Where = { owner: { equals: user.id } };
        return query;
      }
      // Seller puede editar clientes que él creó
      if (user.role === 'seller') {
        const query: Where = { createdBy: { equals: user.id } };
        return query;
      }
      return false;
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Owner puede eliminar clientes de su negocio
      if (user.role === 'owner') {
        const query: Where = { owner: { equals: user.id } };
        return query;
      }
      // Seller puede eliminar clientes que él creó
      if (user.role === 'seller') {
        const query: Where = { createdBy: { equals: user.id } };
        return query;
      }
      return false;
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Nombre del cliente',
      },
    },
    {
      name: 'cuit',
      type: 'text',
      required: false,
      admin: {
        description: 'CUIT/CUIL para facturación',
      },
    },
    {
      name: 'phone',
      type: 'text',
      required: false,
      admin: {
        description: 'Teléfono de contacto',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: false,
      admin: {
        description: 'Email de contacto',
      },
    },
    {
      name: 'address',
      type: 'text',
      required: false,
      admin: {
        description: 'Dirección del cliente',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        condition: () => false,
        description: 'Vendedor que creó este cliente',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        condition: () => false,
        description: 'Dueño del negocio',
      },
    },
  ],
};
