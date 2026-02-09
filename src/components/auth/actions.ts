'use server';

import { z } from 'zod';

import { markInvitationAsUsed, validateInvitation } from '@/app/services/invitations';
import { createUser } from '@/app/services/users';
import { actionClient } from '@/lib/safe-action';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  token: z.string().min(1, 'Token requerido'),
});

export const registerUser = actionClient.schema(registerSchema).action(async ({ parsedInput }) => {
  const { name, email, password, token } = parsedInput;

  // Validar invitación
  const invitationResult = await validateInvitation(token);

  if (!invitationResult.valid || !invitationResult.invitation) {
    return { error: invitationResult.error ?? 'Invitación inválida' };
  }

  const { invitation } = invitationResult;

  // Verificar que el email coincide
  if (invitation.email !== email) {
    return { error: 'El email no coincide con la invitación' };
  }

  // Crear usuario
  const userResult = await createUser({
    name,
    email,
    password,
    role: invitation.role,
    ...(invitation.role === 'seller' && invitation.createdBy ? { owner: invitation.createdBy } : {}),
  });

  if (!userResult.success) {
    return { error: userResult.error ?? 'Error al crear la cuenta' };
  }

  // Marcar invitación como usada
  await markInvitationAsUsed(invitation.id);

  return { success: true };
});
