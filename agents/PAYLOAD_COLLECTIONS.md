# Payload Collection Agent

> Specialized agent for creating and managing Payload CMS collections

## Responsibilities

- Design collection schemas based on requirements
- Implement access control policies
- Create hooks for business logic
- Configure relationships between collections
- Set up field validations

---

## Methodology

### 1. Consultation Phase (MANDATORY)

**NEVER create a collection without first:**

1. **Reviewing** the proposal in `docs/PLAN.md`
2. **Asking** the user about:
   - Required vs optional fields
   - Field types and constraints
   - Relationships with other collections
   - Access control requirements
   - Business rules and validations
   - Default values
3. **Confirming** the complete structure
4. **Only then** proceed to implementation

---

## Collection Template

```typescript
// src/collections/[CollectionName].ts
import { CollectionConfig } from "payload";

export const CollectionName: CollectionConfig = {
  slug: "collection-name",

  // Access Control
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      if (user.role === "owner") {
        return {
          owner: {
            equals: user.id,
          },
        };
      }
      if (user.role === "seller") {
        return {
          owner: {
            equals: user.owner,
          },
        };
      }
      return false;
    },

    create: ({ req: { user } }) => {
      if (!user) return false;
      return ["admin", "owner"].includes(user.role);
    },

    update: ({ req: { user } }) => {
      if (!user) return false;
      return ["admin", "owner"].includes(user.role);
    },

    delete: ({ req: { user } }) => {
      if (!user) return false;
      return ["admin", "owner"].includes(user.role);
    },
  },

  // Admin UI
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "createdAt", "updatedAt"],
    group: "Business", // Group in admin panel
  },

  // Fields
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      minLength: 1,
      maxLength: 100,
    },

    // Relationship
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      filterOptions: {
        role: {
          equals: "owner",
        },
      },
    },

    // Timestamps (automatic)
    // createdAt, updatedAt
  ],

  // Hooks
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        // Auto-assign owner on create
        if (operation === "create" && !data.owner) {
          data.owner =
            req.user?.role === "owner" ? req.user.id : req.user?.owner;
        }
        return data;
      },
    ],

    afterChange: [
      async ({ req, doc, operation }) => {
        // Business logic after changes
        if (operation === "create") {
          // e.g., send notification
        }
      },
    ],
  },
};
```

---

## Field Type Guide

### Text Fields

```typescript
{
  name: 'name',
  type: 'text',
  required: true,
  minLength: 1,
  maxLength: 100,
  unique: false,
}

{
  name: 'description',
  type: 'textarea',
  required: false,
}
```

### Number Fields

```typescript
{
  name: 'price',
  type: 'number',
  required: true,
  min: 0.01,
  max: 999999.99,
}

{
  name: 'stock',
  type: 'number',
  required: true,
  min: 0,
  validate: (val) => {
    if (!Number.isInteger(val)) {
      return 'Stock must be an integer'
    }
    return true
  },
}
```

### Boolean Fields

```typescript
{
  name: 'isActive',
  type: 'checkbox',
  required: true,
  defaultValue: true,
}
```

### Select Fields

```typescript
{
  name: 'unit',
  type: 'select',
  required: true,
  options: [
    { label: 'Unit', value: 'unit' },
    { label: 'Kilogram', value: 'kg' },
    { label: 'Liter', value: 'liter' },
    { label: 'Box', value: 'box' },
  ],
  defaultValue: 'unit',
}

{
  name: 'status',
  type: 'select',
  required: true,
  options: ['pending', 'active', 'completed', 'cancelled'],
}
```

### Relationship Fields

```typescript
// One-to-one
{
  name: 'owner',
  type: 'relationship',
  relationTo: 'users',
  required: true,
  hasMany: false,
}

// One-to-many
{
  name: 'products',
  type: 'relationship',
  relationTo: 'products',
  required: false,
  hasMany: true,
}

// Polymorphic
{
  name: 'reference',
  type: 'relationship',
  relationTo: ['products', 'sales'],
  required: false,
}
```

### Upload Fields

```typescript
{
  name: 'image',
  type: 'upload',
  relationTo: 'media',
  required: false,
}
```

### Array Fields

```typescript
{
  name: 'items',
  type: 'array',
  required: true,
  minRows: 1,
  maxRows: 100,
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
  ],
}
```

### Date Fields

```typescript
{
  name: 'date',
  type: 'date',
  required: true,
  admin: {
    date: {
      pickerAppearance: 'dayAndTime',
    },
  },
}
```

---

## Access Control Patterns

### Owner-Based Access (Most Common)

```typescript
access: {
  read: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (user.role === 'owner') {
      return { owner: { equals: user.id } }
    }
    if (user.role === 'seller') {
      return { owner: { equals: user.owner } }
    }
    return false
  },

  create: ({ req: { user } }) => {
    return user && ['admin', 'owner'].includes(user.role)
  },

  update: ({ req: { user } }) => {
    return user && ['admin', 'owner'].includes(user.role)
  },

  delete: ({ req: { user } }) => {
    return user && ['admin', 'owner'].includes(user.role)
  },
}
```

### Seller-Specific Access

```typescript
access: {
  // Sellers can only read their own data
  read: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (user.role === 'owner') {
      return { owner: { equals: user.id } }
    }
    if (user.role === 'seller') {
      return { seller: { equals: user.id } }
    }
    return false
  },

  // Only sellers can create their own records
  create: ({ req: { user } }) => {
    return user && user.role === 'seller'
  },

  // Sellers can update their own, owners can update all
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin' || user.role === 'owner') return true
    if (user.role === 'seller') {
      return { seller: { equals: user.id } }
    }
    return false
  },
}
```

---

## Hook Patterns

### Auto-Assign Owner

```typescript
hooks: {
  beforeChange: [
    ({ req, operation, data }) => {
      if (operation === 'create' && !data.owner) {
        if (req.user?.role === 'owner') {
          data.owner = req.user.id
        } else if (req.user?.role === 'seller') {
          data.owner = req.user.owner
        }
      }
      return data
    },
  ],
}
```

### Stock Management

```typescript
hooks: {
  beforeChange: [
    async ({ req, operation, data, originalDoc }) => {
      // Prevent stock from going negative
      if (data.stock !== undefined && data.stock < 0) {
        throw new Error('Stock cannot be negative')
      }
      return data
    },
  ],

  afterChange: [
    async ({ req, doc, operation, previousDoc }) => {
      // Create stock movement record
      if (operation === 'update' && doc.stock !== previousDoc.stock) {
        await req.payload.create({
          collection: 'stock-movements',
          data: {
            product: doc.id,
            type: doc.stock > previousDoc.stock ? 'in' : 'out',
            quantity: Math.abs(doc.stock - previousDoc.stock),
            previousStock: previousDoc.stock,
            newStock: doc.stock,
            createdBy: req.user.id,
            owner: doc.owner,
          },
        })
      }
    },
  ],
}
```

### Validation Across Fields

```typescript
hooks: {
  beforeValidate: [
    ({ data }) => {
      // Cost must be less than price
      if (data.cost && data.price && data.cost >= data.price) {
        throw new Error('Cost must be less than price')
      }

      // Min stock must be less than stock
      if (data.minStock && data.stock && data.minStock > data.stock) {
        throw new Error('Minimum stock cannot exceed current stock')
      }

      return data
    },
  ],
}
```

---

## Registration

After creating the collection, register it in the Payload config:

```typescript
// src/payload.config.ts
import { Products } from "./collections/Products";
import { Customers } from "./collections/Customers";
// ... other imports

export default buildConfig({
  collections: [
    Users,
    Invitations,
    Media,
    Products, // ← Add here
    Customers, // ← Add here
    // ...
  ],
  // ...
});
```

---

## Type Generation

After creating or modifying a collection:

```bash
pnpm generate:types
```

This updates `src/payload-types.ts` with TypeScript types for the collection.

---

## Checklist

Before marking a collection as complete:

- [ ] Consulted with user on schema structure
- [ ] All fields defined with proper types and constraints
- [ ] Access control implemented for all operations
- [ ] Relationships configured correctly
- [ ] Hooks implemented for business logic
- [ ] Admin UI configured (useAsTitle, defaultColumns, group)
- [ ] Collection registered in `payload.config.ts`
- [ ] Types generated with `pnpm generate:types`
- [ ] No hardcoded values (use constants for select options)
- [ ] Field names follow camelCase convention
- [ ] Collection slug follows kebab-case convention

---

## Common Pitfalls to Avoid

### ❌ Don't:

```typescript
// Don't hardcode select options directly
options: ['pending', 'active', 'completed']

// Don't forget access control
access: {} // Empty = public access!

// Don't forget to auto-assign owner
// (Will fail if user doesn't manually select)

// Don't use unclear field names
{ name: 'data', type: 'text' } // What data?

// Don't forget relationships need the collection to exist
relationTo: 'products' // Products collection must exist first
```

### ✅ Do:

```typescript
// Define constants for reusable values
const STATUS_OPTIONS = ['pending', 'active', 'completed'] as const

options: STATUS_OPTIONS.map(value => ({ label: value, value }))

// Always implement access control
access: {
  read: ({ req: { user } }) => { /* ... */ },
  create: ({ req: { user } }) => { /* ... */ },
  update: ({ req: { user } }) => { /* ... */ },
  delete: ({ req: { user } }) => { /* ... */ },
}

// Auto-assign owner in hooks
hooks: {
  beforeChange: [
    ({ req, operation, data }) => {
      if (operation === 'create' && !data.owner) {
        data.owner = req.user?.role === 'owner' ? req.user.id : req.user?.owner
      }
      return data
    },
  ],
}

// Use descriptive names
{ name: 'customerName', type: 'text' }

// Create collections in dependency order
// 1. Independent collections (Products, Media)
// 2. Dependent collections (Sales references Products)
```

---

## References

- Main project agent instructions: `/AGENTS.md`
- Payload skill documentation: `/skills/payload/AGENTS.md`
- Project plan: `/docs/PLAN.md`
- Existing collections: `/src/collections/`
