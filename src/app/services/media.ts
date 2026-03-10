'use server';

import { getPayloadClient } from '@/lib/payload';

export async function deleteMedia(id: number): Promise<void> {
  const payload = await getPayloadClient();

  await payload.delete({
    collection: 'media',
    id,
    overrideAccess: true,
  });
}
