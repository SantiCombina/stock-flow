# Server Actions Agent

> Specialized agent for creating type-safe Server Actions with next-safe-action and Zod

## Responsibilities

- Create server actions for form submissions and mutations
- Implement Zod validation schemas
- Handle error cases gracefully
- Revalidate Next.js cache after mutations
- Provide type-safe interfaces for client components

---

## Architecture

```
Client Component → Server Action → Zod Validation → Service Layer → Payload API → Database
       ↓                                                    ↓
   UI Updates  ←────────────── Revalidation ←────────────────┘
```

---

## File Structure

```
src/components/[feature]/
├── [feature]-form.tsx    # Client component using the action
├── actions.ts            # Server actions
└── schemas.ts            # Zod schemas
```

---

## Setup (Already Done)

```typescript
// src/lib/safe-action.ts
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e);

    if (e instanceof Error) {
      return e.message;
    }

    return "An unexpected error occurred";
  },
});
```

---

## Schema Pattern

```typescript
// src/components/products/schemas.ts
import { z } from "zod";

/**
 * Schema for creating a product
 */
export const createProductSchema = z
  .object({
    name: z
      .string()
      .min(1, "Product name is required")
      .max(100, "Product name must be less than 100 characters")
      .trim(),

    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),

    sku: z
      .string()
      .toUpperCase()
      .regex(
        /^[A-Z0-9-]+$/,
        "SKU must contain only letters, numbers, and hyphens",
      )
      .optional(),

    category: z.string().max(50).optional(),

    price: z
      .number()
      .positive("Price must be greater than 0")
      .multipleOf(0.01, "Price must have at most 2 decimal places")
      .max(999999.99, "Price is too high"),

    cost: z
      .number()
      .positive("Cost must be greater than 0")
      .multipleOf(0.01)
      .optional(),

    stock: z
      .number()
      .int("Stock must be a whole number")
      .nonnegative("Stock cannot be negative"),

    minStock: z
      .number()
      .int("Minimum stock must be a whole number")
      .nonnegative("Minimum stock cannot be negative")
      .optional(),

    unit: z.enum(["unit", "kg", "liter", "box"], {
      errorMap: () => ({ message: "Please select a valid unit" }),
    }),

    isActive: z.boolean().default(true),

    image: z.number().positive().optional(),
  })
  .refine((data) => !data.cost || data.cost < data.price, {
    message: "Cost must be less than price",
    path: ["cost"],
  })
  .refine((data) => !data.minStock || data.minStock <= data.stock, {
    message: "Minimum stock cannot exceed current stock",
    path: ["minStock"],
  });

/**
 * Schema for updating a product
 */
export const updateProductSchema = createProductSchema
  .partial()
  .extend({
    id: z.number().positive(),
  })
  .required({ id: true });

/**
 * Schema for deleting a product
 */
export const deleteProductSchema = z.object({
  id: z.number().positive(),
});

/**
 * Infer TypeScript types from schemas
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
```

---

## Action Pattern

```typescript
// src/components/products/actions.ts
"use server";

import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from "./schemas";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/services/products";
import { getCurrentUser } from "@/app/services/users";

/**
 * Create a new product
 */
export const createProductAction = actionClient
  .schema(createProductSchema)
  .action(async ({ parsedInput }) => {
    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (user.role !== "owner" && user.role !== "admin") {
      throw new Error("Only owners can create products");
    }

    // Determine owner ID
    const ownerId = user.role === "owner" ? user.id : user.owner;

    // Create product via service
    const product = await createProduct({
      ...parsedInput,
      owner: ownerId,
    });

    // Revalidate products page
    revalidatePath("/products");

    return {
      success: true,
      product,
    };
  });

/**
 * Update an existing product
 */
export const updateProductAction = actionClient
  .schema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;

    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Update product
    const product = await updateProduct(id, data);

    // Revalidate affected paths
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);

    return {
      success: true,
      product,
    };
  });

/**
 * Delete a product
 */
export const deleteProductAction = actionClient
  .schema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (user.role !== "owner" && user.role !== "admin") {
      throw new Error("Only owners can delete products");
    }

    // Delete product
    await deleteProduct(parsedInput.id);

    // Revalidate and redirect
    revalidatePath("/products");
    redirect("/products");
  });

/**
 * Toggle product active status
 */
export const toggleProductActiveAction = actionClient
  .schema(
    z.object({
      id: z.number().positive(),
      isActive: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, isActive } = parsedInput;

    const product = await updateProduct(id, { isActive });

    revalidatePath("/products");

    return {
      success: true,
      product,
    };
  });
```

---

## Client Component Integration

```typescript
// src/components/products/product-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createProductAction } from './actions'
import { createProductSchema, type CreateProductInput } from './schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductFormProps {
  onSuccess?: () => void
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      category: '',
      price: 0,
      cost: undefined,
      stock: 0,
      minStock: undefined,
      unit: 'unit',
      isActive: true,
    },
  })

  async function onSubmit(data: CreateProductInput) {
    const result = await createProductAction(data)

    if (result?.serverError) {
      // Show error toast
      toast.error(result.serverError)
      return
    }

    if (result?.data?.success) {
      // Show success toast
      toast.success('Product created successfully')

      // Reset form
      form.reset()

      // Call success callback
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Product Name *
        </label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Dog Food Premium"
          disabled={form.formState.isSubmitting}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          {...form.register('description')}
          placeholder="Optional product description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={form.formState.isSubmitting}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* SKU and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="sku" className="text-sm font-medium">
            SKU
          </label>
          <Input
            id="sku"
            {...form.register('sku')}
            placeholder="DOG-FOOD-001"
            disabled={form.formState.isSubmitting}
          />
          {form.formState.errors.sku && (
            <p className="text-sm text-destructive">
              {form.formState.errors.sku.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Input
            id="category"
            {...form.register('category')}
            placeholder="Food"
            disabled={form.formState.isSubmitting}
          />
          {form.formState.errors.category && (
            <p className="text-sm text-destructive">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* Price and Cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Price *
          </label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
            disabled={form.formState.isSubmitting}
          />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="cost" className="text-sm font-medium">
            Cost
          </label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            {...form.register('cost', { valueAsNumber: true })}
            disabled={form.formState.isSubmitting}
          />
          {form.formState.errors.cost && (
            <p className="text-sm text-destructive">
              {form.formState.errors.cost.message}
            </p>
          )}
        </div>
      </div>

      {/* Stock, Min Stock, Unit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="stock" className="text-sm font-medium">
            Stock *
          </label>
          <Input
            id="stock"
            type="number"
            {...form.register('stock', { valueAsNumber: true })}
            disabled={form.formState.isSubmitting}
          />
          {form.formState.errors.stock && (
            <p className="text-sm text-destructive">
              {form.formState.errors.stock.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="minStock" className="text-sm font-medium">
            Min Stock
          </label>
          <Input
            id="minStock"
            type="number"
            {...form.register('minStock', { valueAsNumber: true })}
            disabled={form.formState.isSubmitting}
          />
          {form.formState.errors.minStock && (
            <p className="text-sm text-destructive">
              {form.formState.errors.minStock.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="unit" className="text-sm font-medium">
            Unit *
          </label>
          <Select
            value={form.watch('unit')}
            onValueChange={(value) => form.setValue('unit', value as any)}
            disabled={form.formState.isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit">Unit</SelectItem>
              <SelectItem value="kg">Kilogram</SelectItem>
              <SelectItem value="liter">Liter</SelectItem>
              <SelectItem value="box">Box</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.unit && (
            <p className="text-sm text-destructive">
              {form.formState.errors.unit.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={form.formState.isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
```

---

## Advanced Patterns

### Optimistic Updates

```typescript
'use client'

import { useOptimistic } from 'react'
import { toggleProductActiveAction } from './actions'

export function ProductList({ products }: { products: Product[] }) {
  const [optimisticProducts, addOptimisticProduct] = useOptimistic(
    products,
    (state, updatedProduct: Product) => {
      return state.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      )
    }
  )

  async function toggleActive(product: Product) {
    // Optimistically update UI
    addOptimisticProduct({ ...product, isActive: !product.isActive })

    // Send to server
    await toggleProductActiveAction({
      id: product.id,
      isActive: !product.isActive,
    })
  }

  return (
    <div>
      {optimisticProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onToggle={() => toggleActive(product)}
        />
      ))}
    </div>
  )
}
```

### Batch Actions

```typescript
// actions.ts
export const bulkUpdateProductsAction = actionClient
  .schema(
    z.object({
      ids: z.array(z.number().positive()).min(1),
      data: updateProductSchema.omit({ id: true }),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { ids, data } = parsedInput;

    const results = await Promise.all(ids.map((id) => updateProduct(id, data)));

    revalidatePath("/products");

    return {
      success: true,
      updated: results.length,
    };
  });
```

### With File Upload

```typescript
// Schema
export const createProductWithImageSchema = createProductSchema.extend({
  imageFile: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, "Max file size is 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, .webp formats are supported",
    )
    .optional(),
});

// Action
export const createProductWithImageAction = actionClient
  .schema(createProductWithImageSchema)
  .action(async ({ parsedInput }) => {
    const { imageFile, ...productData } = parsedInput;

    let imageId: number | undefined;

    // Upload image if provided
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const payload = await getPayload();
      const media = await payload.create({
        collection: "media",
        data: {
          alt: productData.name,
        },
        file: imageFile,
      });

      imageId = media.id;
    }

    // Create product
    const product = await createProduct({
      ...productData,
      image: imageId,
    });

    revalidatePath("/products");

    return { success: true, product };
  });
```

---

## Error Handling

```typescript
// Custom error handling
export const createProductAction = actionClient
  .schema(createProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("You must be logged in");
      }

      if (user.role !== "owner" && user.role !== "admin") {
        throw new Error("Only owners can create products");
      }

      const ownerId = user.role === "owner" ? user.id : user.owner;

      const product = await createProduct({
        ...parsedInput,
        owner: ownerId,
      });

      revalidatePath("/products");

      return {
        success: true,
        product,
      };
    } catch (error) {
      console.error("Error in createProductAction:", error);

      // Return specific error messages
      if (error instanceof Error) {
        if (error.message.includes("duplicate")) {
          throw new Error("A product with this SKU already exists");
        }

        if (error.message.includes("owner")) {
          throw new Error("Invalid owner");
        }

        throw error;
      }

      throw new Error("Failed to create product");
    }
  });
```

---

## Revalidation Strategies

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// Revalidate specific path
revalidatePath("/products");

// Revalidate all products paths
revalidatePath("/products", "layout");

// Revalidate by tag (if using fetch with tags)
revalidateTag("products");

// Revalidate multiple paths
revalidatePath("/products");
revalidatePath("/dashboard");
revalidatePath("/statistics");
```

---

## Testing

```typescript
import { describe, it, expect, vi } from "vitest";
import { createProductAction } from "./actions";

vi.mock("@/app/services/products", () => ({
  createProduct: vi.fn((data) => ({
    id: 1,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
}));

vi.mock("@/app/services/users", () => ({
  getCurrentUser: vi.fn(() => ({
    id: 1,
    role: "owner",
    email: "owner@test.com",
  })),
}));

describe("createProductAction", () => {
  it("creates a product with valid data", async () => {
    const result = await createProductAction({
      name: "Test Product",
      price: 10.99,
      stock: 100,
      unit: "unit",
      isActive: true,
    });

    expect(result?.data?.success).toBe(true);
    expect(result?.data?.product).toHaveProperty("id");
  });

  it("rejects invalid price", async () => {
    const result = await createProductAction({
      name: "Test Product",
      price: -10,
      stock: 100,
      unit: "unit",
      isActive: true,
    });

    expect(result?.validationErrors).toBeDefined();
  });
});
```

---

## Checklist

Before marking actions as complete:

- [ ] Zod schemas defined with proper validation
- [ ] All CRUD actions implemented
- [ ] Authorization checks performed
- [ ] Service layer called (not direct Payload access)
- [ ] Paths revalidated after mutations
- [ ] Error handling implemented
- [ ] TypeScript types inferred from schemas
- [ ] No hardcoded values
- [ ] JSDoc comments for all actions
- [ ] Client components correctly integrated

---

## Common Patterns

### Constants for Enums

```typescript
// constants.ts
export const PRODUCT_UNITS = ["unit", "kg", "liter", "box"] as const;
export const ASSIGNMENT_STATUSES = [
  "pending",
  "active",
  "completed",
  "cancelled",
] as const;

// schemas.ts
import { PRODUCT_UNITS } from "./constants";

export const createProductSchema = z.object({
  unit: z.enum(PRODUCT_UNITS),
  // ...
});
```

### Shared Validation Logic

```typescript
// lib/validators.ts
export const priceValidator = z
  .number()
  .positive("Price must be greater than 0")
  .multipleOf(0.01, "Price must have at most 2 decimal places")
  .max(999999.99, "Price is too high");

// schemas.ts
export const createProductSchema = z.object({
  price: priceValidator,
  cost: priceValidator.optional(),
});
```

---

## References

- Zod skill: `/skills/zod-3/SKILL.md`
- Next.js skill: `/skills/nextjs-15/SKILL.md`
- Service layer patterns: `/agents/BACKEND_SERVICES.md`
- Example actions: `/src/components/auth/actions.ts`
