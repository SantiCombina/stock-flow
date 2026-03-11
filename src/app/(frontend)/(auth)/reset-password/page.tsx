import Link from 'next/link';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Enlace inválido</CardTitle>
            <CardDescription>
              Este enlace de recuperación no es válido o ha expirado.{' '}
              <Link href="/forgot-password" className="underline hover:text-foreground">
                Solicitá uno nuevo.
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordForm token={token} />
    </div>
  );
}
