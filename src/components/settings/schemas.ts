import { z } from 'zod';

import { ITEMS_PER_PAGE_OPTIONS, TABLE_COLUMNS } from '@/lib/constants/table-columns';

export const updateTableColumnsSchema = z.object({
  tableName: z.enum(['products', 'clients', 'sales', 'assignments', 'history', 'sellers']),
  columns: z.array(z.string()).min(1, 'Debe seleccionar al menos una columna'),
});

export const updateItemsPerPageSchema = z.object({
  itemsPerPage: z.enum(ITEMS_PER_PAGE_OPTIONS.map((v) => v.toString()) as [string, string, string, string]),
});

export const updateSettingsSchema = z.object({
  productsColumns: z.array(z.string()).optional(),
  clientsColumns: z.array(z.string()).optional(),
  salesColumns: z.array(z.string()).optional(),
  assignmentsColumns: z.array(z.string()).optional(),
  historyColumns: z.array(z.string()).optional(),
  sellersColumns: z.array(z.string()).optional(),
  itemsPerPage: z.string().optional(),
});

export type UpdateTableColumnsInput = z.infer<typeof updateTableColumnsSchema>;
export type UpdateItemsPerPageInput = z.infer<typeof updateItemsPerPageSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export function validateColumnsForTable(tableName: keyof typeof TABLE_COLUMNS, columns: string[]): boolean {
  const validColumns = TABLE_COLUMNS[tableName];
  return columns.every((col) => validColumns.includes(col as never));
}
