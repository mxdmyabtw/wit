"use client";

import { useState } from "react";
import { useCoins } from "@/context/CoinsContext";
import Link from "next/link";

interface MatchCardProps {
  id: string;
  team1: string;
  team2: string;
  game: string;
  gameIcon?: string;
  live?: boolean;
  time?: string;
}

export function MatchCard({
  id,
  team1,
  team2,
  game,
  gameIcon = "🎮",
  live = false,
  time = "2h",
}: MatchCardProps) {
  const { coins, placeBet, spendCoins } = useCoins();
  const [amount, setAmount] = useState(10);
  const [selected, setSelected] = useState<"team1" | "team2" | null>(null);

  const handleBet = () => {
    if (!selected) return;
    if (spendCoins(amount)) {
      placeBet(id, amount, selected, `${team1} vs ${team2}`);
      setSelected(null);
    }
  };

  const presets = [10, 25, 50, 100, 250, "max"];

  return (
    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/30 transition-all overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            {gameIcon} {game}
          </span>
          {live ? (
            <span className="text-xs font-semibold text-red-500 animate-pulse">
              ● LIVE
            </span>
          ) : (
            <span className="text-xs text-zinc-500">{time}</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setSelected("team1")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              selected === "team1"
                ? "bg-amber-500/20 border-2 border-amber-500 text-amber-400"
                : "bg-zinc-800/50 border border-transparent hover:border-zinc-600"
            }`}
          >
            {team1}
          </button>
          <div className="flex items-center justify-center text-zinc-500 text-xs font-bold">
            VS
          </div>
          <button
            onClick={() => setSelected("team2")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              selected === "team2"
                ? "bg-amber-500/20 border-2 border-amber-500 text-amber-400"
                : "bg-zinc-800/50 border border-transparent hover:border-zinc-600"
            }`}
          >
            {team2}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() =>
                  setAmount(p === "max" ? coins : (p as number))
                }
                className="px-2 py-1 rounded text-xs bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
              >
                {p === "max" ? "Max" : p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:border-amber-500/50 focus:outline-none"
              min={1}
              max={coins}
            />
            <button
              onClick={handleBet}
              disabled={!selected || amount > coins || amount < 1}
              className="px-4 py-2 rounded-lg bg-amber-500 text-[#0d0f14] font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Parier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
