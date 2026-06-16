import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import MascotHelper from "@/components/MascotHelper";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "PactForge Protocol | Trustless Escrow on Bitcoin L2",
  description: "Forge trustless agreements on Bitcoin. Decentralized escrow, milestone payments, and dispute resolution powered by Stacks smart contracts.",
  keywords: ["PactForge", "Stacks", "Bitcoin L2", "escrow", "smart contracts", "Clarity", "milestone payments"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "PactForge Protocol",
    description: "Trustless Escrow & Milestone Payments on Bitcoin L2",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
  other: {
    "talentapp:project_verification": "6372d6c7bde2313837fd05ee779de95a2d9ee4d9cb6914a3c37f51fc50271c9183137eb4c9809f42976284720091535c3eaf356a9605af5eade018a9257800a8",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Providers>
            <Navbar />
            <main>{children}</main>
            <MascotHelper />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
