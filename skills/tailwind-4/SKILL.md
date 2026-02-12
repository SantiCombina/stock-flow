# Tailwind CSS 4 Development Guidelines

> Modern utility-first CSS with CSS variables, container queries, and improved DX

## Core Principles

1. **Utility-First**: Compose designs with utility classes
2. **Mobile-First**: Build responsive designs from small to large
3. **CSS Variables**: Use Tailwind's CSS variable system
4. **No Inline Styles**: Use Tailwind classes exclusively
5. **Consistent Spacing**: Use Tailwind's spacing scale

---

## Project Setup

### Configuration (Tailwind 4)

```typescript
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### Global Styles

```css
/* src/app/(frontend)/globals.css */
@import "tailwindcss";

@theme {
  /* Custom design tokens */
  --color-primary: #3b82f6;
  --color-primary-foreground: #ffffff;

  --font-sans: "Inter", system-ui, sans-serif;

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}

/* Custom base styles */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

---

## Design Tokens (CSS Variables)

### Color System

```css
@theme {
  /* Light mode */
  --color-background: 0 0% 100%;
  --color-foreground: 0 0% 3.9%;

  --color-card: 0 0% 100%;
  --color-card-foreground: 0 0% 3.9%;

  --color-primary: 221.2 83.2% 53.3%;
  --color-primary-foreground: 210 40% 98%;

  --color-secondary: 210 40% 96.1%;
  --color-secondary-foreground: 222.2 47.4% 11.2%;

  --color-muted: 210 40% 96.1%;
  --color-muted-foreground: 215.4 16.3% 46.9%;

  --color-destructive: 0 84.2% 60.2%;
  --color-destructive-foreground: 210 40% 98%;

  --color-border: 214.3 31.8% 91.4%;
  --color-input: 214.3 31.8% 91.4%;
  --color-ring: 221.2 83.2% 53.3%;
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: 0 0% 3.9%;
    --color-foreground: 0 0% 98%;

    --color-card: 0 0% 3.9%;
    --color-card-foreground: 0 0% 98%;

    --color-primary: 217.2 91.2% 59.8%;
    --color-primary-foreground: 222.2 47.4% 11.2%;

    /* ... more dark mode colors */
  }
}
```

### Usage

```tsx
// ✅ Use semantic color classes
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
<div className="border-border">

// ❌ Avoid hardcoded colors
<div className="bg-white text-black">
<button className="bg-blue-500 text-white">
```

---

## Layout Patterns

### Container

```tsx
// Max-width centered container
<div className="container mx-auto px-4">
  {/* Content */}
</div>

// Full width with padding
<div className="px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Flexbox

```tsx
// Row with gap
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Column centered
<div className="flex flex-col items-center justify-center min-h-screen">
  <h1>Centered Content</h1>
</div>

// Space between
<div className="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

// Wrap
<div className="flex flex-wrap gap-2">
  {items.map(item => <Tag key={item.id}>{item.name}</Tag>)}
</div>
```

### Grid

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  {/* Cards automatically wrap */}
</div>

// Complex grid
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-8">Main</div>
  <div className="col-span-12 md:col-span-4">Sidebar</div>
</div>
```

---

## Responsive Design (Mobile-First)

### Breakpoints

- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large desktops)

### Pattern

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Column 1</div>
  <div className="w-full md:w-1/2">Column 2</div>
</div>

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">
  Heading
</h1>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>

// Hide/show based on screen size
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

---

## Component Patterns

### Button

```tsx
// Primary button
<button className="
  inline-flex items-center justify-center gap-2
  px-4 py-2 rounded-md
  bg-primary text-primary-foreground
  font-medium text-sm
  hover:bg-primary/90
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
  disabled:opacity-50 disabled:pointer-events-none
  transition-colors
">
  Click me
</button>

// Button variants
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary
</button>

<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
  Delete
</button>

<button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">
  Outline
</button>
```

### Card

```tsx
<div
  className="
  rounded-lg border bg-card text-card-foreground shadow-sm
"
>
  <div className="p-6 space-y-1.5">
    <h3 className="text-2xl font-semibold leading-none tracking-tight">
      Card Title
    </h3>
    <p className="text-sm text-muted-foreground">Card Description</p>
  </div>

  <div className="p-6 pt-0">{/* Card content */}</div>

  <div className="flex items-center p-6 pt-0">{/* Card footer */}</div>
</div>
```

### Input

```tsx
<input
  type="text"
  className="
    flex h-10 w-full rounded-md
    border border-input
    bg-background
    px-3 py-2
    text-sm
    ring-offset-background
    file:border-0 file:bg-transparent file:text-sm file:font-medium
    placeholder:text-muted-foreground
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
  "
  placeholder="Enter text..."
/>
```

### Badge

```tsx
<span className="
  inline-flex items-center rounded-full
  px-2.5 py-0.5
  text-xs font-semibold
  bg-primary text-primary-foreground
">
  Badge
</span>

// Variants
<span className="bg-secondary text-secondary-foreground">Secondary</span>
<span className="bg-destructive text-destructive-foreground">Error</span>
<span className="border border-input bg-background">Outline</span>
```

---

## Dark Mode

### Using CSS Variables (Automatic)

```tsx
// Colors adapt automatically via CSS variables
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Works in both themes
  </button>
</div>
```

### Manual Toggle (if needed)

```tsx
"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 hover:bg-accent"
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}
```

---

## Animations & Transitions

### Hover Effects

```tsx
// Smooth transitions
<button className="
  bg-primary hover:bg-primary/90
  transition-colors duration-200
">
  Hover me
</button>

// Scale on hover
<div className="
  transform hover:scale-105
  transition-transform duration-200
">
  Card
</div>

// Shadow on hover
<div className="
  shadow-md hover:shadow-lg
  transition-shadow duration-200
">
  Elevated card
</div>
```

### Loading States

```tsx
// Pulse animation
<div className="animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
</div>

// Spin animation
<div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
```

### Custom Animations

```css
@layer utilities {
  @keyframes slide-in {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
}
```

---

## Utility Patterns

### Spacing

```tsx
// Consistent spacing scale (4px base)
<div className="space-y-4">    {/* 16px gap between children */}
<div className="space-x-2">    {/* 8px gap between children */}
<div className="p-4">          {/* 16px padding */}
<div className="px-6 py-4">   {/* 24px horizontal, 16px vertical */}
<div className="gap-4">        {/* 16px gap in flex/grid */}
```

### Typography

```tsx
// Headings
<h1 className="text-4xl font-bold tracking-tight">
  Main Title
</h1>

<h2 className="text-3xl font-semibold">
  Section Title
</h2>

<h3 className="text-2xl font-medium">
  Subsection
</h3>

// Body text
<p className="text-base text-muted-foreground leading-relaxed">
  Regular paragraph text
</p>

// Small text
<span className="text-sm text-muted-foreground">
  Helper text
</span>

// Truncate
<p className="truncate">
  This text will be truncated with ellipsis...
</p>

// Line clamp
<p className="line-clamp-3">
  This text will be limited to 3 lines with ellipsis...
</p>
```

### Focus States

```tsx
// Always include focus states for accessibility
<button className="
  focus:outline-none
  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
">
  Accessible button
</button>

<input className="
  focus:outline-none
  focus:ring-2 focus:ring-ring
"/>
```

---

## Container Queries (Tailwind 4)

```tsx
// Enable container queries
<div className="@container">
  <div className="@sm:grid-cols-2 @lg:grid-cols-3 grid gap-4">
    {/* Responds to container size, not viewport */}
  </div>

  <h2 className="text-xl @md:text-2xl @lg:text-3xl">Responsive to container</h2>
</div>
```

---

## Advanced Patterns

### Group Hover

```tsx
<div className="group hover:bg-accent rounded-lg p-4">
  <h3 className="group-hover:text-primary">
    Title changes color on parent hover
  </h3>
  <button className="opacity-0 group-hover:opacity-100">
    Appears on hover
  </button>
</div>
```

### Peer Modifier

```tsx
<div>
  <input type="checkbox" className="peer sr-only" id="terms" />
  <label
    htmlFor="terms"
    className="
      peer-checked:bg-primary peer-checked:text-primary-foreground
      peer-focus:ring-2 peer-focus:ring-ring
    "
  >
    Accept terms
  </label>
</div>
```

### Arbitrary Values

```tsx
// Use sparingly, prefer design tokens
<div className="w-[350px]">Fixed width</div>
<div className="top-[117px]">Specific position</div>
<div className="bg-[#1da1f2]">Brand color</div>
```

---

## Data Attributes

```tsx
// State-based styling
<div
  data-state={isOpen ? "open" : "closed"}
  className="
  data-[state=open]:bg-accent
  data-[state=closed]:bg-muted
"
>
  Content
</div>
```

---

## Best Practices

### ✅ Do:

```tsx
// Extract common patterns to components
<Button variant="primary" size="lg">Click me</Button>

// Use semantic colors
<div className="bg-background text-foreground">

// Compose utilities
<div className="flex items-center justify-between gap-4 p-4 rounded-lg border">

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### ❌ Don't:

```tsx
// Too many utilities (extract to component)
<div className="flex items-center justify-center p-4 m-2 bg-white text-black rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">

// Inline styles
<div style={{ padding: '16px', margin: '8px' }}>

// Hardcoded colors
<div className="bg-blue-500 text-white">

// Arbitrary values everywhere
<div className="w-[234px] h-[567px] mt-[23px]">
```

---

## Performance Tips

1. **Use PurgeCSS** (automatic in production)
2. **Avoid @apply** in components (use utilities directly)
3. **Group related utilities** for readability
4. **Use CSS variables** for theme values

---

## Component Library Integration (shadcn/ui)

Components use Tailwind utilities:

```tsx
// Example: Button component using Tailwind
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
  },
};

export function Button({
  variant = "default",
  size = "default",
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className,
      )}
      {...props}
    />
  );
}
```

---

## Resources

- [Tailwind CSS 4 Docs](https://tailwindcss.com)
- [Utility-First Fundamentals](https://tailwindcss.com/docs/utility-first)
- [Customization](https://tailwindcss.com/docs/adding-custom-styles)
- [Container Queries](https://tailwindcss.com/docs/hover-focus-and-other-states#container-queries)
