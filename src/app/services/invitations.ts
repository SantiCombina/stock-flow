import { getPayloadClient } from '@/lib/payload';

interface ValidateInvitationResult {
  valid: boolean;
  invitation?: {
    id: number;
    email: string;
    role: 'owner' | 'seller';
    createdBy: number | null;
  };
  error?: string;
}

export async function validateInvitation(token: string): Promise<ValidateInvitationResult> {
  const payload = await getPayloadClient();

  const { docs: invitations } = await payload.find({
    collection: 'invitations',
    where: {
      and: [
        { token: { equals: token } },
        { usedAt: { exists: false } },
        { expiresAt: { greater_than: new Date().toISOString() } },
      ],
    },
    limit: 1,
  });

  const invitation = invitations[0];

  if (!invitation) {
    return { valid: false, error: 'Invitación inválida o expirada' };
  }

  return {
    valid: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role as 'owner' | 'seller',
      createdBy: typeof invitation.createdBy === 'number' ? invitation.createdBy : (invitation.createdBy?.id ?? null),
    },
  };
}

export async function markInvitationAsUsed(id: number): Promise<void> {
  const payload = await getPayloadClient();

  await payload.update({
    collection: 'invitations',
    id,
    data: {
      usedAt: new Date().toISOString(),
    },
  });
}
