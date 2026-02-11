# Stocker - Plan de Desarrollo

> Sistema de gestión de inventario y ventas para distribuidoras

---

## 🤝 Metodología de Trabajo

**Enfoque colaborativo paso a paso:**
- Cada colección se diseña en conjunto antes de implementar
- Definimos campos, relaciones y access control conversando
- Validamos la estructura de datos antes de codificar
- Iteramos sobre cada fase hasta que esté completa

---

## 📋 Resumen del Proyecto

### Visión
Reemplazar las hojas de Excel desordenadas por un sistema moderno y confiable donde los owners puedan gestionar su inventario, vendedores y ventas en tiempo real.

### Cliente Principal
Distribuidora de productos para mascotas con múltiples vendedores.

### Modelo de Negocio Futuro
SaaS multi-tenant donde cada owner gestiona su propio negocio.

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 15.x | Framework principal (App Router) |
| Payload CMS | 3.75.x | Backend, Auth, Admin Panel |
| PostgreSQL | - | Base de datos (Neon.tech) |
| Tailwind CSS | 4.x | Estilos |
| shadcn/ui | - | Componentes UI |
| Zod | 3.x | Validación |
| next-safe-action | 8.x | Server Actions tipados |
| React Hook Form | 7.x | Formularios |

---

## 🎭 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| `admin` | Acceso total. Gestiona owners. Solo desarrolladores. |
| `owner` | Gestiona SU negocio: productos, vendedores, asignaciones, clientes, ventas. |
| `seller` | Registra ventas y clientes. Ve solo sus asignaciones. |

---

## ✅ Estado Actual (Completado)

### Infraestructura
- [x] Proyecto Next.js 15 configurado
- [x] Payload CMS 3.x integrado
- [x] PostgreSQL (Neon.tech) conectado
- [x] Tailwind CSS 4 + shadcn/ui configurados
- [x] Feature flags sistema implementado

### Autenticación
- [x] Login funcional
- [x] Sistema de invitaciones por email (Resend)
- [x] Registro por invitación con token
- [x] Middleware de protección de rutas
- [x] Roles (admin, owner, seller)

### Colecciones Payload
- [x] Users (con relación owner-seller)
- [x] Invitations (con hooks de email)
- [x] Media

### Layout
- [x] Sidebar colapsable con navegación
- [x] Sistema de feature flags para rutas
- [x] PageHeader reutilizable
- [x] Páginas esqueleto para todas las secciones

---

## 📅 Roadmap de Desarrollo

### Fase 0: Configuración Base
> **Objetivo**: Sistema de configuración que permita personalizar columnas visibles por tabla.

#### Tareas
- [ ] **0.1** Crear colección `Settings` en Payload
  - Campos por tabla: `productsColumns`, `sellersColumns`, `salesColumns`, etc.
  - Relación con `owner` (cada owner tiene su config)
  - Valores por defecto para nuevos owners
  
- [ ] **0.2** Servicio de settings
  - `getSettings(ownerId)` - obtener configuración
  - `updateSettings(ownerId, data)` - actualizar configuración
  
- [ ] **0.3** UI de Settings
  - Lista de tablas configurables
  - Checkboxes para cada columna
  - Guardado automático o con botón
  
- [ ] **0.4** Hook/Context de settings
  - `useSettings()` para acceder desde cualquier componente
  - Cargar settings en layout principal

**Entregable**: Owner puede elegir qué columnas ver en cada tabla.

---

### Fase 1: Productos
> **Objetivo**: CRUD completo de productos con control de stock.

#### Colección `Products`
```typescript
{
  name: string;           // Nombre del producto
  description?: string;   // Descripción opcional
  sku?: string;          // Código único
  category?: string;     // Categoría
  price: number;         // Precio de venta
  cost?: number;         // Costo (opcional)
  stock: number;         // Cantidad disponible
  minStock?: number;     // Alerta de stock bajo
  unit: string;          // Unidad (unidad, kg, litro, etc.)
  isActive: boolean;     // Si está disponible para vender
  owner: relationship;   // Dueño del producto
  image?: upload;        // Imagen opcional
}
```

#### Tareas
- [ ] **1.1** Crear colección `Products` con access control
- [ ] **1.2** Servicio de productos (CRUD)
- [ ] **1.3** Tabla de productos con DataTable
  - Columnas configurables según Settings
  - Búsqueda y filtros
  - Paginación
- [ ] **1.4** Modal/Página de crear producto
- [ ] **1.5** Modal/Página de editar producto
- [ ] **1.6** Eliminar producto (soft delete o confirmar)
- [ ] **1.7** Importar productos desde CSV (opcional - futuro)

**Entregable**: Owner puede gestionar su catálogo de productos.

---

### Fase 2: Vendedores
> **Objetivo**: Gestión completa del equipo de ventas.

#### Tareas
- [ ] **2.1** UI de lista de vendedores
  - Tabla con datos de sellers del owner
  - Estado activo/inactivo
  - Columnas configurables
  
- [ ] **2.2** Invitar nuevo vendedor
  - Formulario de email
  - Usar sistema de invitaciones existente
  
- [ ] **2.3** Ver detalle de vendedor
  - Información básica
  - Asignaciones activas
  - Ventas realizadas (resumen)
  
- [ ] **2.4** Desactivar/Reactivar vendedor
- [ ] **2.5** Eliminar vendedor (o marcar como eliminado)

**Entregable**: Owner puede gestionar su equipo de vendedores.

---

### Fase 3: Clientes
> **Objetivo**: Registro de clientes frecuentes por vendedor.

#### Colección `Customers`
```typescript
{
  name: string;           // Nombre del cliente
  phone?: string;         // Teléfono
  email?: string;         // Email opcional
  address?: string;       // Dirección
  notes?: string;         // Notas
  seller: relationship;   // Vendedor que lo atiende
  owner: relationship;    // Owner (para queries)
  isActive: boolean;
}
```

#### Tareas
- [ ] **3.1** Crear colección `Customers`
- [ ] **3.2** Servicio de clientes
- [ ] **3.3** UI de lista de clientes
  - Owner ve todos los clientes
  - Seller ve solo sus clientes
- [ ] **3.4** CRUD de clientes
- [ ] **3.5** Búsqueda rápida de cliente (para ventas)

**Entregable**: Vendedores pueden registrar clientes frecuentes.

---

### Fase 4: Asignaciones
> **Objetivo**: Owner asigna productos a vendedores para que salgan a vender.

#### Colección `Assignments`
```typescript
{
  seller: relationship;        // Vendedor asignado
  date: date;                  // Fecha de asignación
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  items: array [
    {
      product: relationship;   // Producto
      quantity: number;        // Cantidad asignada
      returned?: number;       // Cantidad devuelta
    }
  ];
  notes?: string;
  owner: relationship;
}
```

#### Tareas
- [ ] **4.1** Crear colección `Assignments`
- [ ] **4.2** Servicio de asignaciones
- [ ] **4.3** UI de crear asignación
  - Seleccionar vendedor
  - Agregar productos con cantidades
  - Descontar del stock al confirmar
- [ ] **4.4** Lista de asignaciones
  - Filtrar por vendedor, fecha, estado
- [ ] **4.5** Cerrar asignación
  - Registrar devoluciones
  - Actualizar stock
- [ ] **4.6** Vista de asignación para seller
  - Ver sus asignaciones activas
  - Ver productos que tiene

**Entregable**: Owner puede asignar productos a vendedores, controlando el stock.

---

### Fase 5: Ventas
> **Objetivo**: Vendedores registran ventas que actualizan el stock automáticamente.

#### Colección `Sales`
```typescript
{
  seller: relationship;
  customer?: relationship;     // Cliente opcional
  assignment?: relationship;   // Asignación relacionada
  date: date;
  items: array [
    {
      product: relationship;
      quantity: number;
      price: number;           // Precio al momento de venta
      subtotal: number;
    }
  ];
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'credit' | 'other';
  status: 'completed' | 'cancelled';
  notes?: string;
  owner: relationship;
}
```

#### Tareas
- [ ] **5.1** Crear colección `Sales`
- [ ] **5.2** Servicio de ventas
- [ ] **5.3** UI de registrar venta (Seller)
  - Seleccionar productos de su asignación
  - Seleccionar o crear cliente
  - Calcular totales
- [ ] **5.4** Hook afterChange para actualizar stock
- [ ] **5.5** Lista de ventas
  - Owner ve todas
  - Seller ve las suyas
- [ ] **5.6** Detalle de venta
- [ ] **5.7** Anular venta (con reversión de stock)

**Entregable**: Sistema de ventas funcional con actualización automática de stock.

---

### Fase 6: Historial
> **Objetivo**: Registro de todos los movimientos de stock.

#### Colección `StockMovements`
```typescript
{
  product: relationship;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  reason: string;              // Venta, Devolución, Ajuste manual, etc.
  reference?: string;          // ID de venta, asignación, etc.
  previousStock: number;
  newStock: number;
  createdBy: relationship;
  owner: relationship;
}
```

#### Tareas
- [ ] **6.1** Crear colección `StockMovements`
- [ ] **6.2** Hooks para registrar movimientos automáticamente
  - Al crear asignación
  - Al registrar venta
  - Al cerrar asignación (devoluciones)
- [ ] **6.3** UI de historial
  - Filtros por producto, fecha, tipo
  - Timeline de movimientos
- [ ] **6.4** Ajuste manual de stock (solo owner)

**Entregable**: Trazabilidad completa de movimientos de inventario.

---

### Fase 7: Dashboard y Estadísticas
> **Objetivo**: Panel con métricas clave del negocio.

#### Tareas
- [ ] **7.1** Widget: Resumen de stock
  - Productos con stock bajo
  - Valor total de inventario
  
- [ ] **7.2** Widget: Ventas del período
  - Ventas de hoy/semana/mes
  - Comparativa con período anterior
  
- [ ] **7.3** Widget: Top productos
  - Más vendidos
  - Menos vendidos
  
- [ ] **7.4** Widget: Rendimiento por vendedor
  - Ventas por seller
  - Rankings
  
- [ ] **7.5** Gráficos básicos
  - Ventas por día/semana
  - Stock por categoría

**Entregable**: Dashboard con métricas útiles para toma de decisiones.

---

## 📊 Estructura de Colecciones Final

```
Collections (Payload):
├── Users          ✅ (existente)
├── Invitations    ✅ (existente)
├── Media          ✅ (existente)
├── Settings       🔲 (Fase 0)
├── Products       🔲 (Fase 1)
├── Customers      🔲 (Fase 3)
├── Assignments    🔲 (Fase 4)
├── Sales          🔲 (Fase 5)
└── StockMovements 🔲 (Fase 6)
```

---

## 🔧 Componentes Reutilizables a Crear

| Componente | Descripción | Fase |
|------------|-------------|------|
| `DataTable` | Tabla genérica con columnas configurables | 0 |
| `ColumnToggle` | Selector de columnas visibles | 0 |
| `SearchInput` | Input de búsqueda con debounce | 1 |
| `ProductSelect` | Selector de productos con búsqueda | 4 |
| `CustomerSelect` | Selector de clientes | 5 |
| `StatCard` | Card de estadística | 7 |
| `MiniChart` | Gráfico pequeño para widgets | 7 |

---

## 📝 Notas Técnicas

### Patrón de Servicios
```typescript
// src/app/services/[entity].ts
export async function getAll(ownerId: number, filters?: Filters) { }
export async function getById(id: number) { }
export async function create(data: CreateData) { }
export async function update(id: number, data: UpdateData) { }
export async function remove(id: number) { }
```

### Patrón de Server Actions
```typescript
// src/components/[entity]/actions.ts
'use server';
import { actionClient } from '@/lib/safe-action';
// Usar actionClient para todas las acciones
```

### Access Control por Rol
```typescript
// Todas las colecciones deben filtrar por owner
read: ({ req: { user } }) => {
  if (user?.role === 'admin') return true;
  if (user?.role === 'owner') return { owner: { equals: user.id } };
  if (user?.role === 'seller') return { owner: { equals: user.owner } };
  return false;
}
```

---

## 🚀 Próximos Pasos

1. **Completar documentación de skills** en `skills/`
2. **Comenzar Fase 0**: Crear colección Settings
3. **Iterar**: Cada fase se revisa antes de pasar a la siguiente

---

## 📌 Decisiones Pendientes

- [ ] ¿Categorías de productos como colección separada o campo de texto?
- [ ] ¿Métodos de pago configurables por owner?
- [ ] ¿Multi-moneda para el futuro SaaS?
- [ ] ¿Reportes exportables a PDF/Excel?
- [ ] ¿App móvil para sellers en el futuro?

---

*Última actualización: Febrero 2026*
