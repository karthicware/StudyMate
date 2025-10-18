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

## ✅ ALL Interactive Elements Require data-testid

### Checklist

- [ ] **Buttons**: All clickable buttons (submit, cancel, save, delete, edit, add, etc.)
- [ ] **Form Inputs**: Text fields, email, password, number, date inputs
- [ ] **Dropdowns/Selects**: All `<select>` elements
- [ ] **Checkboxes**: All `<input type="checkbox">`
- [ ] **Radio Buttons**: All `<input type="radio">`
- [ ] **Links**: Navigation links, action links
- [ ] **Modals/Dialogs**: Modal containers AND all buttons inside modals
- [ ] **Panels/Sections**: Collapsible panels, property panels, sidebars
- [ ] **List Items**: Cards, table rows, list entries
- [ ] **Status Indicators**: Success messages, error messages, warning toasts
- [ ] **Loading Spinners**: Any element showing loading state
- [ ] **Dynamic Elements**: Elements that appear/disappear based on state

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
| Button | `-btn` | `submit-btn`, `cancel-btn`, `add-seat-btn` |
| Text Input | `-input` | `email-input`, `seat-number-input` |
| Dropdown/Select | `-dropdown` | `hall-dropdown`, `space-type-dropdown` |
| Checkbox | `-checkbox` | `ladies-only-checkbox`, `terms-checkbox` |
| Radio Button | `-radio` | `payment-method-radio` |
| Modal | `-modal` | `add-seat-modal`, `confirm-delete-modal` |
| Panel/Section | `-panel` | `properties-panel`, `filters-panel` |
| Link | `-link` | `dashboard-link`, `profile-link` |
| Success Message | `success-message` or `-success-msg` | `save-success-message` |
| Error Message | `error-message` or `-error-msg` | `validation-error-message` |
| Loading Spinner | `loading-spinner` or `-loading` | `data-loading-spinner` |

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

## 🚨 Pre-Commit Validation

**BEFORE committing UI code**, run these commands to detect missing locators:

```bash
# 1. Find buttons without data-testid (should return ZERO)
grep -r "<button" src/app/features --include="*.html" | grep -v "data-testid"

# 2. Find inputs without data-testid (should return ZERO)
grep -r "<input" src/app/features --include="*.html" | grep -v "data-testid"

# 3. Find selects without data-testid (should return ZERO)
grep -r "<select" src/app/features --include="*.html" | grep -v "data-testid"

# 4. Find divs with click handlers without data-testid (manual review)
grep -r "(click)=" src/app/features --include="*.html" | grep "<div" | grep -v "data-testid"
```

**Expected Result**: ALL commands should return **ZERO results** (no violations).

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

**Last Updated**: 2025-10-18
**Status**: ✅ ACTIVE - MANDATORY
**Owner**: Scrum Master (Bob)
