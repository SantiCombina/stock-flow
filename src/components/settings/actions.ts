'use server';

import {
  getSettings,
  updateTableColumns as updateTableColumnsService,
  updateSettings as updateSettingsService,
  getAllColumnsConfig,
} from '@/app/services/settings';
import { getCurrentUser } from '@/lib/payload';
import { actionClient } from '@/lib/safe-action';

import { updateTableColumnsSchema, updateItemsPerPageSchema, validateColumnsForTable } from './schemas';

// Action para obtener las configuraciones del usuario actual
export const getSettingsAction = actionClient.action(async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('No autenticado');
  }

  const settings = await getSettings(user.id);

  return {
    success: true,
    settings: {
      id: settings.id,
      productsColumns: settings.productsColumns?.map((c) => c.column) ?? [],
      clientsColumns: settings.clientsColumns?.map((c) => c.column) ?? [],
      salesColumns: settings.salesColumns?.map((c) => c.column) ?? [],
      assignmentsColumns: settings.assignmentsColumns?.map((c) => c.column) ?? [],
      historyColumns: settings.historyColumns?.map((c) => c.column) ?? [],
      sellersColumns: settings.sellersColumns?.map((c) => c.column) ?? [],
      itemsPerPage: settings.itemsPerPage ?? '10',
    },
  };
});

// Action para actualizar las columnas de una tabla
export const updateTableColumnsAction = actionClient
  .schema(updateTableColumnsSchema)
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('No autenticado');
    }

    // Validar que las columnas sean válidas para la tabla
    if (!validateColumnsForTable(parsedInput.tableName, parsedInput.columns)) {
      throw new Error('Columnas inválidas para esta tabla');
    }

    const settings = await updateTableColumnsService(user.id, parsedInput.tableName, parsedInput.columns);

    return {
      success: true,
      columns: settings[`${parsedInput.tableName}Columns` as keyof typeof settings],
    };
  });

// Action para actualizar los items por página
export const updateItemsPerPageAction = actionClient
  .schema(updateItemsPerPageSchema)
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('No autenticado');
    }

    const settings = await updateSettingsService(user.id, {
      itemsPerPage: parsedInput.itemsPerPage as '10' | '25' | '50' | '100',
    });

    return {
      success: true,
      itemsPerPage: settings.itemsPerPage,
    };
  });

// Action para obtener las columnas visibles de una tabla
export const getVisibleColumnsAction = actionClient.action(async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('No autenticado');
  }

  const settings = await getSettings(user.id);
  const config = getAllColumnsConfig(settings);

  return {
    success: true,
    config,
  };
});
