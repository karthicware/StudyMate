# Examples

## Example 1: Search Bar Component

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

## Example 2: Property Card

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

## Example 3: Primary Button with Gradient

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
