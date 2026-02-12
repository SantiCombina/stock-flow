# Next.js 15 Development Guidelines

> App Router, Server Components, Server Actions, and modern patterns

## Core Principles

1. **Server-First**: Default to Server Components, use Client Components only when necessary
2. **Type-Safety**: Full TypeScript coverage with strict mode
3. **Performance**: Optimize images, implement streaming, use React Suspense
4. **Data Fetching**: Prefer native fetch with caching strategies
5. **DRY**: Never hardcode values, use constants and environment variables

---

## Project Structure

```
src/app/
├── (frontend)/              # Public routes group
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   ├── (auth)/             # Auth routes group
│   │   ├── layout.tsx      # Auth layout
│   │   ├── login/
│   │   └── register/
│   └── (main)/             # Protected routes group
│       ├── layout.tsx      # Main app layout
│       ├── page.tsx        # Dashboard
│       └── [feature]/      # Feature routes
├── api/                     # API routes (avoid when using Payload)
└── services/                # Backend services
```

---

## App Router Best Practices

### Route Groups

Use parentheses for organizational routes without affecting URL structure:

```typescript
// src/app/(frontend)/(auth)/login/page.tsx
export default function LoginPage() {
  return <LoginForm />
}

// URL: /login (not /frontend/auth/login)
```

### Layouts

Layouts persist across navigation and don't re-render:

```typescript
// src/app/(frontend)/(main)/layout.tsx
import { AppLayout } from '@/components/layout/app-layout'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch data here - runs on server
  const user = await getCurrentUser()

  return <AppLayout user={user}>{children}</AppLayout>
}
```

### Loading States

Use `loading.tsx` for automatic loading UI:

```typescript
// src/app/(frontend)/(main)/products/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

### Error Boundaries

Use `error.tsx` for automatic error handling:

```typescript
// src/app/(frontend)/(main)/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Server Components (Default)

### ✅ Use for:

- Data fetching
- Accessing backend resources
- Sensitive information (API keys, tokens)
- Large dependencies

### Example:

```typescript
// src/app/(frontend)/(main)/products/page.tsx
import { getAllProducts } from '@/app/services/products'
import { ProductsTable } from '@/components/products/products-table'

export default async function ProductsPage() {
  // Fetch data directly in Server Component
  const products = await getAllProducts()

  return (
    <div>
      <h1>Products</h1>
      <ProductsTable data={products} />
    </div>
  )
}
```

---

## Client Components

### ✅ Use for:

- Event listeners (onClick, onChange, etc.)
- State hooks (useState, useReducer, etc.)
- Effect hooks (useEffect, useLayoutEffect)
- Browser-only APIs (localStorage, geolocation)
- Custom hooks

### 🚨 Rules:

1. Add `'use client'` at the TOP of the file
2. Keep them small and focused
3. Don't fetch data in Client Components (use Server Actions instead)

### Example:

```typescript
// src/components/products/product-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductAction } from './actions'

export function ProductForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(productSchema),
  })

  async function onSubmit(data: ProductFormData) {
    setIsLoading(true)
    const result = await createProductAction(data)
    setIsLoading(false)
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

---

## Data Fetching Patterns

### 1. Server Component (Preferred)

```typescript
// Automatic caching, runs on server
export default async function Page() {
  const data = await fetch('...', {
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  return <div>{data}</div>
}
```

### 2. Server Action

```typescript
// src/components/products/actions.ts
"use server";

import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

export const createProductAction = actionClient
  .schema(productSchema)
  .action(async ({ parsedInput }) => {
    const product = await createProduct(parsedInput);
    revalidatePath("/products");
    return product;
  });
```

### 3. Route Handler (Only if needed)

```typescript
// src/app/api/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // Process webhook
  return Response.json({ success: true });
}
```

---

## Server Actions Best Practices

### Always use next-safe-action

```typescript
// src/lib/safe-action.ts
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e);
    return "An error occurred";
  },
});
```

### Pattern for all actions:

```typescript
// src/components/[feature]/actions.ts
"use server";

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().min(1),
});

export const createAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    // Use service layer
    const result = await service.create(parsedInput);

    // Revalidate affected paths
    revalidatePath("/path");

    return result;
  });
```

---

## Caching Strategies

### Fetch API

```typescript
// Cache for 1 hour
fetch("...", { next: { revalidate: 3600 } });

// No cache
fetch("...", { cache: "no-store" });

// Default: cache forever
fetch("...");
```

### Manual Revalidation

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// Revalidate specific path
revalidatePath("/products");

// Revalidate all paths with tag
revalidateTag("products");
```

### Unstable_cache (for non-fetch calls)

```typescript
import { unstable_cache } from "next/cache";

const getCachedProducts = unstable_cache(
  async () => getProducts(),
  ["products"],
  { revalidate: 3600, tags: ["products"] },
);
```

---

## Environment Variables

### Pattern:

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PAYLOAD_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
```

### Usage:

```typescript
import { env } from "@/lib/env";

// ✅ Type-safe, validated
const url = env.DATABASE_URL;

// ❌ Never access directly
const url = process.env.DATABASE_URL;
```

---

## Metadata & SEO

### Static Metadata

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - Stocker",
  description: "Manage your product inventory",
};
```

### Dynamic Metadata

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    title: `${product.name} - Stocker`,
    description: product.description,
  };
}
```

---

## Streaming & Suspense

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<StatsLoading />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<ChartLoading />}>
        <Chart />
      </Suspense>
    </div>
  )
}

// Stats is an async Server Component
async function Stats() {
  const data = await getStats()
  return <StatsCard data={data} />
}
```

---

## Image Optimization

```typescript
import Image from 'next/image'

// ✅ Always use Next Image
<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}
  priority // For above-the-fold images
  placeholder="blur" // Optional blur while loading
/>

// ❌ Never use <img>
<img src="/product.jpg" alt="Product" />
```

---

## Navigation

```typescript
// Client Component
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function navigate() {
    router.push('/products')
    router.replace('/products') // Without history
    router.refresh() // Reload current route
  }
}

// Server Component - use Link
import Link from 'next/link'

<Link href="/products" prefetch={true}>
  Products
</Link>
```

---

## Middleware

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check auth, redirect, rewrite, etc.
  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Performance Optimization

### 1. Route Segments Config

```typescript
// Force dynamic rendering
export const dynamic = "force-dynamic";

// Force static rendering
export const dynamic = "force-static";

// Revalidate every hour
export const revalidate = 3600;
```

### 2. Parallel Route Loading

```typescript
// Load multiple data sources in parallel
export default async function Page() {
  const [products, categories, stats] = await Promise.all([
    getProducts(),
    getCategories(),
    getStats(),
  ])

  return <Dashboard data={{ products, categories, stats }} />
}
```

### 3. Partial Prerendering (Experimental)

```typescript
// next.config.mjs
export default {
  experimental: {
    ppr: true,
  },
};
```

---

## Common Anti-Patterns

### ❌ Don't:

```typescript
// Using useEffect for data fetching
"use client";
useEffect(() => {
  fetch("/api/products").then(setProducts);
}, []);

// Mixing Server/Client logic
("use client");
const products = await getProducts(); // Error!

// Not revalidating after mutations
await createProduct(data);
// Missing: revalidatePath('/products')
```

### ✅ Do:

```typescript
// Server Component for data
async function ProductsList() {
  const products = await getProducts()
  return <Table data={products} />
}

// Client Component for interactions
'use client'
function TableInteractions() {
  async function handleCreate() {
    await createProductAction(data)
    // Revalidation handled in action
  }
}
```

---

## Testing

```typescript
// Use React Testing Library
import { render, screen } from '@testing-library/react'

test('renders product name', () => {
  render(<ProductCard product={mockProduct} />)
  expect(screen.getByText('Product Name')).toBeInTheDocument()
})
```

---

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [App Router Patterns](https://nextjs.org/docs/app/building-your-application)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Caching](https://nextjs.org/docs/app/building-your-application/caching)
