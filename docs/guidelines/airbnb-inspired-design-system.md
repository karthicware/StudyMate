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

## 9. Header and Footer Component Specifications

This section provides detailed implementation guidelines for the global header and footer components, ensuring they align with the Airbnb-inspired design system principles.

### 9.1 Target Technology Stack

- **Framework**: Angular (Component-based architecture)
- **Styling**: Tailwind CSS (Utility-first approach)
- **Design Philosophy**: Airbnb-inspired minimalism with breathing layouts

---

### 9.2 Global Styling Configuration

#### Color Palette Integration

Extend your `tailwind.config.js` with the Airbnb-inspired brand colors:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'red-accent': '#ff3f6c',      // Primary accent (matches primary-500)
        'neutral-dark': '#222222',    // Text primary (matches gray-900)
        'neutral-light': '#EAEAEA',   // Border/divider (matches gray-200)
      }
    }
  }
}
```

#### Design System Compliance

- **Typography**: Clean sans-serif stack using `font-sans` (Inter/Poppins)
- **Spacing**: Tailwind's default 8-point grid scale (`p-4`, `m-2`, `space-x-4`)
- **Responsive**: Mobile-first approach with breakpoint modifiers
- **Transitions**: Smooth 300ms transitions for interactive states
- **Accessibility**: WCAG AA compliant with proper contrast ratios

---

### 9.3 Header Component Implementation

The header should be implemented as a sticky, modular Angular component with child components for maintainability.

#### 9.3.1 Header Structure & Layout

**Component:** `<app-header>`

| Feature | Tailwind Classes | Design System Alignment |
|---------|------------------|------------------------|
| **Main Container** | `fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 p-4` | Uses **Shade 2** (white background), **Elevation** (border separation), **Breathing Layout** (full width) |
| **Content Wrapper** | `flex items-center justify-between max-w-7xl mx-auto` | Centers content, uses **Responsive Strategy** (max-w-7xl container) |
| **Logo Section** | `flex-shrink-0` | Maintains stable size (Breathing Layout principle) |
| **User Actions** | `flex items-center space-x-4` | Uses **Spacing System** (space-x-4 = 16px) |

**Angular Implementation:**

```typescript
@Component({
  selector: 'app-header',
  template: `
    <header class="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 p-4">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <app-logo></app-logo>
        </div>

        <!-- Search Bar -->
        <app-search-bar class="hidden lg:block"></app-search-bar>

        <!-- User Menu -->
        <app-user-menu></app-user-menu>
      </div>
    </header>
  `
})
export class HeaderComponent { }
```

---

#### 9.3.2 Search Bar Component (`<app-search-bar>`)

This is the central, complex component that exemplifies the design system principles.

**Design System Alignment:**
- **Border Radius**: `rounded-full` (pill-shaped, aligns with "Friendly Clarity")
- **Shadow**: `shadow-card` with `hover:shadow-modal` (Two-layer shadow system)
- **Transitions**: `transition-shadow duration-200` (Standard 200ms for quick feedback)
- **Responsive**: `hidden lg:flex` (mobile-first approach)

| Section | Tailwind Classes | Design System Notes |
|---------|------------------|---------------------|
| **Outer Container** | `hidden lg:flex items-center h-12 border border-gray-300 rounded-full shadow-card hover:shadow-modal transition-shadow duration-200 cursor-pointer` | Uses **Component Elevation** (shadow-card), **Border Radius** (rounded-full), **Animation** (duration-200) |
| **Input Sections** | `px-4 text-sm font-medium border-r border-gray-200` | Uses **Spacing** (px-4 = 16px), **Typography** (text-sm font-medium) |
| **Search Button** | `bg-red-accent text-white rounded-full p-2.5 absolute right-0 top-1/2 -translate-y-1/2 hover:shadow-modal transition-all duration-300` | Uses **Primary Accent** (10% rule), **Gradient** (can be enhanced), **Microinteractions** (hover shadow) |

**Angular Implementation:**

```typescript
@Component({
  selector: 'app-search-bar',
  template: `
    <div class="hidden lg:flex items-center h-12 border border-gray-300 rounded-full shadow-card hover:shadow-modal transition-shadow duration-200 cursor-pointer relative">

      <!-- Location Input -->
      <div class="px-4 text-sm font-medium border-r border-gray-200">
        <label class="block text-xs font-semibold text-gray-900 mb-0.5">Where</label>
        <input
          type="text"
          placeholder="Search destinations"
          class="w-full text-sm text-gray-500 border-none outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      <!-- Date Input -->
      <div class="px-4 text-sm font-medium border-r border-gray-200">
        <label class="block text-xs font-semibold text-gray-900 mb-0.5">Check in</label>
        <input
          type="text"
          placeholder="Add dates"
          class="w-full text-sm text-gray-500 border-none outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      <!-- Guests Input -->
      <div class="px-4 text-sm font-medium">
        <label class="block text-xs font-semibold text-gray-900 mb-0.5">Guests</label>
        <input
          type="text"
          placeholder="Add guests"
          class="w-full text-sm text-gray-500 border-none outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      <!-- Search Button (with Gradient Enhancement) -->
      <button
        class="bg-gradient-to-b from-[#ff568c] to-[#ff3f6c] hover:from-[#e31c5f] hover:to-[#c01852]
               text-white rounded-full p-2.5 mx-2 absolute right-0 top-1/2 -translate-y-1/2
               shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_6px_rgba(0,0,0,0.15)]
               hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_6px_12px_rgba(0,0,0,0.2)]
               transition-all duration-300 ease-in-out"
        aria-label="Search">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>

    </div>
  `
})
export class SearchBarComponent { }
```

**Design System Compliance:**
- ✅ **Accent Focus**: Primary color (#ff3f6c) used only on search button
- ✅ **Gradient Enhancement**: Premium two-layer gradient with inner shadow
- ✅ **Microinteractions**: Smooth hover transitions (300ms)
- ✅ **Accessibility**: Proper aria-label for icon-only button

---

#### 9.3.3 User Menu Component (`<app-user-menu>`)

**Design System Alignment:**
- **Responsive**: `hidden md:block` for "Become a host" button
- **Border Radius**: `rounded-full` (pill buttons)
- **Hover States**: `hover:bg-gray-100` and `hover:shadow-modal`
- **Spacing**: `space-x-2` and `space-x-4` for consistent gaps

| Section | Tailwind Classes | Design System Notes |
|---------|------------------|---------------------|
| **"Become a host" Link** | `text-sm font-medium py-2 px-3 rounded-full hover:bg-gray-100 hidden md:block transition-colors duration-200` | Uses **Shade Strategy** (hover:bg-gray-100 = Shade 4), **Typography** (text-sm font-medium) |
| **Menu Button** | `flex items-center space-x-2 border border-gray-300 rounded-full p-1.5 hover:shadow-modal transition-shadow duration-200` | Uses **Component Elevation** (hover:shadow-modal), **Border Radius** (rounded-full) |
| **Hamburger Icon** | `h-4 w-4 text-neutral-dark` | Uses **Neutral Color** (text-neutral-dark = gray-900) |
| **Avatar Placeholder** | `h-6 w-6 rounded-full bg-gray-500` | Uses **Border Radius** (rounded-full for circular avatar) |

**Angular Implementation:**

```typescript
@Component({
  selector: 'app-user-menu',
  template: `
    <div class="flex items-center space-x-4">

      <!-- Become a Host Button -->
      <button class="text-sm font-medium py-2 px-3 rounded-full hover:bg-gray-100 hidden md:block transition-colors duration-200">
        Become a host
      </button>

      <!-- User Menu Button -->
      <button
        class="flex items-center space-x-2 border border-gray-300 rounded-full p-1.5 hover:shadow-modal transition-shadow duration-200"
        aria-label="User menu"
        (click)="toggleMenu()">

        <!-- Hamburger Icon -->
        <svg class="h-4 w-4 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>

        <!-- Avatar Placeholder -->
        <span class="h-6 w-6 rounded-full bg-gray-500 flex items-center justify-center">
          <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </span>

      </button>

    </div>
  `
})
export class UserMenuComponent {
  toggleMenu() {
    // Menu toggle logic
  }
}
```

**Design System Compliance:**
- ✅ **Breathing Layout**: Elements maintain stable relationships across breakpoints
- ✅ **Microinteractions**: Hover effects with shadow elevation
- ✅ **Accessibility**: Proper aria-label for menu button

---

#### 9.3.4 User Menu Dropdown Component (`<app-user-menu-dropdown>`)

This dropdown appears when the User Menu button (avatar/hamburger icon) in the Header is clicked.

**Design System Alignment:**
- **Shadow**: `shadow-2xl` for prominent elevation (Two-Layer Shadow System)
- **Border Radius**: `rounded-xl` matches card aesthetic (12px)
- **Spacing**: `py-2 px-3` follows 8-point grid system
- **Hover States**: `hover:bg-gray-50` uses Shade 4 strategy

##### Structure and Layout

| Feature | Tailwind Classes | Design System Notes |
|---------|------------------|---------------------|
| **Container** | `absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden` | Uses **absolute positioning** relative to header. `shadow-2xl` for prominence. `rounded-xl` matches **Border Radius** guidelines (12px). |
| **Z-Index** | `z-40` | Ensures menu appears above page content but below modals (z-50). |
| **Divider** | `border-t border-gray-200 my-2` | Subtle horizontal lines separate logical groups. Uses **Neutral Colors** (border-gray-200). |

##### Menu Item Specifications

**A. Standard Menu Link** (e.g., "Refer a Host", "Gift cards")

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Text** | `text-base text-gray-800 font-normal` | Standard body text size, dark gray for readability |
| **Spacing** | `block py-2 px-3` | Large hit area (48px height minimum for accessibility) |
| **Hover** | `hover:bg-gray-50 rounded-lg transition-colors duration-200` | Subtle **Shade 4** background change with smooth transition |
| **Active/Focus** | `focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-300` | Keyboard navigation support |

**B. Prominent Host Action Link** (e.g., "Become a host")

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200` | Flexbox for text-left, image-right alignment |
| **Title** | `text-base text-gray-800 font-semibold` | Slightly bolder to emphasize main action |
| **Subtitle** | `text-sm text-gray-500 font-normal` | Smaller, lighter text (secondary information) |
| **Image/Icon** | `w-12 h-12 object-contain flex-shrink-0 rounded-lg` | Fixed size, maintains aspect ratio |

**C. Top Section** (Help Center)

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Layout** | `flex items-center gap-2 py-2 px-3` | Aligns icon and text with 8px gap |
| **Icon** | `w-5 h-5 text-gray-800` | Question mark icon, standard icon size |
| **Text** | `text-base font-semibold text-gray-800` | Semi-bold to distinguish as top category |

##### Angular Component Implementation

```typescript
import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuItem {
  label: string;
  subtitle?: string;
  icon?: string;
  imageUrl?: string;
  action: () => void;
  dividerAfter?: boolean;
  prominent?: boolean;
}

@Component({
  selector: 'app-user-menu-dropdown',
  template: `
    <div
      *ngIf="isOpen"
      class="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40"
      role="menu"
      [attr.aria-labelledby]="triggerId"
      [@dropdownAnimation]>

      <!-- Menu Items -->
      <nav class="py-2">
        <ng-container *ngFor="let item of menuItems; let i = index">

          <!-- Prominent Item (with image/subtitle) -->
          <a
            *ngIf="item.prominent"
            (click)="handleItemClick(item)"
            (keydown.enter)="handleItemClick(item)"
            class="flex justify-between items-center py-2 px-3 mx-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-300"
            role="menuitem"
            tabindex="0">
            <div>
              <p class="text-base text-gray-800 font-semibold">{{ item.label }}</p>
              <p *ngIf="item.subtitle" class="text-sm text-gray-500 font-normal mt-0.5">{{ item.subtitle }}</p>
            </div>
            <img
              *ngIf="item.imageUrl"
              [src]="item.imageUrl"
              [alt]="item.label"
              class="w-12 h-12 object-contain flex-shrink-0 rounded-lg"
            />
          </a>

          <!-- Standard Item -->
          <a
            *ngIf="!item.prominent"
            (click)="handleItemClick(item)"
            (keydown.enter)="handleItemClick(item)"
            class="flex items-center gap-2 py-2 px-3 mx-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-300"
            role="menuitem"
            tabindex="0">
            <!-- Icon (if provided) -->
            <svg
              *ngIf="item.icon"
              class="w-5 h-5 text-gray-800 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
            </svg>
            <!-- Label -->
            <span class="text-base text-gray-800 font-normal">{{ item.label }}</span>
          </a>

          <!-- Divider (if specified) -->
          <div *ngIf="item.dividerAfter" class="border-t border-gray-200 my-2"></div>

        </ng-container>
      </nav>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ]
})
export class UserMenuDropdownComponent {
  @Input() isOpen: boolean = false;
  @Input() triggerId: string = 'user-menu-button';
  @Input() isAuthenticated: boolean = false;
  @Output() closed = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  get menuItems(): MenuItem[] {
    // Authenticated user menu
    if (this.isAuthenticated) {
      return [
        {
          label: 'Help Center',
          icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          action: () => this.navigate('/help')
        },
        {
          label: 'Become a host',
          subtitle: 'It's simple to get set up and start earning',
          imageUrl: '/assets/images/become-host.svg',
          prominent: true,
          action: () => this.navigate('/become-host'),
          dividerAfter: true
        },
        {
          label: 'Messages',
          action: () => this.navigate('/messages')
        },
        {
          label: 'Trips',
          action: () => this.navigate('/trips')
        },
        {
          label: 'Wishlists',
          action: () => this.navigate('/wishlists'),
          dividerAfter: true
        },
        {
          label: 'Manage listings',
          action: () => this.navigate('/hosting')
        },
        {
          label: 'Refer a host',
          action: () => this.navigate('/refer')
        },
        {
          label: 'Account',
          action: () => this.navigate('/account-settings'),
          dividerAfter: true
        },
        {
          label: 'Gift cards',
          action: () => this.navigate('/gift-cards')
        },
        {
          label: 'Log out',
          action: () => this.logout()
        }
      ];
    }

    // Guest menu (not authenticated)
    return [
      {
        label: 'Help Center',
        icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        action: () => this.navigate('/help')
      },
      {
        label: 'Log in or sign up',
        action: () => this.openLoginModal(),
        dividerAfter: true
      },
      {
        label: 'Become a host',
        subtitle: 'It's simple to get set up and start earning',
        imageUrl: '/assets/images/become-host.svg',
        prominent: true,
        action: () => this.navigate('/become-host'),
        dividerAfter: true
      },
      {
        label: 'Gift cards',
        action: () => this.navigate('/gift-cards')
      }
    ];
  }

  handleItemClick(item: MenuItem): void {
    item.action();
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  // Click outside to close
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isOpen) {
      this.close();
    }
  }

  // Escape key to close
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  // Navigation methods (to be implemented based on your routing strategy)
  private navigate(path: string): void {
    // Router navigation logic
    console.log('Navigate to:', path);
  }

  private openLoginModal(): void {
    // Open login modal logic
    console.log('Open login modal');
  }

  private logout(): void {
    // Logout logic
    console.log('Logout user');
  }
}
```

##### Integration with User Menu Button

Update the `UserMenuComponent` to include the dropdown:

```typescript
@Component({
  selector: 'app-user-menu',
  template: `
    <div class="flex items-center space-x-4 relative">

      <!-- Become a Host Button -->
      <button class="text-sm font-medium py-2 px-3 rounded-full hover:bg-gray-100 hidden md:block transition-colors duration-200">
        Become a host
      </button>

      <!-- User Menu Button -->
      <button
        id="user-menu-button"
        class="flex items-center space-x-2 border border-gray-300 rounded-full p-1.5 hover:shadow-modal transition-shadow duration-200"
        aria-label="User menu"
        [attr.aria-expanded]="isMenuOpen"
        aria-haspopup="true"
        (click)="toggleMenu()">

        <!-- Hamburger Icon -->
        <svg class="h-4 w-4 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>

        <!-- Avatar Placeholder -->
        <span class="h-6 w-6 rounded-full bg-gray-500 flex items-center justify-center">
          <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </span>
      </button>

      <!-- Dropdown Menu -->
      <app-user-menu-dropdown
        [isOpen]="isMenuOpen"
        [isAuthenticated]="isAuthenticated"
        triggerId="user-menu-button"
        (closed)="isMenuOpen = false">
      </app-user-menu-dropdown>

    </div>
  `,
  standalone: true,
  imports: [CommonModule, UserMenuDropdownComponent]
})
export class UserMenuComponent {
  isMenuOpen: boolean = false;
  isAuthenticated: boolean = false; // Should be managed by AuthService

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
```

##### Accessibility Features

| Feature | Implementation | Design System Notes |
|---------|---------------|---------------------|
| **Keyboard Navigation** | Tab through menu items, Enter to activate | Meets WCAG 2.1 AA standards |
| **Screen Reader Support** | `role="menu"`, `role="menuitem"`, `aria-labelledby` | Proper ARIA attributes |
| **Escape Key** | Closes dropdown when pressed | Standard modal/dropdown behavior |
| **Click Outside** | Closes dropdown when clicking outside | Expected UX pattern |
| **Focus Management** | Returns focus to trigger button on close | Keyboard navigation best practice |
| **ARIA Expanded** | `aria-expanded` attribute on trigger button | Indicates dropdown state to assistive tech |

##### Design System Compliance

**Alignment with Core Principles:**

| Principle | Implementation | Status |
|-----------|---------------|--------|
| **Friendly Clarity** | Clear menu item labels, logical grouping with dividers | ✅ |
| **Trust through Fidelity** | Smooth animations (200ms), hover states, shadow elevation | ✅ |
| **Accent Focus** | Neutral colors throughout (no accent color needed for menu) | ✅ |
| **Breathing Layout** | Fixed width (288px) with flexible content, responsive positioning | ✅ |

**Key Design Tokens Used:**
- **Shadow**: `shadow-2xl` (Two-Layer Shadow System)
- **Border Radius**: `rounded-xl` (12px - matches card aesthetic)
- **Spacing**: `py-2 px-3` (8px vertical, 12px horizontal - 8-point grid)
- **Hover**: `hover:bg-gray-50` (Shade 4 strategy)
- **Typography**: `text-base font-normal` for standard items, `font-semibold` for prominent items
- **Colors**: Neutral palette (gray-800 text, gray-500 subtitles, gray-200 dividers)

##### Implementation Notes

**Conditional Rendering:**
- "Log in or sign up" link only visible when `isAuthenticated = false`
- "Become a host" section changes based on user status (guest vs. authenticated)
- Menu items dynamically generated based on authentication state

**Click-Outside Logic:**
- Implemented using `@HostListener('document:click')`
- Checks if click target is inside dropdown using `elementRef.nativeElement.contains()`
- Closes dropdown if click is outside

**Animations:**
- Smooth fade-in with slight upward slide (200ms ease-out)
- Quick fade-out on close (150ms ease-in)
- Respects `prefers-reduced-motion` via Angular animations

**Z-Index Strategy:**
- Header: `z-50`
- Dropdown: `z-40` (below header, above content)
- Modals: `z-50` (same level as header)
- Overlay: `z-50` (covers everything including header)

---

### 9.4 Footer Component Implementation

The footer requires a responsive, breathing layout to manage multi-column navigation while maintaining Airbnb's clean aesthetic.

#### 9.4.1 Footer Structure & Layout

**Component:** `<app-footer>`

| Feature | Tailwind Classes | Design System Alignment |
|---------|------------------|------------------------|
| **Main Container** | `bg-white pt-12 pb-8 border-t border-gray-200` | Uses **Spacing System** (pt-12 = 48px, pb-8 = 32px), **Neutral Colors** (white background) |
| **Navigation Wrapper** | `max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8` | Uses **Responsive Strategy** (grid-cols-2 → md:grid-cols-4), **Breathing Layout** (reorganizes naturally) |
| **Legal Divider** | `max-w-7xl mx-auto border-t border-gray-200 pt-6` | Uses **Border/Divider** (border-gray-200), **Spacing** (pt-6 = 24px) |

**Angular Implementation:**

```typescript
@Component({
  selector: 'app-footer',
  template: `
    <footer class="bg-white pt-12 pb-8 border-t border-gray-200">

      <!-- Navigation Links Grid -->
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <app-footer-nav-column
          *ngFor="let column of navColumns"
          [heading]="column.heading"
          [links]="column.links">
        </app-footer-nav-column>
      </div>

      <!-- Legal & Settings Bar -->
      <div class="max-w-7xl mx-auto px-4 border-t border-gray-200 pt-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">

          <!-- Copyright & Legal Links -->
          <div class="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
            <span>© 2024 StudyMate, Inc.</span>
            <a href="/privacy" class="hover:underline cursor-pointer transition-all duration-200">Privacy</a>
            <a href="/terms" class="hover:underline cursor-pointer transition-all duration-200">Terms</a>
            <a href="/sitemap" class="hover:underline cursor-pointer transition-all duration-200">Sitemap</a>
          </div>

          <!-- Global Settings (Language/Currency) -->
          <div class="flex items-center space-x-6 text-sm font-medium">
            <button class="flex items-center gap-2 hover:underline cursor-pointer transition-all duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              English (US)
            </button>
            <button class="flex items-center gap-2 hover:underline cursor-pointer transition-all duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              USD
            </button>
          </div>

        </div>
      </div>

    </footer>
  `
})
export class FooterComponent {
  navColumns = [
    {
      heading: 'Support',
      links: [
        { label: 'Help Center', url: '/help' },
        { label: 'Safety information', url: '/safety' },
        { label: 'Cancellation options', url: '/cancellation' },
        { label: 'Our COVID-19 Response', url: '/covid-response' },
      ]
    },
    {
      heading: 'Community',
      links: [
        { label: 'StudyMate.org', url: '/foundation' },
        { label: 'Supporting people with disabilities', url: '/accessibility' },
        { label: 'Referral program', url: '/referrals' },
      ]
    },
    {
      heading: 'Hosting',
      links: [
        { label: 'Try hosting', url: '/become-host' },
        { label: 'Responsible hosting', url: '/responsible-hosting' },
        { label: 'Resource Center', url: '/resources' },
      ]
    },
    {
      heading: 'About',
      links: [
        { label: 'Newsroom', url: '/news' },
        { label: 'Learn about new features', url: '/features' },
        { label: 'Careers', url: '/careers' },
        { label: 'Investors', url: '/investors' },
      ]
    },
  ];
}
```

**Design System Compliance:**
- ✅ **Breathing Layout**: Grid collapses from 4 columns → 2 columns → 1 column
- ✅ **Responsive Strategy**: Mobile-first with `md:flex-row` for legal bar
- ✅ **Spacing System**: Consistent gaps (gap-8 = 32px, gap-4 = 16px)
- ✅ **Typography**: Uses text-sm for footer content

---

#### 9.4.2 Footer Navigation Column (Reusable Component)

**Component:** `<app-footer-nav-column>`

| Section | Tailwind Classes | Design System Notes |
|---------|------------------|---------------------|
| **Column Headings** | `font-bold text-neutral-dark mb-4 text-sm` | Uses **Typography** (font-bold text-sm), **Neutral Colors** (text-neutral-dark = gray-900) |
| **Link List** | `space-y-3` | Uses **Spacing System** (space-y-3 = 12px vertical gap) |
| **Individual Links** | `text-gray-600 text-sm hover:underline cursor-pointer transition-all duration-200` | Uses **Text Secondary** (text-gray-600), **Microinteractions** (hover:underline) |

**Angular Implementation:**

```typescript
@Component({
  selector: 'app-footer-nav-column',
  template: `
    <div>
      <h3 class="font-bold text-neutral-dark mb-4 text-sm">{{ heading }}</h3>
      <ul class="space-y-3">
        <li *ngFor="let link of links">
          <a
            [href]="link.url"
            class="text-gray-600 text-sm hover:underline cursor-pointer transition-all duration-200">
            {{ link.label }}
          </a>
        </li>
      </ul>
    </div>
  `
})
export class FooterNavColumnComponent {
  @Input() heading!: string;
  @Input() links!: Array<{ label: string; url: string }>;
}
```

**Design System Compliance:**
- ✅ **Reusable**: DRY principle for maintainability
- ✅ **Typography**: Follows heading and body text scales
- ✅ **Microinteractions**: Smooth hover transitions

---

### 9.5 Angular Component Architecture

#### Recommended Hierarchy

```
AppComponent (Main Layout Host)
├── HeaderComponent (<app-header>)
│   ├── LogoComponent (<app-logo>)
│   ├── SearchBarComponent (<app-search-bar>)
│   └── UserMenuComponent (<app-user-menu>)
│
├── RouterOutlet (Page Content)
│
└── FooterComponent (<app-footer>)
    └── FooterNavColumnComponent (<app-footer-nav-column>) [Reusable × 4]
```

#### Module Configuration

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LogoComponent,
    SearchBarComponent,
    UserMenuComponent,
    FooterComponent,
    FooterNavColumnComponent
  ],
  imports: [
    BrowserModule,
    CommonModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

### 9.6 Implementation Checklist

#### Pre-Implementation (Planning Phase)

- [ ] Review Airbnb-inspired design system principles (Section 1)
- [ ] Verify color palette alignment with 60-30-10 rule
- [ ] Consult context7 for latest Angular patterns: `"use context7 - Angular latest component patterns"`
- [ ] Verify Tailwind CSS configuration: `"use context7 - Tailwind CSS 3.4+ setup with Angular"`
- [ ] Plan responsive breakpoints (mobile: 360px, tablet: 768px, desktop: 1024px+)

#### During Implementation (Coding Phase)

**Design System Compliance:**
- [ ] Configure Tailwind with custom colors (red-accent, neutral-dark, neutral-light)
- [ ] Use Inter/Poppins fonts (`font-heading`, `font-body`)
- [ ] Apply border radius guidelines (`rounded-full` for pills, `rounded-xl` for cards)
- [ ] Implement two-layer shadow system (`shadow-card`, `shadow-modal`)
- [ ] Add gradient enhancement to search button (primary CTA)
- [ ] Use 8-point grid spacing (`space-x-4`, `gap-8`, `p-4`)
- [ ] Implement responsive breakpoints (`sm:`, `md:`, `lg:`)

**Accessibility:**
- [ ] Add proper ARIA labels for icon-only buttons
- [ ] Ensure keyboard navigation (Tab, Enter, Escape)
- [ ] Verify color contrast ratios (4.5:1 for text, 3:1 for UI)
- [ ] Test with screen readers
- [ ] Implement focus indicators (visible 2px outline)

**Microinteractions:**
- [ ] Add smooth hover transitions (200-300ms duration)
- [ ] Implement shadow elevation on hover
- [ ] Add motion-reduce support for accessibility
- [ ] Test all interactive states (default, hover, focus, active)

#### Post-Implementation (Verification Phase)

**Visual Verification:**
- [ ] Header is sticky and stays visible on scroll
- [ ] Search bar pill shape matches Airbnb aesthetic
- [ ] Primary accent color used sparingly (10% rule)
- [ ] Gradient button has premium feel with inner shadow
- [ ] Footer grid collapses properly at breakpoints (4 → 2 → 1 columns)
- [ ] Typography follows Inter font family and size scale
- [ ] Spacing is consistent (8-point grid system)

**Responsive Testing:**
- [ ] Test on mobile (360px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px and 1440px width)
- [ ] Verify search bar hides on mobile (`hidden lg:flex`)
- [ ] Verify "Become a host" hides on mobile (`hidden md:block`)
- [ ] Verify footer grid reorganizes naturally

**Accessibility Verification:**
- [ ] Keyboard navigation works (Tab through all interactive elements)
- [ ] Screen reader announces all content properly
- [ ] Focus indicators visible (2px outline minimum)
- [ ] Color contrast meets WCAG AA (use contrast checker tool)
- [ ] Animations respect `prefers-reduced-motion`

**Performance:**
- [ ] No browser console errors or warnings
- [ ] Animations run at 60fps (use DevTools Performance tab)
- [ ] Images are optimized (if any)
- [ ] Component lazy loading considered (if applicable)

---

### 9.7 Design System Alignment Summary

| Design Principle | Header Implementation | Footer Implementation |
|------------------|----------------------|----------------------|
| **Friendly Clarity** | ✅ Rounded pill search bar, clean typography | ✅ Clear column headings, readable link lists |
| **Trust through Fidelity** | ✅ Two-layer shadows, smooth transitions, gradient button | ✅ Consistent spacing, subtle hover effects |
| **Accent Focus (10%)** | ✅ Primary color only on search button | ✅ Neutral colors dominate (60-30-10 rule) |
| **Breathing Layout** | ✅ Flex layout, responsive prefixes, stable relationships | ✅ Grid collapses naturally (4→2→1 columns) |

---

### 9.8 Context7 Integration Commands

When implementing header and footer, use these context7 commands to verify best practices:

```bash
# Angular component patterns
"use context7 - Angular standalone components vs NgModule"
"use context7 - Angular component communication best practices"
"use context7 - Angular lifecycle hooks for header/footer"

# Tailwind integration
"use context7 - Tailwind CSS Angular integration guide"
"use context7 - Tailwind utility class best practices"
"use context7 - Tailwind custom shadow configuration"

# Responsive design
"use context7 - Tailwind responsive design patterns"
"use context7 - Angular viewport service for responsive components"
"use context7 - CSS Grid vs Flexbox for responsive layouts"

# Accessibility
"use context7 - WCAG AA color contrast requirements"
"use context7 - Angular ARIA attribute best practices"
"use context7 - Keyboard navigation patterns for headers"
```

---

## 10. Core UI Components & Form Specifications

This section provides detailed implementation guidelines for buttons, form fields, cards, modals, links, icons, and interactive components based on Airbnb's UI patterns.

### 10.1 Global Component Aesthetic

The Airbnb-inspired component system prioritizes:

| Principle | Implementation | Design System Alignment |
|-----------|---------------|------------------------|
| **Cleanliness & Minimalism** | Heavy reliance on white space using `p-*` and `m-*` utilities | Aligns with **Breathing Layout** principle |
| **Rounded Corners** | Almost all interactive elements use `rounded-xl` or `rounded-2xl` | Follows **Border Radius** guidelines (Section 2.4) |
| **Subtle Shadows** | Soft shadows lift cards/popups off background | Implements **Two-Layer Shadow System** (Section 4.2) |
| **Brand Color Accent** | Vibrant pink/red gradient (#FF385C to #E61E4D) for primary actions | Follows **Accent Focus** 10% rule (Section 1) |

---

### 10.2 Button Specifications

Buttons are categorized by function: Primary Action, Secondary Action, Social Login, and Stepper/Quantity controls.

#### 10.2.1 Primary Action Button

Used for critical actions like "Reserve", "Continue", "Sign Up", "Search".

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Background** | `bg-gradient-to-r from-[#FF385C] to-[#E61E4D]` | Uses **Primary Accent** gradient (Section 4.2 Gradient Enhancement) |
| **Text Color** | `text-white font-semibold` | Maximum contrast for accessibility (WCAG AA) |
| **Shape** | `rounded-lg` or `rounded-xl` | Follows **Border Radius** guidelines (8px or 12px) |
| **Size** | `w-full py-4 px-6` | Full width, generous padding (16px vertical) |
| **Hover State** | `hover:opacity-90 hover:scale-105 transition-all duration-300` | Implements **Microinteractions** (Section 5) |
| **Shadow** | `shadow-card hover:shadow-modal` | Uses **Two-Layer Shadow System** |
| **Disabled State** | `disabled:opacity-50 disabled:cursor-not-allowed` | Accessibility compliance |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-primary-button',
  template: `
    <button
      [disabled]="disabled"
      [class]="buttonClasses"
      (click)="handleClick()"
      type="button">
      <ng-content></ng-content>
    </button>
  `,
  standalone: true
})
export class PrimaryButtonComponent {
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = true;
  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    return `
      bg-gradient-to-r from-[#FF385C] to-[#E61E4D]
      text-white font-semibold
      rounded-xl py-4 px-6
      shadow-card hover:shadow-modal
      hover:opacity-90 hover:scale-105
      transition-all duration-300 ease-in-out
      disabled:opacity-50 disabled:cursor-not-allowed
      motion-reduce:transition-none
      ${this.fullWidth ? 'w-full' : ''}
    `;
  }

  handleClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
```

**Usage Example:**
```html
<app-primary-button (clicked)="onReserve()">Reserve</app-primary-button>
```

---

#### 10.2.2 Secondary / Social Login Buttons

Used for "Continue with Facebook", "Continue with Google", "Continue with Apple".

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Background** | `bg-white` | Uses **Shade 2** (neutral base) |
| **Border** | `border border-gray-300` | Subtle border for definition |
| **Shape** | `rounded-lg` or `rounded-xl` | Matches primary button radius |
| **Text** | `text-neutral-dark font-medium` | Dark text (gray-900) for contrast |
| **Icon** | Prepended icon (platform-specific colors) | Left-aligned with 8px gap |
| **Hover State** | `hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200` | Subtle **Shade 4** hover effect |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-social-login-button',
  template: `
    <button
      [class]="buttonClasses"
      (click)="handleClick()"
      type="button">
      <img [src]="iconSrc" [alt]="provider + ' icon'" class="w-5 h-5" />
      <span>Continue with {{ provider }}</span>
    </button>
  `,
  standalone: true
})
export class SocialLoginButtonComponent {
  @Input() provider!: 'Facebook' | 'Google' | 'Apple' | 'Email';
  @Output() clicked = new EventEmitter<string>();

  get iconSrc(): string {
    const icons = {
      'Facebook': '/assets/icons/facebook.svg',
      'Google': '/assets/icons/google.svg',
      'Apple': '/assets/icons/apple.svg',
      'Email': '/assets/icons/email.svg'
    };
    return icons[this.provider];
  }

  get buttonClasses(): string {
    return `
      w-full flex items-center justify-center gap-3
      bg-white border border-gray-300 rounded-lg
      py-3 px-4
      text-neutral-dark font-medium
      hover:bg-gray-50 hover:border-gray-400
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-300
    `;
  }

  handleClick(): void {
    this.clicked.emit(this.provider);
  }
}
```

---

#### 10.2.3 Quantity/Stepper Buttons

Used for counters like "Adults", "Children", "Infants", "Bedrooms", etc.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Shape** | `w-8 h-8 rounded-full` | Circular buttons (32px × 32px) |
| **Border** | `border border-gray-400` | Light gray border default |
| **Icon** | Simple minus (−) and plus (+) SVG icons | Centered, 16px size |
| **Hover State** | `hover:border-gray-600 hover:bg-gray-50` | Border darkens, subtle background |
| **Active/Disabled** | `disabled:opacity-30 disabled:cursor-not-allowed` | Visual feedback for limits |
| **Focus** | `focus:ring-2 focus:ring-primary-300` | Accessibility keyboard navigation |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-quantity-stepper',
  template: `
    <div class="flex items-center justify-between py-4 border-b border-gray-200">
      <!-- Label -->
      <div>
        <p class="text-base font-medium text-gray-900">{{ label }}</p>
        <p *ngIf="subtitle" class="text-sm text-gray-600">{{ subtitle }}</p>
      </div>

      <!-- Stepper Controls -->
      <div class="flex items-center gap-3">
        <!-- Decrement Button -->
        <button
          type="button"
          [disabled]="value <= min"
          (click)="decrement()"
          class="w-8 h-8 rounded-full border border-gray-400
                 flex items-center justify-center
                 hover:border-gray-600 hover:bg-gray-50
                 disabled:opacity-30 disabled:cursor-not-allowed
                 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-primary-300"
          [attr.aria-label]="'Decrease ' + label">
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>

        <!-- Value Display -->
        <span class="text-base font-medium text-gray-900 min-w-[2rem] text-center">
          {{ value }}
        </span>

        <!-- Increment Button -->
        <button
          type="button"
          [disabled]="value >= max"
          (click)="increment()"
          class="w-8 h-8 rounded-full border border-gray-400
                 flex items-center justify-center
                 hover:border-gray-600 hover:bg-gray-50
                 disabled:opacity-30 disabled:cursor-not-allowed
                 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-primary-300"
          [attr.aria-label]="'Increase ' + label">
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class QuantityStepperComponent {
  @Input() label!: string;
  @Input() subtitle?: string;
  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 10;
  @Output() valueChange = new EventEmitter<number>();

  increment(): void {
    if (this.value < this.max) {
      this.value++;
      this.valueChange.emit(this.value);
    }
  }

  decrement(): void {
    if (this.value > this.min) {
      this.value--;
      this.valueChange.emit(this.value);
    }
  }
}
```

**Usage Example:**
```html
<app-quantity-stepper
  label="Adults"
  subtitle="Age 13+"
  [value]="adults"
  [min]="1"
  [max]="16"
  (valueChange)="adults = $event">
</app-quantity-stepper>
```

---

### 10.3 Form Field Specifications

Form inputs follow a clean, border-focused style with strong focus states.

#### 10.3.1 Standard Text Input

Used for email, name, phone number, address fields.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `border border-gray-400 rounded-lg` | Default light gray border |
| **Focus State** | `focus:border-2 focus:border-black focus:ring-0` | Border becomes black and thicker (no blue ring) |
| **Label** | Small label floating above input or placeholder | Typography: `text-xs font-medium text-gray-700` |
| **Padding** | `py-3 px-4` | 12px vertical, 16px horizontal |
| **Typography** | `text-base font-normal` | Standard body text size |
| **Error State** | `border-danger-500 focus:border-danger-500` | Red border for validation errors |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-text-input',
  template: `
    <div class="relative">
      <!-- Label -->
      <label
        *ngIf="label"
        [for]="inputId"
        class="block text-xs font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-danger-500">*</span>
      </label>

      <!-- Input Field -->
      <input
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        [required]="required"
        [disabled]="disabled"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [class]="inputClasses"
        [attr.aria-invalid]="hasError"
        [attr.aria-describedby]="hasError ? errorId : null"
      />

      <!-- Error Message -->
      <p
        *ngIf="hasError && errorMessage"
        [id]="errorId"
        class="mt-2 text-sm text-danger-500"
        role="alert">
        {{ errorMessage }}
      </p>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class TextInputComponent {
  @Input() label?: string;
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() errorMessage?: string;
  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();

  inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  errorId = `error-${this.inputId}`;

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get inputClasses(): string {
    const baseClasses = `
      w-full py-3 px-4 rounded-lg
      text-base font-normal text-gray-900
      placeholder-gray-400
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none
    `;

    const borderClasses = this.hasError
      ? 'border-2 border-danger-500 focus:border-danger-500'
      : 'border border-gray-400 focus:border-2 focus:border-black';

    return `${baseClasses} ${borderClasses}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  onBlur(): void {
    this.blurred.emit();
  }
}
```

---

#### 10.3.2 Dropdown/Select Field

Used for country code, state selection, guest dropdowns.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `border border-gray-300 rounded-lg` | Similar to text input |
| **Layout** | Title above selected value | Structured display |
| **Indicator** | Chevron icon (downward) on right | `w-5 h-5` icon size |
| **Hover** | `hover:border-gray-400` | Subtle border darkening |
| **Focus** | `focus:border-2 focus:border-black` | Matches text input focus |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-select-dropdown',
  template: `
    <div class="relative">
      <!-- Label -->
      <label
        *ngIf="label"
        [for]="selectId"
        class="block text-xs font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-danger-500">*</span>
      </label>

      <!-- Select Field -->
      <div class="relative">
        <select
          [id]="selectId"
          [value]="value"
          [required]="required"
          [disabled]="disabled"
          (change)="onChange($event)"
          [class]="selectClasses">
          <option value="" disabled selected>{{ placeholder }}</option>
          <option *ngFor="let option of options" [value]="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Chevron Icon -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class SelectDropdownComponent {
  @Input() label?: string;
  @Input() placeholder: string = 'Select an option';
  @Input() value: string = '';
  @Input() options: Array<{ label: string; value: string }> = [];
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  get selectClasses(): string {
    return `
      w-full py-3 px-4 pr-10 rounded-lg
      border border-gray-300 hover:border-gray-400
      focus:border-2 focus:border-black focus:outline-none
      text-base font-normal text-gray-900
      appearance-none
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
  }

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(target.value);
  }
}
```

---

#### 10.3.3 Date Range Picker (Check-in/Check-out)

Two date fields housed in a single container with a vertical divider.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Outer Container** | `border border-gray-300 rounded-lg flex` | Single border around both fields |
| **Vertical Divider** | `border-r border-gray-300` | Separates check-in from check-out |
| **Field Title** | `text-xs font-bold uppercase text-gray-700` | Small, bold, uppercase label |
| **Date Value** | `text-base font-medium text-gray-900` | Prominent date display |
| **Padding** | `p-3` on each side | Equal padding for visual balance |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-date-range-picker',
  template: `
    <div class="border border-gray-300 rounded-lg flex overflow-hidden hover:border-gray-400 transition-colors duration-200">
      <!-- Check-in Field -->
      <div class="flex-1 p-3 border-r border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors" (click)="openCheckInPicker()">
        <label class="block text-xs font-bold uppercase text-gray-700 mb-1">Check-in</label>
        <input
          type="date"
          [value]="checkInDate"
          (change)="onCheckInChange($event)"
          class="w-full text-base font-medium text-gray-900 border-none outline-none bg-transparent cursor-pointer"
          [min]="minDate"
        />
      </div>

      <!-- Check-out Field -->
      <div class="flex-1 p-3 cursor-pointer hover:bg-gray-50 transition-colors" (click)="openCheckOutPicker()">
        <label class="block text-xs font-bold uppercase text-gray-700 mb-1">Check-out</label>
        <input
          type="date"
          [value]="checkOutDate"
          (change)="onCheckOutChange($event)"
          class="w-full text-base font-medium text-gray-900 border-none outline-none bg-transparent cursor-pointer"
          [min]="checkInDate || minDate"
        />
      </div>
    </div>
  `,
  standalone: true
})
export class DateRangePickerComponent {
  @Input() checkInDate: string = '';
  @Input() checkOutDate: string = '';
  @Output() checkInDateChange = new EventEmitter<string>();
  @Output() checkOutDateChange = new EventEmitter<string>();

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  onCheckInChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkInDateChange.emit(target.value);
  }

  onCheckOutChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkOutDateChange.emit(target.value);
  }

  openCheckInPicker(): void {
    // Logic to open date picker modal or calendar
  }

  openCheckOutPicker(): void {
    // Logic to open date picker modal or calendar
  }
}
```

---

### 10.4 Cards and Modal Specifications

#### 10.4.1 Card Style (Price/Booking Summary)

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Background** | `bg-white` | Pure white (Shade 2) |
| **Shape** | `rounded-xl` or `rounded-2xl` | Large rounding (12px or 16px) |
| **Shadow** | `shadow-2xl` or custom soft shadow | **Two-Layer Shadow System** |
| **Padding** | `p-6` to `p-8` | Generous internal padding (24-32px) |
| **Border** | `border border-gray-200` (optional) | Subtle border for definition |
| **Sticky Positioning** | `sticky top-24` (for booking cards) | Stays visible during scroll |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div [class]="cardClasses">
      <!-- Card Header (Optional) -->
      <div *ngIf="title" class="mb-4 pb-4 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
      </div>

      <!-- Card Content -->
      <div class="space-y-4">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() sticky: boolean = false;
  @Input() elevated: boolean = true;

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-xl p-6';
    const shadowClasses = this.elevated ? 'shadow-2xl border border-gray-200' : 'border border-gray-200';
    const positionClasses = this.sticky ? 'sticky top-24' : '';

    return `${baseClasses} ${shadowClasses} ${positionClasses}`;
  }
}
```

---

#### 10.4.2 Modal/Popup Style (Login/Signup)

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Overlay** | `fixed inset-0 bg-black/50 z-50` | Semi-transparent dark overlay |
| **Modal Container** | `fixed inset-0 flex items-center justify-center p-4 z-50` | Centered positioning |
| **Modal Body** | `bg-white rounded-2xl shadow-2xl max-w-md w-full p-8` | Matches card style |
| **Header** | Clear title with close (×) icon on top-right | `text-2xl font-semibold mb-6` |
| **Close Button** | `w-10 h-10 rounded-full hover:bg-gray-100` | Circular, top-right positioned |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-modal',
  template: `
    <!-- Overlay -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      (click)="closeOnOverlay($event)"
      [@fadeIn]>

      <!-- Modal Body -->
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
        (click)="$event.stopPropagation()"
        [@scaleIn]
        role="dialog"
        [attr.aria-labelledby]="titleId"
        aria-modal="true">

        <!-- Close Button -->
        <button
          type="button"
          (click)="close()"
          class="absolute top-4 left-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
          aria-label="Close modal">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Modal Header -->
        <div class="mb-6 mt-4">
          <h2 [id]="titleId" class="text-2xl font-semibold text-gray-900">{{ title }}</h2>
          <p *ngIf="subtitle" class="text-sm text-gray-600 mt-2">{{ subtitle }}</p>
        </div>

        <!-- Modal Content -->
        <div class="space-y-4">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.95)', opacity: 0 }))
      ])
    ])
  ]
})
export class ModalComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() isOpen: boolean = false;
  @Input() closeOnOverlayClick: boolean = true;
  @Output() closed = new EventEmitter<void>();

  titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

  close(): void {
    this.closed.emit();
  }

  closeOnOverlay(event: MouseEvent): void {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }
}
```

**Usage Example:**
```html
<app-modal
  title="Log in or sign up"
  subtitle="Welcome to StudyMate"
  [isOpen]="showLoginModal"
  (closed)="showLoginModal = false">

  <app-social-login-button provider="Google" (clicked)="loginWith($event)"></app-social-login-button>
  <app-social-login-button provider="Facebook" (clicked)="loginWith($event)"></app-social-login-button>

  <div class="relative my-6">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-gray-300"></div>
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-4 bg-white text-gray-500">or</span>
    </div>
  </div>

  <app-text-input label="Email" type="email" placeholder="email@example.com"></app-text-input>
  <app-primary-button (clicked)="continueWithEmail()">Continue</app-primary-button>
</app-modal>
```

---

### 10.5 Links and Text Styles

| Link Type | Tailwind Classes | Design System Notes |
|-----------|------------------|---------------------|
| **Primary Links** | `text-gray-800 hover:underline transition-all duration-200` | Standard dark gray links |
| **Prominent Links** | `text-primary-500 font-semibold hover:text-primary-600 hover:underline` | Uses brand accent color |
| **Privacy/Legal Text** | `text-xs text-gray-500` with `underline` on legal links | Small, subtle legal text |
| **Stepper Labels** | `text-base font-medium text-gray-900` | Dark and bold labels |
| **Stepper Subtext** | `text-sm text-gray-600` | Lighter gray, smaller subtext |

---

### 10.6 Icon Specifications

| Icon Category | Style | Design System Notes |
|---------------|-------|---------------------|
| **Icon Set** | Line-art/outline icons (Lucide, Heroicons, or custom SVG) | Consistent stroke width (2px) |
| **Informational Icons** | `text-neutral-dark` (gray-900) for amenities (Kitchen, WiFi, TV) | Dark gray for visibility |
| **Accent Icons** | `text-primary-500` for badges ("Guest favorite", "Superhost") | Uses brand accent color |
| **Icon Size** | `w-5 h-5` (20px) for standard, `w-6 h-6` (24px) for prominent | Consistent sizing |
| **Icon Spacing** | `gap-2` or `gap-3` between icon and text | 8-12px spacing |

**Icon Usage Examples:**

```html
<!-- Amenity Icon -->
<div class="flex items-center gap-2">
  <svg class="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
  <span class="text-gray-700">Kitchen</span>
</div>

<!-- Badge Icon -->
<div class="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
  <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
  <span class="text-sm font-medium text-gray-900">Guest favorite</span>
</div>
```

---

### 10.7 Component Architecture Summary

#### Recommended Angular Component Library

```
src/app/shared/components/
├── buttons/
│   ├── primary-button.component.ts
│   ├── social-login-button.component.ts
│   └── quantity-stepper.component.ts
├── forms/
│   ├── text-input.component.ts
│   ├── select-dropdown.component.ts
│   └── date-range-picker.component.ts
├── cards/
│   ├── card.component.ts
│   ├── price-summary-card.component.ts (specialized)
│   └── listing-card.component.ts (specialized)
├── modals/
│   └── modal.component.ts
└── layout/
    ├── header.component.ts
    ├── footer.component.ts
    └── search-bar.component.ts
```

---

### 10.8 Implementation Checklist

#### Pre-Implementation
- [ ] Review Airbnb UI patterns and component aesthetic (Section 10.1)
- [ ] Verify gradient colors configured in Tailwind (`from-[#FF385C] to-[#E61E4D]`)
- [ ] Ensure shadow utilities are configured (`shadow-card`, `shadow-2xl`)
- [ ] Plan component reusability (DRY principle)
- [ ] Consult context7 for Angular form patterns: `"use context7 - Angular reactive forms best practices"`

#### During Implementation
- [ ] Create reusable button components (Primary, Secondary, Social, Stepper)
- [ ] Implement form input components with proper focus states
- [ ] Add proper ARIA labels and accessibility attributes
- [ ] Implement card and modal components with animations
- [ ] Use consistent spacing (8-point grid system)
- [ ] Add proper TypeScript types for @Input/@Output properties
- [ ] Implement keyboard navigation support (Tab, Enter, Escape)

#### Post-Implementation
- [ ] Test all interactive states (default, hover, focus, active, disabled)
- [ ] Verify accessibility (WCAG AA compliance)
- [ ] Test keyboard navigation across all components
- [ ] Test responsive behavior at breakpoints (360px, 768px, 1024px, 1440px)
- [ ] Verify animations respect `prefers-reduced-motion`
- [ ] Test form validation and error states
- [ ] Verify modal overlay click-outside behavior
- [ ] Test stepper buttons at min/max limits

---

### 10.9 Design System Compliance Matrix

| Component | Friendly Clarity | Trust through Fidelity | Accent Focus | Breathing Layout |
|-----------|------------------|------------------------|--------------|------------------|
| **Primary Button** | ✅ Rounded corners, clear text | ✅ Gradient, shadow elevation | ✅ Accent color only | ✅ Full width responsive |
| **Stepper** | ✅ Circular shape, clear icons | ✅ Hover states, transitions | ✅ Neutral default | ✅ Flexible alignment |
| **Text Input** | ✅ Clean borders, readable text | ✅ Strong focus state | ✅ Neutral colors | ✅ Full width default |
| **Card** | ✅ Ample padding, clean layout | ✅ Soft shadows, rounding | ✅ Neutral background | ✅ Responsive sizing |
| **Modal** | ✅ Clear title, close button | ✅ Smooth animations | ✅ Neutral overlay | ✅ Centered, responsive |

---

## 11. Search Bar & Image Card Specifications

This section provides detailed implementation guidelines for the search bar component, guest selection dropdown, and image card styles (listing cards and category cards).

### 11.1 Search Bar Component (`<app-search-bar>`)

The primary search component is a highly visible, pill-shaped element that houses several interactive input fields.

#### 11.1.1 Overall Structure and Styling

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `flex items-center w-full max-w-4xl bg-white border border-gray-200 rounded-full shadow-card hover:shadow-modal transition-shadow duration-200` | Pill shape (`rounded-full`), subtle shadow. Uses **Two-Layer Shadow System** with hover elevation. |
| **Field Sections** | `flex-1 py-3 px-6 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200` | Each input field (Where, Check in, Check out, Who) is clickable. `border-r` creates vertical separation. Uses **Shade 4** hover strategy. |
| **Last Section** | Remove right border: `border-r-0` | The 'Who' section should not have right border. |
| **Title Text** | `text-xs font-semibold text-gray-800 uppercase mb-1` | Small, bold labels (e.g., "WHERE", "WHO"). |
| **Value/Placeholder** | `text-sm text-gray-500 font-normal` | Input value or placeholder text (e.g., "Search destinations", "Add guests"). |
| **Search Button** | Integrated at the end with gradient styling | See Primary Button specification (Section 10.2.1). |

**Angular Component Implementation:**

```typescript
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
}

@Component({
  selector: 'app-search-pill',
  template: `
    <div class="flex items-center w-full max-w-4xl bg-white border border-gray-200 rounded-full shadow-card hover:shadow-modal transition-shadow duration-200">

      <!-- Where Section -->
      <div
        class="flex-1 py-3 px-6 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-l-full"
        (click)="openLocationSearch()">
        <label class="block text-xs font-semibold text-gray-800 uppercase mb-1">Where</label>
        <input
          type="text"
          placeholder="Search destinations"
          [(ngModel)]="searchParams.location"
          class="w-full text-sm text-gray-500 font-normal border-none outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      <!-- Check-in Section -->
      <div
        class="flex-1 py-3 px-6 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        (click)="openDatePicker('checkin')">
        <label class="block text-xs font-semibold text-gray-800 uppercase mb-1">Check in</label>
        <span class="block text-sm text-gray-500 font-normal">
          {{ searchParams.checkIn || 'Add dates' }}
        </span>
      </div>

      <!-- Check-out Section -->
      <div
        class="flex-1 py-3 px-6 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        (click)="openDatePicker('checkout')">
        <label class="block text-xs font-semibold text-gray-800 uppercase mb-1">Check out</label>
        <span class="block text-sm text-gray-500 font-normal">
          {{ searchParams.checkOut || 'Add dates' }}
        </span>
      </div>

      <!-- Who Section -->
      <div
        class="relative flex-1 py-3 px-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        (click)="toggleGuestDropdown()">
        <label class="block text-xs font-semibold text-gray-800 uppercase mb-1">Who</label>
        <span class="block text-sm text-gray-500 font-normal">
          {{ guestSummary || 'Add guests' }}
        </span>

        <!-- Guest Dropdown -->
        <app-guest-dropdown
          *ngIf="showGuestDropdown"
          [guests]="searchParams.guests"
          (guestsChange)="updateGuests($event)"
          (closed)="showGuestDropdown = false">
        </app-guest-dropdown>
      </div>

      <!-- Search Button -->
      <button
        (click)="handleSearch()"
        class="flex-shrink-0 bg-gradient-to-r from-[#FF385C] to-[#E61E4D] hover:from-[#e31c5f] hover:to-[#c01852]
               text-white rounded-full p-4 m-2
               shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_6px_rgba(0,0,0,0.15)]
               hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_6px_12px_rgba(0,0,0,0.2)]
               transition-all duration-300 ease-in-out
               focus:outline-none focus:ring-2 focus:ring-primary-300"
        aria-label="Search">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>

    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, GuestDropdownComponent]
})
export class SearchPillComponent {
  @Output() search = new EventEmitter<SearchParams>();

  searchParams: SearchParams = {
    location: '',
    checkIn: '',
    checkOut: '',
    guests: {
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0
    }
  };

  showGuestDropdown: boolean = false;

  get guestSummary(): string {
    const total = this.searchParams.guests.adults + this.searchParams.guests.children;
    if (total === 0) return '';

    const guestText = total === 1 ? 'guest' : 'guests';
    const infantText = this.searchParams.guests.infants > 0
      ? `, ${this.searchParams.guests.infants} infant${this.searchParams.guests.infants > 1 ? 's' : ''}`
      : '';
    const petText = this.searchParams.guests.pets > 0
      ? `, ${this.searchParams.guests.pets} pet${this.searchParams.guests.pets > 1 ? 's' : ''}`
      : '';

    return `${total} ${guestText}${infantText}${petText}`;
  }

  toggleGuestDropdown(): void {
    this.showGuestDropdown = !this.showGuestDropdown;
  }

  updateGuests(guests: SearchParams['guests']): void {
    this.searchParams.guests = guests;
  }

  openLocationSearch(): void {
    // Open location search modal or autocomplete
    console.log('Open location search');
  }

  openDatePicker(type: 'checkin' | 'checkout'): void {
    // Open date picker modal
    console.log('Open date picker:', type);
  }

  handleSearch(): void {
    this.search.emit(this.searchParams);
  }
}
```

**Design System Compliance:**
- ✅ **Friendly Clarity**: Pill shape with clear labels
- ✅ **Trust through Fidelity**: Shadow elevation on hover, smooth transitions
- ✅ **Accent Focus**: Gradient button (primary accent)
- ✅ **Breathing Layout**: Flexible sections with `flex-1`

---

#### 11.1.2 Guest Selection Dropdown (`<app-guest-dropdown>`)

This dropdown appears when the user clicks the "Who" section.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-40` | Similar to User Menu dropdown. `rounded-xl`, high shadow, white background. Uses **absolute positioning** relative to 'Who' field. |
| **Item Row** | `flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0` | Each guest type (Adults, Children, etc.) is a row. Uses `justify-between` and bottom border for separation. |
| **Guest Label - Title** | `text-base font-semibold text-gray-800` | Bold, dark text for main label (e.g., "Adults"). |
| **Guest Label - Subtitle** | `text-sm text-gray-500 font-normal` | Lighter, smaller text for age ranges (e.g., "Ages 13 or above"). |
| **Stepper Component** | Uses `<app-quantity-stepper>` from Section 10.2.3 | Reuses existing stepper component. |
| **Service Animal Link** | `text-sm font-medium text-gray-800 underline hover:no-underline cursor-pointer transition-all duration-200` | Underlined link with hover effect. |

**Angular Component Implementation:**

```typescript
import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuantityStepperComponent } from '../buttons/quantity-stepper.component';

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

@Component({
  selector: 'app-guest-dropdown',
  template: `
    <div
      class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-40"
      [@dropdownAnimation]>

      <!-- Adults -->
      <div class="flex justify-between items-center py-4 border-b border-gray-200">
        <div>
          <p class="text-base font-semibold text-gray-800">Adults</p>
          <p class="text-sm text-gray-500">Ages 13 or above</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            [disabled]="guests.adults <= 1"
            (click)="updateCount('adults', -1)"
            class="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center
                   hover:border-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Decrease adults">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <span class="text-base font-medium text-gray-900 min-w-[2rem] text-center">{{ guests.adults }}</span>
          <button
            type="button"
            [disabled]="guests.adults >= 16"
            (click)="updateCount('adults', 1)"
            class="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center
                   hover:border-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Increase adults">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Children -->
      <div class="flex justify-between items-center py-4 border-b border-gray-200">
        <div>
          <p class="text-base font-semibold text-gray-800">Children</p>
          <p class="text-sm text-gray-500">Ages 2–12</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            [disabled]="guests.children <= 0"
            (click)="updateCount('children', -1)"
            class="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center
                   hover:border-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Decrease children">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <span class="text-base font-medium text-gray-900 min-w-[2rem] text-center">{{ guests.children }}</span>
          <button
            type="button"
            [disabled]="guests.children >= 15"
            (click)="updateCount('children', 1)"
            class="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center
                   hover:border-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Increase children">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Infants -->
      <div class="flex justify-between items-center py-4 border-b border-gray-200">
        <div>
          <p class="text-base font-semibold text-gray-800">Infants</p>
          <p class="text-sm text-gray-500">Under 2</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            [disabled]="guests.infants <= 0"
            (click)="updateCount('infants', -1)"
            class="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center
                   hover:border-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Decrease infants">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <span class="text-base font-medium text-gray-900 min-w-[2rem] text-center">{{ guests.infants }}</span>
          <button
            type="button"
            [disabled]="guests.infants >= 5"
            (click)="updateCount('infants', 1)"
            class="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center
                   hover:border-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Increase infants">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Pets -->
      <div class="flex justify-between items-center py-4 border-b border-gray-200">
        <div>
          <p class="text-base font-semibold text-gray-800">Pets</p>
          <a
            href="/service-animals"
            class="text-sm font-medium text-gray-800 underline hover:no-underline cursor-pointer transition-all duration-200">
            Bringing a service animal?
          </a>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            [disabled]="guests.pets <= 0"
            (click)="updateCount('pets', -1)"
            class="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center
                   hover:border-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Decrease pets">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <span class="text-base font-medium text-gray-900 min-w-[2rem] text-center">{{ guests.pets }}</span>
          <button
            type="button"
            [disabled]="guests.pets >= 5"
            (click)="updateCount('pets', 1)"
            class="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center
                   hover:border-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Increase pets">
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Close/Apply Button -->
      <div class="mt-4">
        <button
          (click)="applyAndClose()"
          class="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors duration-200">
          Close
        </button>
      </div>

    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ]
})
export class GuestDropdownComponent {
  @Input() guests: GuestCounts = { adults: 1, children: 0, infants: 0, pets: 0 };
  @Output() guestsChange = new EventEmitter<GuestCounts>();
  @Output() closed = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  updateCount(type: keyof GuestCounts, delta: number): void {
    this.guests[type] = Math.max(0, this.guests[type] + delta);

    // Ensure at least 1 adult
    if (type === 'adults' && this.guests.adults < 1) {
      this.guests.adults = 1;
    }

    this.guestsChange.emit(this.guests);
  }

  applyAndClose(): void {
    this.closed.emit();
  }

  // Click outside to close
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.closed.emit();
    }
  }

  // Escape key to close
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closed.emit();
  }
}
```

---

### 11.2 Image Card Specifications

Two main card types: **Listing Cards** (property listings) and **Category Cards** (service categories).

#### 11.2.1 Listing Card (`<app-listing-card>`)

Used for individual property listings (e.g., "Apartment in Abu Dhabi").

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `w-full max-w-xs cursor-pointer group` | Fixed max width, cursor pointer, group for hover effects |
| **Image Container** | `relative aspect-[4/3] rounded-xl overflow-hidden mb-3` | Aspect ratio, **rounded-xl** (12px), overflow for contained image |
| **Image** | `w-full h-full object-cover group-hover:scale-105 transition-transform duration-300` | Cover fit, subtle scale on hover (**Microinteraction**) |
| **Heart Icon** | `absolute top-3 right-3 w-8 h-8 bg-white/70 backdrop-blur-sm rounded-full p-1.5 hover:bg-white/90 transition-colors` | Positioned overlay, frosted glass effect |
| **Guest Favorite Badge** | `absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold text-gray-800 bg-white/90 backdrop-blur-sm rounded-lg py-1 px-2 shadow-sm` | Badge overlay with frosted glass effect |
| **Title Text** | `text-base font-semibold text-gray-900 truncate mb-1` | Bold, dark, truncated for overflow |
| **Location/Details** | `text-sm text-gray-600 mb-1` | Lighter gray for secondary info |
| **Price Text** | `text-base font-semibold text-gray-900` with `text-sm text-gray-600` for "night" | Bold price, lighter "per night" text |
| **Rating** | `flex items-center gap-1 text-sm` with star icon and number | Inline rating display |

**Angular Component Implementation:**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Listing {
  id: string;
  title: string;
  location: string;
  distance?: string;
  dates?: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  imageUrl: string;
  isGuestFavorite?: boolean;
  isSaved?: boolean;
}

@Component({
  selector: 'app-listing-card',
  template: `
    <div class="w-full max-w-xs cursor-pointer group" (click)="onCardClick()">
      <!-- Image Container -->
      <div class="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
        <!-- Main Image -->
        <img
          [src]="listing.imageUrl"
          [alt]="listing.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <!-- Guest Favorite Badge -->
        <div
          *ngIf="listing.isGuestFavorite"
          class="absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold text-gray-800 bg-white/90 backdrop-blur-sm rounded-lg py-1 px-2 shadow-sm">
          <svg class="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          <span>Guest favorite</span>
        </div>

        <!-- Heart Icon (Save to Wishlist) -->
        <button
          (click)="toggleSave($event)"
          class="absolute top-3 right-3 w-8 h-8 bg-white/70 backdrop-blur-sm rounded-full p-1.5
                 hover:bg-white/90 transition-colors duration-200 flex items-center justify-center
                 focus:outline-none focus:ring-2 focus:ring-primary-300"
          [attr.aria-label]="listing.isSaved ? 'Remove from wishlist' : 'Add to wishlist'">
          <svg
            class="w-5 h-5 transition-all duration-200"
            [class.fill-primary-500]="listing.isSaved"
            [class.stroke-gray-800]="!listing.isSaved"
            [class.fill-none]="!listing.isSaved"
            stroke-width="2"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <!-- Card Content -->
      <div class="space-y-1">
        <!-- Title and Rating -->
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-base font-semibold text-gray-900 truncate flex-1">{{ listing.title }}</h3>
          <div *ngIf="listing.rating" class="flex items-center gap-1 flex-shrink-0">
            <svg class="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span class="text-sm font-medium text-gray-900">{{ listing.rating }}</span>
          </div>
        </div>

        <!-- Location/Distance -->
        <p class="text-sm text-gray-600">
          {{ listing.location }}
          <span *ngIf="listing.distance"> • {{ listing.distance }}</span>
        </p>

        <!-- Dates (if applicable) -->
        <p *ngIf="listing.dates" class="text-sm text-gray-600">{{ listing.dates }}</p>

        <!-- Price -->
        <div class="pt-1">
          <span class="text-base font-semibold text-gray-900">\${{ listing.price }}</span>
          <span class="text-sm text-gray-600"> night</span>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class ListingCardComponent {
  @Input() listing!: Listing;

  onCardClick(): void {
    // Navigate to listing detail page
    console.log('Navigate to listing:', this.listing.id);
  }

  toggleSave(event: Event): void {
    event.stopPropagation(); // Prevent card click
    this.listing.isSaved = !this.listing.isSaved;
    console.log('Toggle save:', this.listing.id, this.listing.isSaved);
  }
}
```

---

#### 11.2.2 Category/Service Card (`<app-category-card>`)

Used for browsing service categories (e.g., "Photography", "Chefs").

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `flex flex-col items-center w-24 text-center cursor-pointer group` | Tightly spaced, centered alignment, group for hover |
| **Image** | `h-24 w-24 object-cover rounded-lg mb-2 group-hover:opacity-80 transition-opacity duration-200` | Square (1:1), **rounded-lg** (8px), subtle opacity change on hover |
| **Title Text** | `text-sm font-semibold text-gray-800 mb-0.5` | Bold, dark, main category name |
| **Subtitle** | `text-xs text-gray-500` | Smaller, lighter text for availability (e.g., "5 available", "Coming soon") |

**Angular Component Implementation:**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Category {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl: string;
  available?: number;
  comingSoon?: boolean;
}

@Component({
  selector: 'app-category-card',
  template: `
    <div
      class="flex flex-col items-center w-24 text-center cursor-pointer group"
      (click)="onCategoryClick()">
      <!-- Category Image -->
      <img
        [src]="category.imageUrl"
        [alt]="category.name"
        class="h-24 w-24 object-cover rounded-lg mb-2 group-hover:opacity-80 transition-opacity duration-200"
      />

      <!-- Category Name -->
      <h3 class="text-sm font-semibold text-gray-800 mb-0.5">{{ category.name }}</h3>

      <!-- Subtitle (Availability or Status) -->
      <p *ngIf="subtitleText" class="text-xs text-gray-500">{{ subtitleText }}</p>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class CategoryCardComponent {
  @Input() category!: Category;

  get subtitleText(): string {
    if (this.category.comingSoon) return 'Coming soon';
    if (this.category.available !== undefined) {
      return `${this.category.available} available`;
    }
    return this.category.subtitle || '';
  }

  onCategoryClick(): void {
    // Navigate to category page
    console.log('Navigate to category:', this.category.id);
  }
}
```

---

### 11.3 Image Card Style Comparison

| Feature | Listing Card (Property) | Category Card (Service) |
|---------|------------------------|------------------------|
| **Rounding** | Large (`rounded-xl` / 12px) | Medium (`rounded-lg` / 8px) |
| **Aspect Ratio** | 4:3 or 16:9 (landscape) | 1:1 (square) |
| **Text Placement** | Below image, left-aligned | Below image, centered |
| **Interactivity** | Overlaid badges (Heart, Guest Favorite), image scale on hover | Simple opacity change on hover |
| **Content Density** | High (title, location, dates, price, rating) | Low (name, subtitle) |
| **Max Width** | `max-w-xs` (320px) | Fixed `w-24` (96px) |

---

### 11.4 Component Architecture Summary

#### Recommended Component Structure

```
src/app/shared/components/
├── search/
│   ├── search-pill.component.ts
│   └── guest-dropdown.component.ts
└── cards/
    ├── listing-card.component.ts
    └── category-card.component.ts
```

---

### 11.5 Implementation Checklist

#### Pre-Implementation
- [ ] Review search bar and image card specifications
- [ ] Verify gradient colors for search button
- [ ] Plan responsive behavior (search bar on mobile)
- [ ] Consult context7: `"use context7 - Angular reactive forms for search inputs"`

#### During Implementation
- [ ] Create search pill component with flexible sections
- [ ] Implement guest dropdown with stepper controls
- [ ] Add guest count summary logic
- [ ] Create listing card with image overlay badges
- [ ] Create category card with centered text
- [ ] Implement hover effects (image scale, opacity)
- [ ] Add click-outside detection for guest dropdown
- [ ] Ensure proper z-index layering

#### Post-Implementation
- [ ] Test search bar responsiveness (mobile, tablet, desktop)
- [ ] Verify guest dropdown positioning and overflow
- [ ] Test image hover effects (60fps target)
- [ ] Verify heart icon toggle functionality
- [ ] Test keyboard navigation for all interactive elements
- [ ] Verify ARIA labels and accessibility
- [ ] Test with real data and edge cases (long titles, missing images)
- [ ] Optimize images (lazy loading, srcset for responsive images)

---

### 11.6 Design System Compliance Matrix

| Component | Friendly Clarity | Trust through Fidelity | Accent Focus | Breathing Layout |
|-----------|------------------|------------------------|--------------|------------------|
| **Search Pill** | ✅ Clear labels, pill shape | ✅ Shadow elevation, hover states | ✅ Gradient button | ✅ Flexible sections |
| **Guest Dropdown** | ✅ Clear labels, age ranges | ✅ Smooth animation, borders | ✅ Neutral colors | ✅ Fixed width, flexible content |
| **Listing Card** | ✅ Clear hierarchy, truncation | ✅ Image scale, badge overlays | ✅ Favorite badge accent | ✅ Responsive max-width |
| **Category Card** | ✅ Centered text, clear name | ✅ Opacity hover | ✅ Neutral colors | ✅ Fixed size, consistent spacing |

---

**Last Updated**: 2025-10-13
**Maintained By**: UX Expert (Sally) & Dev Team
**Design System Version**: 1.0

---

**For questions or suggestions, please contact the design system maintainers.**
