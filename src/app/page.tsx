import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MatchCard } from "@/components/MatchCard";
import { matches } from "@/data/matches";
import { games } from "@/data/games";
import { streamers } from "@/data/streamers";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="text-center py-16">
        <Logo size="lg" />
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-zinc-100 font-heading">
          JOINS-NOUS ET DOMINE
        </h1>
        <p className="mt-2 text-zinc-400 max-w-xl mx-auto">
          Parie tes pièces virtuelles sur les matchs. Gagne, monte en niveau, prouve que Win is Key.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-center">
          <div className="px-6 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-2xl font-bold text-amber-400">1,234</span>
            <p className="text-xs text-zinc-500 mt-1">Joueurs inscrits</p>
          </div>
          <div className="px-6 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-2xl font-bold text-amber-400">12,500</span>
            <p className="text-xs text-zinc-500 mt-1">Pièces distribuées</p>
          </div>
        </div>
      </section>

      {/* Matchs à la une */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-100 font-heading">Matchs</h2>
          <Link
            href="/matches"
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.slice(0, 6).map((m) => (
            <MatchCard key={m.id} {...m} />
          ))}
        </div>
      </section>

      {/* Jeux */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-100 font-heading">Jeux</h2>
          <Link
            href="/games"
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {games.map((g) => (
            <Link
              key={g.id}
              href={`/games?game=${g.id}`}
              className={`rounded-xl p-6 bg-gradient-to-br ${g.color} border border-zinc-800 hover:border-amber-500/30 transition-all text-center`}
            >
              <span className="text-4xl">{g.icon}</span>
              <p className="mt-2 text-sm font-medium text-zinc-200">{g.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Streamers */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-100 font-heading">
            Streamers
          </h2>
          <Link
            href="/streamers"
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {streamers.map((s) => (
            <div
              key={s.id}
              className="rounded-xl p-4 bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-xl font-bold text-amber-400">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-zinc-100">{s.name}</p>
                  <p className="text-xs text-zinc-500">{s.game}</p>
                  {s.live && (
                    <span className="text-xs text-red-500 font-medium">
                      ● {s.viewers}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer avec WIT */}
      <footer className="mt-20 py-8 border-t border-zinc-800 text-center">
        <Logo size="sm" />
        <p className="mt-4 text-xs text-zinc-600">
          © 2025 Win is Key — Paris en pièces virtuelles uniquement
        </p>
      </footer>
    </div>
  );
}
