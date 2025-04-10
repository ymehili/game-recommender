import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/contexts/PreferencesContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Recommender | Powered by Gemini",
  description: "Get personalized video game recommendations based on your preferences using Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 min-h-screen`}>
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
