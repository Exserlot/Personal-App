---
trigger: always_on
---

# 🚀 Antigravity Development Rules: Personal Management Dashboard

This file defines the strict technical, architectural, and design standards for this project. Antigravity must adhere to these rules for every modification and new feature.

---

## 🛠 1. Core Technical Stack & Constraints

- **Framework:** Next.js 14+ (App Router). Use `app/` directory. No `pages/`.
- **Language:** TypeScript. Use strict typing. Interface definitions are mandatory.
- **Styling:** Tailwind CSS only.
  - Do NOT use external CSS files.
  - Use `clsx` or `tailwind-merge` for conditional classes.
- **Backend:**
  - Prisma ORM with PostgreSQL (Supabase).
  - Use **Server Actions** (`src/lib/actions/`) for all database mutations.
  - Wrap balance-critical operations in `prisma.$transaction`.
  - Handle Prisma `null` returns explicitly to match UI types (usually `undefined`).
- **State Management:** React Hooks (`useState`, `useContext`) or Zustand for complex global state.

---

## 🎨 2. Design System: Pastel Glassmorphism

The aesthetic is "Organic Minimalism with Pastel Glassmorphism" — Clean, warm, calming, and premium.

### Surface & Cards (Glassmorphism)

- **Base Card:** `bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 dark:border-white/5`
- **Premium Modal/Surface:**
  - `bg-gradient-to-br from-rose-100/80 via-purple-50/80 to-sky-100/80 dark:from-rose-950/30 dark:via-purple-900/20 dark:to-sky-950/30`
  - `backdrop-blur-3xl rounded-3xl shadow-2xl`
- **Interactive:** Always add hover effects: `hover:-translate-y-1 transition-all duration-200`.

### Color Palette (Tailwind)

- **Base:** `stone` or `warmGray` (Never use pure black `#000`).
- **Success/Income:** `emerald` or `sage`.
- **Danger/Expense:** `rose` or `terracotta`.
- **Primary Accent:** Custom primary color (check `tailwind.config.ts`).

### UI Constants (Use these!)

Import from `@/lib/constants/styles`:

- `PREMIUM_INPUT_CLASS`: For all text inputs.
- `PREMIUM_TEXTAREA_CLASS`: For textareas.
- **Selects:** Always use the `<CustomSelect />` component from `@/components/ui/custom-select`.

---

## 📂 3. Component & File Architecture

- **Server vs Client:**
  - Default to Server Components where possible.
  - Use `"use client"` only for interactive elements or components using hooks.
- **Directory Structure:**
  - `src/components/[module]`: Feature-specific components.
  - `src/components/ui`: Generic shared UI components.
  - `src/lib/actions`: Server Actions (database logic).
  - `src/lib/repository.ts`: Data access layer (read operations).
- **Naming Conventions:**
  - Components: `PascalCase.tsx`
  - Lib/Actions/Utils: `kebab-case.ts`
  - Folders: `kebab-case`

---

## 🧩 4. Layout Standards

- **Mobile First:** Ensure all layouts are responsive.
- **Navigation:**
  - **Desktop:** Collapsible sidebar (width toggled via `SidebarContext`).
  - **Mobile:** Bottom Nav + FAB (Floating Action Button).
- **Modals:** Use `GlobalModal` component for consistency.

---

## 🛡 5. Data Integrity & Safety

- **Atomic Transactions:** Every transaction edit or delete MUST re-calculate the associated Wallet balance within a transaction.
- **Error Handling:** Use `try-catch` in Server Actions and return a standardized result `{ success: boolean, error?: string, data?: T }`.
- **Prisma Schema:** Sync changes with `npx prisma generate` and `npx prisma db push`.

---

## 🤖 6. Antigravity Specific Rules

1. **Verify Before Edit:** Always check the existing implementation of a component before modifying it to preserve the specific glassmorphism styling.
2. **No Placeholders:** Generate real assets or high-quality mock data.
3. **Consistency:** If creating a new module, copy the layout pattern from `Finance` or `Productivity`.
4. **Documentation:** Keep Phase documentation (e.g., `IMPLEMENT_PHASE_2.md`) updated if core logic changes.
5. **Default Language:** When creating or modifying screens, UI components, or text content, the default language MUST be English.
