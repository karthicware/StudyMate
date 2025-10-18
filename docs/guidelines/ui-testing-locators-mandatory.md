# UI Testing Locators - MANDATORY Requirements

**Purpose**: Enforce data-testid locators on ALL testable UI elements
**Applies To**: All UI/Full-Stack stories
**Established**: 2025-10-18 (Story 1.4.1 Post-Mortem)
**Status**: MANDATORY - Non-negotiable

---

## 🚨 Critical Rule

⚠️ **EVERY testable UI element MUST have a `data-testid` locator. NO EXCEPTIONS.**

**If an element can be tested** (clicked, filled, validated), **it MUST have `data-testid`**.

---

## ✅ ALL Interactive & Testable Elements Require data-testid

### Mandatory Checklist (Complete List)

#### Form Elements (MANDATORY)
- [ ] **Buttons**: All `<button>` elements (submit, cancel, save, delete, edit, add, close, confirm, etc.)
- [ ] **Text Inputs**: All `<input type="text">`, `<input type="email">`, `<input type="password">`, `<input type="tel">`
- [ ] **Number Inputs**: All `<input type="number">`, `<input type="range">`
- [ ] **Date/Time Inputs**: All `<input type="date">`, `<input type="time">`, `<input type="datetime-local">`
- [ ] **Textareas**: All `<textarea>` elements
- [ ] **Dropdowns/Selects**: All `<select>` elements
- [ ] **Checkboxes**: All `<input type="checkbox">`
- [ ] **Radio Buttons**: All `<input type="radio">`
- [ ] **File Uploads**: All `<input type="file">`

#### Navigation & Links (MANDATORY)
- [ ] **Navigation Links**: All `<a>` elements for routing/navigation
- [ ] **Action Links**: Clickable links that trigger actions
- [ ] **Tabs**: Tab headers/buttons for switching content
- [ ] **Breadcrumbs**: Navigation breadcrumb links

#### Containers & Panels (MANDATORY)
- [ ] **Modals/Dialogs**: Modal containers AND all interactive elements inside
- [ ] **Panels/Sidebars**: Property panels, sidebars, drawers, collapsible sections
- [ ] **Accordions**: Accordion headers and content sections
- [ ] **Cards**: Interactive cards that can be clicked/selected
- [ ] **Tables**: Table containers, sortable headers, filterable columns

#### Status & Feedback Elements (MANDATORY)
- [ ] **Success Messages**: All success/confirmation toasts, banners, alerts
- [ ] **Error Messages**: All error/validation messages
- [ ] **Warning Messages**: All warning/caution messages
- [ ] **Info Messages**: All informational messages
- [ ] **Loading Spinners**: All loading indicators, progress bars
- [ ] **Badges/Tags**: Status badges, count indicators

#### Dynamic & List Elements (MANDATORY)
- [ ] **List Items**: Individual items in lists (use `[attr.data-testid]="'item-' + id"`)
- [ ] **Table Rows**: Individual rows in tables (use `[attr.data-testid]="'row-' + id"`)
- [ ] **Grid Items**: Items in grids/galleries
- [ ] **Draggable Elements**: Any draggable components
- [ ] **Sortable Items**: Elements that can be sorted/reordered

#### Interactive Visualizations (MANDATORY)
- [ ] **Clickable Icons**: Icons with click handlers (edit, delete, info icons)
- [ ] **Toggles/Switches**: Toggle buttons, switches
- [ ] **Tooltips**: Tooltip containers (if testable)
- [ ] **Popovers**: Popover containers and triggers
- [ ] **Context Menus**: Right-click menus, dropdown menus

#### Custom Components (MANDATORY)
- [ ] **Any element with `(click)` handler**: If it's clickable in code, it needs `data-testid`
- [ ] **Any element with `(change)` handler**: If it triggers change detection, it needs `data-testid`
- [ ] **Any element with `(submit)` handler**: If it submits forms, it needs `data-testid`
- [ ] **Any element with `*ngIf` condition**: If it appears/disappears, it needs `data-testid`
- [ ] **Any element validated in tests**: If E2E tests check it, it needs `data-testid`

---

## 📋 Naming Convention

**Pattern**: `{component}-{element-type}-{action/purpose}`

### Rules
1. **Use kebab-case** (lowercase with hyphens)
2. **Start with component/feature name** (e.g., `seat`, `booking`, `user`)
3. **Include element type** (e.g., `btn`, `input`, `dropdown`, `modal`, `panel`)
4. **Add action/purpose** for clarity (e.g., `save`, `cancel`, `email`, `success`)

### Examples

```html
<!-- ✅ GOOD - Buttons -->
<button data-testid="seat-properties-save-btn">Save</button>
<button data-testid="seat-properties-cancel-btn">Cancel</button>
<button data-testid="add-seat-btn">+ Add Seat</button>
<button data-testid="save-configuration-btn">Save Configuration</button>

<!-- ✅ GOOD - Form Inputs -->
<input data-testid="seat-number-input" type="text" />
<input data-testid="seat-custom-price-input" type="number" />
<input data-testid="user-email-input" type="email" />
<input data-testid="user-password-input" type="password" />

<!-- ✅ GOOD - Dropdowns/Selects -->
<select data-testid="hall-selection-dropdown">
  <option>Select Hall</option>
</select>
<select data-testid="space-type-dropdown" formControlName="spaceType">
  <option value="Cabin">Cabin</option>
</select>

<!-- ✅ GOOD - Checkboxes -->
<input data-testid="ladies-only-checkbox" type="checkbox" formControlName="isLadiesOnly" />
<input data-testid="terms-agreement-checkbox" type="checkbox" />

<!-- ✅ GOOD - Modals/Panels -->
<div data-testid="add-seat-modal" class="modal">
  <!-- Modal content -->
</div>
<div data-testid="seat-properties-panel" class="panel">
  <!-- Panel content -->
</div>

<!-- ✅ GOOD - Status Messages -->
<div data-testid="success-message" class="alert-success">
  Configuration saved successfully!
</div>
<div data-testid="error-message" class="alert-error">
  {{ errorMessage() }}
</div>

<!-- ✅ GOOD - Dynamic Lists (use unique identifiers) -->
<div
  *ngFor="let seat of seats()"
  [attr.data-testid]="'seat-item-' + seat.seatNumber"
  class="seat-item"
>
  {{ seat.seatNumber }}
</div>

<!-- ❌ BAD - No locators -->
<button>Save</button>
<input type="text" />
<div class="panel">
```

---

## 🎯 Element Type Naming Guide

| Element Type | Suffix | Example |
|--------------|--------|---------|
| **Form Elements** |||
| Button | `-btn` | `submit-btn`, `cancel-btn`, `add-seat-btn` |
| Text Input | `-input` | `email-input`, `seat-number-input`, `password-input` |
| Number Input | `-input` | `price-input`, `quantity-input` |
| Textarea | `-textarea` | `description-textarea`, `notes-textarea` |
| Dropdown/Select | `-dropdown` | `hall-dropdown`, `space-type-dropdown` |
| Checkbox | `-checkbox` | `ladies-only-checkbox`, `terms-checkbox` |
| Radio Button | `-radio` | `payment-method-radio`, `gender-radio` |
| File Upload | `-file-upload` | `profile-picture-file-upload` |
| **Navigation** |||
| Link | `-link` | `dashboard-link`, `profile-link`, `nav-home-link` |
| Tab | `-tab` | `overview-tab`, `settings-tab` |
| Breadcrumb | `-breadcrumb` | `home-breadcrumb`, `hall-breadcrumb` |
| **Containers** |||
| Modal/Dialog | `-modal` | `add-seat-modal`, `confirm-delete-modal` |
| Panel/Section | `-panel` | `properties-panel`, `filters-panel` |
| Card | `-card` | `seat-card`, `hall-card` |
| Accordion | `-accordion` | `faq-accordion`, `settings-accordion` |
| Table | `-table` | `seats-table`, `bookings-table` |
| **Status & Feedback** |||
| Success Message | `-success-message` | `save-success-message` |
| Error Message | `-error-message` | `validation-error-message` |
| Warning Message | `-warning-message` | `unsaved-warning-message` |
| Info Message | `-info-message` | `tips-info-message` |
| Loading Spinner | `-loading-spinner` | `data-loading-spinner` |
| Badge/Tag | `-badge` | `status-badge`, `count-badge` |
| **Interactive Elements** |||
| Toggle/Switch | `-toggle` | `notifications-toggle`, `dark-mode-toggle` |
| Clickable Icon | `-icon` | `edit-icon`, `delete-icon`, `info-icon` |
| Tooltip | `-tooltip` | `help-tooltip`, `info-tooltip` |
| Popover | `-popover` | `actions-popover`, `filters-popover` |
| Context Menu | `-menu` | `context-menu`, `actions-menu` |
| **Dynamic Elements** |||
| List Item | `-item-{id}` | `seat-item-A1`, `user-item-123` |
| Table Row | `-row-{id}` | `booking-row-456`, `seat-row-A1` |
| Grid Item | `-grid-item-{id}` | `hall-grid-item-1` |

---

## ✅ Implementation Examples

### Angular Component Template

```html
<!-- Buttons -->
<button
  data-testid="add-seat-btn"
  (click)="openAddSeatModal()"
  class="btn btn-primary"
>
  + Add Seat
</button>

<button
  data-testid="save-configuration-btn"
  (click)="saveSeatConfiguration()"
  [disabled]="!hasUnsavedChanges()"
>
  Save Configuration
</button>

<!-- Form Inputs -->
<input
  data-testid="seat-number-input"
  type="text"
  placeholder="Enter seat number (e.g., A1)"
  [(ngModel)]="newSeatNumber"
/>

<input
  data-testid="seat-custom-price-input"
  type="number"
  formControlName="customPrice"
  placeholder="Custom price (optional)"
/>

<!-- Dropdown/Select -->
<select data-testid="space-type-dropdown" formControlName="spaceType">
  <option value="Cabin">🚪 Cabin</option>
  <option value="Seat Row">💺 Seat Row</option>
  <option value="Study Pod">📚 Study Pod</option>
</select>

<!-- Checkbox -->
<label for="ladiesOnly">
  <input
    id="ladiesOnly"
    data-testid="ladies-only-checkbox"
    type="checkbox"
    formControlName="isLadiesOnly"
  />
  Ladies Only Seat
</label>

<!-- Modal -->
<div
  *ngIf="showSeatModal()"
  data-testid="add-seat-modal"
  class="fixed inset-0 bg-gray-600 bg-opacity-50"
>
  <div class="bg-white p-6">
    <h2>Add New Seat</h2>
    <input data-testid="new-seat-number-input" [(ngModel)]="newSeatNumber" />
    <button data-testid="modal-add-btn" (click)="addSeat()">Add</button>
    <button data-testid="modal-cancel-btn" (click)="showSeatModal.set(false)">Cancel</button>
  </div>
</div>

<!-- Panel -->
<div
  *ngIf="selectedSeat()"
  data-testid="seat-properties-panel"
  class="properties-panel"
>
  <h3>Seat Properties</h3>
  <form [formGroup]="propertiesForm">
    <!-- Form content -->
  </form>
  <button data-testid="properties-save-btn" (click)="onSave()">Save</button>
  <button data-testid="properties-cancel-btn" (click)="onCancel()">Cancel</button>
</div>

<!-- Status Messages -->
<div
  *ngIf="saveSuccess()"
  data-testid="success-message"
  class="alert alert-success"
>
  ✓ Configuration saved successfully!
</div>

<div
  *ngIf="errorMessage()"
  data-testid="error-message"
  class="alert alert-error"
>
  ✗ {{ errorMessage() }}
</div>

<!-- Dynamic List Items -->
<div
  *ngFor="let seat of seats()"
  [attr.data-testid]="'seat-item-' + seat.seatNumber"
  class="seat-item"
  (click)="selectSeat(seat)"
>
  {{ seat.seatNumber }} - {{ seat.spaceType }}
</div>
```

---

## 🚨 Pre-Commit Validation (MANDATORY)

**BEFORE committing UI code**, run these commands to detect missing locators:

```bash
# ========================================
# FORM ELEMENTS (MUST return ZERO results)
# ========================================

# 1. Find buttons without data-testid
grep -r "<button" src/app/features --include="*.html" | grep -v "data-testid"

# 2. Find all input elements without data-testid
grep -r "<input" src/app/features --include="*.html" | grep -v "data-testid"

# 3. Find select dropdowns without data-testid
grep -r "<select" src/app/features --include="*.html" | grep -v "data-testid"

# 4. Find textarea elements without data-testid
grep -r "<textarea" src/app/features --include="*.html" | grep -v "data-testid"

# ========================================
# NAVIGATION & LINKS (MUST return ZERO results)
# ========================================

# 5. Find clickable links without data-testid (with click handlers)
grep -r "<a" src/app/features --include="*.html" | grep "(click)" | grep -v "data-testid"

# 6. Find router links without data-testid
grep -r "routerLink" src/app/features --include="*.html" | grep -v "data-testid"

# ========================================
# INTERACTIVE ELEMENTS (MUST return ZERO results)
# ========================================

# 7. Find divs with click handlers without data-testid
grep -r "(click)=" src/app/features --include="*.html" | grep "<div" | grep -v "data-testid"

# 8. Find spans with click handlers without data-testid
grep -r "(click)=" src/app/features --include="*.html" | grep "<span" | grep -v "data-testid"

# 9. Find any element with submit handler without data-testid
grep -r "(submit)=" src/app/features --include="*.html" | grep -v "data-testid"

# 10. Find any element with change handler without data-testid
grep -r "(change)=" src/app/features --include="*.html" | grep -v "data-testid"

# ========================================
# E2E TEST VALIDATION (MUST return ZERO results)
# ========================================

# 11. Find fragile text-based selectors in E2E tests
grep -n "has-text" e2e/*.spec.ts | grep -v "data-testid"

# 12. Find CSS selectors based on formControlName (fragile)
grep -n "formControlName" e2e/*.spec.ts

# 13. Find placeholder-based selectors (fragile)
grep -n "placeholder" e2e/*.spec.ts

# 14. Find class-based selectors in E2E tests (fragile)
grep -n "locator('\\..*')" e2e/*.spec.ts | grep -v "data-testid"
```

**Expected Result**: ALL commands should return **ZERO results** (no violations).

**Enforcement**: If ANY validation command returns results, you MUST fix violations before committing.

---

## 🎯 Why data-testid is Mandatory

### Benefits

✅ **Reliability**: Locators don't break when text/classes change
✅ **Specificity**: No ambiguity about which element to test
✅ **Maintainability**: Tests are self-documenting
✅ **Performance**: Faster selector resolution in Playwright
✅ **Separation of Concerns**: Test locators separate from styling

### Problems Without data-testid

❌ **Fragile Tests**: Break when UI text changes
❌ **Ambiguous Selectors**: Multiple elements match, wrong one clicked
❌ **Maintenance Hell**: Tests depend on CSS classes that change
❌ **Debugging Nightmare**: Hard to know which element test is targeting

---

## 📊 E2E Test Comparison

### With data-testid (Recommended)

```typescript
// ✅ Reliable, specific, maintainable
await page.click('[data-testid="seat-properties-save-btn"]');
await page.fill('[data-testid="seat-number-input"]', 'A1');
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
```

### Without data-testid (Fragile)

```typescript
// ❌ Fragile, ambiguous, breaks easily
await page.click('button:has-text("Save")'); // Which Save button?
await page.fill('input[placeholder*="seat"]'); // Breaks if placeholder text changes
await expect(page.locator('text=Success')).toBeVisible(); // Text might appear elsewhere
```

---

## 🚨 Enforcement

### Rejection Criteria

- ❌ **Code Review**: Any interactive element without `data-testid` → Story REJECTED
- ❌ **QA Gate**: Missing locators discovered during E2E testing → Story REJECTED
- ❌ **Pre-Commit**: Validation commands return violations → Must fix before commit

### No Exceptions

**Every testable element must have a locator. Period.**

This is not optional. This is not negotiable. This is MANDATORY.

---

## 📚 Related Documentation

- [Coding Standards - UI Testing Locators](../architecture/coding-standards.md#ui-testing-locators-mandatory-for-all-ui-stories)
- [E2E Testing Guide](../testing/e2e-testing-guide.md#1-use-data-testid-attributes)
- [E2E Quality Gates](../testing/e2e-quality-gates-quick-reference.md)
- [QA Checklist - Gate 0](../../.bmad-core/checklists/e2e-quality-gate-checklist.md#0-ui-testing-locators)

---

## 📋 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-18 | Enhanced with comprehensive element checklist (40+ element types), 14 validation commands, expanded naming guide | Bob (Scrum Master) |
| 2025-10-18 | Initial creation with basic data-testid requirements | Bob (Scrum Master) |

---

**Last Updated**: 2025-10-18 (Enhanced)
**Status**: ✅ ACTIVE - MANDATORY
**Owner**: Scrum Master (Bob)
