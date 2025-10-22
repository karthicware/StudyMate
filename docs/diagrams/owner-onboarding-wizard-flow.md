# Owner Onboarding Wizard Flow - Visual Documentation

**Epic:** Epic 0.1 - Authentication & Onboarding
**Features:** 0.1.6, 0.1.7, 0.1.8
**Created:** 2025-10-19

---

## Implementation Status

**Last Updated**: 2025-10-21
**Status**: 🔄 Partial Implementation (Component Ready, Integration In Progress)

- ✅ Wizard UI Component (OwnerOnboardingWizardComponent) - Complete
- ✅ Backend API Integration (HallManagementService) - Complete
- 🔄 Onboarding Guard & Routing (Task 14) - In Progress
- 🔄 Dashboard Empty State CTA (Task 7) - In Progress
- 🔄 Multi-Hall Support UI (Task 8) - In Progress
- 🔄 E2E Test Coverage (Task 12) - In Progress

**Diagrams Below**: Represent final intended behavior (not all flows active yet)

---

## Complete Onboarding Flow

```mermaid
flowchart TD
    Start([Owner First Login]) --> CheckOnboarding{Onboarding<br/>Completed?}

    CheckOnboarding -->|No| ShowWizard[Display Onboarding Wizard<br/>Step 1 of 3: Hall Setup]
    CheckOnboarding -->|Yes| Dashboard[Owner Dashboard]

    ShowWizard --> Step1[Step 1: Hall Setup Form]

    Step1 --> FillForm[Owner fills:<br/>- Hall Name*<br/>- Description<br/>- Address*<br/>- City*<br/>- State*<br/>- Postal Code<br/>- Country*]

    FillForm --> SkipCheck1{Skip or<br/>Create?}

    SkipCheck1 -->|Skip| ConfirmSkip1{Confirm Skip?}
    ConfirmSkip1 -->|Yes| EmptyDashboard[Dashboard with<br/>Empty State]
    ConfirmSkip1 -->|No| Step1

    SkipCheck1 -->|Create Hall| ValidateForm1{Form<br/>Valid?}

    ValidateForm1 -->|No| ShowErrors1[Display Validation Errors]
    ShowErrors1 --> Step1

    ValidateForm1 -->|Yes| CallAPI1[POST /owner/halls]

    CallAPI1 --> APICheck1{API<br/>Success?}

    APICheck1 -->|Error 400| ShowValidationError1[Show Backend<br/>Validation Error]
    ShowValidationError1 --> Step1

    APICheck1 -->|Error 409| ShowDuplicateError[Show: Hall name<br/>already exists]
    ShowDuplicateError --> Step1

    APICheck1 -->|201 Created| StoreHallID[Store Hall ID<br/>status=DRAFT]

    StoreHallID --> ShowSuccess1[Show Success Message:<br/>Hall created successfully!]

    ShowSuccess1 --> Step2[Step 2: Pricing Configuration]

    Step2 --> FillPricing[Owner sets:<br/>- Base Pricing ₹/hour<br/>Default: ₹100<br/>Range: ₹50 - ₹5000]

    FillPricing --> SkipCheck2{Skip or<br/>Continue?}

    SkipCheck2 -->|Skip| ConfirmSkip2{Confirm Skip?}
    ConfirmSkip2 -->|Yes| DashboardDraft[Dashboard<br/>Hall Status: DRAFT]
    ConfirmSkip2 -->|No| Step2

    SkipCheck2 -->|Continue| ValidatePricing{Pricing<br/>Valid?}

    ValidatePricing -->|No| ShowPricingError[Show: Pricing must be<br/>between ₹50 - ₹5000]
    ShowPricingError --> Step2

    ValidatePricing -->|Yes| CallAPI2["PUT /owner/halls/:hallId/pricing"]

    CallAPI2 --> APICheck2{API<br/>Success?}

    APICheck2 -->|Error 400| ShowValidationError2[Show Backend<br/>Validation Error]
    ShowValidationError2 --> Step2

    APICheck2 -->|200 OK| ShowSuccess2[Show Success Message:<br/>Pricing updated!]

    ShowSuccess2 --> Step3[Step 3: Location Configuration]

    Step3 --> LoadMap[Load Google Maps<br/>Map Picker UI]

    LoadMap --> SelectLocation[Owner selects:<br/>- Location via Map Click<br/>- Auto-populate Lat/Long<br/>- Select Region Dropdown]

    SelectLocation --> SkipCheck3{Skip or<br/>Complete?}

    SkipCheck3 -->|Skip| ConfirmSkip3{Confirm Skip?}
    ConfirmSkip3 -->|Yes| DashboardDraft
    ConfirmSkip3 -->|No| Step3

    SkipCheck3 -->|Complete Setup| ValidateLocation{Location<br/>Valid?}

    ValidateLocation -->|No| ShowLocationError[Show: Location and<br/>Region required]
    ShowLocationError --> Step3

    ValidateLocation -->|Yes| CallAPI3["PUT /owner/halls/:hallId/location"]

    CallAPI3 --> APICheck3{API<br/>Success?}

    APICheck3 -->|Error 400| ShowValidationError3[Show Backend<br/>Validation Error]
    ShowValidationError3 --> Step3

    APICheck3 -->|200 OK| UpdateStatus[Backend Updates:<br/>status = ACTIVE]

    UpdateStatus --> ShowSuccess3[Show Success Message:<br/>Hall activated!<br/>Welcome to StudyMate]

    ShowSuccess3 --> DashboardActive[Owner Dashboard<br/>Hall Status: ACTIVE<br/>All Features Enabled]

    EmptyDashboard --> CTAButton[Create Your First Hall<br/>CTA Button]
    CTAButton --> ShowWizard

    DashboardActive --> HallSelector[Hall Selector Dropdown]
    DashboardActive --> ConfigureSeats[Configure Seat Map<br/>Story 1.4]
    DashboardActive --> ManageSettings[Manage Settings<br/>Story 1.20]
    DashboardActive --> ConfigureAmenities[Configure Amenities<br/>Story 1.22]

    HallSelector --> AddNewHall[Add New Hall Button]
    AddNewHall --> Step1

    style Start fill:#e1f5e1
    style Dashboard fill:#e3f2fd
    style EmptyDashboard fill:#fff3e0
    style DashboardDraft fill:#fff9c4
    style DashboardActive fill:#c8e6c9
    style CallAPI1 fill:#bbdefb
    style CallAPI2 fill:#bbdefb
    style CallAPI3 fill:#bbdefb
    style UpdateStatus fill:#a5d6a7
    style ShowSuccess1 fill:#c8e6c9
    style ShowSuccess2 fill:#c8e6c9
    style ShowSuccess3 fill:#81c784
    style ShowErrors1 fill:#ffcdd2
    style ShowValidationError1 fill:#ffcdd2
    style ShowPricingError fill:#ffcdd2
    style ShowValidationError2 fill:#ffcdd2
    style ShowLocationError fill:#ffcdd2
    style ShowValidationError3 fill:#ffcdd2
    style ShowDuplicateError fill:#ffcdd2
```

---

## Wizard Step Details

### Step 1: Hall Setup (Story 0.1.6)

**Purpose:** Create study hall with basic information

**Form Fields:**
- Hall Name* (required, max 255 chars)
- Description (optional, max 1000 chars)
- Address* (required, max 500 chars)
- City* (required, max 100 chars)
- State/Province* (required, max 100 chars)
- Postal Code (optional, max 20 chars)
- Country* (required, dropdown)

**Actions:**
- **Create Hall:** POST /owner/halls → Advances to Step 2
- **Skip for now:** Redirect to dashboard with empty state

**Backend:**
- Creates hall with status=DRAFT
- Validates hall name uniqueness per owner
- Returns hall ID for subsequent steps

---

### Step 2: Pricing Configuration (Story 0.1.7)

**Purpose:** Set base hourly pricing for the hall

**Form Fields:**
- Base Pricing ₹/hour (default: ₹100, range: ₹50 - ₹5000)

**Actions:**
- **Continue:** PUT /owner/halls/{hallId}/pricing → Advances to Step 3
- **Skip for now:** Redirect to dashboard (hall remains DRAFT)

**Backend:**
- Updates base_pricing column
- Validates pricing range (₹50 - ₹5000)
- Hall status remains DRAFT

---

### Step 3: Location Configuration (Story 0.1.8)

**Purpose:** Set hall location and activate for student discovery

**Form Fields:**
- Google Maps Map Picker (click to select location)
- Latitude (auto-populated, readonly)
- Longitude (auto-populated, readonly)
- Region Dropdown (North Zone, South Zone, East Zone, West Zone, Central)

**Actions:**
- **Complete Setup:** PUT /owner/halls/{hallId}/location → Activates hall, redirects to dashboard
- **Skip for now:** Redirect to dashboard (hall remains DRAFT)

**Backend:**
- Updates latitude, longitude, region columns
- **Changes hall status from DRAFT to ACTIVE**
- Makes hall discoverable to students

---

## User Journey Map

```mermaid
journey
    title Owner Onboarding Journey
    section Registration
      Sign up as Owner: 5: Owner
      Verify email: 4: Owner
      First login: 5: Owner
    section Step 1: Hall Setup
      View onboarding wizard: 5: Owner
      Fill hall information: 4: Owner
      Submit hall creation: 5: Owner
      See success message: 5: Owner
    section Step 2: Pricing
      View pricing form: 5: Owner
      Enter base pricing: 4: Owner
      Submit pricing: 5: Owner
      See success message: 5: Owner
    section Step 3: Location
      View Google Maps: 5: Owner
      Select hall location: 4: Owner
      Select region: 4: Owner
      Complete setup: 5: Owner
      Hall activated: 5: Owner
    section Post-Onboarding
      View dashboard: 5: Owner
      Configure seat map: 5: Owner
      Manage settings: 5: Owner
```

---

## API Sequence Diagram

```mermaid
sequenceDiagram
    participant O as Owner (Frontend)
    participant API as Backend API
    participant DB as PostgreSQL Database

    Note over O,DB: Step 1: Hall Setup

    O->>API: POST /owner/halls<br/>(hallName, address, city, ...)
    API->>API: Extract ownerId from JWT
    API->>DB: Check UNIQUE(owner_id, hall_name)
    alt Hall name exists
        DB-->>API: Constraint violation
        API-->>O: 409 Conflict<br/>"Hall name already exists"
    else Hall name unique
        DB-->>API: OK
        API->>DB: INSERT INTO study_halls<br/>(status=DRAFT, ...)
        DB-->>API: Hall created (UUID)
        API-->>O: 201 Created<br/>(hallId, status=DRAFT)
        O->>O: Store hallId in session
        O->>O: Advance to Step 2
    end

    Note over O,DB: Step 2: Pricing Configuration

    O->>API: PUT /owner/halls/:hallId/pricing<br/>(basePricing: 150)
    API->>API: Validate ownerId from JWT
    API->>DB: SELECT * FROM study_halls<br/>WHERE id=hallId AND owner_id=ownerId
    alt Not owner
        DB-->>API: No rows
        API-->>O: 403 Forbidden
    else Owner verified
        DB-->>API: Hall found
        API->>DB: UPDATE study_halls<br/>SET base_pricing=150<br/>WHERE id=hallId
        DB-->>API: Updated
        API-->>O: 200 OK<br/>(hallId, basePricing: 150)
        O->>O: Advance to Step 3
    end

    Note over O,DB: Step 3: Location Configuration

    O->>API: PUT /owner/halls/:hallId/location<br/>(latitude, longitude, region)
    API->>API: Validate ownerId from JWT
    API->>DB: SELECT * FROM study_halls<br/>WHERE id=hallId AND owner_id=ownerId
    alt Not owner
        DB-->>API: No rows
        API-->>O: 403 Forbidden
    else Owner verified
        DB-->>API: Hall found (status=DRAFT)
        API->>DB: UPDATE study_halls<br/>SET latitude=..., longitude=..., region=...,<br/>status=ACTIVE<br/>WHERE id=hallId
        DB-->>API: Updated (status=ACTIVE)
        API-->>O: 200 OK<br/>(hallId, status=ACTIVE)
        O->>O: Redirect to Dashboard<br/>Show: "Hall activated!"
    end

    Note over O,DB: Post-Onboarding: Hall Selector

    O->>API: GET /owner/halls
    API->>API: Extract ownerId from JWT
    API->>DB: SELECT * FROM study_halls<br/>WHERE owner_id=ownerId<br/>ORDER BY created_at DESC
    DB-->>API: List of halls
    API-->>O: 200 OK<br/>(halls: [array of halls])
    O->>O: Populate hall selector dropdown
```

---

## State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> No_Hall : Owner First Login

    No_Hall --> Wizard_Step1 : Start Onboarding
    No_Hall --> Empty_Dashboard : Skip Onboarding

    Wizard_Step1 --> Hall_DRAFT : Create Hall<br/>(POST /owner/halls)
    Wizard_Step1 --> Empty_Dashboard : Skip

    Hall_DRAFT --> Wizard_Step2 : Proceed to Pricing

    Wizard_Step2 --> Hall_DRAFT_Priced : Update Pricing<br/>(PUT /pricing)
    Wizard_Step2 --> Dashboard_DRAFT : Skip

    Hall_DRAFT_Priced --> Wizard_Step3 : Proceed to Location

    Wizard_Step3 --> Hall_ACTIVE : Set Location<br/>(PUT /location)<br/>status=ACTIVE
    Wizard_Step3 --> Dashboard_DRAFT : Skip

    Hall_ACTIVE --> Dashboard_Active : Complete!
    Dashboard_DRAFT --> Dashboard_Active : Resume & Complete Later

    Empty_Dashboard --> Wizard_Step1 : Click "Create First Hall"
    Dashboard_Active --> Wizard_Step1 : Click "Add New Hall"

    Dashboard_Active --> [*] : Ready for Operations

    note right of Hall_DRAFT
        Status: DRAFT
        Hall created but inactive
        Not discoverable to students
    end note

    note right of Hall_DRAFT_Priced
        Status: DRAFT
        Pricing configured
        Still not discoverable
    end note

    note right of Hall_ACTIVE
        Status: ACTIVE
        Fully configured
        Discoverable to students
        All features enabled
    end note
```

---

## Error Handling Flow

```mermaid
flowchart TD
    APICall[API Call] --> CheckHTTP{HTTP<br/>Status}

    CheckHTTP -->|200/201| Success[Display Success<br/>Message]
    Success --> NextStep[Proceed to<br/>Next Step]

    CheckHTTP -->|400| Validation[Validation Error]
    Validation --> ParseErrors[Parse Field Errors<br/>from Response]
    ParseErrors --> DisplayFieldErrors[Display Field-Specific<br/>Error Messages]
    DisplayFieldErrors --> RetryForm[User Fixes Form]

    CheckHTTP -->|401| Unauthorized[Unauthorized]
    Unauthorized --> CheckToken{JWT Token<br/>Valid?}
    CheckToken -->|Expired| RedirectLogin[Redirect to Login]
    CheckToken -->|Missing| RedirectLogin

    CheckHTTP -->|403| Forbidden[Forbidden]
    Forbidden --> ShowForbidden[Show Error Toast:<br/>Not authorized for this hall]
    ShowForbidden --> RetryForm

    CheckHTTP -->|409| Conflict[Conflict]
    Conflict --> CheckConflictType{Conflict<br/>Type}
    CheckConflictType -->|Duplicate Name| ShowDuplicate[Show Error:<br/>Hall name already exists]
    ShowDuplicate --> RetryForm

    CheckHTTP -->|500| ServerError[Server Error]
    ServerError --> ShowGeneric[Show Error Toast:<br/>Something went wrong.<br/>Please try again.]
    ShowGeneric --> RetryForm

    CheckHTTP -->|Network Error| NetworkError[Network Error]
    NetworkError --> ShowNetwork[Show Error:<br/>Network error.<br/>Check connection.]
    ShowNetwork --> RetryForm

    RetryForm --> APICall

    style Success fill:#c8e6c9
    style DisplayFieldErrors fill:#ffcdd2
    style RedirectLogin fill:#ffecb3
    style ShowForbidden fill:#ffcdd2
    style ShowDuplicate fill:#ffcdd2
    style ShowGeneric fill:#ffcdd2
    style ShowNetwork fill:#ffcdd2
```

---

## Multi-Hall Management Flow

```mermaid
flowchart TD
    Dashboard[Owner Dashboard] --> HallSelector{Hall<br/>Selector}

    HallSelector --> SelectExisting[Select Existing Hall]
    HallSelector --> AddNew[Click Add New Hall]

    SelectExisting --> LoadHallData[Load Hall Data:<br/>- Seat Configuration<br/>- Settings<br/>- Amenities]
    LoadHallData --> HallFeatures[Hall-Specific Features<br/>Available]

    AddNew --> OpenForm[Open Hall Creation Form<br/>Same as Onboarding Step 1]
    OpenForm --> CreateNewHall[POST /owner/halls]
    CreateNewHall --> NewHallCreated{Success?}

    NewHallCreated -->|Yes| AddToSelector[Add to Hall Selector<br/>Dropdown]
    NewHallCreated -->|No| ShowError[Show Error]
    ShowError --> OpenForm

    AddToSelector --> SwitchHall[Switch to New Hall]
    SwitchHall --> ConfigureNew[Configure New Hall:<br/>- Pricing<br/>- Location<br/>- Seats]

    HallFeatures --> SeatMap[Configure Seat Map<br/>Story 1.4]
    HallFeatures --> Settings[Manage Settings<br/>Story 1.20]
    HallFeatures --> Amenities[Configure Amenities<br/>Story 1.22]
    HallFeatures --> Maintenance[Seat Maintenance<br/>Story 1.23]

    ConfigureNew --> HallFeatures

    style Dashboard fill:#e3f2fd
    style AddToSelector fill:#c8e6c9
    style HallFeatures fill:#c8e6c9
    style ShowError fill:#ffcdd2
```

---

## Component Hierarchy

```mermaid
graph TD
    App[App Component] --> OwnerRoutes[Owner Routes<br/>with OnboardingGuard]

    OwnerRoutes --> Dashboard[Owner Dashboard Component]
    OwnerRoutes --> Wizard[Owner Onboarding Wizard Component]

    Wizard --> Step1[Hall Setup Step Component]
    Wizard --> Step2[Pricing Step Component]
    Wizard --> Step3[Location Step Component]

    Step1 --> HallForm[Hall Creation Form<br/>Reactive Forms]
    Step1 --> SkipDialog1[Skip Confirmation Dialog]

    Step2 --> PricingInput[Pricing Input Field]
    Step2 --> SkipDialog2[Skip Confirmation Dialog]

    Step3 --> MapPicker[Google Maps Component]
    Step3 --> RegionDropdown[Region Dropdown]
    Step3 --> LatLongFields[Lat/Long Fields<br/>readonly]

    Dashboard --> EmptyState[Empty State Component<br/>No Halls]
    Dashboard --> HallSelector[Hall Selector Dropdown]
    Dashboard --> HallFeatures[Hall Features Area]

    HallSelector --> AddNewButton[Add New Hall Button]
    AddNewButton --> Wizard

    EmptyState --> CTAButton[Create First Hall CTA]
    CTAButton --> Wizard

    HallFeatures --> SeatMapConfig[Seat Map Configuration<br/>Story 1.4]
    HallFeatures --> OwnerSettings[Owner Settings<br/>Story 1.20]

    Step1 -.Service.-> HallService[HallManagementService]
    Step2 -.Service.-> HallService
    Step3 -.Service.-> HallService
    HallSelector -.Service.-> HallService

    HallService -.API.-> BackendAPI[Backend REST API]

    style Wizard fill:#bbdefb
    style Step1 fill:#c5cae9
    style Step2 fill:#c5cae9
    style Step3 fill:#c5cae9
    style HallService fill:#ffe082
    style BackendAPI fill:#a5d6a7
```

---

## Database Schema Visualization

```mermaid
erDiagram
    USERS ||--o{ STUDY_HALLS : owns
    STUDY_HALLS ||--o{ SEATS : contains

    USERS {
        UUID id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR role
        BOOLEAN email_verified
        TIMESTAMP created_at
    }

    STUDY_HALLS {
        UUID id PK
        UUID owner_id FK
        VARCHAR hall_name
        TEXT description
        TEXT address
        VARCHAR city
        VARCHAR state
        VARCHAR postal_code
        VARCHAR country
        VARCHAR status "DRAFT|ACTIVE|INACTIVE"
        DECIMAL base_pricing "₹50-5000"
        DECIMAL latitude "Set in Step 3"
        DECIMAL longitude "Set in Step 3"
        VARCHAR region "Set in Step 3"
        INT seat_count "Updated by Seat Config"
        JSONB opening_hours
        JSONB amenities
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    SEATS {
        UUID id PK
        UUID hall_id FK
        VARCHAR seat_number
        INT x_coord
        INT y_coord
        VARCHAR status
        VARCHAR space_type
        DECIMAL custom_price
        TIMESTAMP created_at
    }
```

---

## Implementation Timeline (3 Sprints)

```mermaid
gantt
    title Owner Onboarding Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Sprint 1 (Foundation)
    Story 0.1.6-backend (5 SP)       :done, backend1, 2025-10-21, 9d
    Story 0.1.6 (8 SP)                :done, frontend1, 2025-10-25, 10d
    section Sprint 2 (Pricing)
    Story 0.1.7-backend (2 SP)       :active, backend2, 2025-11-04, 4d
    Story 0.1.7 (3 SP)                :active, frontend2, 2025-11-04, 5d
    section Sprint 3 (Location)
    Google Maps API Key Procurement  :crit, gmaps, 2025-11-08, 1d
    Story 0.1.8-backend (3 SP)       :backend3, 2025-11-11, 6d
    Story 0.1.8 (5 SP)                :frontend3, 2025-11-11, 8d
    section Milestones
    Hall Creation Functional         :milestone, m1, 2025-11-04, 0d
    Pricing Configuration Functional :milestone, m2, 2025-11-11, 0d
    Complete Onboarding Flow         :milestone, m3, 2025-11-25, 0d
```

---

## Key Takeaways

### For Developers

1. **Backend First:** Always implement backend stories before corresponding frontend stories
2. **Data-Testid Mandatory:** Add data-testid attributes during component development (NOT during E2E testing)
3. **Real Authentication:** E2E tests MUST use real auth (loginAsOwnerAPI helper, NO mocks)
4. **Status Transitions:** Hall status changes DRAFT → ACTIVE automatically in Story 0.1.8-backend
5. **Multi-Hall Support:** Hall selector dropdown and "Add New Hall" button from Story 0.1.6

### For Product Owner

1. **Google Maps API:** Obtain API key BEFORE Sprint 3 starts (critical dependency)
2. **Sprint Dependencies:** Stories must be implemented sequentially (0.1.6 → 0.1.7 → 0.1.8)
3. **Testing Requirements:** 90%+ unit test coverage, 100% E2E pass rate (non-negotiable)
4. **Unblocks Features:** Completes onboarding, enables Story 1.4 and all hall-dependent features

### For QA

1. **Validation Report:** See `docs/qa/story-validation-report-onboarding-stories.md`
2. **Test Approach:** Unit + E2E + Integration + PostgreSQL MCP validation
3. **Anti-Patterns:** Review `docs/lessons-learned/e2e-testing-anti-patterns-*` before testing
4. **Definition of Done:** 14 pre-commit validation commands must return ZERO violations

---

**Diagram Created By:** Sarah (Product Owner)
**Date:** 2025-10-19
**Version:** 1.0
