# Stocker - Agent Instructions

## Project Overview

Sistema de gestión de inventario para vendedores ambulantes construido con Next.js 15, Payload CMS y PostgreSQL.

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

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **CMS/Backend**: Payload CMS 3.x
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Validation**: Zod 3
- **Auth**: Payload Auth con sesiones

## Project Structure

```
src/
  app/
    (frontend)/          # Rutas públicas y autenticadas del frontend
      (auth)/            # Login, register
      (main)/            # Dashboard, productos, etc.
    (payload)/           # Admin panel de Payload (no modificar)
  collections/           # Definiciones de colecciones Payload
  components/            # Componentes React
    ui/                  # shadcn/ui components
    layout/              # Layout components
    auth/                # Auth components
  lib/                   # Utilidades
  app/services/          # Servicios de datos
```

## Coding Conventions

### TypeScript

- Usar tipos estrictos, evitar `any`
- Preferir interfaces sobre types para objetos
- Usar `payload-types.ts` para tipos generados

### Components

- Componentes funcionales con TypeScript
- Props con interfaces nombradas `[Component]Props`
- Usar `'use client'` solo cuando sea necesario

### Data Fetching

- Server Components por defecto
- `next-safe-action` para Server Actions
- Servicios en `src/app/services/`

### Styling

- Tailwind CSS con variables CSS
- Usar clases de shadcn/ui
- Mobile-first approach

## Feature Flags

El proyecto usa feature flags en `.env`:

- FEATURE_PRODUCTS
- FEATURE_SELLERS
- FEATURE_ASSIGNMENTS
- FEATURE_HISTORY
- FEATURE_SALES
- FEATURE_STATISTICS
- FEATURE_SETTINGS

## User Roles

- `admin`: Acceso total, gestiona owners
- `owner`: Gestiona su negocio y sellers
- `seller`: Acceso limitado a sus asignaciones

## References

- See `docs/PLAN.md` for roadmap
- See `skills/` for technology-specific conventions
