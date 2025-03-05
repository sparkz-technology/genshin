import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import SessionProviderClient from "@/components/ui/session-provider-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Genshin Impact Redeem Code Tracker",
  description: "Track and manage your Genshin Impact redeem codes with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased mx-6`}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <TooltipProvider>
            <main className="min-h-screen">
              <SessionProviderClient>{children}</SessionProviderClient>
            </main>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
