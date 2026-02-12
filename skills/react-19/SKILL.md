# React 19 Development Guidelines

> Modern React with Compiler, Actions, Transitions, and new hooks

## Core Principles

1. **Functional Components Only**: No class components
2. **Hooks-Based**: Leverage all React hooks properly
3. **Type-Safety**: Full TypeScript integration
4. **Declarative**: Prefer declarative over imperative code
5. **Composition**: Small, focused, reusable components

---

## Component Patterns

### Basic Component Structure

```typescript
interface ProductCardProps {
  product: Product
  onEdit?: (id: number) => void
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      {onEdit && (
        <button onClick={() => onEdit(product.id)}>
          Edit
        </button>
      )}
    </div>
  )
}
```

### Component with Children

```typescript
interface CardProps {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Card({ title, children, footer }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}
```

---

## React 19 New Features

### 1. React Compiler (Automatic Optimization)

React 19 automatically memoizes components - no need for `useMemo` and `useCallback` everywhere:

```typescript
// ❌ React 18 - Manual optimization
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);

// ✅ React 19 - Compiler handles it
const value = computeExpensiveValue(a, b);
const callback = () => doSomething(a, b);
```

**When to still use memo:**

- Props are extremely expensive to compute
- Preventing unnecessary re-renders of large component trees

### 2. Actions (for Forms & Mutations)

```typescript
'use client'

import { useActionState } from 'react'
import { createProductAction } from './actions'

export function ProductForm() {
  const [state, formAction, isPending] = useActionState(
    createProductAction,
    { message: '' }
  )

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="price" type="number" required />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Product'}
      </button>
      {state.message && <p>{state.message}</p>}
    </form>
  )
}
```

### 3. useOptimistic Hook

```typescript
'use client'

import { useOptimistic } from 'react'

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, { ...newTodo, pending: true }]
  )

  async function handleAdd(formData: FormData) {
    const newTodo = { id: Date.now(), text: formData.get('text') }
    addOptimisticTodo(newTodo)
    await createTodo(newTodo)
  }

  return (
    <div>
      {optimisticTodos.map(todo => (
        <div key={todo.id} className={todo.pending ? 'opacity-50' : ''}>
          {todo.text}
        </div>
      ))}
      <form action={handleAdd}>
        <input name="text" />
        <button>Add</button>
      </form>
    </div>
  )
}
```

### 4. use() Hook (for Promises & Context)

```typescript
import { use } from 'react'

// Use with Promises
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)
  return <div>{user.name}</div>
}

// Use with Context
function ThemedButton() {
  const theme = use(ThemeContext)
  return <button className={theme.buttonClass}>Click</button>
}

// Conditional use (now allowed!)
function Component({ condition, promiseA, promiseB }) {
  const data = use(condition ? promiseA : promiseB)
  return <div>{data.value}</div>
}
```

---

## Hooks Best Practices

### useState

```typescript
// ✅ Preferred patterns
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);

// Update with previous state
setCount((prev) => prev + 1);
setItems((prev) => [...prev, newItem]);

// ❌ Avoid
let count = 0; // Use state instead
```

### useEffect

```typescript
"use client";

// ✅ Cleanup side effects
useEffect(() => {
  const subscription = api.subscribe();
  return () => subscription.unsubscribe();
}, []);

// ✅ Proper dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Avoid for data fetching in Next.js
useEffect(() => {
  fetch("/api/data").then(setData); // Use Server Components instead
}, []);
```

### useRef

```typescript
// DOM reference
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);

// Mutable value (doesn't trigger re-render)
const countRef = useRef(0);
countRef.current += 1;
```

### useContext

```typescript
// Define context
const UserContext = createContext<User | null>(null)

// Provider
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}

// Consumer
function Profile() {
  const user = useContext(UserContext)
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}

// Or use 'use' hook in React 19
function Profile() {
  const user = use(UserContext)
  return <div>{user.name}</div>
}
```

### useReducer

```typescript
type State = { count: number; logs: string[] }
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return {
        count: state.count + 1,
        logs: [...state.logs, 'Incremented']
      }
    case 'decrement':
      return {
        count: state.count - 1,
        logs: [...state.logs, 'Decremented']
      }
    case 'reset':
      return { count: 0, logs: [] }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, logs: [] })

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  )
}
```

### useTransition

```typescript
'use client'

import { useTransition } from 'react'

export function SearchResults() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  function handleSearch(value: string) {
    setQuery(value) // Urgent update

    startTransition(() => {
      // Non-urgent update - can be interrupted
      const filtered = expensiveFilter(value)
      setResults(filtered)
    })
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </div>
  )
}
```

---

## Custom Hooks

### Pattern:

```typescript
// src/hooks/use-products.ts
"use client";

import { useState, useEffect } from "react";

export function useProducts(ownerId: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts(ownerId);
        setProducts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [ownerId]);

  return { products, isLoading, error };
}
```

### Usage:

```typescript
function ProductsList({ ownerId }: { ownerId: number }) {
  const { products, isLoading, error } = useProducts(ownerId)

  if (isLoading) return <Skeleton />
  if (error) return <Error message={error.message} />

  return <Table data={products} />
}
```

---

## Form Handling (React 19)

### With useActionState

```typescript
'use client'

import { useActionState } from 'react'

export function CreateProductForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData: FormData) => {
      const name = formData.get('name') as string
      const price = parseFloat(formData.get('price') as string)

      try {
        await createProduct({ name, price })
        return { message: 'Product created!', error: null }
      } catch (error) {
        return { message: null, error: 'Failed to create product' }
      }
    },
    { message: null, error: null }
  )

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="price" type="number" required />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>

      {state.message && <p className="text-green-600">{state.message}</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}
    </form>
  )
}
```

### With React Hook Form (Complex forms)

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from './schema'

export function ProductForm() {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
    },
  })

  async function onSubmit(data: ProductFormData) {
    const result = await createProductAction(data)
    if (result.success) {
      form.reset()
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <span className="text-red-600">
          {form.formState.errors.name.message}
        </span>
      )}

      <button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

---

## Performance Optimization

### 1. React.memo (When Needed)

```typescript
// Only re-render if props change
export const ProductCard = memo(function ProductCard({
  product
}: ProductCardProps) {
  return <div>{product.name}</div>
})

// Custom comparison
export const ProductCard = memo(
  ProductCard,
  (prevProps, nextProps) => prevProps.product.id === nextProps.product.id
)
```

### 2. Code Splitting

```typescript
import dynamic from 'next/dynamic'

// Lazy load heavy component
const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <Skeleton />,
  ssr: false, // Skip SSR if needed
})
```

### 3. Virtual Lists (Large Lists)

```typescript
import { FixedSizeList } from 'react-window'

function ProductList({ products }: { products: Product[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {products[index].name}
        </div>
      )}
    </FixedSizeList>
  )
}
```

---

## Error Boundaries

```typescript
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## Common Patterns

### Compound Components

```typescript
interface TabsProps {
  children: ReactNode
  defaultValue: string
}

export function Tabs({ children, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  return <div className="tabs-list">{children}</div>
}

Tabs.Trigger = function TabsTrigger({
  value,
  children
}: {
  value: string
  children: ReactNode
}) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={activeTab === value ? 'active' : ''}
    >
      {children}
    </button>
  )
}

// Usage
<Tabs defaultValue="products">
  <Tabs.List>
    <Tabs.Trigger value="products">Products</Tabs.Trigger>
    <Tabs.Trigger value="sales">Sales</Tabs.Trigger>
  </Tabs.List>
</Tabs>
```

### Render Props

```typescript
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, isLoading: boolean, error: Error | null) => ReactNode
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [url])

  return <>{children(data, isLoading, error)}</>
}

// Usage
<DataFetcher url="/api/products">
  {(data, isLoading, error) => {
    if (isLoading) return <Spinner />
    if (error) return <Error message={error.message} />
    return <ProductList products={data} />
  }}
</DataFetcher>
```

---

## Anti-Patterns to Avoid

### ❌ Don't:

```typescript
// Mutating state directly
products.push(newProduct)
setProducts(products)

// Using index as key
{products.map((p, i) => <div key={i}>{p.name}</div>)}

// Too many useState calls
const [name, setName] = useState('')
const [price, setPrice] = useState(0)
const [stock, setStock] = useState(0)
// ... 10 more fields

// Nested component definitions
function Parent() {
  function Child() { // ❌ Re-created on every render
    return <div>Child</div>
  }
  return <Child />
}
```

### ✅ Do:

```typescript
// Immutable updates
setProducts(prev => [...prev, newProduct])

// Stable keys
{products.map(p => <div key={p.id}>{p.name}</div>)}

// Single object state or useReducer
const [formData, setFormData] = useState({ name: '', price: 0, stock: 0 })

// Component outside
function Child() {
  return <div>Child</div>
}
function Parent() {
  return <Child />
}
```

---

## Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductForm } from './product-form'

describe('ProductForm', () => {
  it('submits form data', async () => {
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test Product' }
    })

    fireEvent.click(screen.getByText('Submit'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Test Product' })
    })
  })
})
```

---

## Resources

- [React 19 Docs](https://react.dev)
- [React Compiler](https://react.dev/learn/react-compiler)
- [Actions](https://react.dev/reference/react-dom/components/form#handle-form-submission-with-a-server-action)
- [Hooks API](https://react.dev/reference/react)
