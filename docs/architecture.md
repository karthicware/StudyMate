## 🏗️ StudyMate System Architecture Blueprint

### 1. Technology Stack & Environment

| Layer | Technology | Version / Stack | Reasoning |
| :--- | :--- | :--- | :--- |
| **Front-End (FE)** | **Angular 20** | TypeScript, NgRx (State Mgmt) | Robust framework for complex, data-heavy applications. |
| **FE Styling** | **Shadcn/Tailwind CSS** | Utility-first CSS | Highly performant and adheres to the specified UX design system. |
| **Back-End (BE)** | **Spring Boot 3.5.6** | Java 17 | Enterprise-grade stability and performance for transactional logic. |
| **Database (DB)** | **MySQL** | Relational Database | Strong consistency for seat booking and reliability for payment records. |
| **Infrastructure** | **To Be Decided (TBD)** | AWS or GCP | Cloud-native deployment required for scalability. |

***

### 2. High-Level System Architecture

The system utilizes a **3-Tier Architecture** with services decomposed by domain, accessible via a single API Gateway.

**Conceptual Flow:** Clients $\rightarrow$ API Gateway $\rightarrow$ Spring Boot Services $\rightarrow$ MySQL DB

| Core Spring Boot Service | Primary Responsibilities | Technical Note |
| :--- | :--- | :--- |
| **User & Auth Service** | Handling User Accounts, Login/Logout, Staff Access Control. | Utilizes **JWT/OAuth 2.0**. |
| **Booking Service** | **Real-time Seat State** management, Seat Locking, Check-in/Check-out. | **Must be highly consistent** (ACID). **WebSockets** or polling required for real-time FE updates. |
| **Payment & Subscription Service** | Integration with **Razorpay/Stripe**, Managing Subscription Plans, Auto-reminders. | Adherence to **PCI compliance** is mandatory. |
| **Reporting & Analytics** | Data aggregation, generating PDF/Excel reports, calculating utilization rates. | Can run on a **Read-Replica** for performance isolation. |

***

### 3. Core Data Model (MySQL Schema)

| Table Name | Key Fields | Relationship Note | Criticality |
| :--- | :--- | :--- | :--- |
| **`users`** | `id` (PK), `email` (UNIQUE), `role`, `hall_id` (FK) | Links all users to their role and hall. | High |
| **`study_halls`** | `id` (PK), `owner_id` (FK), `hall_name`, `seat_count` | The root entity for the business owner. | High |
| **`seats`** | `id` (PK), `hall_id` (FK), `seat_number`, `x_coord`, `y_coord`, `status` | Defines reservable units and their map coordinates. | High |
| **`bookings`** | `id` (PK), `user_id` (FK), `seat_id` (FK), `start_time`, `end_time`, `payment_id` (FK), `check_in_time` | The core transactional ledger for all reservations and attendance. | Critical |

***

### 4. Key REST API Endpoints

| Method | Endpoint | Service | Purpose |
| :--- | :--- | :--- | :--- |
| **GET** | `/booking/seats/{hallId}` | Booking | Retrieves **real-time seat status** for the map view. |
| **POST** | `/booking/seats/lock` | Booking | **Locks a specific seat** for a user during the payment window. |
| **POST** | `/payment/initiate` | Payment | Generates the secure payment session/link. |
| **POST** | `/payment/webhook` | Payment | Receives external confirmation and sets booking to `CONFIRMED`. |
| **GET** | `/owner/dashboard/{hallId}` | Owner | Retrieves all summary metrics for the Admin UI. |
| **GET** | `/owner/reports/{hallId}` | Owner | Generates and serves the performance report file (PDF/Excel). |