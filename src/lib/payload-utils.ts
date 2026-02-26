/**
 * Extrae el ID numérico de un campo de relación de Payload.
 * Los campos de relación pueden venir como número (sin poblar) o como objeto poblado.
 */
export function resolveId<T extends { id: number }>(field: (number | null) | T | undefined): number | null {
  if (!field) return null;
  if (typeof field === 'object') return field.id;
  return field;
}
