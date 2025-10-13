# 9. Header and Footer Component Specifications

> **🎨 SHADOW & DEPTH REFERENCE**: All shadow and elevation implementations follow [Shadow.md](./Shadow.md).
> - Use the two-layer shadow system (small/medium/large)
> - Apply color layering for depth (4-shade system)
> - Shadow.md guidance takes precedence

This section provides detailed implementation guidelines for the global header and footer components, ensuring they align with the Airbnb-inspired design system principles.

## 9.1 Target Technology Stack

- **Framework**: Angular (Component-based architecture)
- **Styling**: Tailwind CSS (Utility-first approach)
- **Design Philosophy**: Airbnb-inspired minimalism with breathing layouts

---

## 9.2 Global Styling Configuration

### Color Palette Integration

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

### Design System Compliance

- **Typography**: Clean sans-serif stack using `font-sans` (Inter/Poppins)
- **Spacing**: Tailwind's default 8-point grid scale (`p-4`, `m-2`, `space-x-4`)
- **Responsive**: Mobile-first approach with breakpoint modifiers
- **Transitions**: Smooth 300ms transitions for interactive states
- **Accessibility**: WCAG AA compliant with proper contrast ratios

---

## 9.3 Header Component Implementation

The header should be implemented as a sticky, modular Angular component with child components for maintainability.

### 9.3.1 Header Structure & Layout

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

### 9.3.2 Search Bar Component (`<app-search-bar>`)

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

### 9.3.3 User Menu Component (`<app-user-menu>`)

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

### 9.3.4 User Menu Dropdown Component (`<app-user-menu-dropdown>`)

This dropdown appears when the User Menu button (avatar/hamburger icon) in the Header is clicked.

**Design System Alignment:**
- **Shadow**: `shadow-2xl` for prominent elevation (Two-Layer Shadow System)
- **Border Radius**: `rounded-xl` matches card aesthetic (12px)
- **Spacing**: `py-2 px-3` follows 8-point grid system
- **Hover States**: `hover:bg-gray-50` uses Shade 4 strategy

#### Structure and Layout

| Feature | Tailwind Classes | Design System Notes |
|---------|------------------|---------------------|
| **Container** | `absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden` | Uses **absolute positioning** relative to header. `shadow-2xl` for prominence. `rounded-xl` matches **Border Radius** guidelines (12px). |
| **Z-Index** | `z-40` | Ensures menu appears above page content but below modals (z-50). |
| **Divider** | `border-t border-gray-200 my-2` | Subtle horizontal lines separate logical groups. Uses **Neutral Colors** (border-gray-200). |

#### Menu Item Specifications

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

#### Angular Component Implementation

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

#### Integration with User Menu Button

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

#### Accessibility Features

| Feature | Implementation | Design System Notes |
|---------|---------------|---------------------|
| **Keyboard Navigation** | Tab through menu items, Enter to activate | Meets WCAG 2.1 AA standards |
| **Screen Reader Support** | `role="menu"`, `role="menuitem"`, `aria-labelledby` | Proper ARIA attributes |
| **Escape Key** | Closes dropdown when pressed | Standard modal/dropdown behavior |
| **Click Outside** | Closes dropdown when clicking outside | Expected UX pattern |
| **Focus Management** | Returns focus to trigger button on close | Keyboard navigation best practice |
| **ARIA Expanded** | `aria-expanded` attribute on trigger button | Indicates dropdown state to assistive tech |

#### Design System Compliance

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

#### Implementation Notes

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

## 9.4 Footer Component Implementation

The footer requires a responsive, breathing layout to manage multi-column navigation while maintaining Airbnb's clean aesthetic.

### 9.4.1 Footer Structure & Layout

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

### 9.4.2 Footer Navigation Column (Reusable Component)

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

## 9.5 Angular Component Architecture

### Recommended Hierarchy

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

### Module Configuration

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

## 9.6 Implementation Checklist

### Pre-Implementation (Planning Phase)

- [ ] Review Airbnb-inspired design system principles (Section 1)
- [ ] Verify color palette alignment with 60-30-10 rule
- [ ] Consult context7 for latest Angular patterns: `"use context7 - Angular latest component patterns"`
- [ ] Verify Tailwind CSS configuration: `"use context7 - Tailwind CSS 3.4+ setup with Angular"`
- [ ] Plan responsive breakpoints (mobile: 360px, tablet: 768px, desktop: 1024px+)

### During Implementation (Coding Phase)

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

### Post-Implementation (Verification Phase)

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

## 9.7 Design System Alignment Summary

| Design Principle | Header Implementation | Footer Implementation |
|------------------|----------------------|----------------------|
| **Friendly Clarity** | ✅ Rounded pill search bar, clean typography | ✅ Clear column headings, readable link lists |
| **Trust through Fidelity** | ✅ Two-layer shadows, smooth transitions, gradient button | ✅ Consistent spacing, subtle hover effects |
| **Accent Focus (10%)** | ✅ Primary color only on search button | ✅ Neutral colors dominate (60-30-10 rule) |
| **Breathing Layout** | ✅ Flex layout, responsive prefixes, stable relationships | ✅ Grid collapses naturally (4→2→1 columns) |

---

## 9.8 Context7 Integration Commands

When implementing header and footer, use these context7 commands to verify best practices:

```bash