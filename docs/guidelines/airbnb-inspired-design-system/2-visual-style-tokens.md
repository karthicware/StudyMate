# 2. Visual Style & Tokens

> **⚠️ PRIMARY GUIDANCE**: All shadow and depth implementations in this document follow the principles defined in [Shadow.md](./Shadow.md), which serves as the authoritative reference for:
> - **Color Layering for Depth** (4-shade system for visual hierarchy)
> - **Two-Layer Shadows & Gradients** (small/medium/large shadow system)
> - Shadow.md takes precedence over any conflicting guidance in this document.

## 2.1 UI Color Palette Structure & Usage

A complete UI color palette consists of four main categories, following the **60-30-10 Rule**.

### Color Categories

| Category | Role | Usage Percentage | Implementation |
|----------|------|------------------|----------------|
| **Primary Color** | The prominent brand accent. (Accent) | **10%** | Used for: CTAs, primary buttons, progress bars, active navigation, links. NOT the most-used color, but the most prominent accent. |
| **Secondary/Accent** | Harmonious supporting colors. (Secondary) | **30%** | Used for: Highlighting new features, secondary actions, visual variety. Must complement, not compete with, the primary color. |
| **Neutral Colors** | Whites, grays, and black. (Dominant) | **60%** | Used for: Text (body, headings), backgrounds, panels, form controls, borders. Most screens are primarily composed of these colors. |
| **Semantic Colors** | Status communication. | N/A | Green (Success), Yellow/Amber (Warning), Red/Orange (Error/Destructive). |

### Implementation Guidelines

- Each color should have **8-10 shade variations** for flexibility (e.g., `gray-50` to `gray-900`)
- True red should be used for errors UNLESS red is your primary color (in which case, use orange for errors)
- Always verify WCAG AA color contrast ratios (4.5:1 for text, 3:1 for UI elements)

### StudyMate Color Tokens

| Token | Hex Value | Tailwind Class | Usage Example |
|-------|-----------|----------------|---------------|
| **Primary Accent** | `#ff3f6c` | `bg-primary-500` | Search button backgrounds, link hovers, active states |
| **Primary Hover** | `#e31c5f` | `bg-primary-600` | Button hover states, pressed states |
| **Primary Light** | `#ff568c` | `bg-primary-400` | Gradient tops, light backgrounds |
| **Success** | `#00A699` | `bg-success-500` | Success messages, verified states, available status |
| **Warning** | `#FFB400` | `bg-warning-500` | Warning alerts, caution states |
| **Danger** | `#E31C5F` | `bg-danger-500` | Error messages, destructive actions |
| **Text Primary** | `#222222` | `text-gray-900` | Headings, main body copy |
| **Text Secondary** | `#717171` | `text-gray-500` | Subtitles, captions, metadata |
| **Background Light** | `#FFFFFF` | `bg-white` | Default page and card background |
| **Background Subtle** | `#F7F7F7` | `bg-gray-50` | Page backgrounds, de-emphasized sections |
| **Border/Divider** | `#EAEAEA` | `border-gray-200` | Separators, form field outlines |

### Color Palette Shades

**Primary (Pink) Palette:**
```
primary-50:  #ffe8f0
primary-100: #ffcfdc
primary-200: #ff9fb8
primary-300: #ff6f95
primary-400: #ff568c (gradient top)
primary-500: #ff3f6c (base)
primary-600: #e31c5f (hover)
primary-700: #c01852
primary-800: #9d1445
primary-900: #7a1038
```

**Neutral (Gray) Palette:**
```
gray-50:  #f7f7f7
gray-100: #e3e3e3
gray-200: #c8c8c8
gray-300: #a4a4a4
gray-400: #818181
gray-500: #717171
gray-600: #555555
gray-700: #3e3e3e
gray-800: #2a2a2a
gray-900: #222222
```

**Semantic Colors:**
```
success-500: #00A699 (Airbnb Teal)
warning-500: #FFB400 (Amber)
danger-500:  #E31C5F (Deep Pink)
```

---

## 2.2 Typography

We use the **Inter** font family for a clean, neutral, and readable experience. Fallback to **Poppins** if Inter is unavailable.

### Typography Scale

| Role | Tailwind Classes | Size/Weight | Line Height | Usage |
|------|------------------|-------------|-------------|-------|
| **Display Header** | `text-4xl font-bold` | 36px / 700 | 1.2 (tight) | Page titles, hero text |
| **Title 1** | `text-3xl font-semibold` | 30px / 600 | 1.25 (tight) | Section titles, main component headings |
| **Title 2** | `text-2xl font-semibold` | 24px / 600 | 1.3 (tight) | Card titles, subsection headings |
| **Title 3** | `text-xl font-semibold` | 20px / 600 | 1.4 (normal) | Component titles, small headings |
| **Body Large** | `text-lg font-normal` | 18px / 400 | 1.5 (normal) | Lead paragraphs, important copy |
| **Body Text** | `text-base font-normal` | 16px / 400 | 1.5 (normal) | Standard paragraph and body copy |
| **Body Small** | `text-sm font-normal` | 14px / 400 | 1.5 (normal) | Form labels, secondary text |
| **Caption/Meta** | `text-xs font-light` | 12px / 300 | 1.6 (relaxed) | Dates, pricing details, secondary info |

### Font Weight Scale
- **Light**: 300 (Captions, metadata)
- **Regular**: 400 (Body text, paragraphs)
- **Medium**: 500 (Form labels, button text)
- **Semibold**: 600 (Headings, titles)
- **Bold**: 700 (Display headers, emphasis)

### Typography Implementation

**Tailwind Configuration:**
```javascript
fontFamily: {
  'heading': ['Inter', 'Poppins', 'sans-serif'],
  'body': ['Inter', 'Poppins', 'sans-serif'],
}
```

**HTML Implementation:**
```html
<!-- Display Header -->
<h1 class="text-4xl font-bold text-gray-900 font-heading">Welcome to StudyMate</h1>

<!-- Title 1 -->
<h2 class="text-3xl font-semibold text-gray-900 font-heading">Popular Study Spaces</h2>

<!-- Body Text -->
<p class="text-base font-normal text-gray-700 font-body">Find the perfect study space for your needs.</p>

<!-- Caption -->
<span class="text-xs font-light text-gray-500">Updated 2 hours ago</span>
```

---

## 2.3 Spacing System

We follow an **8-point grid system** for consistent spacing across all components.

### Spacing Scale

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| **xs** | 4px | `space-1`, `gap-1`, `p-1` | Micro spacing, icon gaps |
| **sm** | 8px | `space-2`, `gap-2`, `p-2` | Tight spacing, form field padding |
| **md** | 16px | `space-4`, `gap-4`, `p-4` | Standard spacing, card padding |
| **lg** | 24px | `space-6`, `gap-6`, `p-6` | Comfortable spacing, section padding |
| **xl** | 32px | `space-8`, `gap-8`, `p-8` | Generous spacing, page margins |
| **2xl** | 48px | `space-12`, `gap-12`, `p-12` | Large spacing, section separators |
| **3xl** | 64px | `space-16`, `gap-16`, `p-16` | Extra large spacing, hero sections |

### Spacing Guidelines

- **Within Components**: Use `md` (16px) as default
- **Between Components**: Use `lg` (24px) or `xl` (32px)
- **Section Separators**: Use `2xl` (48px) or `3xl` (64px)
- **Form Fields**: Use `sm` (8px) for field padding, `md` (16px) for field gaps
- **Card Padding**: Use `md` (16px) for compact cards, `lg` (24px) for standard cards

---

## 2.4 Border Radius

Rounded corners create a friendly, approachable aesthetic.

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| **Small** | 4px | `rounded` | Small buttons, badges, chips |
| **Medium** | 8px | `rounded-lg` | Input fields, form controls, small cards |
| **Large** | 12px | `rounded-xl` | Cards, modals, large buttons |
| **Extra Large** | 16px | `rounded-2xl` | Hero sections, feature cards |
| **Full** | 9999px | `rounded-full` | Circular elements, pill buttons, avatars |

### Border Radius Guidelines

- **Default for Cards**: Use `rounded-xl` (12px) - "Airbnb Standard"
- **Form Inputs**: Use `rounded-lg` (8px)
- **Buttons**: Use `rounded-lg` (8px) for standard, `rounded-full` for pill buttons
- **Modals**: Use `rounded-xl` (12px)
- **Images**: Use `rounded-lg` (8px) or `rounded-xl` (12px) depending on size

---
