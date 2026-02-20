import './globals.css';

export const metadata = {
  appleWebApp: {
    title: 'Stocker',
  },
  description: 'Sistema de gestión de negocio',
  title: 'Stocker',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-title" content="Stocker" />
      </head>
      <body>{children}</body>
    </html>
  );
}
