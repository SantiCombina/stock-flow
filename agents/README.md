# Stocker - Specialized Agents

> Subdivision of development tasks into specialized autonomous agents

## Overview

This project uses a multi-agent architecture where complex tasks are divided among specialized agents, each responsible for a specific layer of the application.

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Agent (You)                        │
│              Orchestrates & Consults User                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
      ┌────────────┼────────────┬──────────────┬──────────────┐
      │            │            │              │              │
      ▼            ▼            ▼              ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Payload  │ │ Services │ │    UI    │ │  Server  │ │  Schema  │
│Collection│ │  Agent   │ │Component │ │ Actions  │ │  Agent   │
│  Agent   │ │          │ │  Agent   │ │  Agent   │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
     │            │            │              │              │
     └────────────┴────────────┴──────────────┴──────────────┘
                               │
                               ▼
                         Final Code
```

---

## Agents

### 1. [Payload Collection Agent](./PAYLOAD_COLLECTIONS.md)

**Responsibility**: Define and create Payload CMS collections (database schema)

**When to use**:

- Creating a new entity (Products, Customers, Assignments, etc.)
- Defining fields, types, and validations
- Setting up relationships between collections
- Configuring access control policies
- Implementing collection hooks

**Input**:

- User requirements (consulted first)
- Data structure needs
- Business rules

**Output**:

- Collection file in `src/collections/[Name].ts`
- Registered in `src/payload.config.ts`
- Types generated via `pnpm generate:types`

**Key Features**:

- ALWAYS consults user before implementation
- No hardcoded values
- Follows Payload CMS best practices
- Implements proper access control

---

### 2. [Backend Services Agent](./BACKEND_SERVICES.md)

**Responsibility**: Create data access layer using Payload Local API

**When to use**:

- Fetching data from collections
- Creating, updating, deleting records
- Complex queries and filters
- Business logic that involves data
- Statistics and aggregations

**Input**:

- Collection structure (from Payload Collection Agent)
- Data requirements
- Query patterns needed

**Output**:

- Service file in `src/app/services/[entity].ts`
- Type-safe CRUD functions
- Reusable business logic

**Key Features**:

- Type-safe with generated Payload types
- Consistent error handling
- Optimized queries
- Follows service layer pattern

---

### 3. [UI Components Agent](./UI_COMPONENTS.md)

**Responsibility**: Create React components with Tailwind CSS

**When to use**:

- Building user interfaces
- Creating forms, tables, cards
- Implementing responsive layouts
- Adding interactive elements
- Styling with Tailwind

**Input**:

- Design requirements
- Data structure (for display)
- User interactions needed

**Output**:

- Components in `src/components/[feature]/`
- Responsive, accessible UI
- Consistent styling with Tailwind

**Key Features**:

- Server Components by default
- Client Components only when needed
- shadcn/ui integration
- Mobile-first responsive design
- WCAG accessibility standards

---

### 4. [Server Actions Agent](./SERVER_ACTIONS.md)

**Responsibility**: Create validated server actions for mutations

**When to use**:

- Handling form submissions
- Creating/updating/deleting data
- Mutations that revalidate cache
- Type-safe client-server communication

**Input**:

- Service layer functions
- Validation requirements
- Form structure

**Output**:

- Actions in `src/components/[feature]/actions.ts`
- Schemas in `src/components/[feature]/schemas.ts`
- Type-safe, validated actions

**Key Features**:

- Zod schema validation
- next-safe-action integration
- Automatic cache revalidation
- Type inference
- Error handling

---

## Workflow Example: Creating Products Feature

### Step 1: Main Agent Consults User

```
Main Agent: "We need to create the Products feature. Let me consult you about
the structure based on the plan..."

Questions:
- Do you need barcode/UPC field?
- Should categories be a separate collection or text field?
- Do you need supplier information?
- What units of measurement do you need?
- Custom fields specific to your products?

User: [Provides requirements]
```

### Step 2: Invoke Payload Collection Agent

```
Task: Create Products collection with confirmed structure
Input: User requirements from Step 1
Agent: PAYLOAD_COLLECTIONS.md
Output: src/collections/Products.ts
```

### Step 3: Invoke Backend Services Agent

```
Task: Create product service layer
Input: Products collection structure
Agent: BACKEND_SERVICES.md
Output: src/app/services/products.ts
```

### Step 4: Invoke Server Actions Agent (Schemas)

```
Task: Create validation schemas for product forms
Input: Products collection structure
Agent: SERVER_ACTIONS.md
Output: src/components/products/schemas.ts
```

### Step 5: Invoke UI Components Agent

```
Task: Create product UI components
Input:
  - Products data structure
  - Schemas for forms
Agent: UI_COMPONENTS.md
Output:
  - src/components/products/products-section.tsx
  - src/components/products/products-table.tsx
  - src/components/products/product-form.tsx
```

### Step 6: Invoke Server Actions Agent (Actions)

```
Task: Create server actions for product mutations
Input:
  - Product service functions
  - Product schemas
Agent: SERVER_ACTIONS.md
Output: src/components/products/actions.ts
```

### Step 7: Integration

Main agent integrates all pieces and tests the feature end-to-end.

---

## Benefits of Multi-Agent Architecture

### 1. **Separation of Concerns**

Each agent focuses on one layer, preventing mixed responsibilities.

### 2. **Code Quality**

Specialized agents follow best practices for their domain.

### 3. **Consistency**

All components of the same type follow the same patterns.

### 4. **Maintainability**

Changes to one layer can be made by the relevant agent without affecting others.

### 5. **Scalability**

New features can be added by running the same agent workflow.

### 6. **Type Safety**

End-to-end type safety from database to UI.

### 7. **No Hardcoding**

All agents enforce no hardcoded values - use constants and config.

---

## Task Distribution Rules

### When to use each agent:

**Payload Collection Agent**:

- ✅ Defining data structure
- ✅ Field types and validations
- ✅ Relationships
- ✅ Access control
- ❌ Fetching data
- ❌ UI components

**Backend Services Agent**:

- ✅ Data fetching (CRUD)
- ✅ Complex queries
- ✅ Business logic
- ✅ Aggregations
- ❌ UI rendering
- ❌ Form handling

**UI Components Agent**:

- ✅ React components
- ✅ Layout and styling
- ✅ User interactions
- ✅ Responsive design
- ❌ Data fetching logic
- ❌ Validation schemas

**Server Actions Agent**:

- ✅ Form submissions
- ✅ Validation schemas
- ✅ Mutations
- ✅ Cache revalidation
- ❌ UI components
- ❌ Direct database access

---

## Running Agents

### Option 1: Manual Reference

Copy the agent documentation and ask the AI to follow it:

```
"Create the Products collection following the PAYLOAD_COLLECTIONS agent guidelines.
First, consult me about the structure based on PLAN.md."
```

### Option 2: Subagent Tool (Preferred)

Use the `runSubagent` tool with specific instructions:

```typescript
runSubagent({
  description: "Create Products collection",
  prompt: `
    Follow the PAYLOAD_COLLECTIONS.md agent guidelines.
    
    Task: Create Products collection
    
    IMPORTANT:
    1. Read /docs/PLAN.md for the proposed structure
    2. Read /agents/PAYLOAD_COLLECTIONS.md for guidelines
    3. Ask the user to confirm fields and structure
    4. Only implement after user confirms
    
    Proposed structure is in PLAN.md Phase 1.
    
    Return: Summary of what was created and any decisions made.
  `,
});
```

---

## Agent Communication

Agents should not communicate directly with each other. All coordination goes through the main agent:

```
Main Agent
    ↓ (orchestrates)
Agent 1 → Output → Main Agent → Input → Agent 2
                       ↓
                User Consultation
```

---

## Quality Checklist

Before completing any agent task:

- [ ] Follows the agent's specific guidelines
- [ ] No hardcoded values
- [ ] Type-safe with TypeScript
- [ ] Error handling implemented
- [ ] Proper documentation/comments
- [ ] Consistent naming conventions
- [ ] No code duplication
- [ ] Tests considered (if applicable)

---

## Future Enhancements

Potential additional agents:

- **Testing Agent**: Generate tests for components and services
- **Documentation Agent**: Generate user docs and API docs
- **Migration Agent**: Handle database migrations and data transformations
- **Deployment Agent**: Handle build, deploy, and environment setup

---

## References

- Main project instructions: `/AGENTS.md`
- Development plan: `/docs/PLAN.md`
- Technology skills:
  - `/skills/nextjs-15/SKILL.md`
  - `/skills/react-19/SKILL.md`
  - `/skills/tailwind-4/SKILL.md`
  - `/skills/zod-3/SKILL.md`
  - `/skills/payload/AGENTS.md`

---

_Last updated: February 2026_
