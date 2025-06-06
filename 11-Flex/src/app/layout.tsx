import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";

import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";

import { ThemeProvider } from "@/components/ui/theme-provider"

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Flex",
  title: "Flex",
  description: "Your next-generation decentralized portfolio AI manager.",
  icons: {
    icon: "/logo/flex-logo-dark.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.className} suppressHydrationWarning>
      <body>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          
          <WalletProvider>
            <ReactQueryProvider>
              <div id="root">{children}</div>
              <WrongNetworkAlert />
              <Toaster />
            </ReactQueryProvider>
          </WalletProvider>

        </ThemeProvider>
      </body>
    </html>
  );
}
