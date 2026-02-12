# Zod 3 Validation Guidelines

> TypeScript-first schema validation with static type inference

## Core Principles

1. **Schema-First**: Define schemas before implementation
2. **Type Safety**: Leverage TypeScript inference
3. **Reusability**: Share schemas across client and server
4. **Error Handling**: Provide clear validation messages
5. **Composition**: Build complex schemas from simple ones

---

## Basic Schemas

### Primitive Types

```typescript
import { z } from "zod";

// String
const nameSchema = z.string();
const emailSchema = z.string().email();
const urlSchema = z.string().url();
const uuidSchema = z.string().uuid();

// Number
const ageSchema = z.number();
const priceSchema = z.number().positive();
const stockSchema = z.number().int().nonnegative();

// Boolean
const isActiveSchema = z.boolean();

// Date
const dateSchema = z.date();
const isoDateSchema = z.string().datetime(); // ISO 8601

// Null/Undefined
const nullableSchema = z.string().nullable(); // string | null
const optionalSchema = z.string().optional(); // string | undefined
const nullishSchema = z.string().nullish(); // string | null | undefined
```

### String Validations

```typescript
// Length constraints
z.string().min(3, "Name must be at least 3 characters");
z.string().max(100, "Name must be less than 100 characters");
z.string().length(10, "Must be exactly 10 characters");

// Patterns
z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Invalid phone format");
z.string().email("Invalid email address");
z.string().url("Invalid URL");

// Content validation
z.string().trim(); // Remove whitespace
z.string().toLowerCase();
z.string().toUpperCase();
z.string().nonempty("This field is required");

// Combined
const skuSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3)
  .max(20)
  .regex(/^[A-Z0-9-]+$/, "SKU must contain only letters, numbers, and hyphens");
```

### Number Validations

```typescript
// Range constraints
z.number().min(0, "Must be non-negative");
z.number().max(1000, "Must be less than 1000");
z.number().positive("Must be positive");
z.number().nonnegative("Cannot be negative");

// Type constraints
z.number().int("Must be an integer");
z.number().finite("Must be finite");

// Multiple of
z.number().multipleOf(0.01); // For currency (2 decimals)

// Combined
const priceSchema = z
  .number()
  .positive("Price must be greater than 0")
  .multipleOf(0.01, "Price must have at most 2 decimal places")
  .max(999999.99, "Price is too high");
```

---

## Object Schemas

### Basic Object

```typescript
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
});

// Infer TypeScript type
type Product = z.infer<typeof productSchema>;
// {
//   name: string
//   description?: string
//   price: number
//   stock: number
//   isActive: boolean
// }
```

### Nested Objects

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
});

const customerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: addressSchema,
});
```

### Partial/Required/Pick/Omit

```typescript
const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
});

// Make all fields optional
const partialProductSchema = productSchema.partial();

// Make all fields required
const requiredProductSchema = productSchema.required();

// Pick specific fields
const productNamePriceSchema = productSchema.pick({
  name: true,
  price: true,
});

// Omit specific fields
const productWithoutIdSchema = productSchema.omit({ id: true });

// Extend schema
const productWithOwnerSchema = productSchema.extend({
  ownerId: z.number(),
});
```

---

## Array Schemas

```typescript
// Array of primitives
const tagsSchema = z.array(z.string());

// Array of objects
const productsSchema = z.array(productSchema);

// Non-empty array
const itemsSchema = z
  .array(z.string())
  .nonempty("At least one item is required");

// Min/Max length
const assignmentsSchema = z
  .array(assignmentSchema)
  .min(1, "At least one assignment required")
  .max(100, "Maximum 100 assignments allowed");
```

---

## Union & Discriminated Unions

### Union

```typescript
const idSchema = z.union([z.string(), z.number()]);
// string | number

// Simpler syntax
const idSchema2 = z.string().or(z.number());
```

### Discriminated Union

```typescript
const paymentMethodSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("cash"),
  }),
  z.object({
    type: z.literal("transfer"),
    bankAccount: z.string(),
  }),
  z.object({
    type: z.literal("credit"),
    cardNumber: z.string(),
    expiryDate: z.string(),
  }),
]);

type PaymentMethod = z.infer<typeof paymentMethodSchema>;
// { type: 'cash' }
// | { type: 'transfer'; bankAccount: string }
// | { type: 'credit'; cardNumber: string; expiryDate: string }
```

---

## Enum Schemas

```typescript
// Native enum
enum Role {
  ADMIN = "admin",
  OWNER = "owner",
  SELLER = "seller",
}

const roleSchema = z.nativeEnum(Role);

// Zod enum
const statusSchema = z.enum(["pending", "active", "completed", "cancelled"]);

type Status = z.infer<typeof statusSchema>;
// 'pending' | 'active' | 'completed' | 'cancelled'
```

---

## Default Values & Transformations

### Default Values

```typescript
const productSchema = z.object({
  name: z.string(),
  isActive: z.boolean().default(true),
  stock: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
});
```

### Transformations

```typescript
// Transform string to number
const stringToNumberSchema = z.string().transform((val) => parseInt(val));

// Transform and validate
const priceFromStringSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .pipe(z.number().positive());

// Preprocess
const trimmedStringSchema = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : val),
  z.string().min(1),
);
```

---

## Custom Validations

### Refine

```typescript
// Single field validation
const passwordSchema = z
  .string()
  .min(8)
  .refine(
    (val) => /[A-Z]/.test(val),
    "Password must contain at least one uppercase letter",
  )
  .refine(
    (val) => /[0-9]/.test(val),
    "Password must contain at least one number",
  );

// Cross-field validation
const changePasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error on specific field
  });

// Async validation
const usernameSchema = z.string().refine(async (username) => {
  const exists = await checkUsernameExists(username);
  return !exists;
}, "Username already taken");
```

### SuperRefine (Advanced)

```typescript
const productSchema = z
  .object({
    price: z.number(),
    cost: z.number().optional(),
    stock: z.number(),
    minStock: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    // Cost must be less than price
    if (data.cost && data.cost >= data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cost must be less than price",
        path: ["cost"],
      });
    }

    // Min stock must be less than stock
    if (data.minStock && data.minStock > data.stock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum stock cannot exceed current stock",
        path: ["minStock"],
      });
    }
  });
```

---

## Form Validation Patterns

### React Hook Form Integration

```typescript
// schemas/product.ts
export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  cost: z.number().positive().optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  minStock: z.number().int().nonnegative().optional(),
  unit: z.enum(["unit", "kg", "liter", "box"]),
  isActive: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

```typescript
// components/product-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema, CreateProductInput } from './schemas'

export function ProductForm() {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      unit: 'unit',
      isActive: true,
    },
  })

  async function onSubmit(data: CreateProductInput) {
    const result = await createProductAction(data)
    // Handle result
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <span className="text-red-600">
          {form.formState.errors.name.message}
        </span>
      )}

      {/* More fields */}

      <button type="submit" disabled={form.formState.isSubmitting}>
        Create Product
      </button>
    </form>
  )
}
```

---

## Server Action Validation

### With next-safe-action

```typescript
// lib/safe-action.ts
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

```typescript
// components/products/actions.ts
"use server";

import { actionClient } from "@/lib/safe-action";
import { createProductSchema } from "./schemas";
import { revalidatePath } from "next/cache";

export const createProductAction = actionClient
  .schema(createProductSchema)
  .action(async ({ parsedInput }) => {
    // parsedInput is fully typed and validated
    const product = await createProduct(parsedInput);

    revalidatePath("/products");

    return { success: true, product };
  });
```

---

## Payload CMS Field Validation

```typescript
// collections/Products.ts
import { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    {
      name: "price",
      type: "number",
      required: true,
      min: 0.01,
    },
    {
      name: "stock",
      type: "number",
      required: true,
      min: 0,
      validate: (val) => {
        if (!Number.isInteger(val)) {
          return "Stock must be an integer";
        }
        return true;
      },
    },
    {
      name: "unit",
      type: "select",
      required: true,
      options: [
        { label: "Unit", value: "unit" },
        { label: "Kilogram", value: "kg" },
        { label: "Liter", value: "liter" },
        { label: "Box", value: "box" },
      ],
    },
  ],
};
```

---

## Error Handling

### Parse vs SafeParse

```typescript
// parse() - throws on error
try {
  const data = productSchema.parse(input);
  // data is typed and validated
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors);
  }
}

// safeParse() - returns result object
const result = productSchema.safeParse(input);

if (result.success) {
  const data = result.data; // Typed data
} else {
  const errors = result.error.errors; // Validation errors
}
```

### Custom Error Messages

```typescript
const productSchema = z.object({
  name: z
    .string({
      required_error: "Product name is required",
      invalid_type_error: "Product name must be a string",
    })
    .min(1, "Product name cannot be empty"),

  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be greater than 0"),
});
```

### Formatting Errors

```typescript
import { z } from "zod";

function formatZodErrors(error: z.ZodError) {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}

// Usage
const result = schema.safeParse(data);
if (!result.success) {
  const formattedErrors = formatZodErrors(result.error);
  // [{ field: 'name', message: 'Name is required' }, ...]
}
```

---

## Reusable Schema Patterns

### Centralized Schemas

```typescript
// schemas/common.ts
export const idSchema = z.number().int().positive();
export const emailSchema = z.string().email();
export const phoneSchema = z.string().regex(/^\d{3}-\d{3}-\d{4}$/);
export const dateSchema = z.string().datetime();

// schemas/product.ts
import { idSchema } from "./common";

export const productSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100),
  // ...
});

export const createProductSchema = productSchema.omit({ id: true });
export const updateProductSchema = productSchema
  .partial()
  .required({ id: true });
```

### Shared Between Client and Server

```typescript
// shared/schemas/product.ts
export const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})

// Client component
import { productSchema } from '@/shared/schemas/product'
const form = useForm({ resolver: zodResolver(productSchema) })

// Server action
import { productSchema } from '@/shared/schemas/product'
export const createAction = actionClient.schema(productSchema).action(...)
```

---

## Advanced Patterns

### Recursive Schemas

```typescript
const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(categorySchema).optional(),
  }),
);

type Category = {
  name: string;
  subcategories?: Category[];
};
```

### Generic Schemas

```typescript
function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  });
}

const paginatedProductsSchema = createPaginatedSchema(productSchema);
```

---

## Testing Schemas

```typescript
import { describe, it, expect } from "vitest";
import { productSchema } from "./schemas";

describe("productSchema", () => {
  it("validates correct product", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      price: 10.99,
      stock: 5,
      unit: "unit",
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      price: -10,
      stock: 5,
      unit: "unit",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("positive");
    }
  });
});
```

---

## Best Practices

### ✅ Do:

```typescript
// Define schemas centrally
// schemas/product.ts
export const createProductSchema = z.object({ ... })
export const updateProductSchema = z.object({ ... })

// Use type inference
type Product = z.infer<typeof productSchema>

// Provide clear error messages
z.string().min(1, 'Name is required')

// Reuse schemas
const baseProductSchema = z.object({ name: z.string() })
const fullProductSchema = baseProductSchema.extend({ price: z.number() })

// Validate at boundaries (forms, APIs, server actions)
```

### ❌ Don't:

```typescript
// Define schemas inline
const data = z.object({ name: z.string() }).parse(input);

// Use any
z.any(); // Defeats the purpose

// Ignore validation errors
productSchema.parse(input); // Might throw

// Duplicate schema definitions across files
```

---

## Resources

- [Zod Documentation](https://zod.dev)
- [Type Inference](https://zod.dev/?id=type-inference)
- [Error Handling](https://zod.dev/?id=error-handling)
- [Validation](https://zod.dev/?id=primitives)
