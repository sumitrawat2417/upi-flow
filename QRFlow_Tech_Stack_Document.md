# QRFlow — Technology Stack Document

## 1. Document Purpose

This document defines the technology stack for **QRFlow**, a mobile-first merchant utility for generating and managing multiple UPI payment QR codes from a merchant's payment details.

The stack is intentionally lightweight.

QRFlow is designed to work primarily on the user's device, with local persistence and offline capability. A backend is **not required for the initial version**.

---

# 2. Product Architecture at a Glance

```text
                         QRFlow PWA
                            │
                ┌───────────┴───────────┐
                │                       │
             React UI               Core Logic
                │                       │
      ┌─────────┼─────────┐      ┌──────┼──────────────┐
      │         │         │      │      │              │
   Sessions   History   Profiles  UPI   Split Engine   QR
                                   │
                                   ▼
                              Validation
                                   │
                                   ▼
                              QR Generator
                │
                ▼
           Dexie / IndexedDB
                │
                ▼
         Browser Local Storage

                       +
                 PWA / Service Worker
                       │
                       ▼
              Installable + Offline App
```

---

# 3. Core Technology Stack

## 3.1 Frontend Framework — React

**Technology:** React

### Role

React is responsible for the application's user interface and UI state.

It will be used for:

- Merchant setup screens
- Amount entry
- Split configuration
- Payment sessions
- QR display
- Payment confirmation states
- Payment history
- Settings
- Import/export screens
- Error and empty states
- Reusable UI components

### Why React?

QRFlow contains several interconnected UI states:

```text
Payment Session
    ↓
QR 1 → Received
    ↓
QR 2 → Received
    ↓
QR 3 → Received
    ↓
Session Complete
```

React is well suited for managing these state-driven interfaces.

---

# 4. Language — TypeScript

**Technology:** TypeScript

### Role

TypeScript will be used throughout the React application.

### Why TypeScript?

QRFlow has several structured data objects that must remain consistent:

```text
MerchantProfile
PaymentSession
Payment
QRCodeRecord
SplitConfiguration
AppSettings
```

There are also explicit states such as:

```text
pending
active
received
cancelled
completed
```

TypeScript helps prevent invalid data and state combinations while the project becomes larger.

### Decision

Use TypeScript from the beginning rather than converting a JavaScript project later.

---

# 5. Build Tool — Vite

**Technology:** Vite

### Role

Vite will handle:

- Local development server
- Development builds
- Production builds
- Asset processing
- React integration
- Fast development feedback

### Why Vite?

QRFlow does not need a large build system.

Vite provides a simple and fast setup that fits a client-side React application and works well with PWA tooling.

---

# 6. Local Database — IndexedDB

**Technology:** IndexedDB

### Role

IndexedDB will be the primary persistent data store inside the browser.

It will store data such as:

```text
Merchant profiles
Payment sessions
Individual payments
QR records
Application settings
Local history
```

### Why IndexedDB?

QRFlow is designed to be:

- Local-first
- Offline-capable
- Installable
- Usable without an account
- Independent of a remote database for its core functions

IndexedDB allows the application to retain structured data even after the browser or installed PWA is closed.

---

# 7. IndexedDB Wrapper — Dexie.js

**Technology:** Dexie.js

### Role

Dexie will provide a cleaner interface for working with IndexedDB.

It will be used for:

- Creating and opening the local database
- Defining tables
- Reading records
- Updating records
- Querying history
- Deleting records
- Managing database versions/migrations

### Why Dexie?

Raw IndexedDB APIs are verbose and cumbersome for normal application development.

Dexie keeps the local database logic easier to read and maintain while still using IndexedDB underneath.

### Example logical tables

```text
merchantProfiles
paymentSessions
payments
settings
```

---

# 8. Progressive Web App — PWA

**Technology:** Progressive Web App

### Supporting tool

`vite-plugin-pwa`

### Role

The PWA layer will provide:

- Installability
- Home-screen application experience
- Service worker
- Offline application shell
- Cached application assets
- Faster repeat launches

### Intended experience

```text
Open QRFlow website
        ↓
Install QRFlow
        ↓
QRFlow appears on device home screen
        ↓
Open without internet
        ↓
Use local features normally
```

### Important distinction

The **QRFlow application can work offline**.

The **customer's UPI payment still depends on the normal UPI/payment infrastructure and the customer's payment application/network availability**.

The PWA does not make UPI itself offline.

---

# 9. QR Scanning

**Technology:** Browser camera access + QR scanning library

### Role

QRFlow needs to accept a merchant's existing QR/payment information.

Possible input methods:

```text
Scan QR
Upload QR image
Paste UPI URL
```

### Scanner strategy

Use the browser's camera capabilities where supported, with a QR scanning library as a compatibility fallback.

The scanner's job is only to obtain the QR payload.

The application should then pass that payload into the UPI parsing and validation layer.

```text
Camera / Image
      ↓
QR Decoder
      ↓
Raw Payload
      ↓
UPI Parser
```

---

# 10. UPI URI Parsing and Generation

**Technology:** Custom application logic

### Role

This is one of the main technical components of QRFlow.

The application will:

1. Accept a decoded UPI payment payload.
2. Determine whether it is a supported UPI payment URI.
3. Parse the available payment fields.
4. Validate the merchant/payee information.
5. Create payment-session records.
6. Generate payment-specific UPI requests with the required amount and reference information.
7. Convert those requests into QR codes.

### Conceptual flow

```text
Merchant QR / UPI URL
          ↓
      Decode
          ↓
      Parse URI
          ↓
       Validate
          ↓
Extract merchant details
          ↓
Create payment session
          ↓
Generate payment QR data
```

### Important implementation principle

Do not treat a UPI URI as an arbitrary text string and blindly replace values.

The application should parse parameters, validate the result, and then construct a valid supported payment URI.

---

# 11. Payment Split Engine

**Technology:** Custom TypeScript logic

### Role

The split engine converts a total amount into one or more payment amounts according to the merchant's selected strategy.

Examples:

```text
₹3,000
→ ₹2,000 + ₹1,000
```

```text
₹5,500
→ ₹2,000 + ₹2,000 + ₹1,500
```

```text
₹4,000
→ ₹1,500 + ₹1,500 + ₹1,000
```

### Possible split modes

```text
Maximum allowed amount
Equal split
Custom split
Merchant-defined preset
```

### Required validation

The engine should verify:

```text
Sum of split amounts = original amount
```

and should reject invalid configurations.

The maximum amount should be configurable rather than permanently hard-coded.

---

# 12. QR Code Generation

**Technology:** QR generation library

### Role

The QR generator converts the generated UPI payment URI into a QR code displayed on the screen.

It should support:

- Dynamic QR generation
- High-resolution rendering
- Mobile display
- Download/export
- Reliable scanning
- Optional branded presentation

### Flow

```text
Generated UPI URI
       ↓
QR Generator
       ↓
QR Image / Canvas
       ↓
Display to Merchant
```

---

# 13. Validation — Zod

**Technology:** Zod

### Role

Zod will validate structured application data.

Examples:

- Merchant profile data
- Imported data
- Payment session data
- Split configuration
- Settings
- Backup files

### Why?

QRFlow stores structured local data and accepts user-provided/imported input.

Validation provides a clear boundary between:

```text
Untrusted input
      ↓
Validation
      ↓
Application data
```

This is especially useful for imported backup files and parsed payment information.

---

# 14. Local Payment History

**Storage:** IndexedDB through Dexie

### Role

QRFlow will keep local payment-session history.

Example:

```text
Today

₹5,500    Completed
₹3,000    Completed
₹7,250    Incomplete
```

Opening a session can show:

```text
Session #A81F

QR-A72K   ₹2,000   Received
QR-B19P   ₹2,000   Received
QR-C43M   ₹1,500   Received

Total:    ₹5,500
Status:   Completed
```

### Important semantic distinction

This history records the merchant's actions and confirmations.

It should not claim that QRFlow independently verified a bank transaction unless a future payment-verification integration actually provides such verification.

---

# 15. Payment Session State

The application will treat a multi-QR collection as a **Payment Session**.

Conceptually:

```text
Payment Session
├── Session ID
├── Total Amount
├── Split Strategy
├── Created At
├── Status
└── Payments
      ├── QR ID
      ├── Amount
      ├── UPI URI
      ├── Status
      └── Confirmed At
```

### Example state flow

```text
Created
   ↓
Active
   ↓
QR displayed
   ↓
Merchant confirms received
   ↓
Payment marked received
   ↓
Next QR displayed
   ↓
All received
   ↓
Completed
```

---

# 16. QR IDs and References

Each generated payment QR should receive a short unique identifier.

Example:

```text
QR-A72K
QR-B19P
QR-C43M
```

The identifier can be included in supported UPI reference/note fields where appropriate.

### Purpose

The identifier helps the merchant match:

```text
Generated QR
      ↕
Incoming payment information
```

It also makes the payment session understandable inside QRFlow.

The application should use an appropriate merchant transaction reference field where supported and treat the human-readable note as an additional convenience rather than the sole reconciliation mechanism.

---

# 17. UI and Styling

**Primary choice:** Tailwind CSS

### Role

Used for:

- Layout
- Responsive design
- Spacing
- Typography
- Component styling
- State styling
- Responsive mobile-first layouts

### Design priority

QRFlow is primarily a **mobile merchant tool**.

The interface should therefore prioritize:

```text
Speed
Clarity
Large touch targets
Readable amounts
Minimal steps
Strong visual state changes
```

The most frequently used action should always be obvious.

---

# 18. Icons

**Technology:** Lucide React

### Role

Used for interface icons such as:

```text
Scan
Share
Download
History
Settings
Check
Back
Delete
Edit
```

Lucide provides a consistent icon style without requiring custom icon assets for basic UI actions.

---

# 19. Testing

**Technologies:**

- Vitest
- React Testing Library

### What should be tested?

#### Split logic

```text
₹3,000
→ ₹2,000 + ₹1,000
```

#### Amount validation

```text
Invalid split
→ rejected
```

#### Session state

```text
pending → received → completed
```

#### Persistence

```text
Create session
→ close app
→ reopen
→ session still exists
```

#### UPI parsing

Valid and invalid payment URIs should produce predictable results.

#### UI behavior

Important interactions such as:

```text
Mark Received
Next QR
Continue Session
Delete History
Import Data
```

should be tested.

---

# 20. Data Backup and Recovery

Because QRFlow is local-first, it should provide a manual data export/import mechanism.

### Export

```text
IndexedDB
   ↓
Validated application data
   ↓
JSON backup file
```

### Import

```text
Backup file
   ↓
Parse
   ↓
Validate
   ↓
Restore local data
```

This protects the merchant from losing important local history when changing devices or resetting browser data.

---

# 21. Security Approach

The first version does not need a server-side security architecture.

However, security still matters.

The application should:

- Validate imported data.
- Validate UPI payment information before generating new requests.
- Never silently change the merchant/payee identity.
- Clearly show the payment destination before confirmation.
- Avoid storing unnecessary personal information.
- Keep local data isolated to the merchant's browser/device.
- Avoid claiming a payment is successful without reliable verification.
- Treat QR/UPI input as untrusted input.

---

# 22. Backend Decision

## Version 1: No Backend

The initial application does not require:

```text
Node.js server
Express
PostgreSQL
MongoDB
Firebase
Supabase
Redis
Authentication server
Cloud database
```

### Reason

The core application can perform its main functions locally:

```text
Merchant setup
Amount entry
Amount splitting
UPI parsing
QR generation
Payment sessions
Manual confirmation
Local history
Offline operation
```

Adding a backend would increase complexity without providing an essential benefit for the initial product.

---

# 23. What the Browser Handles

```text
Browser / PWA
│
├── React UI
├── Payment session logic
├── Split engine
├── UPI parsing
├── QR generation
├── QR scanning
├── IndexedDB
├── Local history
├── Import / export
└── Offline application shell
```

This makes QRFlow primarily a **device-side application delivered through the web**.

---

# 24. Proposed Folder-Level Architecture

A possible project structure:

```text
src/
│
├── components/
│   ├── ui/
│   ├── qr/
│   ├── payment/
│   └── history/
│
├── pages/
│   ├── Home/
│   ├── Setup/
│   ├── Session/
│   ├── History/
│   └── Settings/
│
├── core/
│   ├── upi/
│   ├── splitter/
│   ├── qr/
│   └── validation/
│
├── db/
│   ├── dexie.ts
│   ├── schemas.ts
│   └── repositories/
│
├── services/
│   ├── importExport/
│   └── backup/
│
├── hooks/
│
├── types/
│
├── utils/
│
└── app/
```

This is a logical starting structure, not a requirement to follow exactly.

---

# 25. Final Technology Stack

| Area | Technology |
|---|---|
| Framework | **React** |
| Language | **TypeScript** |
| Build tool | **Vite** |
| Local database | **IndexedDB** |
| IndexedDB wrapper | **Dexie.js** |
| PWA | **vite-plugin-pwa / Service Worker** |
| Styling | **Tailwind CSS** |
| QR scanning | **QR scanning library + browser camera APIs** |
| QR generation | **QR generation library** |
| Data validation | **Zod** |
| Icons | **Lucide React** |
| Unit testing | **Vitest** |
| UI testing | **React Testing Library** |
| Backend | **None for v1** |
| Remote database | **None for v1** |
| Authentication | **None for v1** |

---

# 26. Technology Philosophy

QRFlow should follow one principle:

> **Use the simplest technology that solves the actual problem.**

The application does not need a backend simply because it is a web application.

It does not need user accounts simply because it stores data.

It does not need a cloud database when local storage is sufficient.

It does not need a large infrastructure stack when the product is intentionally local-first.

The initial architecture should therefore remain:

```text
React
+
TypeScript
+
Vite
+
IndexedDB / Dexie
+
PWA
+
QR tools
+
Validation
+
Testing
```

The objective is a fast, polished, reliable merchant utility rather than a technically bloated system.

---

# 27. Future Expansion

A backend can be introduced later only if the product develops requirements that genuinely need remote infrastructure, such as:

```text
Multi-device synchronization
Cloud backup
Merchant accounts
Team access
Centralized analytics
Cross-device session recovery
Remote configuration
Business administration
```

Those are future product decisions, not requirements for the first version.

---

## Final Stack Summary

**QRFlow v1**

```text
React
TypeScript
Vite
Tailwind CSS
Dexie
IndexedDB
PWA
QR Scanner
QR Generator
Zod
Lucide React
Vitest
React Testing Library

             NO BACKEND
             NO CLOUD DB
             NO AUTH
```

This stack is intentionally optimized for QRFlow's actual design: **mobile-first, local-first, offline-capable, installable, simple, and fast.**
