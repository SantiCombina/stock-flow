'use client';

import { useUser } from '@/components/providers/user-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { PageHeader } from '../layout/page-header';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  owner: 'Dueño',
  seller: 'Vendedor',
};

export function ProfileSection() {
  const user = useUser();

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Mi Perfil" description="Información de tu cuenta" />

      <main className="flex-1 px-6 pb-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
            <CardDescription>Tu información de usuario en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rol</label>
                <p className="text-sm">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
