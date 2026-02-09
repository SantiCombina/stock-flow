import { AppLayout } from '@/components/layout/app-layout';
import { getFeatureFlags } from '@/lib/features';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const features = getFeatureFlags();

  return <AppLayout features={features}>{children}</AppLayout>;
}
