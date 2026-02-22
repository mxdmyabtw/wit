"use client";

import Link from "next/link";
import { useCoins } from "@/context/CoinsContext";

export function Header() {
  const { coins } = useCoins();

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/matches", label: "Matchs" },
    { href: "/games", label: "Jeux" },
    { href: "/streamers", label: "Streamers" },
    { href: "/rules", label: "Règles" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0f14]/95 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start group">
            <span className="text-xl font-bold tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
              Win is Key
            </span>
            <span
              className="text-[10px] font-['Orbitron'] tracking-[0.35em] text-amber-500/80 uppercase"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              WIT
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-amber-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Coins + Auth */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-amber-400 text-lg">🪙</span>
              <span className="font-bold text-amber-400 tabular-nums">
                {coins.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500">pièces</span>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 rounded-lg bg-amber-500 text-[#0d0f14] font-semibold hover:bg-amber-400 transition-colors text-sm"
            >
              Profil
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
