import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/actions/settings";

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description: "Minimalist Personal Management Dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Workspace",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let initialTheme: "light" | "dark" | "system" = "system";

  if (session?.user?.id) {
    try {
      const settings = await getSettings(session.user.id);
      initialTheme = settings.theme;
    } catch {
      // ignore
    }
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme={initialTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
