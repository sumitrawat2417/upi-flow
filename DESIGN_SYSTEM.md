# UPI Flow Design System

This document outlines the UI/UX design language created for the **UPI Flow** application. It serves as a style guide and reference manual so you can easily replicate this sleek, modern, and highly polished aesthetic in your future projects.

> [!NOTE]
> The core philosophy of this design system is **"Premium Mobile-First"**. It relies on vibrant but grounded gradients, deep layered shadows, rounded organic shapes, and a highly accessible dark/light mode toggle.

## 1. Typography

We use **Outfit** (available on Google Fonts) as the sole typeface. It is a beautiful geometric sans-serif that strikes a perfect balance between technical precision and friendly curves.

- **Font Family**: `'Outfit', system-ui, -apple-system, sans-serif`
- **Weights Used**: 
  - `400` (Regular) for body text and secondary labels.
  - `500` (Medium) for inputs and minor interactive elements.
  - `600` (SemiBold) for section labels and secondary buttons.
  - `700` (Bold) for primary buttons, titles, and amounts.
  - `800` (ExtraBold) for the massive hero amount display.

## 2. Color Palette & Theming

The app uses CSS Variables to seamlessly transition between Light and Dark modes. The primary brand color is a warm, energetic Coral/Pink.

### Primary Colors
- **Primary Brand**: `#E8435A` (Coral Red)
- **Primary Gradient (Hero)**: `linear-gradient(145deg, #F36B6B 0%, #E8435A 40%, #C62A8E 100%)`

### Light Mode Tokens
- **Background**: `#FEF0EE` (Very soft warm tint)
- **Surface (Cards)**: `#FFFFFF`
- **Surface 2 (Inputs/Secondary cards)**: `#FDF5F4`
- **Text Primary**: `#1A1A2E` (Deep navy instead of pure black for softer contrast)
- **Text Secondary**: `#4A4A6A`

### Dark Mode Tokens
- **Background**: `#0F0F1A` (Deep, rich midnight purple/blue)
- **Surface (Cards)**: `#1A1A2E`
- **Surface 2**: `#222236`
- **Text Primary**: `#F0F0FF`
- **Text Secondary**: `#A0A0C0`

> [!TIP]
> Using off-blacks (like `#1A1A2E`) and off-whites (like `#F0F0FF`) prevents eye strain and makes the UI feel instantly more expensive and thoughtful than pure `#000000` or `#FFFFFF`.

## 3. Core Layout Architecture

The layout relies on a specific "layered" approach that separates the header from the content.

### The App Shell
A mobile-first container that ensures the app looks great even on ultra-wide desktop monitors by constraining the width and centering the view.
```css
.app-shell {
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}
```

### The "Overlapping Hero" Pattern
This is the signature look of the app. It consists of a vibrant top header, and a dark/light content card that pushes *up* into the header.

1. **Hero Header**: Contains the gradient background and top padding (`pt-16 pb-14`).
2. **Decorative Orbs**: Absolute positioned `::before` and `::after` pseudo-elements on the header with low opacity (`rgba(255,255,255,0.08)`) and `border-radius: 50%`. *(Crucial: Always apply `pointer-events: none` so they don't block clicks!)*
3. **The Main Content Sheet**: A `flex-1` container that holds the rest of the page.
   - It gets a massive top border-radius: `borderRadius: '24px 24px 0 0'`
   - It is pulled up into the header using negative margin: `marginTop: '-20px'`
   - It is given `position: relative; z-index: 10;` to ensure it renders *above* the header.

## 4. Components & Micro-interactions

### Cards
Cards do not use harsh borders. They use very subtle box-shadows and faint translucent borders.
```css
.card {
  border-radius: 20px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.07);
}
```

### Primary Pill Buttons
The main CTA buttons are large, rounded pill shapes (`border-radius: 100px; height: 58px;`).
- **Interaction**: On `:active`, the button physically presses down using `transform: scale(0.97);`.
- **Shadows**: They have a "floating" shadow that gets larger and more intense on `:hover`.

### Section Labels
Small, uppercase, widely tracked text used to divide sections.
```css
.section-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.07em; /* Wide tracking */
  text-transform: uppercase;
}
```

### Icon Circles
Used everywhere for settings, history, and list items. A perfect circle (`border-radius: 50%; w-10 h-10`) with a tinted background (`rgba(primary, 0.10)`). It gives the icons a beautiful bounding box without being heavy.

## 5. Animation (The "Juice")

Animations are used to make the app feel alive.
- **Fade In**: `.fade-in` (opacity 0 to 1 over 0.2s) is applied to page transitions.
- **Pop In**: `.pop-in` (scale 0.88 to 1 with a cubic-bezier bounce) is used for context chips and alerts appearing.
- **Pulse Glow**: `.pulse-glow` is used for the "Live Session" indicators to show active listening/polling states.

> [!IMPORTANT]  
> When copying this design system, always remember that spacing (padding and margins) is just as important as colors. The UI feels premium because elements are given generous room to breathe (e.g., `px-5 py-4` inside cards, and `gap-4` between sections).
