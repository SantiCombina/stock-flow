import { AppLayout } from '@/components/layout/app-layout';
import { getFeatureFlags } from '@/lib/features';

import './globals.css';

export const metadata = {
  description: 'Sistema de gestión de inventario',
  title: 'Stocker',
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  const features = getFeatureFlags();

  return (
    <html lang="es">
      <body>
        <AppLayout features={features}>{children}</AppLayout>
      </body>
    </html>
  );
}
