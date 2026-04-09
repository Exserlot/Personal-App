export const dynamic = "force-dynamic";

import { getWishlist } from "@/lib/actions/wishlist";
import { getWallets } from "@/lib/actions/finance";
import { getSettings } from "@/lib/actions/settings";
import { WishlistDashboard } from "@/components/wishlist/wishlist-dashboard";
import { auth } from "@/lib/auth";

export default async function WishlistPage() {
  const session = await auth();
  const userId = session?.user?.id || "user-1";
  const wishlistItems = await getWishlist();
  const wallets = await getWallets();
  const settings = await getSettings(userId);

  return (
    <div className="">
      <WishlistDashboard 
        items={wishlistItems}
        wallets={wallets}
        defaultWalletId={settings.defaultWalletId}
        userId={userId}
      />
    </div>
  );
}
