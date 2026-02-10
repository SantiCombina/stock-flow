'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { markInvitationAsUsed, validateInvitation } from '@/app/services/invitations';
import { createUser, loginUser as loginUserService } from '@/app/services/users';
import { actionClient } from '@/lib/safe-action';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const loginUser = actionClient.schema(loginSchema).action(async ({ parsedInput }) => {
  const { email, password } = parsedInput;

  const result = await loginUserService({ email, password });

  if (!result.success || !result.token) {
    return { error: result.error ?? 'Credenciales inválidas' };
  }

  const cookieStore = await cookies();
  cookieStore.set('payload-token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  return { success: true };
});

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
