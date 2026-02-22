import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { CoinsProvider } from "@/context/CoinsContext";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Win is Key - Paris en pièces virtuelles",
  description: "Pariez sur des matchs avec des pièces virtuelles. Gagnez, dominez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${orbitron.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#0d0f14] text-zinc-100 min-h-screen`}
      >
        <CoinsProvider>
          <Header />
          <main className="pt-20 min-h-screen">{children}</main>
        </CoinsProvider>
      </body>
    </html>
  );
}
