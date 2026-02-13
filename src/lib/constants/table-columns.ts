/**
 * Constantes compartidas para configuración de columnas de tablas
 */

// Columnas disponibles por tabla
export const TABLE_COLUMNS = {
  products: ['name', 'code', 'brand', 'category', 'quality', 'stock', 'price'],
  clients: ['name', 'cuit', 'phone', 'email', 'address'],
  sales: ['date', 'client', 'total', 'paymentMethod', 'status', 'items'],
  assignments: ['date', 'seller', 'status', 'items', 'notes'],
  history: ['date', 'product', 'type', 'quantity', 'reason', 'reference'],
  sellers: ['name', 'email', 'phone', 'isActive', 'createdAt'],
} as const;

// Nombres de tablas
export type TableName = keyof typeof TABLE_COLUMNS;

// Tipo para las columnas de cada tabla
export type TableColumns = typeof TABLE_COLUMNS;

// Columnas por defecto (las más importantes)
export const DEFAULT_COLUMNS: Record<TableName, string[]> = {
  products: ['name', 'code', 'stock', 'price'],
  clients: ['name', 'phone', 'email'],
  sales: ['date', 'client', 'total', 'status'],
  assignments: ['date', 'seller', 'status'],
  history: ['date', 'product', 'type', 'quantity'],
  sellers: ['name', 'email', 'isActive'],
};

// Columnas mínimas por tabla (las indispensables)
export const MINIMUM_COLUMNS: Record<TableName, string[]> = {
  products: ['name', 'stock', 'brand'],
  clients: ['name', 'phone', 'email'],
  sales: ['date', 'client', 'total'],
  assignments: ['date', 'seller', 'status'],
  history: ['date', 'product', 'type', 'quantity'],
  sellers: ['name', 'email', 'isActive'],
};

// Opciones de elementos por página
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
export type ItemsPerPageOption = (typeof ITEMS_PER_PAGE_OPTIONS)[number];
export const DEFAULT_ITEMS_PER_PAGE: ItemsPerPageOption = 10;

// Etiquetas legibles para las columnas
export const COLUMN_LABELS: Record<string, string> = {
  // Products
  name: 'Nombre',
  code: 'Código',
  brand: 'Marca',
  category: 'Categoría',
  quality: 'Calidad',
  stock: 'Stock',
  price: 'Precio',
  // Clients
  cuit: 'CUIT/CUIL',
  phone: 'Teléfono',
  email: 'Email',
  address: 'Dirección',
  // Sales
  date: 'Fecha',
  client: 'Cliente',
  total: 'Total',
  paymentMethod: 'Método de pago',
  status: 'Estado',
  items: 'Items',
  // Assignments
  seller: 'Vendedor',
  notes: 'Notas',
  // History
  product: 'Producto',
  type: 'Tipo',
  quantity: 'Cantidad',
  reason: 'Razón',
  reference: 'Referencia',
  // Sellers
  isActive: 'Activo',
  createdAt: 'Fecha de creación',
};

// Nombres legibles de las tablas
export const TABLE_LABELS: Record<TableName, string> = {
  products: 'Productos',
  clients: 'Clientes',
  sales: 'Ventas',
  assignments: 'Asignaciones',
  history: 'Historial',
  sellers: 'Vendedores',
};
