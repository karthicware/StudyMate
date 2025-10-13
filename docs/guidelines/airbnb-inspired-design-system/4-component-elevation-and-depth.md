# 4. Component Elevation and Depth

We use **subtle layering** and **controlled shadows** to establish visual hierarchy and depth, reinforcing the "Trust through Fidelity" principle.

## 4.1 Color Layering for Depth (Shade Strategy)

The visual separation between elements should often be achieved through **color contrast (shading), not borders**.

### Shade System

| Shade Level | Lightness Adjustment | Usage | Emphasis |
|-------------|---------------------|-------|----------|
| **Shade 1 (Darkest)** | Base color - 0.1 lightness | Page background, table backgrounds (to de-emphasize). | Recedes (Pushed deeper) |
| **Shade 2 (Medium)** | Base color (Starting point) | Container/card backgrounds, navigation base. | Neutral (Standard layer) |
| **Shade 3 (Light)** | Base color + 0.1 lightness | Interactive elements (buttons, tabs, inputs), important card elements. | Pops (Moves closer) |
| **Shade 4 (Lightest)** | Base color + 0.2 lightness | Selected/active/hover states. | Strongest Pop |

### Shade Strategy Rule

**Remove borders from any element using Shade 3 or 4; the color contrast provides separation.**

### Implementation Example

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

## 4.2 Two-Layer Shadows & Gradients

All elevation uses a **two-layer shadow system**: a subtle light glow (white inner shadow) and a soft dark shadow (standard drop shadow).

### Shadow Levels

| Shadow Level | Usage | Tailwind Implementation Concept |
|--------------|-------|--------------------------------|
| **SMALL** | Subtle elements, nav items, tabs. | `inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.1)` |
| **MEDIUM** | Standard elevation: Cards, dropdowns, modals. (Default) | `inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 6px rgba(0,0,0,0.15)` |
| **LARGE** | Prominent depth: Hover states, focused elements, key modals. | `inset 0 2px 0 rgba(255,255,255,0.2), 0 6px 12px rgba(0,0,0,0.2)` |

### Shadow Implementation

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

### Gradient Enhancement (Premium Effect)

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
