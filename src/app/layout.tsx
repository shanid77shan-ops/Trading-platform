import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeHub - Trading Platform",
  description: "Professional mobile trading platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b121c",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-[#0b121c] antialiased">
        <AppProviders cookies={cookies}>
          <div className="mx-auto min-h-screen max-w-lg bg-[#0b121c]">
            {children}
          </div>
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
