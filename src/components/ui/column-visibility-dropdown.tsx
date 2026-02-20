'use client';

import { SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSettings } from '@/contexts/settings-context';
import { TABLE_COLUMNS, COLUMN_LABELS, type TableName } from '@/lib/constants/table-columns';

interface ColumnVisibilityDropdownProps {
  tableName: TableName;
}

export function ColumnVisibilityDropdown({ tableName }: ColumnVisibilityDropdownProps) {
  const { getVisibleColumns, updateTableColumns } = useSettings();

  const visibleColumns = getVisibleColumns(tableName);
  const availableColumns = TABLE_COLUMNS[tableName];

  const handleToggle = async (column: string, checked: boolean) => {
    if (!checked && visibleColumns.length <= 1) return;
    const next = checked ? [...visibleColumns, column] : visibleColumns.filter((c) => c !== column);
    await updateTableColumns(tableName, next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Columnas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column}
            checked={visibleColumns.includes(column)}
            onCheckedChange={(checked) => handleToggle(column, checked)}
          >
            {COLUMN_LABELS[column] ?? column}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
