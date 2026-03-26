import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { AuthProvider } from "@/components/auth/auth-provider";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <MobileHeader />
          <Sidebar />
          <SidebarLayout>
            {children}
          </SidebarLayout>
          <MobileNav />
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}

