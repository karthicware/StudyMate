# 6. Accessibility Requirements

All components MUST meet **WCAG 2.1 Level AA** standards.

## Color Contrast

| Element Type | Minimum Contrast Ratio | Example |
|--------------|------------------------|---------|
| **Body Text** | 4.5:1 | `text-gray-900` on `bg-white` |
| **Large Text (18px+)** | 3:1 | `text-gray-700` on `bg-white` |
| **UI Components** | 3:1 | `border-gray-300` on `bg-white` |
| **Graphical Objects** | 3:1 | Icons, focus indicators |

## Keyboard Navigation

- **Tab Order**: All interactive elements must be reachable via Tab key
- **Focus Indicators**: Visible focus states for all interactive elements
- **Skip Links**: Provide skip navigation links for keyboard users
- **Escape Key**: Modals and dropdowns should close with Escape key

## ARIA Labels

- **Buttons**: Use `aria-label` when button has no text (icon-only)
- **Form Fields**: Use `aria-describedby` for error messages
- **Loading States**: Use `aria-busy="true"` during async operations
- **Alerts**: Use `role="alert"` for dynamic messages

## Motion Sensitivity

Use `prefers-reduced-motion` media query to respect user preferences:

```html
<button class="
  transition-all duration-300
  motion-reduce:transition-none
">
  Hover Me
</button>
```

## Accessibility Checklist

- [ ] All images have descriptive `alt` text
- [ ] Form fields have visible labels or `aria-label`
- [ ] Error messages are announced to screen readers
- [ ] Focus indicators are visible (2px outline minimum)
- [ ] Color is not the only means of conveying information
- [ ] Interactive elements have minimum 44x44px touch target (mobile)
- [ ] Text can be zoomed to 200% without breaking layout
- [ ] Animations respect `prefers-reduced-motion`

---
