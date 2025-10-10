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

### 2. Design System Foundation (Visual Guide)

The design adheres to the **60-30-10 Rule** and the chosen technology stack (Angular/Shadcn/Tailwind).

| Category | StudyMate Implementation | Role & Application |
| :--- | :--- | :--- |
| **10% Accent (Primary)** | **`#007BFF` (Study Blue)** | **Call-to-Action (CTA) Buttons**, Active Navigation Items, Links. |
| **30% Secondary** | **Semantic Status Colors** | **Green** (`#28A745`) for **Available** / Success. **Red** (`#DC3545`) for **Occupied** / Danger. **Yellow** (`#FFC107`) for **Locked** / Warning. |
| **60% Dominant (Neutrals)** | **Base Gray Palette** | **Backgrounds** (Pages, Modals), **Text** (Body, Headings), **Borders**. |
| **Typography** | **Header:** Montserrat (Bold). **Body:** Roboto (Regular). | Ensures legibility and a modern aesthetic. |

---

### 3. Advanced Depth & Interaction Rules

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