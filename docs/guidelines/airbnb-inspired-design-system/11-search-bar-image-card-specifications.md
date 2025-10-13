# 11. Search Bar & Image Card Specifications

This section provides detailed implementation guidelines for the search bar component, guest selection dropdown, and image card styles (listing cards and category cards).

## 11.1 Search Bar Component (`<app-search-bar>`)

The primary search component is a highly visible, pill-shaped element that houses several interactive input fields.

### 11.1.1 Overall Structure and Styling

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

### 11.1.2 Guest Selection Dropdown (`<app-guest-dropdown>`)

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

## 11.2 Image Card Specifications

Two main card types: **Listing Cards** (property listings) and **Category Cards** (service categories).

### 11.2.1 Listing Card (`<app-listing-card>`)

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

### 11.2.2 Category/Service Card (`<app-category-card>`)

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

## 11.3 Image Card Style Comparison

| Feature | Listing Card (Property) | Category Card (Service) |
|---------|------------------------|------------------------|
| **Rounding** | Large (`rounded-xl` / 12px) | Medium (`rounded-lg` / 8px) |
| **Aspect Ratio** | 4:3 or 16:9 (landscape) | 1:1 (square) |
| **Text Placement** | Below image, left-aligned | Below image, centered |
| **Interactivity** | Overlaid badges (Heart, Guest Favorite), image scale on hover | Simple opacity change on hover |
| **Content Density** | High (title, location, dates, price, rating) | Low (name, subtitle) |
| **Max Width** | `max-w-xs` (320px) | Fixed `w-24` (96px) |

---

## 11.4 Component Architecture Summary

### Recommended Component Structure

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

## 11.5 Implementation Checklist

### Pre-Implementation
- [ ] Review search bar and image card specifications
- [ ] Verify gradient colors for search button
- [ ] Plan responsive behavior (search bar on mobile)
- [ ] Consult context7: `"use context7 - Angular reactive forms for search inputs"`

### During Implementation
- [ ] Create search pill component with flexible sections
- [ ] Implement guest dropdown with stepper controls
- [ ] Add guest count summary logic
- [ ] Create listing card with image overlay badges
- [ ] Create category card with centered text
- [ ] Implement hover effects (image scale, opacity)
- [ ] Add click-outside detection for guest dropdown
- [ ] Ensure proper z-index layering

### Post-Implementation
- [ ] Test search bar responsiveness (mobile, tablet, desktop)
- [ ] Verify guest dropdown positioning and overflow
- [ ] Test image hover effects (60fps target)
- [ ] Verify heart icon toggle functionality
- [ ] Test keyboard navigation for all interactive elements
- [ ] Verify ARIA labels and accessibility
- [ ] Test with real data and edge cases (long titles, missing images)
- [ ] Optimize images (lazy loading, srcset for responsive images)

---

## 11.6 Design System Compliance Matrix

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
