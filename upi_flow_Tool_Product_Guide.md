# Merchant UPI QR Payment Tool — Product Guide
# Tool name: UPI Flow 

**Document Type:** Product / Working Guide  
**Version:** 1.0  
**Audience:** Project planning, design, development, testing  
**Primary Users:** Merchants / business owners  

---

## 1. What Is This Project?

This project is a **simple merchant-side web app/PWA for creating and managing UPI payment QR codes for a specific amount**.

The merchant provides their existing UPI payment information once. The app can then create payment QRs for different amounts and, when required, split one large amount into multiple smaller payments.

The tool is designed primarily for **mobile use at a shop, counter, stall, service desk, or other merchant location**.

The goal is not to replace UPI apps or become a payment processor. The merchant still receives money through their normal UPI/bank setup.

---

## 2. Why Is This Tool Being Built?

The immediate project inspiration comes from the new UPI merchant pricing framework announced by the Government of India in September 2026.

The official announcement states that **specified person-to-merchant (P2M) transactions above ₹2,000 can attract MDR**, while P2M transactions up to ₹2,000 remain free of MDR; it also states that MDR is **not a tax collected by the government**. The exact treatment depends on the applicable merchant/category rules. citeturn946303search0

This creates a product opportunity around **merchant payment amount management**.

The project therefore explores a simple workflow:

> **Take one amount → split it into permitted smaller payment amounts → generate separate UPI payment QRs → let the merchant confirm each received payment.**

The application should not assume that every merchant or every transaction is subject to MDR. It is a general payment-QR utility whose splitting feature can be used where relevant.

---

## 3. Who Is the User?

The main user is the **merchant**, not the customer.

Examples:

- Grocery/shop owner
- Street vendor
- Restaurant or café operator
- Service provider
- Small business owner
- Any merchant who wants a quick way to request a particular UPI amount

The customer normally interacts only with the generated QR or UPI payment link.

---

## 4. Simple Example

A merchant needs to collect **₹3,000**.

Instead of showing one QR requesting ₹3,000, the merchant can use the tool to create:

```text
Payment 1 → ₹2,000
Payment 2 → ₹1,000
```

The merchant shows Payment 1's QR to the customer.

After checking their normal UPI/bank confirmation, the merchant marks Payment 1 as received.

The app then moves focus to Payment 2.

After Payment 2 is received:

```text
₹2,000 received ✓
₹1,000 received ✓
------------------
₹3,000 completed
```

The merchant never has to manually remember which generated QR has already been handled.

---

## 5. Core Product Idea

The application is built around the concept of a **Payment Session**.

A Payment Session represents one amount that a merchant wants to collect.

For example:

```text
Session
Total: ₹5,500

QR-01 → ₹2,000 → Received ✓
QR-02 → ₹2,000 → Received ✓
QR-03 → ₹1,500 → Pending
```

The merchant completes the session by confirming each payment.

This is more useful than treating the app as only a QR-code generator.

---

# 6. How the Application Works

## Step 1 — Merchant Setup

The merchant opens the application and provides their payment information.

Possible input methods:

- Enter UPI ID manually
- Scan an existing UPI QR
- Import/parse a compatible UPI payment URL

The merchant profile can then be saved on the device.

Example:

```text
Business Name: Sharma Store
UPI ID: sharmastore@upi
```

The merchant should not have to enter this information every time.

---

## Step 2 — Enter Amount

The merchant enters the amount to collect.

Example:

```text
Amount
₹3,000
```

The app calculates a suitable split.

---

## Step 3 — Choose a Split

The app can suggest a default split and optionally provide alternative strategies.

Example:

```text
₹3,000

Suggested:
₹2,000 + ₹1,000

Other options:
₹1,500 + ₹1,500
Custom split
```

The merchant can choose the arrangement that is most convenient for the transaction.

The application should use a configurable maximum rather than permanently hard-coding ₹1,999. The current government announcement refers to payments **up to ₹2,000** as the relevant zero-MDR threshold for P2M payments, subject to the stated merchant/category rules. citeturn946303search0

---

## Step 4 — Generate Individual QRs

Each split amount becomes its own payment QR.

Example:

```text
QR-A72K
₹2,000

QR-B19P
₹1,000
```

Each QR is associated with a short unique identifier.

The identifier is useful for the merchant to match the QR with the corresponding payment/reference information.

---

## Step 5 — Customer Pays

The customer scans the shown QR using their normal UPI application.

The generated payment request contains the merchant's payment destination and the requested amount.

The customer completes payment using the normal UPI flow.

The project does **not** move money itself.

---

## Step 6 — Merchant Confirms the Payment

The application does not treat a QR being displayed or scanned as proof that money was received.

The merchant checks their normal UPI/bank/payment-app confirmation and then presses:

```text
✓ Mark Received
```

The QR moves from the active list to completed history.

The application immediately focuses on the next pending QR.

---

## Step 7 — Session Completion

When every split payment has been confirmed:

```text
Payment Session Complete

Total: ₹5,500
Received: ₹5,500
Pending: ₹0

✓ Completed
```

The session remains available in local history.

---

# 7. Main Functions

## A. Merchant Profile

The merchant can save their payment identity locally.

Possible information:

- Business name
- UPI ID / payment identity
- Imported payment information
- Optional display preferences

Multiple merchant profiles can be supported later.

Example:

```text
My Businesses

Sharma Store
sharmastore@upi

Sharma Catering
sharmacatering@upi
```

---

## B. Amount Entry

The merchant can enter any amount supported by the application.

Example:

```text
₹750
₹1,999
₹3,000
₹7,500
₹25,000
```

---

## C. Smart Split

The application automatically divides the total into smaller payment amounts.

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
₹10,000
→ ₹2,000 + ₹2,000 + ₹2,000 + ₹2,000 + ₹2,000
```

The split rules should be configurable so that the product does not depend on one permanent regulatory threshold.

---

## D. Custom Split

A merchant can manually choose the payment amounts.

Example:

```text
Total: ₹4,000

₹1,200
₹1,800
₹1,000
```

The app validates that the split adds up to the original total.

---

## E. QR ID

Every generated QR should receive a short identifier.

Example:

```text
QR-A72K
QR-B19P
QR-C43M
```

The ID should be visible in the merchant interface and can also be included in relevant UPI reference/note fields where supported.

This helps the merchant match an incoming payment with the correct QR.

---

## F. Sequential Payment Flow

The merchant should not have to manage multiple QRs manually.

Example:

```text
₹5,500

QR-A72K  ₹2,000  [Show QR]
QR-B19P  ₹2,000  [Locked]
QR-C43M  ₹1,500  [Locked]
```

After the merchant confirms QR-A72K:

```text
QR-A72K  ₹2,000  ✓ Received
QR-B19P  ₹2,000  [Show QR]
QR-C43M  ₹1,500  [Locked]
```

This creates a simple counter-style workflow.

---

## G. Local Payment History

The application should keep a **local history of payment sessions and merchant confirmations**.

Example:

```text
Today

₹5,500   Completed
2:41 PM

₹3,000   Completed
1:18 PM

₹7,250   Incomplete
11:52 AM
```

Opening a session can show:

```text
₹5,500
Session #A81F

QR-A72K   ₹2,000   ✓
QR-B19P   ₹2,000   ✓
QR-C43M   ₹1,500   ✓

Received: ₹5,500
Status: Completed
```

This is a merchant-side record. It should not be presented as an independent bank-verified transaction ledger.

---

## H. Offline Use

The application should be installable and usable as an offline-capable PWA.

The merchant should be able to do core tasks without an internet connection, including:

- Open the installed app
- Access saved merchant profiles
- Enter an amount
- Split an amount
- Generate/display payment QRs
- Manage a payment session
- Mark payments as received
- View local history

However, **offline operation of the tool does not mean UPI itself becomes offline**. The customer's actual UPI payment still depends on the normal UPI/payment ecosystem and connectivity available to the customer/payment providers.

---

# 8. Installable App Experience

The project should behave like a small utility application rather than a normal website.

A merchant can:

```text
Open website
    ↓
Install app
    ↓
App appears on phone
    ↓
Open like a normal app
```

The merchant should not need to create an account just to use the core functionality.

---

# 9. Data Stored on the Device

The initial product is intended to keep merchant information and history locally on the merchant's device.

Examples of local data:

- Merchant profile
- UPI payment information
- Payment sessions
- QR IDs
- Amounts
- Session status
- Merchant confirmation times
- Application settings

This supports the offline-first design and reduces the need for a central user database.

---

# 10. Backup and Data Safety

Because the initial system is local, losing or clearing the browser/app data could also remove local history.

A future data-management section should therefore provide:

```text
Settings

Data
 ├── Export Data
 ├── Import Data
 └── Clear History
```

The export should provide a portable backup of the merchant's local data.

A cloud-backup system can be considered later, but it is not required for the initial product.

---

# 11. Useful Merchant Features to Consider Later

These are extensions, not requirements for the first version.

### Saved Split Presets

```text
₹3,000 → ₹2,000 + ₹1,000
₹5,000 → ₹2,000 + ₹2,000 + ₹1,000
```

### Multiple Business Profiles

```text
Shop
Cafe
Catering
Service Business
```

### QR Display Modes

- Full-screen QR
- Compact counter mode
- One-QR-at-a-time mode
- Multi-QR view

### Sharing

- Share QR image
- Download QR
- Share payment link

### Session Notes

Optional merchant notes such as:

```text
Order #1042
Table 7
Customer: Rahul
```

### Local Search

Search local history by:

- Amount
- QR ID
- Session ID
- Date
- Note

---

# 12. What the Product Is NOT

The initial application is not intended to be:

- A bank
- A wallet
- A payment gateway
- A UPI app replacement
- A system that holds merchant funds
- An automatic bank reconciliation platform
- An independent payment-verification authority
- A cloud accounting platform

Its role is much simpler:

> **Help a merchant create, organize, display, and locally track UPI payment requests.**

---

# 13. Important Behaviour Rules

The application should always make the following distinction clear:

### QR generated

Means:

> A payment request has been prepared.

It does **not** mean payment succeeded.

### QR scanned

Means:

> The customer scanned/opened the payment request.

It does **not** prove money was received.

### Merchant marked received

Means:

> The merchant personally confirmed receipt using their normal payment/bank confirmation.

This is the state recorded by the application.

---

# 14. Example: ₹3,000 Payment

### Merchant enters

```text
₹3,000
```

### Application suggests

```text
₹2,000 + ₹1,000
```

### Payment Session

```text
Session #A81F

QR-A72K
₹2,000
Pending

QR-B19P
₹1,000
Pending
```

### Merchant displays QR-A72K

Customer pays ₹2,000.

Merchant checks their normal UPI confirmation and taps:

```text
✓ Mark Received
```

### Application becomes

```text
QR-A72K
₹2,000
✓ Received

QR-B19P
₹1,000
Pending
```

The second QR becomes the active QR.

### Customer pays ₹1,000

Merchant confirms it.

Final state:

```text
QR-A72K   ₹2,000   ✓
QR-B19P   ₹1,000   ✓
------------------------
Total     ₹3,000   ✓
```

The session is saved into local history.

---

# 15. Example: ₹8,750 Payment

Merchant enters:

```text
₹8,750
```

The application can generate:

```text
QR-01 → ₹2,000
QR-02 → ₹2,000
QR-03 → ₹2,000
QR-04 → ₹2,000
QR-05 → ₹750
```

The merchant handles them sequentially:

```text
QR-01 ✓
QR-02 ✓
QR-03 ✓
QR-04 ✓
QR-05 ✓
```

Final result:

```text
₹8,750 received
Session completed
```

---

# 16. Example: Customer Pays From a Distance

The customer does not necessarily have to stand directly in front of the merchant's screen.

Possible flow:

```text
Merchant creates payment request
        ↓
Merchant shares QR / payment link
        ↓
Customer opens it
        ↓
Customer completes payment
        ↓
Merchant confirms receipt
```

The exact behaviour depends on how the customer receives and opens the QR/link and on the capabilities of their UPI application.

---

# 17. Product Philosophy

The project should follow five main principles:

### Simple

A merchant should understand the application without needing instructions.

### Fast

Generating the next QR should take very little time.

### Reliable

Closing, reopening, or temporarily losing connectivity should not unexpectedly destroy an active session.

### Private

The first version should keep merchant data local wherever practical.

### Honest

The app should never claim that a payment succeeded when it only knows that a QR was generated or that the merchant marked it received.

---

# 18. Initial Product Scope

The first serious version should focus on:

```text
Merchant setup
        ↓
UPI information import
        ↓
Amount entry
        ↓
Smart split
        ↓
Custom split
        ↓
QR generation
        ↓
QR IDs
        ↓
Sequential payment session
        ↓
Merchant confirmation
        ↓
Local history
        ↓
Offline / installable app
```

Anything beyond this should be considered only after the core workflow is polished.

---

# 19. End Goal

The final experience should feel like a **small, fast merchant utility** that solves one specific payment-management problem extremely well.

The ideal merchant experience is:

```text
Open App
   ↓
Enter ₹ amount
   ↓
Choose / accept split
   ↓
Show QR
   ↓
Customer pays
   ↓
✓ Confirm
   ↓
Next QR
   ↓
✓ Confirm
   ↓
Complete
```

The application should stay focused instead of becoming an unnecessarily complicated financial platform.

---

# 20. Reference Note

The project's initial problem statement was inspired by the Government of India's September 15, 2026 announcement regarding the new UPI merchant pricing framework. The official announcement states that P2P UPI remains free, P2M payments up to ₹2,000 remain free of MDR, and specified P2M transactions above ₹2,000 can attract MDR. It also explicitly describes MDR as a merchant-payment ecosystem charge rather than a government tax. The framework includes category-specific rules, so the application should not assume the same treatment applies to every merchant or transaction. citeturn946303search0

For project documentation, treat the regulatory details as **context for the feature**, not as a permanent hard-coded business rule. The application should be designed so its amount threshold and splitting logic can be changed if the applicable rules change.

**Official source:** Press Information Bureau, Ministry of Finance, September 15, 2026.
