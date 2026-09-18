# UPI Flow

> A mobile-first, privacy-focused merchant utility for generating and managing multiple UPI payment QR codes.

UPI Flow (also known as QRFlow) is a lightweight, local-first Progressive Web App (PWA) designed to help merchants handle large UPI payments by intelligently splitting them into smaller, manageable amounts. This allows merchants to navigate payment limits and potential Merchant Discount Rate (MDR) thresholds effortlessly.

## 🚀 Key Features

* **Smart Split Engine**: Automatically divides a large total amount into smaller, permitted payment chunks (e.g., splitting ₹3,000 into ₹2,000 + ₹1,000).
* **Sequential Payment Flow**: Guides the merchant through a counter-style workflow to confirm each split payment individually without confusion.
* **Offline-First & Local**: Operates completely offline. Merchant profiles, payment sessions, and history are stored securely on the device using IndexedDB. No backend is required.
* **Zero Account Required**: Merchants can start using the tool immediately by simply inputting their existing UPI ID or scanning their QR.
* **Progressive Web App (PWA)**: Installable directly to the device home screen for a native-like experience.

## 🛠️ Technology Stack

UPI Flow is built with modern web technologies, prioritizing speed, reliability, and local persistence.

* **Frontend Framework**: React 
* **Language**: TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Local Database**: IndexedDB (via Dexie.js)
* **Validation**: Zod
* **Icons**: Lucide React

## 📖 How It Works

1. **Setup**: The merchant enters their UPI ID or scans their existing payment QR.
2. **Enter Amount**: The merchant inputs the total amount they need to collect (e.g., ₹5,500).
3. **Split**: The app suggests an optimal split (e.g., ₹2,000 + ₹2,000 + ₹1,500) based on configurable thresholds.
4. **Collect**: The app generates a unique QR code for the first amount.
5. **Confirm**: Once the customer pays and the merchant receives the bank confirmation, the merchant marks it as 'Received'. The app then displays the next QR code until the session is fully collected.

## 🔒 Privacy & Security

UPI Flow respects merchant data:
* **Local-First**: No data is sent to a remote server. All payment history and profiles remain on the merchant's device.
* **No Fund Holding**: The app is purely a utility for generating QR codes and managing sessions locally. It does not process or hold funds; transactions happen through the standard UPI ecosystem.

## 📝 License

This project is licensed under the MIT License.
