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

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description: "Minimalist Personal Management Dashboard",
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
