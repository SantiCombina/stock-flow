import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stocker - Gestión de Negocio',
    short_name: 'Stocker',
    description: 'Sistema de gestión de inventario y ventas para distribuidoras',
    start_url: '/',
    display: 'standalone',
    background_color: '#F59E0B',
    theme_color: '#F59E0B',
    icons: [
      {
        src: '/icon-512.png',
        sizes: '192x192 512x512',
        type: 'image/png',
      },
    ],
  };
}
