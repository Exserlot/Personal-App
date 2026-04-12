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
        <div className="min-h-screen bg-gradient-to-br from-rose-100/50 via-purple-50/50 to-sky-100/50 dark:from-rose-950/20 dark:via-purple-900/10 dark:to-sky-950/20 relative overflow-x-hidden">
          {/* Ambient Mesh Gradients */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 dark:from-primary/20 dark:to-purple-500/20 blur-[120px] opacity-70" />
             <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-gradient-to-bl from-rose-500/30 to-purple-500/30 dark:from-rose-500/20 dark:to-purple-500/20 blur-[120px] opacity-70" />
             <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-gradient-to-tr from-secondary/30 to-sky-500/30 dark:from-secondary/20 dark:to-sky-500/20 blur-[120px] opacity-70" />
          </div>

          <div className="relative z-10 w-full flex flex-col min-h-screen">
            <MobileHeader />
            <Sidebar />
            <SidebarLayout>
              {children}
            </SidebarLayout>
            <MobileNav />
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}

