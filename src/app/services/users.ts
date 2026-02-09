import { getPayloadClient } from '@/lib/payload';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'owner' | 'seller';
  owner?: number;
}

interface CreateUserResult {
  success: boolean;
  user?: { id: number; email: string };
  error?: string;
}

export async function createUser(data: CreateUserData): Promise<CreateUserResult> {
  const payload = await getPayloadClient();

  // Verificar si el usuario ya existe
  const { docs: existingUsers } = await payload.find({
    collection: 'users',
    where: { email: { equals: data.email } },
    limit: 1,
  });

  if (existingUsers.length > 0) {
    return { success: false, error: 'El email ya está registrado' };
  }

  try {
    const user = await payload.create({
      collection: 'users',
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.owner ? { owner: data.owner } : {}),
      },
    });

    return {
      success: true,
      user: { id: user.id, email: user.email },
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Error al crear el usuario' };
  }
}

export async function getUserByEmail(email: string) {
  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  });

  return docs[0] ?? null;
}
