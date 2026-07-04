import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TanstackProvider } from "@/components/providers/tanstack-provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneMinute Logs",
  description: "Production-ready logs in under a minute.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider ui={ui}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            <Toaster reverseOrder position="top-center"/>
            <TanstackProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </TanstackProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
