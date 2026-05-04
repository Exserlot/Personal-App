# AGENTS.md

> **Context:** This file acts as the MASTER REQUIREMENT and SYSTEM INSTRUCTION for the Google Antigravity Agent.
> **Project:** Personal Management Dashboard (Solo Developer)

---

## 🤖 1. System Role & Strict Constraints

**Role:** You are a Senior Full-Stack Developer expert in **Next.js 14+ (App Router)**, **Tailwind CSS**, and **TypeScript**. Your goal is to build a robust, minimalist personal dashboard.

**🛑 Strict Technical Rules:**

1.  **Framework:** Use **Next.js 14+** with **App Router** (`app/` directory). Do NOT use Pages Router.
2.  **Language:** **TypeScript** only. Define interfaces for all data models.
3.  **Styling:** Use **Tailwind CSS** for all styling.
    - Do NOT create separate CSS files. Use utility classes.
    - Use `clsx` or `tailwind-merge` for conditional class names.
4.  **State Management:** Use React Hooks (`useState`, `useContext`) or Zustand.
5.  **Data Storage:** Use **PostgreSQL (Supabase)** via **Prisma ORM**.
    - Use Server Actions for all core database operations (e.g., `finance.ts`, `wishlist.ts`).
    - Handle data integrity using atomic transactions (`prisma.$transaction`) for balance-critical operations (like editing/deleting Transactions to sync Wallet balances).
    - Must handle Prisma `null` returns explicitly to match existing TypeScript definitions expected by React Components (`undefined`).

---

## 🎨 2. Design System: Pastel Glassmorphism

**Concept:** "Organic Minimalism with Pastel Glassmorphism" - Clean, warm, calming, and deeply modern.
**Theme Support:** Light Mode (Default), Dark Mode (User Toggle), and System Theme support.

**Global Aesthetic & UI Components:**
- **Surfaces/Cards:** Modern, translucent aesthetic using `backdrop-blur-xl`, `rounded-3xl`, and `bg-white/40` (light) or `bg-stone-800/40` (dark).
- **Interactive Depth:** Floating hover effects (`hover:-translate-y-1`) and soft outer glows on all major dashboard cards.
- **Global Modals:** Full transparency with `backdrop-blur-3xl` and `bg-white/80` (dark: `bg-stone-900/80`). Inputs use `bg-white/50`, `shadow-inner`, and defined borders for clarity. Headers/Footers use `backdrop-blur-md` for visual separation.
- **Form Inputs:** Centralized `CustomSelect` component replaces native system `<select>` elements for visual unity (e.g., in Finance, Wishlist, Investments).

**Color Palette Strategy (Tailwind):**
Base uses `stone` (or `warmGray`). `emerald` or `sage` for success, and `rose` or `terracotta` for danger.

| Component            | Light Mode Example    | Dark Mode Example              | Note                                |
| :------------------- | :-------------------- | :----------------------------- | :---------------------------------- |
| **Background**       | `bg-stone-50` (Cream) | `bg-stone-900` (Deep Charcoal) | _Never use pure black (#000)_       |
| **Surface/Card**     | `bg-white/40`         | `bg-stone-800/40`              | Translucent Glassmorphism           |
| **Text Primary**     | `text-stone-800`      | `text-stone-100`               | Soft contrast                       |
| **Text Secondary**   | `text-stone-500`      | `text-stone-400`               |                                     |
| **Accent (Income)**  | `text-emerald-700`    | `text-emerald-400`             | Sage Green tones                    |
| **Accent (Expense)** | `text-rose-700`       | `text-rose-400`                | Terracotta/Clay tones               |

---

## 📱 3. Layout & Navigation

**A. Dashboard Structure:**
- Main landing page (`/`) aggregates modular Widgets: Wallets, Daily Transactions, Todos, and Wishlist priorities.

**B. Desktop Navigation:**
- **Collapsible Sidebar:** Uses `SidebarContext` to toggle sidebar width (Expanded/Icon-only). Persists state in `localStorage`. 
- Main content dynamically adjusts padding (`md:pl-64` vs `md:pl-20`) based on sidebar state.

**C. Mobile Navigation (Small Screens):**
- **Bottom Nav:** Fixed bottom navigation bar (`md:hidden`).
- **FAB (Floating Action Button):** Positioned appropriately (e.g., `bottom-24`) to float above bottom nav for quick actions like adding transactions or wishlist items.
- **Mobile Header:** Dedicated top bar containing User Avatar and Sign Out button.
- Stacked headers for transaction lists to prevent overlapping. Ensure instant navigation over placeholder skeleton animations.

---

## 🛠 4. Functional Requirements

### 4.0 👤 User & Profile Management

**A. Registration & Login:**
- **Fields:** Username (Required), Email (Optional), Password (Required).
- Authenticate via Username/Password. Session managed via NextAuth.js.
- Clean redirection to the main Dashboard (`/`) instead of Finance module.

**B. Settings & Profile:**
- App-wide UI Theme preference (Light / Dark / System).
- Default Currency selection (e.g., THB).
- Update Display Name and manage custom Profile Pictures.

### 4.1 💰 Finance Module

**A. Dashboard & Transactions:**
- Display **Total Balance** and **Income vs Expense** summary.
- **Transaction Grouping:** Grouped by date (Today, Yesterday, specific dates). Filterable by All/Income/Expense.
- **Add/Edit Transaction:** Date, Amount, Type, Category, Wallet, Note.
  - *Strict Method:* Income/Expense toggleable. Transfer type is locked and hides/auto-resets the "Category" field.
  - *Safety:* Manual Balance Adjustments are Read-Only.
- **Delete Transaction:** Automatically reverts wallet balance. Custom styled overlay confirmation dialog replaces native browser alerts. Hidden footer actions during delete confirmation.
- **QR Code & Slip Integration:** Upload payment slip images. Auto-scan built-in Thai QR Code standard data via `jsQR` to automatically populate expense transactions.

**B. Wallets & Categories:**
- Manage custom wallets with icons/images.
- **Total Assets (Omni-Wallet):** A unified conceptual view aggregating balances from all wallets and investments.
- Category CRUD via tabbed interface (Income/Expense). Smart delete prevents deletion of active categories. 

### 4.2 📈 Investment Tracker

- Monthly snapshot of portfolio (Asset Name, Type, Amount Invested).
- Application of dynamic gradient backgrounds for asset cards based on profit/loss status.
- Modals exclusively use `CustomSelect` for visually integrated inputs.

### 4.3 💳 Subscription Manager (Recurring)

- Track recurring subscriptions (Netflix, Spotify, etc.) and calculate yearly fixed costs.
- **Mark as Paid:** Automatically reconciles and generates an expense transaction in the designated wallet for that cycle.

### 4.4 🎁 Wishlist Module

- Dedicated `/wishlist` module.
- Grid layout with visual cards: Name, Price, Priority (Low/Medium/High visual badge), Link, Image.
- **Mark as Bought:** Capability to track acquired items and potentially prompt an expense record. Includes Restore capability for history items.

### 4.5 🎯 Goals Module

- Track yearly achievements (Not Started / In Progress / Done).
- Employs the glassmorphism grid layout and visually reduces luminosity for checked-off/completed states.

### 4.6 📅 Productivity Module (Tasks & Habits)

- **Daily Tasks:** Manage to-dos with priorities. Auto-migrate incomplete tasks to the next day automatically.
- **Habit Tracker:** Record completion dates, calculate and maintain current streaks.
- Inputs modernized to align with the floating translucent theme.

---

## 📂 5. Data Architecture (Prisma/PostgreSQL)

The primary data layer interfaces with PostgreSQL via Prisma ORM.

- **Centralized Source:** `prisma` operations encompass all data previously stored in JSON, acting symmetrically as the single source of truth.
- **Format Adjustments:** Ensure dates align with Prisma schema specifications (e.g., using `"YYYY-MM-DD"` instead of full `DateTime` blocks where appropriate for Tasks/Habits).
