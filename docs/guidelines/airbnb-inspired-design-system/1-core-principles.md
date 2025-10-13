# 1. Core Principles

Every design decision must align with these four foundational principles:

| Principle | Description | Implementation Focus |
|-----------|-------------|---------------------|
| **Friendly Clarity** | Use clear, accessible language, and focus on simple, approachable shapes (rounded corners, soft typography). | Rounded corners (12px), Inter font, clear visual hierarchy. |
| **Trust through Fidelity** | Small details (smooth transitions, controlled shadows, perfect alignment) build user trust and premium quality. | Two-layer shadows, subtle hover effects, responsive precision. |
| **Accent Focus** | Reserve the primary accent color (60-30-10 rule) strictly for high-priority CTAs and essential interactive feedback. | Primary color (#ff3f6c) only on search buttons, active links, and focus states. |
| **Breathing Layout** | Layouts must prioritize flow and relationship over fixed pixels, allowing elements to reorganize naturally across breakpoints. | Flex/Grid, `sm:`, `md:`, `lg:` prefixes, responsive strategy implementation. |

## Principle Guidelines

### Friendly Clarity
- **Typography**: Use Inter font family for a neutral, readable experience
- **Shapes**: Prefer rounded corners (12px standard, 8px for inputs)
- **Language**: Use conversational, helpful copy
- **Visual Hierarchy**: Clear distinction between headings, body text, and captions

### Trust through Fidelity
- **Precision**: Pixel-perfect alignment across all breakpoints
- **Transitions**: All interactive elements have smooth transitions (300ms standard)
- **Shadows**: Consistent two-layer shadow system
- **Quality**: No visual artifacts, proper image optimization

### Accent Focus
- **60-30-10 Rule**:
  - 60% Neutral colors (backgrounds, text)
  - 30% Semantic colors (status, secondary actions)
  - 10% Primary accent (#ff3f6c for emphasis)
- **Restraint**: Primary color used sparingly for maximum impact

### Breathing Layout
- **Relationship**: Elements maintain stable relationships as viewport changes
- **Proportion**: Relative sizing ensures natural reorganization
- **Flow**: Consistent spacing, predictable column wrapping
- **No Fixed Widths**: Use `max-w-*` instead of fixed `w-*` where appropriate

---
