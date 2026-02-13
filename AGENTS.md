# Stocker - Agent Instructions

## Project Overview

Stocker es un sistema de gestión de inventario y ventas para distribuidoras, diseñado para reemplazar hojas de Excel desordenadas por una plataforma moderna donde los owners puedan gestionar su inventario, vendedores y ventas en tiempo real.

**Visión futura**: SaaS multi-tenant donde cada owner gestiona su propio negocio.

---

## Technology Stack

| Tecnología       | Versión | Uso                              |
| ---------------- | ------- | -------------------------------- |
| Next.js          | 15.x    | Framework principal (App Router) |
| Payload CMS      | 3.75.x  | Backend, Auth, Admin Panel       |
| PostgreSQL       | -       | Base de datos (Neon.tech)        |
| Tailwind CSS     | 4.x     | Estilos                          |
| shadcn/ui        | -       | Componentes UI                   |
| Zod              | 3.x     | Validación                       |
| next-safe-action | 8.x     | Server Actions tipados           |
| React Hook Form  | 7.x     | Formularios                      |
| Resend           | -       | Envío de emails                  |
| UploadThing      | -       | Almacenamiento de archivos       |

---

## Project Structure

```
src/
├── app/
│   ├── (frontend)/              # Rutas del frontend
│   │   ├── (auth)/              # Login, registro
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/              # Rutas protegidas
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── products/page.tsx
│   │   │   ├── sellers/page.tsx
│   │   │   ├── assignments/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── sales/page.tsx
│   │   │   ├── statistics/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css          # Tailwind + variables CSS
│   ├── (payload)/               # Admin panel de Payload (no modificar)
│   └── services/                # Servicios de datos
│       ├── settings.ts
│       ├── users.ts
│       └── invitations.ts
├── collections/                 # Definiciones de colecciones Payload
│   ├── Users.ts
│   ├── Invitations.ts
│   ├── Media.ts
│   ├── Products.ts
│   ├── Brands.ts
│   ├── Categories.ts
│   ├── Qualities.ts
│   ├── Presentations.ts
│   ├── ProductVariants.ts
│   ├── ProductCustomFields.ts
│   ├── Clients.ts
│   └── Settings.ts
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # AppLayout, Sidebar, PageHeader
│   ├── auth/                    # LoginForm, RegisterForm
│   ├── settings/                # Configuración de columnas
│   └── providers/               # UserProvider
├── contexts/
│   └── settings-context.tsx     # Contexto de configuración
├── lib/
│   ├── features.ts              # Feature flags
│   ├── payload.ts               # Cliente Payload
│   ├── safe-action.ts           # Cliente next-safe-action
│   ├── utils.ts                 # Utilidades (cn, etc.)
│   └── constants/
│       └── table-columns.ts     # Configuración de columnas
├── hooks/
│   └── use-mobile.ts            # Hook para mobile
├── payload.config.ts            # Configuración de Payload
├── payload-types.ts             # Tipos generados automáticamente
└── middleware.ts                # Protección de rutas y feature flags
```

---

## Build and Development Commands

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo
pnpm devsafe          # Limpia .next y reinicia

# Build
pnpm build            # Build de producción
pnpm start            # Inicia servidor de producción

# Linting
pnpm lint             # Ejecuta ESLint
pnpm lint:fix         # Corrige errores automáticamente

# Payload
pnpm generate:types   # Genera tipos de Payload (IMPORTANTE después de cambios en colecciones)
pnpm generate:importmap  # Regenera import map
pnpm payload          # CLI de Payload
```

**Nota**: Después de modificar cualquier colección en Payload, SIEMPRE ejecutar `pnpm generate:types` para actualizar los tipos en `src/payload-types.ts`.

---

## User Roles and Permissions

| Rol      | Permisos                                                                    |
| -------- | --------------------------------------------------------------------------- |
| `admin`  | Acceso total. Gestiona owners. Solo desarrolladores.                        |
| `owner`  | Gestiona SU negocio: productos, vendedores, asignaciones, clientes, ventas. |
| `seller` | Registra ventas y clientes. Ve solo sus asignaciones.                       |

### Access Control Pattern

Todas las colecciones deben filtrar por owner:

```typescript
access: {
  read: ({ req: { user } }) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'owner') {
      return { owner: { equals: user.id } };
    }
    if (user?.role === 'seller') {
      return { owner: { equals: user.owner } };
    }
    return false;
  },
}
```

---

## Feature Flags

El proyecto usa feature flags en `.env` para habilitar/deshabilitar funcionalidades:

```env
FEATURE_PRODUCTS=true
FEATURE_SELLERS=true
FEATURE_ASSIGNMENTS=true
FEATURE_HISTORY=true
FEATURE_SALES=true
FEATURE_STATISTICS=true
FEATURE_SETTINGS=true
```

Las rutas protegidas por feature flags se definen en `src/middleware.ts`.

---

## Coding Conventions

### TypeScript

- Usar tipos estrictos, evitar `any` (eslint: `@typescript-eslint/no-explicit-any: error`)
- Preferir interfaces sobre types para objetos
- Usar `src/payload-types.ts` para tipos generados
- No usar `console.log` en producción (permitido en desarrollo)

### Components

- **Server Components por defecto** - Solo usar `'use client'` cuando sea necesario
- Usar `'use client'` para: event listeners, state hooks, effects, browser APIs
- Props con interfaces nombradas `[Component]Props`
- Usar shadcn/ui para componentes base

### Server Actions

SIEMPRE usar `next-safe-action`:

```typescript
'use server';

import { actionClient } from '@/lib/safe-action';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
});

export const createAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    // Lógica aquí
    return result;
  });
```

### Data Fetching

- **Server Components**: Fetch directo usando servicios
- **Mutaciones**: Server Actions con revalidación
- **No usar** useEffect para data fetching

### Services Pattern

```typescript
// src/app/services/[entity].ts
export async function getAll(ownerId: number) {}
export async function getById(id: number) {}
export async function create(data: CreateData) {}
export async function update(id: number, data: UpdateData) {}
export async function remove(id: number) {}
```

### Styling

- Tailwind CSS con variables CSS
- Colores definidos en `src/app/(frontend)/globals.css`
- Mobile-first approach
- Usar clase `cn()` de `@/lib/utils` para condicionales

---

## Security Considerations

### CRÍTICO: Local API Access Control

```typescript
// ❌ BUG DE SEGURIDAD: Bypass de access control
await payload.find({
  collection: 'posts',
  user: someUser,
});

// ✅ SEGURO: Aplica permisos del usuario
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // REQUERIDO
});
```

### Transaction Safety en Hooks

```typescript
// ❌ RIESGO: Transacción separada
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        // Falta req - corre en transacción separada!
      });
    },
  ],
}

// ✅ ATÓMICO: Misma transacción
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Mantiene atomicidad
      });
    },
  ],
}
```

### Authentication

- El middleware (`src/middleware.ts`) protege rutas basado en cookie `payload-token`
- Rutas públicas: `/login`, `/register`
- Payload Auth con sesiones HTTP-only

---

## ⚠️ METODOLOGÍA OBLIGATORIA

**NUNCA implementar código sin consultar primero cuando:**

- Vayas a crear o modificar una colección de Payload
- Necesites definir estructura de datos
- Tengas que decidir validaciones o reglas de negocio
- Debas configurar access control

**Proceso obligatorio:**

1. **Proponer** la estructura basada en `docs/PLAN.md`
2. **Preguntar** al usuario sobre campos, tipos, validaciones
3. **Esperar confirmación** explícita
4. **Solo entonces** proceder a implementar

Las estructuras en `docs/PLAN.md` son **propuestas iniciales**, NO instrucciones finales.

---

## Collections Reference

### Users
- Autenticación con Payload Auth
- Roles: admin, owner, seller
- Relación owner-seller para vendedores

### Products
- Catálogo de productos
- Relaciones: Brand, Category, Quality
- Código único (SKU)

### Settings
- Configuración por usuario
- Columnas visibles por tabla
- Elementos por página

### Invitations
- Sistema de invitaciones por email
- Tokens de un solo uso
- Integración con Resend

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Payload
PAYLOAD_SECRET=...

# Email (Resend)
RESEND_API_KEY=...
EMAIL_FROM=...

# File Storage (UploadThing)
UPLOADTHING_TOKEN=...

# App
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Feature Flags
FEATURE_PRODUCTS=true
FEATURE_SELLERS=true
...
```

---

## Path Aliases

```typescript
// tsconfig.json paths
"@/*": ["./src/*"]
"@payload-config": ["./src/payload.config.ts"]

// Ejemplos de uso
import { Button } from '@/components/ui/button';
import { getSettings } from '@/app/services/settings';
import config from '@payload-config';
```

---

## References

- `docs/PLAN.md` - Roadmap y plan de desarrollo
- `skills/nextjs-15/SKILL.md` - Guía de Next.js 15
- `skills/payload/AGENTS.md` - Guía de Payload CMS
- `skills/tailwind-4/SKILL.md` - Guía de Tailwind CSS 4
- `skills/zod-3/SKILL.md` - Guía de Zod
- `skills/react-19/SKILL.md` - Guía de React 19
