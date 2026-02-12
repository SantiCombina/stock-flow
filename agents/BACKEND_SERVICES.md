# Backend Services Agent

> Specialized agent for creating data access services using Payload Local API

## Responsibilities

- Create service modules for data fetching and mutations
- Implement type-safe CRUD operations
- Handle authentication context
- Manage error handling
- Optimize queries and caching

---

## Methodology

### Service Layer Pattern

Services sit between Server Components/Actions and Payload CMS:

```
Server Component/Action → Service → Payload Local API → Database
```

**Benefits:**

- Type safety with generated types
- Reusable business logic
- Consistent error handling
- Easy to test and mock

---

## Service Template

```typescript
// src/app/services/[entity].ts
import { getPayload } from "@/lib/payload";
import type { Product } from "@/payload-types";

/**
 * Get all products for an owner
 */
export async function getProducts(ownerId: number): Promise<Product[]> {
  const payload = await getPayload();

  const { docs } = await payload.find({
    collection: "products",
    where: {
      owner: {
        equals: ownerId,
      },
    },
    sort: "-createdAt",
    limit: 1000,
  });

  return docs;
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: number): Promise<Product | null> {
  const payload = await getPayload();

  try {
    const product = await payload.findByID({
      collection: "products",
      id,
    });
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Create a new product
 */
export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<Product> {
  const payload = await getPayload();

  const product = await payload.create({
    collection: "products",
    data,
  });

  return product;
}

/**
 * Update a product
 */
export async function updateProduct(
  id: number,
  data: Partial<Product>,
): Promise<Product> {
  const payload = await getPayload();

  const product = await payload.update({
    collection: "products",
    id,
    data,
  });

  return product;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: number): Promise<void> {
  const payload = await getPayload();

  await payload.delete({
    collection: "products",
    id,
  });
}

/**
 * Search products by name
 */
export async function searchProducts(
  ownerId: number,
  query: string,
): Promise<Product[]> {
  const payload = await getPayload();

  const { docs } = await payload.find({
    collection: "products",
    where: {
      and: [
        {
          owner: {
            equals: ownerId,
          },
        },
        {
          name: {
            contains: query,
          },
        },
      ],
    },
    limit: 50,
  });

  return docs;
}

/**
 * Get products with low stock
 */
export async function getLowStockProducts(ownerId: number): Promise<Product[]> {
  const payload = await getPayload();

  const { docs } = await payload.find({
    collection: "products",
    where: {
      and: [
        {
          owner: {
            equals: ownerId,
          },
        },
        {
          or: [
            {
              stock: {
                less_than_equal: "minStock",
              },
            },
          ],
        },
      ],
    },
  });

  return docs;
}
```

---

## Query Patterns

### Basic Find

```typescript
const { docs, totalDocs, hasNextPage, hasPrevPage } = await payload.find({
  collection: "products",
  where: {
    owner: { equals: ownerId },
  },
  sort: "-createdAt", // Descending
  limit: 10,
  page: 1,
});
```

### Find by ID

```typescript
const product = await payload.findByID({
  collection: "products",
  id: 123,
});
```

### Find with Relationships (Depth)

```typescript
const sale = await payload.findByID({
  collection: "sales",
  id: 456,
  depth: 2, // Populate nested relationships
});
// sale.seller will be the full user object
// sale.customer will be the full customer object
```

### Complex Where Clauses

```typescript
// AND conditions
where: {
  and: [
    { owner: { equals: ownerId } },
    { isActive: { equals: true } },
    { stock: { greater_than: 0 } },
  ],
}

// OR conditions
where: {
  or: [
    { category: { equals: 'food' } },
    { category: { equals: 'treats' } },
  ],
}

// Nested conditions
where: {
  and: [
    { owner: { equals: ownerId } },
    {
      or: [
        { status: { equals: 'pending' } },
        { status: { equals: 'active' } },
      ],
    },
  ],
}

// Text search
where: {
  name: {
    like: 'dog', // Case-insensitive partial match
  },
}

// Date range
where: {
  createdAt: {
    greater_than_equal: startDate,
    less_than_equal: endDate,
  },
}
```

---

## Mutation Patterns

### Create

```typescript
const product = await payload.create({
  collection: "products",
  data: {
    name: "Dog Food",
    price: 29.99,
    stock: 100,
    unit: "kg",
    isActive: true,
    owner: ownerId,
  },
});
```

### Update

```typescript
const product = await payload.update({
  collection: "products",
  id: productId,
  data: {
    stock: 50, // Only update specific fields
  },
});
```

### Update Many

```typescript
const { docs } = await payload.update({
  collection: "products",
  where: {
    category: { equals: "discontinued" },
  },
  data: {
    isActive: false,
  },
});
```

### Delete

```typescript
await payload.delete({
  collection: "products",
  id: productId,
});
```

### Delete Many

```typescript
const { docs } = await payload.delete({
  collection: "products",
  where: {
    isActive: { equals: false },
  },
});
```

---

## Pagination Service

```typescript
interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

interface PaginatedResult<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getPaginatedProducts(
  ownerId: number,
  options: PaginationOptions = {},
): Promise<PaginatedResult<Product>> {
  const payload = await getPayload();

  const { page = 1, limit = 10, sort = "-createdAt" } = options;

  const result = await payload.find({
    collection: "products",
    where: {
      owner: { equals: ownerId },
    },
    page,
    limit,
    sort,
  });

  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    limit: result.limit,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}
```

---

## Filter Service

```typescript
interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
}

export async function getFilteredProducts(
  ownerId: number,
  filters: ProductFilters,
): Promise<Product[]> {
  const payload = await getPayload();

  const where: any = {
    and: [{ owner: { equals: ownerId } }],
  };

  if (filters.search) {
    where.and.push({
      name: { like: filters.search },
    });
  }

  if (filters.category) {
    where.and.push({
      category: { equals: filters.category },
    });
  }

  if (filters.minPrice !== undefined) {
    where.and.push({
      price: { greater_than_equal: filters.minPrice },
    });
  }

  if (filters.maxPrice !== undefined) {
    where.and.push({
      price: { less_than_equal: filters.maxPrice },
    });
  }

  if (filters.inStock) {
    where.and.push({
      stock: { greater_than: 0 },
    });
  }

  if (filters.isActive !== undefined) {
    where.and.push({
      isActive: { equals: filters.isActive },
    });
  }

  const { docs } = await payload.find({
    collection: "products",
    where,
    limit: 1000,
  });

  return docs;
}
```

---

## Statistics Service

```typescript
// src/app/services/statistics.ts

/**
 * Get product statistics for dashboard
 */
export async function getProductStats(ownerId: number) {
  const payload = await getPayload();

  const { docs: allProducts } = await payload.find({
    collection: "products",
    where: { owner: { equals: ownerId } },
    limit: 10000,
  });

  const totalProducts = allProducts.length;
  const activeProducts = allProducts.filter((p) => p.isActive).length;
  const lowStockProducts = allProducts.filter(
    (p) => p.minStock && p.stock <= p.minStock,
  ).length;
  const outOfStockProducts = allProducts.filter((p) => p.stock === 0).length;

  const totalValue = allProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

  return {
    totalProducts,
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    totalValue,
  };
}

/**
 * Get sales statistics
 */
export async function getSalesStats(
  ownerId: number,
  startDate: Date,
  endDate: Date,
) {
  const payload = await getPayload();

  const { docs: sales } = await payload.find({
    collection: "sales",
    where: {
      and: [
        { owner: { equals: ownerId } },
        { status: { equals: "completed" } },
        { createdAt: { greater_than_equal: startDate.toISOString() } },
        { createdAt: { less_than_equal: endDate.toISOString() } },
      ],
    },
    limit: 10000,
  });

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const averageTicket = totalRevenue / totalSales || 0;

  return {
    totalSales,
    totalRevenue,
    averageTicket,
  };
}
```

---

## Error Handling

```typescript
/**
 * Safe wrapper for service calls
 */
export async function getProductSafe(
  id: number,
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const product = await getProductById(id);
    return { data: product, error: null };
  } catch (error) {
    console.error("Error in getProductSafe:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Service with validation
 */
export async function createProductWithValidation(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<{ product: Product | null; error: string | null }> {
  try {
    // Validate business rules
    if (data.cost && data.cost >= data.price) {
      return { product: null, error: "Cost must be less than price" };
    }

    if (data.minStock && data.minStock > data.stock) {
      return { product: null, error: "Min stock cannot exceed current stock" };
    }

    const product = await createProduct(data);
    return { product, error: null };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      product: null,
      error:
        error instanceof Error ? error.message : "Failed to create product",
    };
  }
}
```

---

## Transaction Patterns

For operations that need to be atomic (all succeed or all fail):

```typescript
/**
 * Create assignment and update product stock atomically
 */
export async function createAssignmentWithStockUpdate(
  assignmentData: CreateAssignmentData,
): Promise<{ assignment: Assignment | null; error: string | null }> {
  const payload = await getPayload();

  try {
    // 1. Check if all products have enough stock
    for (const item of assignmentData.items) {
      const product = await payload.findByID({
        collection: "products",
        id: item.product,
      });

      if (product.stock < item.quantity) {
        return {
          assignment: null,
          error: `Insufficient stock for ${product.name}`,
        };
      }
    }

    // 2. Create assignment
    const assignment = await payload.create({
      collection: "assignments",
      data: assignmentData,
    });

    // 3. Update stock for all products
    for (const item of assignmentData.items) {
      const product = await payload.findByID({
        collection: "products",
        id: item.product,
      });

      await payload.update({
        collection: "products",
        id: item.product,
        data: {
          stock: product.stock - item.quantity,
        },
      });
    }

    return { assignment, error: null };
  } catch (error) {
    console.error("Error creating assignment:", error);
    return {
      assignment: null,
      error:
        error instanceof Error ? error.message : "Failed to create assignment",
    };
  }
}
```

---

## Type Safety

```typescript
import type { Product, User, Sale } from "@/payload-types";

// Use generated types everywhere
export async function getProductsTyped(ownerId: number): Promise<Product[]> {
  // Return type is enforced
}

// Use Partial for updates
export async function updateProductTyped(
  id: number,
  data: Partial<Product>,
): Promise<Product> {
  // Can only update fields that exist on Product
}

// Use Omit for creates (exclude auto-generated fields)
export async function createProductTyped(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<Product> {
  // Cannot pass id, createdAt, or updatedAt
}
```

---

## Caching Considerations

Services run on the server and benefit from Next.js caching:

```typescript
import { unstable_cache } from "next/cache";

// Cache expensive queries
export const getCachedProducts = unstable_cache(
  async (ownerId: number) => getProducts(ownerId),
  ["products"],
  {
    revalidate: 3600, // 1 hour
    tags: ["products"],
  },
);

// Revalidate in mutations
export async function createProduct(data: CreateProductData) {
  const product = await payload.create({ collection: "products", data });
  revalidateTag("products");
  return product;
}
```

---

## Service Organization

```
src/app/services/
├── users.ts          # User management
├── invitations.ts    # User invitations
├── products.ts       # Product CRUD
├── customers.ts      # Customer CRUD
├── sellers.ts        # Seller management
├── assignments.ts    # Assignment CRUD + stock logic
├── sales.ts          # Sales CRUD + stock logic
├── stock-movements.ts # Stock history
└── statistics.ts     # Aggregated data for dashboards
```

---

## Testing

```typescript
import { describe, it, expect, vi } from "vitest";
import { getProducts, createProduct } from "./products";

// Mock Payload
vi.mock("@/lib/payload", () => ({
  getPayload: vi.fn(() => ({
    find: vi.fn(),
    create: vi.fn(),
  })),
}));

describe("Product Services", () => {
  it("fetches products for owner", async () => {
    const products = await getProducts(1);
    expect(Array.isArray(products)).toBe(true);
  });

  it("creates a product", async () => {
    const product = await createProduct({
      name: "Test Product",
      price: 10,
      stock: 5,
      unit: "unit",
      isActive: true,
      owner: 1,
    });

    expect(product).toHaveProperty("id");
    expect(product.name).toBe("Test Product");
  });
});
```

---

## Checklist

Before marking a service module as complete:

- [ ] All CRUD operations implemented
- [ ] Type-safe with generated Payload types
- [ ] Error handling implemented
- [ ] Business logic validated
- [ ] JSDoc comments for all public functions
- [ ] Consistent naming (get*, create*, update*, delete*)
- [ ] No hardcoded values (use constants)
- [ ] Tested manually or with unit tests

---

## References

- Project agent instructions: `/AGENTS.md`
- Payload skill documentation: `/skills/payload/AGENTS.md`
- Next.js skill documentation: `/skills/nextjs-15/SKILL.md`
- Existing services: `/src/app/services/`
