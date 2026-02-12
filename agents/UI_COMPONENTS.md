# UI Components Agent

> Specialized agent for creating React components with Tailwind CSS and shadcn/ui

## Responsibilities

- Create reusable UI components
- Implement responsive designs
- Ensure accessibility (WCAG)
- Integrate with shadcn/ui library
- Apply consistent styling with Tailwind
- Manage component state and interactions

---

## Component Architecture

```
src/components/
├── ui/                    # shadcn/ui base components (don't modify)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── layout/                # Layout components
│   ├── app-layout.tsx
│   ├── app-sidebar.tsx
│   └── page-header.tsx
├── [feature]/             # Feature-specific components
│   ├── [feature]-section.tsx    # Main section component
│   ├── [feature]-table.tsx      # Data table
│   ├── [feature]-form.tsx       # Form component
│   ├── [feature]-card.tsx       # Card component
│   └── actions.ts               # Server actions
└── shared/                # Shared components across features
    ├── data-table.tsx
    ├── search-input.tsx
    └── empty-state.tsx
```

---

## Component Types

### 1. Server Components (Default)

For static content and data fetching:

```typescript
// src/components/products/products-section.tsx
import { getProducts } from '@/app/services/products'
import { ProductsTable } from './products-table'
import { ProductsHeader } from './products-header'

export async function ProductsSection({ ownerId }: { ownerId: number }) {
  // Fetch data on server
  const products = await getProducts(ownerId)

  return (
    <div className="space-y-6">
      <ProductsHeader />
      <ProductsTable data={products} />
    </div>
  )
}
```

### 2. Client Components

For interactive elements:

```typescript
// src/components/products/product-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createProductAction } from './actions'
import { productSchema, type ProductFormData } from './schemas'

export function ProductForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      unit: 'unit',
      isActive: true,
    },
  })

  async function onSubmit(data: ProductFormData) {
    setIsSubmitting(true)
    try {
      const result = await createProductAction(data)
      if (result?.serverError) {
        form.setError('root', { message: result.serverError })
      } else {
        form.reset()
        // Show success toast
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Product Name
        </label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Enter product name"
          disabled={isSubmitting}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Price
          </label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="stock" className="text-sm font-medium">
            Stock
          </label>
          <Input
            id="stock"
            type="number"
            {...form.register('stock', { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {form.formState.errors.stock && (
            <p className="text-sm text-destructive">
              {form.formState.errors.stock.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating...' : 'Create Product'}
      </Button>

      {form.formState.errors.root && (
        <p className="text-sm text-destructive text-center">
          {form.formState.errors.root.message}
        </p>
      )}
    </form>
  )
}
```

---

## Data Table Pattern

Generic reusable data table:

```typescript
// src/components/shared/data-table.tsx
'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: string) {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedData = sortColumn
    ? [...data].sort((a, b) => {
        const aVal = a[sortColumn as keyof T]
        const bVal = b[sortColumn as keyof T]
        const direction = sortDirection === 'asc' ? 1 : -1

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * direction
        }

        return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * direction
      })
    : data

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(String(column.key))}
                    className="h-8 px-2 lg:px-3"
                  >
                    {column.label}
                    {sortColumn === column.key && (
                      <span className="ml-2">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
            >
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

Usage:

```typescript
// src/components/products/products-table.tsx
'use client'

import { DataTable } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/payload-types'

interface ProductsTableProps {
  data: Product[]
}

export function ProductsTable({ data }: ProductsTableProps) {
  return (
    <DataTable
      data={data}
      columns={[
        {
          key: 'name',
          label: 'Name',
          sortable: true,
        },
        {
          key: 'sku',
          label: 'SKU',
        },
        {
          key: 'price',
          label: 'Price',
          sortable: true,
          render: (product) => `$${product.price.toFixed(2)}`,
        },
        {
          key: 'stock',
          label: 'Stock',
          sortable: true,
          render: (product) => (
            <span
              className={
                product.stock === 0
                  ? 'text-destructive'
                  : product.minStock && product.stock <= product.minStock
                  ? 'text-amber-600'
                  : ''
              }
            >
              {product.stock} {product.unit}
            </span>
          ),
        },
        {
          key: 'isActive',
          label: 'Status',
          render: (product) => (
            <Badge variant={product.isActive ? 'default' : 'secondary'}>
              {product.isActive ? 'Active' : 'Inactive'}
            </Badge>
          ),
        },
      ]}
      emptyMessage="No products found"
    />
  )
}
```

---

## Dialog/Modal Pattern

```typescript
// src/components/products/product-dialog.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ProductForm } from './product-form'

export function ProductDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>
        <ProductForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
```

---

## Card Pattern

```typescript
// src/components/dashboard/stat-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div
            className={`text-xs mt-2 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Search Input Pattern

```typescript
// src/components/shared/search-input.tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchInput({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchInputProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query)
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [query, onSearch, debounceMs])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  )
}
```

---

## Empty State Pattern

```typescript
// src/components/shared/empty-state.tsx
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

---

## Loading State Pattern

```typescript
// src/components/shared/loading-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-24" />
    </div>
  )
}
```

---

## Responsive Design

```typescript
// Mobile-first approach
export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Cards */}
    </div>
  )
}

// Conditional rendering for mobile
export function ResponsiveHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Title</h1>
      <div className="flex gap-2">
        <Button size="sm" className="md:size-default">
          Action
        </Button>
      </div>
    </div>
  )
}
```

---

## Accessibility

```typescript
// Always include labels
<label htmlFor="name" className="sr-only">
  Product Name
</label>
<Input id="name" placeholder="Product Name" />

// Use semantic HTML
<main>
  <header>
    <h1>Page Title</h1>
  </header>
  <section>
    {/* Content */}
  </section>
</main>

// Keyboard navigation
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Delete product"
>
  <Trash2 className="h-4 w-4" />
</button>

// Focus states (Tailwind handles most of this)
<Button className="focus-visible:ring-2 focus-visible:ring-ring">
  Click me
</Button>
```

---

## Component Composition

```typescript
// Build complex UIs from simple components

// Base components (shadcn/ui)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Shared components
import { DataTable } from '@/components/shared/data-table'
import { SearchInput } from '@/components/shared/search-input'

// Feature components
import { ProductForm } from '@/components/products/product-form'
import { ProductCard } from '@/components/products/product-card'

// Page component (Server Component)
export async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <ProductsHeader />
      <ProductsFilters />
      <ProductsGrid products={products} />
    </div>
  )
}
```

---

## Styling Guidelines

### ✅ Do:

```tsx
// Use Tailwind utilities
<div className="flex items-center gap-4 p-6 rounded-lg border bg-card">

// Use semantic colors
<Button className="bg-primary text-primary-foreground">

// Use spacing scale consistently
<div className="space-y-4">  {/* 16px */}
<div className="space-y-6">  {/* 24px */}

// Responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### ❌ Don't:

```tsx
// Don't use inline styles
<div style={{ padding: '24px', margin: '16px' }}>

// Don't use arbitrary values everywhere
<div className="p-[23px] mt-[17px]">

// Don't mix hardcoded colors
<div className="bg-blue-500"> {/* Use bg-primary instead */}
```

---

## Checklist

Before marking a component as complete:

- [ ] TypeScript props interface defined
- [ ] Proper Server/Client Component designation
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility attributes (labels, aria-\*, roles)
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] Error states handled
- [ ] Semantic HTML used
- [ ] Tailwind CSS used (no inline styles)
- [ ] shadcn/ui components used where appropriate
- [ ] No hardcoded values (use constants)
- [ ] Component is focused and reusable

---

## References

- React skill: `/skills/react-19/SKILL.md`
- Tailwind skill: `/skills/tailwind-4/SKILL.md`
- Next.js skill: `/skills/nextjs-15/SKILL.md`
- shadcn/ui components: `/src/components/ui/`
- Existing components: `/src/components/`
