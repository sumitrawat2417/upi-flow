# UPI Flow

UPI Flow is a local-first merchant tool for instantly generating and splitting smart UPI QR codes. 
It features a premium UI/UX design with a warm coral aesthetic, taking inspiration from top-tier modern finance apps like Quantro.

## Features

- **Local-First & Private:** All your data (profile, history, settings) stays entirely on your device via `localStorage`. No cloud accounts required.
- **Smart Splitting:** Large payment amounts can be automatically split based on custom thresholds to avoid limits, or split into equal parts.
- **Premium Design System:**
  - Modern, responsive, mobile-first design.
  - Light mode (default) and dark mode (via context & system preference).
  - High-end aesthetics: coral gradients, subtle shadows, clean typography using the `Outfit` font, and elegant micro-animations.
- **Payment Lifecycle:** Track active sessions and visually verify collected payments.
- **Zero Fees / Direct to Bank:** UPI Flow only generates the QR code payload; the actual money transfer happens entirely through the customer's UPI app directly to the merchant's bank account.

## Tech Stack

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4** (with native CSS nesting and theming)
- **React Router v6**
- **Lucide Icons**

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Workflow

1. **Setup:** On first load, provide your Business Name and a valid UPI ID (e.g. `merchant@bank`).
2. **Amount Entry:** Enter the desired amount on the minimal numeric keypad.
3. **Split Strategy:** If the amount exceeds your split threshold (configurable in Settings), you can choose to auto-split it or collect as one single payment.
4. **Session Collection:** For a session, you are shown sequential QR codes. After your customer successfully pays a QR code via their UPI app, click 'Confirm Payment Received' to proceed to the next QR code.
5. **History & Settings:** You can review all completed and active sessions in History, and toggle dark/light mode or reset your data from Settings.
