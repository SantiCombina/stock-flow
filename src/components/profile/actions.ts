'use server';

import { changePassword, loginUser as loginUserService } from '@/app/services/users';
import { getCurrentUser } from '@/lib/payload';
import { actionClient } from '@/lib/safe-action';
import { changePasswordSchema } from '@/schemas/profile/change-password-schema';

export const changePasswordAction = actionClient
  .schema(changePasswordSchema)
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();

    if (!user) throw new Error('No autenticado');

    const loginResult = await loginUserService({
      email: user.email,
      password: parsedInput.currentPassword,
    });

    if (!loginResult.success) {
      return { error: 'La contraseña actual es incorrecta.' };
    }

    await changePassword(user.id, parsedInput.newPassword);

    return { success: true };
  });
