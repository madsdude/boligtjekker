import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthHeader } from "./components/AuthHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boligtjekker AI",
  description: "AI-powered home analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthHeader />
        {children}
      </body>
    </html>
  );
}
