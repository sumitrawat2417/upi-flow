<div align="center">
  <h1>UPI Flow</h1>
  <p>A mobile-first, local Progressive Web App (PWA) for generating and managing multiple UPI payment QR codes.</p>
  
  <p>
    <a href="https://github.com/sumitrawat2417/upi-flow/actions"><img src="https://img.shields.io/github/actions/workflow/status/sumitrawat2417/upi-flow/ci.yml?branch=main" alt="Build Status"></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React"></a>
  </p>

  <p>
    <a href="#demo">Live Demo</a> •
    <a href="#key-features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#how-it-works">How It Works</a>
  </p>
</div>

---

> **Note:** The screenshot below is a placeholder. You can replace this with an actual demo GIF or image once the UI is ready!
> <br/><br/>
> `![UPI Flow Demo](https://via.placeholder.com/800x400?text=App+Screenshot+or+GIF+Goes+Here)`

UPI Flow is a lightweight, local-first utility designed to help merchants handle large UPI payments by intelligently splitting them into smaller, manageable amounts. This allows merchants to easily request modular payments while navigating standard zero-MDR (Merchant Discount Rate) thresholds for specific P2M transactions.

## ✨ Key Features

* **Smart Split Engine**: Automatically divides a large total amount into smaller, permitted payment chunks (e.g., splitting ₹3,000 into ₹2,000 + ₹1,000).
* **Sequential Payment Flow**: Guides the merchant through a counter-style workflow to confirm each split payment individually without confusion.
* **Offline-First & Local**: Operates completely offline. Merchant profiles, payment sessions, and history are stored **locally** on the device using IndexedDB. No backend is required.
* **Zero Account Required**: Merchants can start using the tool immediately by simply inputting their existing UPI ID or scanning their QR.
* **Progressive Web App (PWA)**: Installable directly to the device home screen for a native-like app experience.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need Node.js and npm installed on your local machine.

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/sumitrawat2417/upi-flow.git
   ```
2. Navigate into the directory
   ```bash
   cd upi-flow
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Start the development server
   ```bash
   npm run dev
   ```

## 🌐 Demo

* **Live Link**: [Your Vercel/Netlify Deployment Link Here] 

## 🛠️ Technology Stack

UPI Flow is built with modern web technologies, prioritizing speed, reliability, and local persistence.

* **Frontend Framework**: [React](https://reactjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Local Database**: IndexedDB (via [Dexie.js](https://dexie.org/))
* **Validation**: [Zod](https://zod.dev/)

## 📖 How It Works

1. **Setup**: The merchant enters their UPI ID or scans their existing payment QR.
2. **Enter Amount**: The merchant inputs the total amount they need to collect (e.g., ₹5,500).
3. **Split**: The app suggests an optimal split (e.g., ₹2,000 + ₹2,000 + ₹1,500) based on configurable limits.
4. **Collect**: The app generates a unique QR code for the first amount.
5. **Confirm**: Once the customer pays and the merchant receives the bank confirmation, the merchant marks it as 'Received'. The app then displays the next QR code until the session is fully collected.

## 🔒 Privacy & Local-First Architecture

UPI Flow respects merchant data:
* **Local-First Data**: No data is sent to a remote server. All payment history and profiles remain entirely on the merchant's local browser storage.
* **No Fund Holding**: The app is purely a utility for generating QR codes and managing sessions locally. It does not process or hold funds; transactions happen independently through the standard UPI ecosystem.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
