import { randomBytes } from 'crypto';

import type { CollectionConfig } from 'payload';

export const Invitations: CollectionConfig = {
  slug: 'invitations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdBy', 'expiresAt', 'usedAt'],
  },
  access: {
    create: ({ req: { user } }) => {
      if (!user) return false;
      // Admins pueden invitar owners
      // Owners pueden invitar sellers
      return user.role === 'admin' || user.role === 'owner';
    },
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Owners ven sus propias invitaciones
      return { createdBy: { equals: user.id } };
    },
    update: () => false, // No se pueden editar
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { createdBy: { equals: user.id } };
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data) {
          // Generar token único
          data.token = randomBytes(32).toString('hex');
          // Expira en 7 días
          data.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }
        return data;
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && data) {
          // Owners solo pueden invitar sellers
          if (req.user.role === 'owner' && data.role !== 'seller') {
            throw new Error('Solo podés invitar vendedores');
          }
          // Admins solo pueden invitar owners (o admins)
          if (req.user.role === 'admin' && data.role === 'seller') {
            throw new Error('Admins solo invitan owners');
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create') {
          const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
          const registerUrl = `${baseUrl}/register?token=${doc.token}`;
          const roleName = doc.role === 'owner' ? 'Dueño' : 'Vendedor';

          try {
            await req.payload.sendEmail({
              to: doc.email,
              subject: 'Invitación a Stocker',
              html: `
                <h1>¡Fuiste invitado a Stocker!</h1>
                <p>Alguien te invitó a unirte como <strong>${roleName}</strong>.</p>
                <p>Hacé clic en el siguiente enlace para crear tu cuenta:</p>
                <a href="${registerUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px;">
                  Crear Cuenta
                </a>
                <p style="margin-top: 20px; color: #666;">
                  Este enlace expira en 7 días.
                </p>
              `,
            });
          } catch (error) {
            req.payload.logger.error({ err: error, msg: 'Error enviando email de invitación' });
          }
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Dueño', value: 'owner' },
        { label: 'Vendedor', value: 'seller' },
      ],
    },
    {
      name: 'token',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [({ req }) => req.user?.id],
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'usedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Fecha en que se usó la invitación',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
};
