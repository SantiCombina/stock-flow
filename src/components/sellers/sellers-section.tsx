import { PageHeader } from '@/components/layout/page-header';

export function SellersSection() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Vendedores" description="Gestión del equipo de ventas" />

      <main className="flex-1 px-6 pb-6">
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-muted-foreground">Contenido de vendedores próximamente...</p>
        </div>
      </main>
    </div>
  );
}
