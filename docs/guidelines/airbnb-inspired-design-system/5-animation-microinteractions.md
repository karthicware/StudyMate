# 5. Animation & Microinteractions

Smooth, purposeful animations enhance user experience and build trust through fidelity.

## Animation Timing

| Duration | Milliseconds | Tailwind Class | Usage |
|----------|--------------|----------------|-------|
| **Fast** | 200ms | `duration-200` | Quick feedback, small movements |
| **Standard** | 300ms | `duration-300` | Default for most transitions |
| **Complex** | 500ms | `duration-500` | Multi-step animations, complex transitions |

## Easing Functions

| Easing | Tailwind Class | Usage |
|--------|----------------|-------|
| **Linear** | `ease-linear` | Continuous animations (spinners, progress bars) |
| **Ease In** | `ease-in` | Exit animations, fading out |
| **Ease Out** | `ease-out` | Entrance animations, fading in |
| **Ease In-Out** | `ease-in-out` | Most transitions, hover effects |

## Common Microinteractions

### Button Hover
```html
<button class="
  transform hover:-translate-y-1
  transition-all duration-300 ease-in-out
  shadow-card hover:shadow-modal
">
  Click Me
</button>
```

### Input Focus
```html
<input class="
  border-2 border-gray-200
  focus:border-primary-500 focus:ring-2 focus:ring-primary-300
  transition-all duration-200 ease-out
"/>
```

### Card Hover (Image Scale)
```html
<div class="overflow-hidden rounded-xl">
  <img class="
    transform transition-transform duration-300 ease-in-out
    hover:scale-105
  " src="property.jpg" />
</div>
```

### Loading Spinner
```html
<svg class="animate-spin h-5 w-5 text-primary-500">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
```

## Animation Guidelines

1. **Use GPU-Accelerated Properties**: Prefer `transform` and `opacity` over `top`, `left`, `width`, `height`
2. **Respect User Preferences**: Use `motion-reduce:` prefix for users with motion sensitivity
3. **Purposeful Animations**: Every animation should have a clear purpose (feedback, guidance, delight)
4. **Consistent Timing**: Use standard durations (200ms, 300ms, 500ms) across the app
5. **Subtle Movement**: Avoid excessive or jarring animations

---
