import { PageHeader } from '@/components/layout/page-header';

export function StatisticsSection() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Estadísticas" description="Análisis y reportes del negocio" />

      <main className="flex-1 px-6 pb-6">
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-muted-foreground">Contenido de estadísticas próximamente...</p>
        </div>
      </main>
    </div>
  );
}
