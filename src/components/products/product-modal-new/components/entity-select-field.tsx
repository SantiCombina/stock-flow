'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { EntitySelectFieldProps } from '../types';

export function EntitySelectField({
  label,
  value,
  onChange,
  options,
  entityType,
  onCreateEntity,
  emptyMessage = 'Sin opciones',
}: EntitySelectFieldProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue === '__create__') {
      onCreateEntity(entityType);
      return;
    }
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select onValueChange={handleValueChange} value={value ?? ''}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__create__" className="text-primary font-medium cursor-pointer">
            + Crear nueva {label.toLowerCase()}
          </SelectItem>
          {options.length === 0 ? (
            <SelectItem value="_empty" disabled>
              {emptyMessage}
            </SelectItem>
          ) : (
            options.map((option) => (
              <SelectItem key={option.id} value={option.id.toString()}>
                {option.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
