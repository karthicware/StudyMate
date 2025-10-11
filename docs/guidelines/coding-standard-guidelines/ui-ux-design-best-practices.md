# UI/UX Design Best Practices

This comprehensive guide outlines best practices, conventions, and standards for development in UI and UX design principles for software development.

**Referenced by:**
- [Product Requirements Document (PRD)](../../prd.md) - Section 5: Technical Constraints
- [Front-End Specification](../../front-end-spec.md) - Section 3: Design System Foundation

**Project-Specific Application:** See [Front-End Specification](../../front-end-spec.md) for StudyMate's implementation of these principles with specific color palette (#007BFF primary, semantic status colors), typography (Montserrat/Roboto), and component standards.

---

### UI Color Palette Structure
A complete UI color palette consists of four main categories:

1. **Primary Color** (10% of interface)
   - The most prominent brand color
   - Used for: CTAs, primary buttons, progress bars, selection controls, sliders, active navigation elements, links
   - Typically 1-2 colors maximum
   - This is NOT the most-used color (neutrals are), but the most prominent accent

2. **Secondary/Accent Colors** (part of the 30%)
   - Harmonious colors derived from color wheel relationships (analogous, complementary, split-complementary, triadic, monochromatic)
   - Used for: Highlighting new features, secondary actions, visual variety
   - Should complement, not compete with primary color

3. **Neutral Colors** (60% of interface)
   - Whites, grays, blacks in 8-10 shades
   - Used for: Text (body, headings, captions), backgrounds, panels, form controls, borders
   - Most screens are primarily composed of these colors

4. **Semantic Colors** (status communication)
   - **Green**: Success states, confirmations, positive actions
   - **Yellow/Amber**: Warnings, caution states
   - **Blue**: Informational messages, neutral notifications
   - **Red/Orange**: Errors, destructive actions, failed attempts

### The 60-30-10 Rule
- 60% Dominant (neutral colors)
- 30% Secondary (supporting colors)
- 10% Accent (primary color for emphasis)

### Implementation Guidelines
- Each color should have 8-10 shade variations for flexibility
- Define text color shades (body, heading, caption) early to avoid rework
- Color choices influence 62-90% of subconscious product judgments
- True red for errors UNLESS red is your primary color (then use orange)
- Extend palette further for data visualizations and charts if needed



→ Color Layering for Depth

STEP-BY-STEP COLOR LAYERING FOR ANY COMPONENT:

1. SHADE CREATION:
    - Take your base color (e.g., gray-200, blue-500)
    - Create exactly 3-4 shades by increasing lightness:
        - Shade 1 (darkest): Base color - 0.1 lightness
        - Shade 2 (medium): Base color (your starting point)
        - Shade 3 (light): Base color + 0.1 lightness
        - Shade 4 (lightest): Base color + 0.2 lightness (optional)
2. APPLY TO PAGE HIERARCHY:
    - Page background: Use Shade 1 (darkest)
    - Container/card backgrounds: Use Shade 2 (medium)
    - Interactive elements (buttons, tabs, inputs): Use Shade 3 (light)
    - Selected/active/hover states: Use Shade 4 (lightest)
3. TEXT & ICON COMPENSATION:
    - When you apply a lighter background to an element
    - Increase text color lightness by the same amount
    - Increase icon color lightness by the same amount
    - This maintains proper contrast and prevents muted appearance
4. BORDER REMOVAL:
    - Remove borders from any element using Shade 3 or Shade 4
    - The color contrast itself creates the separation
    - Keep borders only on Shade 1 or Shade 2 if absolutely needed
5. ELEMENT-SPECIFIC APPLICATIONS:
    
    **For Tabs:**
    
    - Background: Shade 2
    - Selected tab: Shade 3
    - Text/icon in selected tab: Increase lightness
    
    **For Cards:**
    
    - Wrapper: Shade 2
    - Important elements inside: Shade 3
    - Selected card: Shade 3 + shadow
    
    **For Dropdowns/Buttons:**
    
    - Default: Shade 2
    - Highlighted/important: Shade 3
    - Can add gradient + inner shadow for premium feel
    
    **For Radio/Checkbox Options:**
    
    - Container: Shade 2
    - Options: Shade 2 with spacing
    - Selected option: Shade 3
    
    **For Tables:**
    
    - Background: Shade 1 (to push it deeper)
    - Can be darker than other elements to de-emphasize
    
    **For Navigation:**
    
    - Base: Shade 2
    - Items: Shade 3
    - Multiple layers create depth effect
6. EMPHASIS CONTROL:
    - To emphasize: Use lighter shades (Shade 3 or 4)
    - To de-emphasize: Use darker shades (Shade 1 or 2)
    - The lighter an element, the more it "pops" toward the user
    - The darker an element, the more it recedes into the background


→ Two-Layer Shadows & Gradients

COMPLETE SHADOW & GRADIENT SYSTEM FOR ANY COMPONENT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. BASIC TWO-LAYER SHADOW (Choose Your Level)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**SMALL SHADOW (Subtle depth):**
Use for: Subtle elements, small cards, nav items, tabs

- Top layer: Light border or glow (0-1px offset, soft, white/light color, low opacity)
- Bottom layer: Dark shadow (1-2px offset, soft blur, dark color, low opacity)
- Specific values example:
    - Top: inset 0 1px 0 rgba(255,255,255,0.1)
    - Bottom: 0 1px 2px rgba(0,0,0,0.1)

**MEDIUM SHADOW (Standard depth):**
Use for: Cards, dropdowns, modals, most components

- Top layer: Light border/glow (increase by 2-3px from small)
- Bottom layer: Dark shadow (increase by 2-3px from small)
- Specific values example:
    - Top: inset 0 1px 0 rgba(255,255,255,0.15)
    - Bottom: 0 3px 6px rgba(0,0,0,0.15)

**LARGE SHADOW (Prominent depth):**
Use for: Hover states, focused elements, important modals

- Top layer: Light border/glow (push by few more pixels)
- Bottom layer: Dark shadow (push by few more pixels)
- Specific values example:
    - Top: inset 0 2px 0 rgba(255,255,255,0.2)
    - Bottom: 0 6px 12px rgba(0,0,0,0.2)

**SHADOW SELECTION GUIDE:**

- Profile cards → Small shadow (feels most natural)
- Dashboard cards → Medium shadow (default)
- Hover states → Large shadow (interactive feedback)
- Works best in light mode, but adapt for dark mode

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. GRADIENT ENHANCEMENT (Premium Shiny Effect)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**WHEN TO USE:**

- Dropdowns, buttons, important interactive elements
- When you want a "light hitting from top" effect
- To make linear elements feel more dynamic

**IMPLEMENTATION:**
Step 1: Create linear gradient (top to bottom)

- Top color: Lighter shade (base + 0.1-0.2 lightness)
- Bottom color: Darker shade (base - 0.05-0.1 lightness)
- Example: linear-gradient(to bottom, #f5f5f5, #e5e5e5)

Step 2: Add lighter inner shadow on top edge

- Position: inset 0 1px 0
- Color: White or very light color
- Opacity: 0.2-0.4
- This creates the "shiny highlight up top"

Step 3: Optional - Add standard shadow at bottom

- Use small or medium shadow from above
- Reinforces the elevation

**COMPLETE EXAMPLE:**
background: linear-gradient(to bottom, #lighter, #darker);
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.3), /* Top highlight */
  0 2px 4px rgba(0,0,0,0.1);