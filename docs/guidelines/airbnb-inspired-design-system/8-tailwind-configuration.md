# 8. Tailwind Configuration

> **📋 IMPLEMENTATION NOTE**: This configuration implements the shadow system defined in [Shadow.md](./Shadow.md).
> - All shadow values follow the two-layer shadow principle
> - Shadow.md is the primary reference for shadow implementation details

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
