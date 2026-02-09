import './globals.css';

export const metadata = {
  description: 'Sistema de gestión de inventario',
  title: 'Stocker',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
