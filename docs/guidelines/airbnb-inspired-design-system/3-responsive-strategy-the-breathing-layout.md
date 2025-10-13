# 3. Responsive Strategy (The Breathing Layout)

We prioritize **fluid layouts** that adapt gracefully by focusing on **relationship, proportion, and flow**. The layout shouldn't shrink; it should **breathe and reorganize**.

## The Three Pillars of Breathing Layout

### Prompt 1: Structure (Relationship)

**Define how elements (boxes) contain and align, focusing on stable internal relationships.**

- Sections move above/below others; important areas retain priority
- Use **Flex** and **Grid** for structure
- Use responsive prefixes (`md:flex-row`, `sm:grid-cols-1`) to redefine flow

**Example:**
```html
<!-- Mobile: Stack vertically | Desktop: Side-by-side -->
<div class="flex flex-col md:flex-row gap-6">
  <div class="w-full md:w-1/2">Hero Section</div>
  <div class="w-full md:w-1/2">Form Section</div>
</div>
```

### Prompt 2: Behavior (Proportion)

**Structure elements to rearrange naturally when space changes without breaking balance.**

- Which sections expand, and which step back?
- Use **relative units** (`w-full`, `max-w-7xl`)
- Use Tailwind's `flex-grow` or `col-span-1` to control expansion and compression

**Example:**
```html
<!-- Search bar expands, button stays fixed width -->
<div class="flex items-center gap-2">
  <input class="flex-1 px-4 py-2" placeholder="Search destinations">
  <button class="flex-shrink-0 px-6 py-2">Search</button>
</div>
```

### Flow (Stability)

**Maintain an organized and stable feel, even when resized.**

- Margins should scale, gaps should stay consistent, columns merge into rows
- Utilize consistent **Spacing tokens** (`space-x-4`, `gap-y-6`)
- Use responsive utility classes to force column wrapping on smaller screens (`flex-wrap`)

**Example:**
```html
<!-- 4 columns on desktop, 2 on tablet, 1 on mobile -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Property cards -->
</div>
```

## Responsive Breakpoints

| Breakpoint | Min Width | Tailwind Prefix | Usage |
|------------|-----------|-----------------|-------|
| **Mobile** | 0px | (default) | Base mobile-first styles |
| **SM** | 640px | `sm:` | Large phones, small tablets |
| **MD** | 768px | `md:` | Tablets, small laptops |
| **LG** | 1024px | `lg:` | Laptops, desktops |
| **XL** | 1280px | `xl:` | Large desktops |
| **2XL** | 1536px | `2xl:` | Extra large screens |

## Responsive Strategy Guidelines

1. **Mobile-First Approach**: Start with mobile layout, then enhance for larger screens
2. **Content Priority**: Most important content should be visible on mobile without scrolling
3. **Touch Targets**: Minimum 44x44px for interactive elements on mobile
4. **Readable Line Length**: Max 75 characters per line for body text
5. **Grid Collapsing**: Multi-column grids should collapse to 1-2 columns on mobile
6. **Navigation**: Consider hamburger menu for mobile, full menu for desktop

---
