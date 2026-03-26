// --- Wishlist ---
export type WishlistPriority = "low" | "medium" | "high";
export type WishlistStatus = "active" | "bought";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  priority: WishlistPriority;
  status: WishlistStatus;
  url?: string;
  image?: string; // URL or path
  lastTransactionId?: string | null;
  note?: string;
  userId: string;
  createdAt: string;
}

// --- Productivity ---
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // ISO Date "YYYY-MM-DD"
  priority: TaskPriority;
  userId: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDates: string[]; // Array of "YYYY-MM-DD"
  userId: string;
}

// --- Finance ---
export type WalletType = "cash" | "bank" | "credit" | "investment" | "other";

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color?: string; // Hex color code
  icon?: string; // URL/Path to icon image
  userId: string;
}

export type TransactionType = "income" | "expense" | "transfer" | "adjustment";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  userId: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO Date String
  amount: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  targetWalletId?: string; // For transfers
  note?: string;
  slipId?: string; // Optional link to payment slip
  userId: string;
}

export interface TotalAssetsSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netWorth: number; // Includes investments
}

// --- Payment Slips ---
export interface PaymentSlip {
  id: string;
  fileName: string;
  uploadDate: string; // ISO Date
  imagePath: string; // Path to stored image (relative to public)
  qrData?: {
    amount?: number;
    recipient?: string;
    reference?: string;
    rawData: string;
  };
  linkedTransactionId?: string; // Optional link to transaction
  note?: string;
  userId: string;
}

// --- Investments ---
export type InvestmentType = "stock" | "crypto" | "fund" | "other";

export interface InvestmentAsset {
  id: string;
  name: string;
  type: InvestmentType;
  amountInvested: number; // Total money put in
  currentValue: number; // Current value of the asset
  note?: string;
  userId: string;
  updatedAt: string; // ISO Date
}

// --- Subscriptions ---
export type BillingCycle = "daily" | "monthly" | "yearly";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  cycle: BillingCycle;
  nextBillingDate?: string; // ISO Date (optional, for tracking)
  lastPaidDate?: string | null; // ISO Date of the last payment marked for this cycle
  lastTransactionId?: string | null; // ID of the transaction created for the current cycle
  url?: string; // Link to manage subscription
  note?: string;
  userId: string;
}

// --- Goals ---
export type GoalStatus = "not_started" | "in_progress" | "done";

export interface YearlyGoal {
  id: string;
  title: string;
  year: number;
  status: GoalStatus;
  description?: string;
  userId: string;
  createdAt: string; // ISO Date
}

// --- Settings ---
export interface UserSettings {
  userId: string;
  theme: "light" | "dark" | "system";
  currency: string; // "THB", "USD" etc.
  defaultWalletId?: string;
}

// --- Authentication ---
export type AuthProvider = "credentials" | "google";

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Hashed password (only for credentials provider)
  provider: AuthProvider;
  providerId?: string; // OAuth provider ID
  name?: string;
  image?: string;
  createdAt: string; // ISO Date
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name?: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    username: string;
    email: string;
    name?: string;
    image?: string;
  }
}

