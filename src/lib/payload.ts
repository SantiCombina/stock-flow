import { headers } from 'next/headers';
import { getPayload } from 'payload';

import type { User } from '@/payload-types';

import config from '@payload-config';

export async function getPayloadClient() {
  return getPayload({ config });
}

export async function getCurrentUser(): Promise<User | null> {
  const payload = await getPayload({ config });
  const requestHeaders = await headers();

  const { user } = await payload.auth({ headers: requestHeaders });

  return user ?? null;
}
