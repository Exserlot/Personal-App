import { getSettings } from "@/lib/actions/settings";
import { getWallets } from "@/lib/actions/finance";
import { SettingsDashboard } from "@/components/settings/settings-dashboard";
import { auth } from "@/lib/auth";
import { findUserById } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const settings = await getSettings(userId);
  const wallets = await getWallets();
  const dbUser = await findUserById(userId);

  // Merge the auth session user with the fresh DB data
  const freshUser = {
    ...session.user,
    name: dbUser?.name || session.user.name,
    image: dbUser?.image || session.user.image,
  };

  return (
    <div className="">
      <SettingsDashboard 
        user={freshUser}
        settings={settings}
        wallets={wallets}
      />
    </div>
  );
}
