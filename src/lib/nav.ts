import { 
  LayoutDashboard, 
  Wallet, 
  CheckSquare, 
  ShoppingBag,
  TrendingUp,
  Target,
  Settings,
  RefreshCw
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, disabled: false },
  { label: "Finance", href: "/finance", icon: Wallet, disabled: false },
  { label: "Productivity", href: "/productivity", icon: CheckSquare, disabled: false },
  { label: "Wishlist", href: "/wishlist", icon: ShoppingBag, disabled: false },
  { label: "Investments", href: "/investments", icon: TrendingUp, disabled: false },
  { label: "Subscriptions", href: "/subscriptions", icon: RefreshCw, disabled: false },
  { label: "Goals", href: "/goals", icon: Target, disabled: false },
  { label: "Settings", href: "/settings", icon: Settings, disabled: false },
];
