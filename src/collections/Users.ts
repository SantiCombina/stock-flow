import type { CollectionConfig, Where } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'isActive'],
  },
  auth: {
    // Desactivado temporalmente hasta verificar dominio en Resend
    // verify: true,
  },
  access: {
    // Solo admins pueden crear usuarios directamente desde el panel
    create: ({ req: { user } }) => user?.role === 'admin',
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role === 'owner') {
        // Owner ve sus sellers y a sí mismo
        const query: Where = {
          or: [{ id: { equals: user.id } }, { owner: { equals: user.id } }],
        };
        return query;
      }
      // Seller solo se ve a sí mismo
      const query: Where = { id: { equals: user.id } };
      return query;
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Usuarios pueden editar su propio perfil
      const query: Where = { id: { equals: user.id } };
      return query;
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'seller',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Dueño', value: 'owner' },
        { label: 'Vendedor', value: 'seller' },
      ],
      access: {
        // Solo admins pueden cambiar roles
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      saveToJWT: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      // Solo para sellers - referencia al owner que los invitó
      admin: {
        condition: (data) => data?.role === 'seller',
        description: 'El dueño al que pertenece este vendedor',
      },
      filterOptions: () => ({
        role: { equals: 'owner' },
      }),
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Si está desactivado, el usuario no puede iniciar sesión',
      },
    },
  ],
};
