'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';

import { getSettingsAction, updateTableColumnsAction, updateItemsPerPageAction } from '@/components/settings/actions';
import type { TableName, ItemsPerPageOption } from '@/lib/constants/table-columns';

interface SettingsState {
  id: number | null;
  productsColumns: string[];
  clientsColumns: string[];
  salesColumns: string[];
  assignmentsColumns: string[];
  historyColumns: string[];
  sellersColumns: string[];
  itemsPerPage: string;
  isLoading: boolean;
  error: string | null;
}

interface SettingsContextType extends SettingsState {
  getVisibleColumns: (tableName: TableName) => string[];
  isColumnVisible: (tableName: TableName, columnKey: string) => boolean;
  getItemsPerPage: () => ItemsPerPageOption;
  updateTableColumns: (tableName: TableName, columns: string[]) => Promise<void>;
  updateItemsPerPage: (itemsPerPage: ItemsPerPageOption) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_COLUMNS = {
  products: ['name', 'code', 'stock', 'price'],
  clients: ['name', 'phone', 'email'],
  sales: ['date', 'client', 'total', 'status'],
  assignments: ['date', 'seller', 'status'],
  history: ['date', 'product', 'type', 'quantity'],
  sellers: ['name', 'email', 'isActive'],
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SettingsState>({
    id: null,
    productsColumns: DEFAULT_COLUMNS.products,
    clientsColumns: DEFAULT_COLUMNS.clients,
    salesColumns: DEFAULT_COLUMNS.sales,
    assignmentsColumns: DEFAULT_COLUMNS.assignments,
    historyColumns: DEFAULT_COLUMNS.history,
    sellersColumns: DEFAULT_COLUMNS.sellers,
    itemsPerPage: '10',
    isLoading: true,
    error: null,
  });

  // Ref para trackear si ya se cargaron los settings
  const hasFetchedRef = useRef(false);

  // Effect para cargar settings iniciales
  useEffect(() => {
    // Evitar fetchs duplicados en Strict Mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Ejecutar fetch - el estado inicial ya tiene isLoading: true
    getSettingsAction()
      .then((result) => {
        if (result?.data?.success && result.data.settings) {
          const settings = result.data.settings;
          setState((prev) => ({
            ...prev,
            id: settings.id,
            productsColumns: settings.productsColumns,
            clientsColumns: settings.clientsColumns,
            salesColumns: settings.salesColumns,
            assignmentsColumns: settings.assignmentsColumns,
            historyColumns: settings.historyColumns,
            sellersColumns: settings.sellersColumns,
            itemsPerPage: settings.itemsPerPage,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Error al cargar configuraciones',
          }));
        }
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Error al cargar configuraciones',
        }));
      });
  }, []);

  const getVisibleColumns = useCallback(
    (tableName: TableName): string[] => {
      const key = `${tableName}Columns` as keyof SettingsState;
      const columns = state[key] as string[];
      return columns.length > 0 ? columns : DEFAULT_COLUMNS[tableName];
    },
    [state],
  );

  const isColumnVisible = useCallback(
    (tableName: TableName, columnKey: string): boolean => {
      const visibleColumns = getVisibleColumns(tableName);
      return visibleColumns.includes(columnKey);
    },
    [getVisibleColumns],
  );

  const getItemsPerPage = useCallback((): ItemsPerPageOption => {
    const value = parseInt(state.itemsPerPage, 10) as ItemsPerPageOption;
    return [10, 25, 50, 100].includes(value) ? value : 10;
  }, [state.itemsPerPage]);

  const updateTableColumns = useCallback(async (tableName: TableName, columns: string[]) => {
    try {
      const result = await updateTableColumnsAction({
        tableName,
        columns,
      });

      if (result?.data?.success) {
        setState((prev) => ({
          ...prev,
          [`${tableName}Columns`]: columns,
        }));
        toast.success('Columnas actualizadas');
      } else {
        toast.error('Error al actualizar columnas');
      }
    } catch {
      toast.error('Error al actualizar columnas');
    }
  }, []);

  const updateItemsPerPageCallback = useCallback(async (itemsPerPage: ItemsPerPageOption) => {
    try {
      const result = await updateItemsPerPageAction({
        itemsPerPage: itemsPerPage.toString(),
      });

      if (result?.data?.success) {
        setState((prev) => ({
          ...prev,
          itemsPerPage: itemsPerPage.toString(),
        }));
        toast.success('Preferencia actualizada');
      } else {
        toast.error('Error al actualizar preferencia');
      }
    } catch {
      toast.error('Error al actualizar preferencia');
    }
  }, []);

  const reloadSettings = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await getSettingsAction();

      if (result?.data?.success && result.data.settings) {
        const settings = result.data.settings;
        setState((prev) => ({
          ...prev,
          id: settings.id,
          productsColumns: settings.productsColumns,
          clientsColumns: settings.clientsColumns,
          salesColumns: settings.salesColumns,
          assignmentsColumns: settings.assignmentsColumns,
          historyColumns: settings.historyColumns,
          sellersColumns: settings.sellersColumns,
          itemsPerPage: settings.itemsPerPage,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Error al recargar configuraciones',
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Error al recargar configuraciones',
      }));
    }
  }, []);

  const value: SettingsContextType = {
    ...state,
    getVisibleColumns,
    isColumnVisible,
    getItemsPerPage,
    updateTableColumns,
    updateItemsPerPage: updateItemsPerPageCallback,
    reloadSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
