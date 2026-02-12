# Stocker - Registro de Progreso

> Documentación de features implementadas y estado actual del proyecto

---

## ✅ Fases Completadas

### ✅ Fase 0: Configuración Base (Settings) - COMPLETADA

**Fecha de completado:** Febrero 2026

**Objetivo:** Sistema de configuración que permita personalizar columnas visibles por tabla.

#### ✅ Tareas Completadas:

- [x] **0.1** Crear colección `Settings` en Payload
- [x] **0.2** Servicio de settings
- [x] **0.3** UI de Settings
- [x] **0.4** Hook/Context de settings

#### 📁 Archivos Creados/Modificados:

| Archivo                                             | Descripción                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/collections/Settings.ts`                       | Colección de Payload para almacenar configuraciones por usuario                       |
| `src/payload.config.ts`                             | Registrada la colección Settings                                                      |
| `src/payload-types.ts`                              | Tipos generados automáticamente                                                       |
| `src/app/services/settings.ts`                      | Servicios: getSettings, updateSettings, updateTableColumns, getVisibleColumns, etc.   |
| `src/app/services/users.ts`                         | Agregado `getCurrentUser()` y `getUserById()`                                         |
| `src/components/settings/schemas.ts`                | Schemas de Zod para validación y constantes de columnas disponibles                   |
| `src/components/settings/actions.ts`                | Server Actions: getSettingsAction, updateTableColumnsAction, updateItemsPerPageAction |
| `src/components/settings/table-columns-config.tsx`  | Componente UI para configurar columnas por tabla                                      |
| `src/components/settings/items-per-page-config.tsx` | Componente UI para configurar elementos por página                                    |
| `src/components/settings/settings-section.tsx`      | Página principal de configuración con tabs                                            |
| `src/components/ui/tabs.tsx`                        | Componente Tabs de shadcn/ui                                                          |
| `src/components/ui/checkbox.tsx`                    | Componente Checkbox de shadcn/ui                                                      |
| `src/components/ui/select.tsx`                      | Componente Select de shadcn/ui                                                        |
| `src/contexts/settings-context.tsx`                 | Contexto React para acceder a settings desde cualquier componente                     |

#### 📦 Dependencias Instaladas:

```bash
pnpm add @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-select
```

#### 🔧 Funcionalidades Implementadas:

1. **Colección Settings (Payload CMS)**
   - Relación 1:1 con usuario (`user`)
   - 6 campos de columnas configurables (una por tabla)
   - Campo `itemsPerPage` (10, 25, 50, 100)
   - Access control: usuarios solo pueden ver/modificar sus propias settings
   - Auto-creación de settings por defecto al consultar

2. **Columnas Configurables por Tabla:**
   | Tabla | Columnas Disponibles |
   |-------|---------------------|
   | Products | name, sku, price, stock, cost, category, minStock, unit, isActive, image |
   | Sellers | name, email, phone, role, isActive, createdAt |
   | Sales | date, customer, seller, total, paymentMethod, status, items |
   | Assignments | date, seller, status, items, notes, completedAt |
   | Customers | name, phone, email, address, notes, seller, isActive |
   | History | date, product, type, quantity, reason, reference, createdBy |

3. **Servicios (Backend)**
   - `getSettings(userId)`: Obtiene o crea settings por defecto
   - `updateSettings(userId, data)`: Actualiza configuraciones
   - `updateTableColumns(userId, tableName, columns)`: Actualiza columnas específicas
   - `getVisibleColumns(settings, tableName)`: Extrae columnas visibles
   - `isColumnVisible(settings, tableName, columnKey)`: Verifica visibilidad
   - `getItemsPerPage(settings)`: Obtiene preferencia de paginación

4. **UI de Configuración**
   - Página `/settings` con interfaz completa
   - Tabs para cada una de las 6 tablas
   - Checkboxes para mostrar/ocultar columnas
   - Botones "Seleccionar todas" y "Mínimo"
   - Selector de elementos por página (10/25/50/100)
   - Guardado automático con feedback (toasts)
   - Validación: mínimo 1 columna debe estar visible

5. **Hook `useSettings`**
   - Acceso global a settings desde cualquier componente
   - Métodos: `getVisibleColumns()`, `isColumnVisible()`, `getItemsPerPage()`
   - Recarga automática de settings

#### 🎨 Estructura Visual:

```
/settings
├── Header: "Configuración"
├── Card: Elementos por página (Select: 10/25/50/100)
└── Section: Columnas visibles por tabla
    └── Tabs: [Productos] [Vendedores] [Ventas] [Asignaciones] [Clientes] [Historial]
        └── Card por tab:
            ├── Description
            ├── Botones: [Seleccionar todas] [Mínimo]
            └── Grid de Checkboxes (2 cols móvil, 3 cols desktop)
```

#### 🔐 Seguridad:

- Access control en colección: users solo ven sus propias settings
- Server Actions verifican autenticación con `getCurrentUser()`
- Validación con Zod en todas las entradas
- Tipos de TypeScript generados automáticamente
- **Hook `beforeChange`**: Siempre usa el usuario autenticado para prevenir suplantación

#### ✅ Validación:

- [x] TypeScript compila sin errores (`tsc --noEmit`)
- [x] Tipos de Payload generados correctamente
- [x] Colección registrada en `payload.config.ts`

**Entregable:** ✅ Owner puede elegir qué columnas ver en cada tabla.

---

### 🔄 Mejoras Post-Review (Febrero 2026)

**Cambios realizados tras revisión de código:**

#### 📁 Archivos Creados:

| Archivo                              | Descripción                                                        |
| ------------------------------------ | ------------------------------------------------------------------ |
| `src/lib/constants/table-columns.ts` | Constantes compartidas para columnas de tablas (evita duplicación) |

#### 📁 Archivos Modificados:

| Archivo                                             | Cambio                                                                      |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/collections/Settings.ts`                       | Importa constantes compartidas, hook `beforeChange` mejorado para seguridad |
| `src/app/services/settings.ts`                      | Manejo de condición de carrera en `getSettings`, usa constantes compartidas |
| `src/components/settings/schemas.ts`                | Schemas de Zod con tipos proper (eliminado `z.any()`), importa constantes   |
| `src/components/settings/table-columns-config.tsx`  | Importa constantes compartidas                                              |
| `src/components/settings/items-per-page-config.tsx` | Importa constantes compartidas                                              |
| `src/contexts/settings-context.tsx`                 | Importa tipo `TableName` desde constantes                                   |

#### 🔧 Mejoras Implementadas:

1. **Seguridad - Hook `beforeChange`**
   - Ahora siempre sobrescribe `user` con el usuario autenticado
   - Previene que usuarios malintencionados creen settings para otros usuarios

2. **Robustez - Condición de carrera**
   - `getSettings()` ahora maneja el caso donde dos peticiones simultáneas intentan crear settings
   - Si la creación falla por restricción única, reintenta la búsqueda

3. **Type Safety - Schemas de Zod**
   - Eliminado `z.any()` en `updateSettingsSchema`
   - Cada campo de columnas ahora valida contra sus valores específicos permitidos

4. **Mantenibilidad - Constantes compartidas**
   - Creado `src/lib/constants/table-columns.ts` con todas las constantes
   - Eliminada duplicación entre `Settings.ts` y `schemas.ts`
   - Tipos exportados: `TableName`, `ItemsPerPageOption`, etc.

---

## Fases Pendientes

- [ ] **Fase 1**: Productos
- [ ] **Fase 2**: Vendedores
- [ ] **Fase 3**: Clientes
- [ ] **Fase 4**: Asignaciones
- [ ] **Fase 5**: Ventas
- [ ] **Fase 6**: Historial
- [ ] **Fase 7**: Dashboard y Estadísticas

---

## 📁 Estructura de Colecciones

```
Collections (Payload):
├── Users          ✅ (existente)
├── Invitations    ✅ (existente)
├── Media          ✅ (existente)
├── Settings       ✅ (Fase 0 - COMPLETADO)
├── Products       🔲 (Fase 1)
├── Customers      🔲 (Fase 3)
├── Assignments    🔲 (Fase 4)
├── Sales          🔲 (Fase 5)
└── StockMovements 🔲 (Fase 6)
```

---

## 🚀 Cómo Usar

### Para mostrar solo columnas visibles en una tabla:

```typescript
import { useSettings } from '@/contexts/settings-context';

function ProductsTable() {
  const { getVisibleColumns, isColumnVisible } = useSettings();

  // Obtener array de columnas visibles
  const visibleColumns = getVisibleColumns('products');
  // Result: ['name', 'price', 'stock', ...]

  // Verificar si una columna específica debe mostrarse
  const showPrice = isColumnVisible('products', 'price');
  // Result: true/false

  return (/* render table */);
}
```

### Para obtener items por página:

```typescript
const { getItemsPerPage } = useSettings();
const pageSize = getItemsPerPage(); // 10, 25, 50 o 100
```

---

_Última actualización: Febrero 2026_
