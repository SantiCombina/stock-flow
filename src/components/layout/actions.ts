'use server';

import { cookies } from 'next/headers';

export async function logout() {
  const cookieStore = await cookies();

  // Eliminar cookie de sesión de Payload
  cookieStore.delete('payload-token');

  return { success: true };
}
