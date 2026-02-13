import { AppLayout } from '@/components/layout/app-layout';
import { UserProvider } from '@/components/providers/user-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import { getFeatureFlags } from '@/lib/features';
import { getCurrentUser } from '@/lib/payload';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Si no hay usuario, el middleware se encarga de redirigir
  // No hacemos redirect aquí para evitar loops
  if (!user) {
    return null;
  }

  const features = getFeatureFlags();

  return (
    <UserProvider
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      <SettingsProvider>
        <AppLayout features={features}>{children}</AppLayout>
      </SettingsProvider>
    </UserProvider>
  );
}
