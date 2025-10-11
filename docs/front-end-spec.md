## 🎨 StudyMate UX & Front-End Specification

### 1. High-Level Wireframe Draft

This section visualizes the two most critical user interfaces, based on the **Product Requirements Document (PRD)**.

#### **A. Owner Dashboard (Admin View)**

| Component | Functionality | PRD Reference |
| :--- | :--- | :--- |
| **Summary Metrics (Top Row)** | Large cards for **Current Revenue**, **Active Subscriptions**, and **Current Occupancy Rate (%)**. | 1.1 |
| **Real-time Seat Map Widget** | Miniature, interactive map showing seats: **Green (Available)**, **Red (Occupied)**, **Yellow (Locked)**. | 1.1, 2.1 |
| **Quick Actions/Alerts** | Buttons for **"Send Announcement"**, **"Add New Seat/Shift"**, and a feed of **"Expiring Subscriptions"**. | 4.1, 6.1 |
| **Revenue/Utilization Chart** | Chart showing usage patterns or daily income over the last 30 days. | 5.1 |

#### **B. Student Seat Booking Map (User View)**

| Component | Functionality | PRD Reference |
| :--- | :--- | :--- |
| **Hall/Shift Selector** | **Step 1:** Select Date. **Step 2:** Select Shift Type (e.g., Morning 9-1). | 1.2, 2.1 |
| **Interactive Seat Map** | Large, zoomable/pannable map. Tapping a **Green** seat triggers the booking flow. | 2.1 |
| **Booking Summary Panel** | Appears on selection. Displays: **Selected Seat No.**, **Shift Time**, **Price**. | 2.1 |
| **Action Button** | Button becomes active: **"Proceed to Payment"** (links to external gateway). | 2.2 |
| **QR Code Check-in Widget** | Persistent widget displaying the student's **live QR code** for attendance tracking. | 3.1 |

---

### 2. Angular Development Standards

All front-end development must strictly adhere to the Angular coding standards defined in [docs/guidelines/coding-standard-guidelines/angular-rules.md](../guidelines/coding-standard-guidelines/angular-rules.md).

#### Key Angular Requirements
| Requirement | Implementation |
| :--- | :--- |
| **Component Architecture** | Use standalone components with `inject()` for dependency injection. |
| **State Management** | Utilize Angular Signals for reactive state management alongside NgRx where appropriate. |
| **Type Safety** | Strict TypeScript with interfaces/types; avoid `any`. |
| **File Naming** | kebab-case for all files (e.g., `user-profile.component.ts`). |
| **Performance** | Use `trackBy` with `ngFor`, `async` pipe for observables, `NgOptimizedImage` for images. |
| **Code Quality** | Follow immutability principles, pure functions, and component composition over inheritance. |
| **Testing** | Unit tests following Arrange-Act-Assert pattern with high coverage. |

#### context7 MCP for Angular Development (MANDATORY)
All Angular development must utilize context7 MCP for version-specific documentation and patterns:

| Usage Context | context7 Command Example |
| :--- | :--- |
| **Component Patterns** | `"use context7 - Angular 20 standalone component best practices"` |
| **Signals & State** | `"use context7 - Angular 20 Signals implementation patterns"` |
| **Routing & Guards** | `"use context7 - Angular 20 router latest features"` |
| **Forms & Validation** | `"use context7 - Angular 20 reactive forms with signals"` |
| **Performance** | `"use context7 - Angular 20 performance optimization techniques"` |
| **Testing** | `"use context7 - Angular 20 testing with Jest/Jasmine"` |

**Pre-Implementation Requirements:**
- ALWAYS query context7 before implementing new Angular features
- Verify all Angular 20-specific patterns and APIs
- Validate Tailwind CSS integration patterns with Angular
- Check compatibility of third-party libraries with Angular 20

See comprehensive guidelines: [docs/guidelines/context7-mcp.md](../guidelines/context7-mcp.md)

---

### 3. Design System Foundation (Visual Guide)

All UI/UX design must strictly follow the comprehensive guidelines defined in [UI/UX Design Best Practices](../guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md).

**Core Principles Applied:**
- **60-30-10 Rule**: 60% neutrals, 30% secondary/semantic, 10% primary accent
- **Color Layering**: 3-4 shades for depth without heavy borders (detailed in UI/UX guidelines)
- **Two-Layer Shadows**: Small/medium/large shadow system (detailed in UI/UX guidelines)
- **Gradients**: Linear gradients with inner shadows for premium feel (detailed in UI/UX guidelines)

The design adheres to the **60-30-10 Rule** and the chosen technology stack (Angular/Tailwind).

#### Color Palette Structure
| Category | StudyMate Implementation | Role & Application |
| :--- | :--- | :--- |
| **10% Accent (Primary)** | **`#007BFF` (Study Blue)** | **Call-to-Action (CTA) Buttons**, Active Navigation Items, Links, Progress Bars, Selection Controls. |
| **30% Secondary** | **Semantic Status Colors** | **Green** (`#28A745`) for **Available** / Success. **Red** (`#DC3545`) for **Occupied** / Danger. **Yellow** (`#FFC107`) for **Locked** / Warning. **Blue** for informational messages. |
| **60% Dominant (Neutrals)** | **Base Gray Palette (8-10 shades)** | **Backgrounds** (Pages, Modals), **Text** (Body, Headings, Captions), **Borders**, **Form Controls**. |
| **Typography** | **Header:** Montserrat (Bold). **Body:** Roboto (Regular). | Ensures legibility and a modern aesthetic. |

#### StudyMate-Specific Implementation

**Color Layering Application** (See [UI/UX Best Practices](../guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md) for complete methodology):
- **Shade 1 (Darkest)**: Page backgrounds, table backgrounds (de-emphasize)
- **Shade 2 (Medium)**: Container/card backgrounds, navigation base (neutral)
- **Shade 3 (Light)**: Interactive elements, selected card backgrounds (emphasize)
- **Shade 4 (Lightest)**: Hover/active states (maximum emphasis)

**Shadow System** (See [UI/UX Best Practices](../guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md) for exact values):
- **Small Shadow**: Subtle cards, nav items, tabs
- **Medium Shadow**: Dashboard cards, dropdowns, modals
- **Large Shadow**: Hover states, focus states, interactive feedback

**Gradient Enhancement**:
- Applied to primary CTAs (#007BFF) with linear gradient + inner shadow
- Creates "light hitting from top" premium effect
- Implementation details in [UI/UX Best Practices](../guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md)

---

### 4. Advanced Depth & Interaction Rules

#### **A. Color Layering (Creating Depth)**

Separation is created using varying lightness of the background color (Shades 1-4) to reduce reliance on hard borders.

| Shade Level | Relative Lightness | Emphasis Control | StudyMate Application |
| :--- | :--- | :--- | :--- |
| **Shade 1 (Darkest)** | Base Color - 0.1 | **De-emphasize** (recede) | Page Backgrounds, Tables. |
| **Shade 2 (Medium)** | Base Color | Neutral/Standard | Container/Card Backgrounds, Navigation Base. |
| **Shade 3 (Light)** | Base Color + 0.1 | **Emphasize** (pop toward user) | Interactive Elements, Selected Card Backgrounds. |

#### **B. Shadow & Gradient System**

All elevated components must use a **Two-Layer Shadow** system for consistent visual depth.

| Shadow Level | Application | Enhancement |
| :--- | :--- | :--- |
| **Medium Shadow** | **Dashboard Cards**, Dropdowns, Modals. | Standard elevation. |
| **Large Shadow** | **Hover States** for cards, Focus states. | Used to provide interactive feedback. |
| **Gradient** | Primary Blue CTAs. | Linear gradient + light inner shadow for a premium, dynamic look on key buttons. |

---

### 5. Visual Quality & Testing Standards

#### UI Quality Checklist
Every front-end component and feature must adhere to these visual quality standards:

| Category | Requirement | Validation Method |
| :--- | :--- | :--- |
| **Design System Compliance** | Strict adherence to Tailwind CSS design tokens and components. | Component review against design system. |
| **S-Tier SaaS Standards** | Visual quality must meet top-tier SaaS application standards (smooth, polished, professional). | UX review checklist. |
| **Animations & Micro-interactions** | All interactive elements must have smooth animations and appropriate micro-interactions. | Manual interaction testing. |
| **Consistency** | Consistent spacing, typography, and visual hierarchy across all screens. | Design consistency audit. |

#### Playwright Testing Requirements
All UI features must be validated with Playwright end-to-end tests following [docs/guidelines/coding-standard-guidelines/playwright-rules.md](../guidelines/coding-standard-guidelines/playwright-rules.md):

- **AC Validation**: Every acceptance criterion must be validated with Playwright automation.
- **Browser Console Check**: All tests must include browser console validation (zero errors/warnings).
- **Visual Evidence**: Failed tests must capture screenshots with references in the test report.
- **Pass/Fail Reporting**: Each AC must report clear pass/fail status with evidence.
- **Best Practices**: Use role-based locators (`getByRole`, `getByLabel`), web-first assertions, avoid hardcoded timeouts.
- **Test Quality**: Descriptive test names, DRY principles, proper fixtures, and focus on critical user paths.

#### Front-End Testing Coverage
- **Component Testing**: Individual component functionality and state management.
- **Integration Testing**: Component interaction and data flow validation.
- **Visual Regression**: Screenshot comparison for visual consistency.
- **Accessibility**: WCAG compliance validation for all interactive elements.