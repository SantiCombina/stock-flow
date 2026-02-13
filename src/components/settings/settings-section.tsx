'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ItemsPerPageConfig } from '@/components/settings/items-per-page-config';
import { TableColumnsConfig } from '@/components/settings/table-columns-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/settings-context';
import { TABLE_LABELS, type TableName, type ItemsPerPageOption } from '@/lib/constants/table-columns';

const TABLE_NAMES: TableName[] = ['products', 'clients', 'sales', 'assignments', 'history', 'sellers'];

export function SettingsSection() {
  const {
    productsColumns,
    clientsColumns,
    salesColumns,
    assignmentsColumns,
    historyColumns,
    sellersColumns,
    itemsPerPage,
    isLoading,
    updateTableColumns,
    updateItemsPerPage,
  } = useSettings();

  const getColumns = (tableName: TableName): string[] => {
    switch (tableName) {
      case 'products':
        return productsColumns;
      case 'clients':
        return clientsColumns;
      case 'sales':
        return salesColumns;
      case 'assignments':
        return assignmentsColumns;
      case 'history':
        return historyColumns;
      case 'sellers':
        return sellersColumns;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Configuración" description="Ajustes del sistema" />
        <main className="flex-1 px-6 pb-6">
          <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
            <p className="text-muted-foreground">Cargando configuración...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Configuración" description="Personaliza tu experiencia" />

      <main className="flex-1 space-y-6 px-6 pb-6">
        {/* Items per page config */}
        <Card>
          <CardHeader>
            <CardTitle>Paginación</CardTitle>
            <CardDescription>Cantidad de elementos a mostrar en cada tabla</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemsPerPageConfig
              initialValue={parseInt(itemsPerPage, 10) as ItemsPerPageOption}
              onSave={updateItemsPerPage}
            />
          </CardContent>
        </Card>

        {/* Table columns config */}
        <Card>
          <CardHeader>
            <CardTitle>Columnas visibles</CardTitle>
            <CardDescription>Selecciona qué columnas mostrar en cada tabla</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
                {TABLE_NAMES.map((tableName) => (
                  <TabsTrigger key={tableName} value={tableName}>
                    {TABLE_LABELS[tableName]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {TABLE_NAMES.map((tableName) => (
                <TabsContent key={tableName} value={tableName}>
                  <TableColumnsConfig
                    tableName={tableName}
                    initialColumns={getColumns(tableName)}
                    onSave={(columns) => updateTableColumns(tableName, columns)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
