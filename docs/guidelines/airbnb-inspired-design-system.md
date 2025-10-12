# Airbnb-Inspired Design System Guidelines

**Version**: 1.0
**Last Updated**: 2025-10-12
**Status**: Active

---

## Overview

This document outlines the core principles, visual style, and implementation guidelines for building StudyMate components that follow a **minimalist, friendly, and high-fidelity user experience**, inspired by Airbnb's design philosophy.

**All components, pages, and stories MUST follow these guidelines during planning, implementation, and verification.**

---

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [Visual Style & Tokens](#2-visual-style--tokens)
   - 2.1 [UI Color Palette Structure & Usage](#21-ui-color-palette-structure--usage)
   - 2.2 [Typography](#22-typography)
   - 2.3 [Spacing System](#23-spacing-system)
   - 2.4 [Border Radius](#24-border-radius)
3. [Responsive Strategy (The Breathing Layout)](#3-responsive-strategy-the-breathing-layout)
4. [Component Elevation and Depth](#4-component-elevation-and-depth)
   - 4.1 [Color Layering for Depth](#41-color-layering-for-depth-shade-strategy)
   - 4.2 [Two-Layer Shadows & Gradients](#42-two-layer-shadows--gradients)
5. [Animation & Microinteractions](#5-animation--microinteractions)
6. [Accessibility Requirements](#6-accessibility-requirements)
7. [Implementation Checklist](#7-implementation-checklist)
8. [Tailwind Configuration](#8-tailwind-configuration)

---

## 1. Core Principles

Every design decision must align with these four foundational principles:

| Principle | Description | Implementation Focus |
|-----------|-------------|---------------------|
| **Friendly Clarity** | Use clear, accessible language, and focus on simple, approachable shapes (rounded corners, soft typography). | Rounded corners (12px), Inter font, clear visual hierarchy. |
| **Trust through Fidelity** | Small details (smooth transitions, controlled shadows, perfect alignment) build user trust and premium quality. | Two-layer shadows, subtle hover effects, responsive precision. |
| **Accent Focus** | Reserve the primary accent color (60-30-10 rule) strictly for high-priority CTAs and essential interactive feedback. | Primary color (#ff3f6c) only on search buttons, active links, and focus states. |
| **Breathing Layout** | Layouts must prioritize flow and relationship over fixed pixels, allowing elements to reorganize naturally across breakpoints. | Flex/Grid, `sm:`, `md:`, `lg:` prefixes, responsive strategy implementation. |

### Principle Guidelines

#### Friendly Clarity
- **Typography**: Use Inter font family for a neutral, readable experience
- **Shapes**: Prefer rounded corners (12px standard, 8px for inputs)
- **Language**: Use conversational, helpful copy
- **Visual Hierarchy**: Clear distinction between headings, body text, and captions

#### Trust through Fidelity
- **Precision**: Pixel-perfect alignment across all breakpoints
- **Transitions**: All interactive elements have smooth transitions (300ms standard)
- **Shadows**: Consistent two-layer shadow system
- **Quality**: No visual artifacts, proper image optimization

#### Accent Focus
- **60-30-10 Rule**:
  - 60% Neutral colors (backgrounds, text)
  - 30% Semantic colors (status, secondary actions)
  - 10% Primary accent (#ff3f6c for emphasis)
- **Restraint**: Primary color used sparingly for maximum impact

#### Breathing Layout
- **Relationship**: Elements maintain stable relationships as viewport changes
- **Proportion**: Relative sizing ensures natural reorganization
- **Flow**: Consistent spacing, predictable column wrapping
- **No Fixed Widths**: Use `max-w-*` instead of fixed `w-*` where appropriate

---

## 2. Visual Style & Tokens

### 2.1 UI Color Palette Structure & Usage

A complete UI color palette consists of four main categories, following the **60-30-10 Rule**.

#### Color Categories

| Category | Role | Usage Percentage | Implementation |
|----------|------|------------------|----------------|
| **Primary Color** | The prominent brand accent. (Accent) | **10%** | Used for: CTAs, primary buttons, progress bars, active navigation, links. NOT the most-used color, but the most prominent accent. |
| **Secondary/Accent** | Harmonious supporting colors. (Secondary) | **30%** | Used for: Highlighting new features, secondary actions, visual variety. Must complement, not compete with, the primary color. |
| **Neutral Colors** | Whites, grays, and black. (Dominant) | **60%** | Used for: Text (body, headings), backgrounds, panels, form controls, borders. Most screens are primarily composed of these colors. |
| **Semantic Colors** | Status communication. | N/A | Green (Success), Yellow/Amber (Warning), Red/Orange (Error/Destructive). |

#### Implementation Guidelines

- Each color should have **8-10 shade variations** for flexibility (e.g., `gray-50` to `gray-900`)
- True red should be used for errors UNLESS red is your primary color (in which case, use orange for errors)
- Always verify WCAG AA color contrast ratios (4.5:1 for text, 3:1 for UI elements)

#### StudyMate Color Tokens

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

#### Color Palette Shades

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

### 2.2 Typography

We use the **Inter** font family for a clean, neutral, and readable experience. Fallback to **Poppins** if Inter is unavailable.

#### Typography Scale

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

#### Font Weight Scale
- **Light**: 300 (Captions, metadata)
- **Regular**: 400 (Body text, paragraphs)
- **Medium**: 500 (Form labels, button text)
- **Semibold**: 600 (Headings, titles)
- **Bold**: 700 (Display headers, emphasis)

#### Typography Implementation

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

### 2.3 Spacing System

We follow an **8-point grid system** for consistent spacing across all components.

#### Spacing Scale

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| **xs** | 4px | `space-1`, `gap-1`, `p-1` | Micro spacing, icon gaps |
| **sm** | 8px | `space-2`, `gap-2`, `p-2` | Tight spacing, form field padding |
| **md** | 16px | `space-4`, `gap-4`, `p-4` | Standard spacing, card padding |
| **lg** | 24px | `space-6`, `gap-6`, `p-6` | Comfortable spacing, section padding |
| **xl** | 32px | `space-8`, `gap-8`, `p-8` | Generous spacing, page margins |
| **2xl** | 48px | `space-12`, `gap-12`, `p-12` | Large spacing, section separators |
| **3xl** | 64px | `space-16`, `gap-16`, `p-16` | Extra large spacing, hero sections |

#### Spacing Guidelines

- **Within Components**: Use `md` (16px) as default
- **Between Components**: Use `lg` (24px) or `xl` (32px)
- **Section Separators**: Use `2xl` (48px) or `3xl` (64px)
- **Form Fields**: Use `sm` (8px) for field padding, `md` (16px) for field gaps
- **Card Padding**: Use `md` (16px) for compact cards, `lg` (24px) for standard cards

---

### 2.4 Border Radius

Rounded corners create a friendly, approachable aesthetic.

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| **Small** | 4px | `rounded` | Small buttons, badges, chips |
| **Medium** | 8px | `rounded-lg` | Input fields, form controls, small cards |
| **Large** | 12px | `rounded-xl` | Cards, modals, large buttons |
| **Extra Large** | 16px | `rounded-2xl` | Hero sections, feature cards |
| **Full** | 9999px | `rounded-full` | Circular elements, pill buttons, avatars |

#### Border Radius Guidelines

- **Default for Cards**: Use `rounded-xl` (12px) - "Airbnb Standard"
- **Form Inputs**: Use `rounded-lg` (8px)
- **Buttons**: Use `rounded-lg` (8px) for standard, `rounded-full` for pill buttons
- **Modals**: Use `rounded-xl` (12px)
- **Images**: Use `rounded-lg` (8px) or `rounded-xl` (12px) depending on size

---

## 3. Responsive Strategy (The Breathing Layout)

We prioritize **fluid layouts** that adapt gracefully by focusing on **relationship, proportion, and flow**. The layout shouldn't shrink; it should **breathe and reorganize**.

### The Three Pillars of Breathing Layout

#### Prompt 1: Structure (Relationship)

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

#### Prompt 2: Behavior (Proportion)

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

#### Flow (Stability)

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

### Responsive Breakpoints

| Breakpoint | Min Width | Tailwind Prefix | Usage |
|------------|-----------|-----------------|-------|
| **Mobile** | 0px | (default) | Base mobile-first styles |
| **SM** | 640px | `sm:` | Large phones, small tablets |
| **MD** | 768px | `md:` | Tablets, small laptops |
| **LG** | 1024px | `lg:` | Laptops, desktops |
| **XL** | 1280px | `xl:` | Large desktops |
| **2XL** | 1536px | `2xl:` | Extra large screens |

### Responsive Strategy Guidelines

1. **Mobile-First Approach**: Start with mobile layout, then enhance for larger screens
2. **Content Priority**: Most important content should be visible on mobile without scrolling
3. **Touch Targets**: Minimum 44x44px for interactive elements on mobile
4. **Readable Line Length**: Max 75 characters per line for body text
5. **Grid Collapsing**: Multi-column grids should collapse to 1-2 columns on mobile
6. **Navigation**: Consider hamburger menu for mobile, full menu for desktop

---

## 4. Component Elevation and Depth

We use **subtle layering** and **controlled shadows** to establish visual hierarchy and depth, reinforcing the "Trust through Fidelity" principle.

### 4.1 Color Layering for Depth (Shade Strategy)

The visual separation between elements should often be achieved through **color contrast (shading), not borders**.

#### Shade System

| Shade Level | Lightness Adjustment | Usage | Emphasis |
|-------------|---------------------|-------|----------|
| **Shade 1 (Darkest)** | Base color - 0.1 lightness | Page background, table backgrounds (to de-emphasize). | Recedes (Pushed deeper) |
| **Shade 2 (Medium)** | Base color (Starting point) | Container/card backgrounds, navigation base. | Neutral (Standard layer) |
| **Shade 3 (Light)** | Base color + 0.1 lightness | Interactive elements (buttons, tabs, inputs), important card elements. | Pops (Moves closer) |
| **Shade 4 (Lightest)** | Base color + 0.2 lightness | Selected/active/hover states. | Strongest Pop |

#### Shade Strategy Rule

**Remove borders from any element using Shade 3 or 4; the color contrast provides separation.**

#### Implementation Example

**Registration Form Shading:**
- **Shade 1**: Page background (`bg-gray-50`) - Recedes
- **Shade 2**: Form card container (`bg-white`) - Neutral base
- **Shade 3**: Input focus states (`bg-gray-50` with `ring-2 ring-primary-300`) - Pops
- **Shade 4**: Button hover states (`bg-primary-50` overlay) - Strongest pop

**Code Example:**
```html
<!-- Page Background (Shade 1) -->
<div class="min-h-screen bg-gray-50">

  <!-- Card Container (Shade 2) -->
  <div class="bg-white rounded-xl shadow-card p-8">

    <!-- Input Field (Shade 2 → Shade 3 on focus) -->
    <input
      class="bg-white focus:bg-gray-50 border-0 focus:ring-2 focus:ring-primary-300"
      placeholder="Email"
    />

    <!-- Button (Shade 3 → Shade 4 on hover) -->
    <button class="bg-primary-500 hover:bg-primary-400">
      Search
    </button>

  </div>

</div>
```

---

### 4.2 Two-Layer Shadows & Gradients

All elevation uses a **two-layer shadow system**: a subtle light glow (white inner shadow) and a soft dark shadow (standard drop shadow).

#### Shadow Levels

| Shadow Level | Usage | Tailwind Implementation Concept |
|--------------|-------|--------------------------------|
| **SMALL** | Subtle elements, nav items, tabs. | `inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.1)` |
| **MEDIUM** | Standard elevation: Cards, dropdowns, modals. (Default) | `inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 6px rgba(0,0,0,0.15)` |
| **LARGE** | Prominent depth: Hover states, focused elements, key modals. | `inset 0 2px 0 rgba(255,255,255,0.2), 0 6px 12px rgba(0,0,0,0.2)` |

#### Shadow Implementation

**Tailwind Configuration:**
```javascript
boxShadow: {
  'soft': 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.1)',
  'card': 'inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 6px rgba(0,0,0,0.15)',
  'modal': 'inset 0 2px 0 rgba(255,255,255,0.2), 0 6px 12px rgba(0,0,0,0.2)',
}
```

**Usage Guidelines:**
- **Cards**: Use `shadow-card` for standard cards
- **Modals**: Use `shadow-modal` for modal dialogs
- **Dropdowns**: Use `shadow-modal` for dropdown menus
- **Buttons**: Use `shadow-card` by default, `shadow-modal` on hover
- **Hover States**: Increase shadow level (soft → card → modal)

#### Gradient Enhancement (Premium Effect)

Use a **top-to-bottom linear gradient** and a **lighter inner shadow** on the top edge to create a "shiny highlight" for premium interactive elements like buttons and dropdowns.

**Implementation Steps:**
1. Create linear gradient (top to bottom):
   - **Top**: Lighter shade (`#ff568c` or base + 0.1-0.2 lightness)
   - **Bottom**: Darker shade (`#ff3f6c` or base - 0.05-0.1 lightness)
2. Add lighter inner shadow on top edge:
   - `inset 0 1px 0 rgba(255,255,255,0.3)`
3. Add standard shadow at bottom (medium or large)

**Tailwind Implementation:**
```html
<button class="
  bg-gradient-to-b from-[#ff568c] to-[#ff3f6c]
  shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_6px_rgba(0,0,0,0.15)]
  hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_6px_12px_rgba(0,0,0,0.2)]
  hover:from-[#e31c5f] hover:to-[#c01852]
  transition-all duration-300
  px-6 py-3 rounded-lg text-white font-medium
">
  Sign Up
</button>
```

**Gradient Usage Guidelines:**
- **Primary CTAs**: Always use gradient for main action buttons
- **Search Buttons**: Use gradient to draw attention
- **Submit Buttons**: Use gradient for form submission
- **Standard Buttons**: Solid colors are acceptable for secondary actions
- **Hover Effect**: Transition to deeper gradient on hover

---

## 5. Animation & Microinteractions

Smooth, purposeful animations enhance user experience and build trust through fidelity.

### Animation Timing

| Duration | Milliseconds | Tailwind Class | Usage |
|----------|--------------|----------------|-------|
| **Fast** | 200ms | `duration-200` | Quick feedback, small movements |
| **Standard** | 300ms | `duration-300` | Default for most transitions |
| **Complex** | 500ms | `duration-500` | Multi-step animations, complex transitions |

### Easing Functions

| Easing | Tailwind Class | Usage |
|--------|----------------|-------|
| **Linear** | `ease-linear` | Continuous animations (spinners, progress bars) |
| **Ease In** | `ease-in` | Exit animations, fading out |
| **Ease Out** | `ease-out` | Entrance animations, fading in |
| **Ease In-Out** | `ease-in-out` | Most transitions, hover effects |

### Common Microinteractions

#### Button Hover
```html
<button class="
  transform hover:-translate-y-1
  transition-all duration-300 ease-in-out
  shadow-card hover:shadow-modal
">
  Click Me
</button>
```

#### Input Focus
```html
<input class="
  border-2 border-gray-200
  focus:border-primary-500 focus:ring-2 focus:ring-primary-300
  transition-all duration-200 ease-out
"/>
```

#### Card Hover (Image Scale)
```html
<div class="overflow-hidden rounded-xl">
  <img class="
    transform transition-transform duration-300 ease-in-out
    hover:scale-105
  " src="property.jpg" />
</div>
```

#### Loading Spinner
```html
<svg class="animate-spin h-5 w-5 text-primary-500">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
```

### Animation Guidelines

1. **Use GPU-Accelerated Properties**: Prefer `transform` and `opacity` over `top`, `left`, `width`, `height`
2. **Respect User Preferences**: Use `motion-reduce:` prefix for users with motion sensitivity
3. **Purposeful Animations**: Every animation should have a clear purpose (feedback, guidance, delight)
4. **Consistent Timing**: Use standard durations (200ms, 300ms, 500ms) across the app
5. **Subtle Movement**: Avoid excessive or jarring animations

---

## 6. Accessibility Requirements

All components MUST meet **WCAG 2.1 Level AA** standards.

### Color Contrast

| Element Type | Minimum Contrast Ratio | Example |
|--------------|------------------------|---------|
| **Body Text** | 4.5:1 | `text-gray-900` on `bg-white` |
| **Large Text (18px+)** | 3:1 | `text-gray-700` on `bg-white` |
| **UI Components** | 3:1 | `border-gray-300` on `bg-white` |
| **Graphical Objects** | 3:1 | Icons, focus indicators |

### Keyboard Navigation

- **Tab Order**: All interactive elements must be reachable via Tab key
- **Focus Indicators**: Visible focus states for all interactive elements
- **Skip Links**: Provide skip navigation links for keyboard users
- **Escape Key**: Modals and dropdowns should close with Escape key

### ARIA Labels

- **Buttons**: Use `aria-label` when button has no text (icon-only)
- **Form Fields**: Use `aria-describedby` for error messages
- **Loading States**: Use `aria-busy="true"` during async operations
- **Alerts**: Use `role="alert"` for dynamic messages

### Motion Sensitivity

Use `prefers-reduced-motion` media query to respect user preferences:

```html
<button class="
  transition-all duration-300
  motion-reduce:transition-none
">
  Hover Me
</button>
```

### Accessibility Checklist

- [ ] All images have descriptive `alt` text
- [ ] Form fields have visible labels or `aria-label`
- [ ] Error messages are announced to screen readers
- [ ] Focus indicators are visible (2px outline minimum)
- [ ] Color is not the only means of conveying information
- [ ] Interactive elements have minimum 44x44px touch target (mobile)
- [ ] Text can be zoomed to 200% without breaking layout
- [ ] Animations respect `prefers-reduced-motion`

---

## 7. Implementation Checklist

Use this checklist during **planning**, **implementation**, and **verification** of all components, pages, and stories.

### Planning Phase

- [ ] Design follows core principles (Friendly Clarity, Trust through Fidelity, Accent Focus, Breathing Layout)
- [ ] Color usage follows 60-30-10 rule
- [ ] Typography scale is applied correctly
- [ ] Spacing uses 8-point grid system
- [ ] Responsive strategy is defined for all breakpoints
- [ ] Accessibility requirements are considered

### Implementation Phase

- [ ] Tailwind configuration includes design system tokens
- [ ] Components use design system color classes
- [ ] Typography uses Inter/Poppins fonts
- [ ] Border radius follows guidelines (12px for cards, 8px for inputs)
- [ ] Shadows use two-layer system (shadow-soft, shadow-card, shadow-modal)
- [ ] Gradients applied to primary CTAs
- [ ] Animations use standard durations (200ms, 300ms, 500ms)
- [ ] Hover states are implemented for all interactive elements
- [ ] Focus states are visible and meet accessibility standards
- [ ] Layout uses Flexbox/Grid for responsive behavior
- [ ] Components reorganize naturally at breakpoints

### Verification Phase

- [ ] Visual appearance matches design system guidelines
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1 for text, 3:1 for UI)
- [ ] Typography is readable and properly scaled
- [ ] Spacing is consistent and follows 8-point grid
- [ ] Shadows are subtle and consistent
- [ ] Animations are smooth (60fps target)
- [ ] Hover/focus states work correctly
- [ ] Layout is responsive across all breakpoints (360px, 768px, 1024px, 1440px)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader compatibility verified
- [ ] No browser console errors or warnings
- [ ] Motion preferences respected (`prefers-reduced-motion`)

---

## 8. Tailwind Configuration

Add these tokens to your `tailwind.config.js` to implement the design system.

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary (Airbnb Pink)
        primary: {
          50: '#ffe8f0',
          100: '#ffcfdc',
          200: '#ff9fb8',
          300: '#ff6f95',
          400: '#ff568c', // Gradient top
          500: '#ff3f6c', // Base
          600: '#e31c5f', // Hover
          700: '#c01852',
          800: '#9d1445',
          900: '#7a1038',
        },
        // Success (Airbnb Teal)
        success: {
          500: '#00A699',
        },
        // Warning (Amber)
        warning: {
          500: '#FFB400',
        },
        // Danger (Deep Pink)
        danger: {
          500: '#E31C5F',
        },
      },
      fontFamily: {
        heading: ['Inter', 'Poppins', 'sans-serif'],
        body: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        soft: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.1)',
        card: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 6px rgba(0,0,0,0.15)',
        modal: 'inset 0 2px 0 rgba(255,255,255,0.2), 0 6px 12px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        airbnb: '12px', // Standard Airbnb border radius
      },
      spacing: {
        // 8-point grid system
        // Already covered by Tailwind's default spacing
      },
    },
  },
  plugins: [],
}
```

---

## Examples

### Example 1: Search Bar Component

```html
<div class="max-w-4xl mx-auto">
  <div class="bg-white border border-gray-300 rounded-full shadow-card hover:shadow-modal transition-shadow duration-300 flex items-center overflow-hidden">

    <!-- Where -->
    <div class="flex-1 px-6 py-3 border-r border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
      <label class="block text-xs font-semibold text-gray-900 mb-0.5">Where</label>
      <input
        type="text"
        placeholder="Search destinations"
        class="w-full text-sm text-gray-500 border-none outline-none bg-transparent placeholder-gray-400"
      />
    </div>

    <!-- Check in -->
    <div class="flex-1 px-6 py-3 border-r border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
      <label class="block text-xs font-semibold text-gray-900 mb-0.5">Check in</label>
      <input
        type="text"
        placeholder="Add dates"
        class="w-full text-sm text-gray-500 border-none outline-none bg-transparent placeholder-gray-400"
      />
    </div>

    <!-- Search Button -->
    <div class="pr-2">
      <button
        class="bg-gradient-to-b from-[#ff568c] to-[#ff3f6c] hover:from-[#e31c5f] hover:to-[#c01852] text-white rounded-full p-4 shadow-card hover:shadow-modal transition-all duration-200 flex items-center justify-center"
        aria-label="Search"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>
    </div>

  </div>
</div>
```

### Example 2: Property Card

```html
<div class="group cursor-pointer">
  <!-- Property Image -->
  <div class="relative aspect-square rounded-xl overflow-hidden mb-3">
    <img
      src="property.jpg"
      alt="Apartment in Abu Dhabi"
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />

    <!-- Guest Favorite Badge -->
    <div class="absolute top-3 left-3 bg-white rounded-full px-3 py-1 shadow-card">
      <span class="text-xs font-semibold text-gray-900">Guest favorite</span>
    </div>

    <!-- Favorite Heart Icon -->
    <button
      class="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
      aria-label="Add to favorites"
    >
      <svg class="w-6 h-6 fill-none stroke-white stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  </div>

  <!-- Property Info -->
  <div class="space-y-1">
    <!-- Title and Rating -->
    <div class="flex items-start justify-between gap-2">
      <h3 class="text-base font-medium text-gray-900 flex-1">Apartment in Abu Dhabi</h3>
      <div class="flex items-center gap-1 flex-shrink-0">
        <svg class="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <span class="text-sm font-medium text-gray-900">4.5</span>
      </div>
    </div>

    <!-- Location -->
    <p class="text-sm text-gray-600">1,971 ft • 2 nights</p>

    <!-- Price -->
    <div class="pt-1">
      <span class="text-base font-semibold text-gray-900">$450</span>
      <span class="text-sm text-gray-600"> night</span>
    </div>
  </div>
</div>
```

### Example 3: Primary Button with Gradient

```html
<button class="
  bg-gradient-to-b from-[#ff568c] to-[#ff3f6c]
  hover:from-[#e31c5f] hover:to-[#c01852]
  shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_6px_rgba(0,0,0,0.15)]
  hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_6px_12px_rgba(0,0,0,0.2)]
  transform hover:-translate-y-0.5
  transition-all duration-300 ease-in-out
  px-8 py-3 rounded-lg
  text-white font-medium
  disabled:opacity-50 disabled:cursor-not-allowed
  motion-reduce:transition-none
">
  Sign Up
</button>
```

---

## Enforcement

**All components, pages, and stories MUST be reviewed against this document during:**

1. **Story Planning**: Ensure story requirements align with design system
2. **Implementation**: Verify code follows design system tokens and guidelines
3. **Code Review**: Reviewers must check adherence to design system
4. **QA Verification**: Test visual appearance, accessibility, and responsive behavior

**Non-compliance should be flagged and corrected before merging.**

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-12 | 1.0 | Initial creation of Airbnb-inspired design system guidelines | System |

---

## References

- [Airbnb Design Language](https://airbnb.design/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Color System](https://material.io/design/color/the-color-system.html)

---

**For questions or suggestions, please contact the design system maintainers.**
