import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
