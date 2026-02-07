import { PageHeader } from '@/components/layout/page-header';

export function SettingsSection() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Configuración" description="Ajustes del sistema" />

      <main className="flex-1 px-6 pb-6">
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-muted-foreground">Contenido de configuración próximamente...</p>
        </div>
      </main>
    </div>
  );
}
