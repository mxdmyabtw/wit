"use client";

import { useCoins } from "@/context/CoinsContext";

export default function ProfilePage() {
  const { coins, bets, addCoins } = useCoins();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-100 font-heading mb-6">
        Mon profil
      </h1>

      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">
          Solde de pièces
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-amber-400 flex items-center gap-2">
            🪙 {coins.toLocaleString()} pièces
          </span>
          <button
            onClick={() => addCoins(500)}
            className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm"
          >
            + 500 pièces (test)
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">
          Mes paris
        </h2>
        {bets.length === 0 ? (
          <p className="text-zinc-500">Aucun pari pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {bets.map((bet) => (
              <li
                key={bet.id}
                className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
              >
                <div>
                  <p className="text-zinc-200">{bet.matchTitle}</p>
                  <p className="text-xs text-zinc-500">
                    {bet.amount} pièces · {bet.prediction === "team1" ? "Équipe 1" : "Équipe 2"}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    bet.status === "won"
                      ? "text-green-500"
                      : bet.status === "lost"
                      ? "text-red-500"
                      : "text-amber-500"
                  }`}
                >
                  {bet.status === "pending" && "En cours"}
                  {bet.status === "won" && "Gagné"}
                  {bet.status === "lost" && "Perdu"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
