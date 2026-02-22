"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CoinsContextType {
  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  bets: Bet[];
  placeBet: (matchId: string, amount: number, prediction: "team1" | "team2", matchTitle?: string) => void;
}

interface Bet {
  id: string;
  matchId: string;
  amount: number;
  prediction: "team1" | "team2";
  status: "pending" | "won" | "lost";
  matchTitle: string;
}

const CoinsContext = createContext<CoinsContextType | undefined>(undefined);

const STORAGE_KEY = "wit-coins";
const BETS_KEY = "wit-bets";
const INITIAL_COINS = 1000;

export function CoinsProvider({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState(INITIAL_COINS);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedBets = localStorage.getItem(BETS_KEY);
    if (saved) setCoins(parseInt(saved, 10));
    if (savedBets) setBets(JSON.parse(savedBets));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, coins.toString());
  }, [coins, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(BETS_KEY, JSON.stringify(bets));
  }, [bets, loaded]);

  const addCoins = (amount: number) => setCoins((c) => c + amount);
  const spendCoins = (amount: number) => {
    if (coins >= amount) {
      setCoins((c) => c - amount);
      return true;
    }
    return false;
  };

  const placeBet = (
    matchId: string,
    amount: number,
    prediction: "team1" | "team2",
    matchTitle?: string
  ) => {
    if (!spendCoins(amount)) return;
    const bet: Bet = {
      id: `bet-${Date.now()}`,
      matchId,
      amount,
      prediction,
      status: "pending",
      matchTitle: matchTitle || `Match ${matchId}`,
    };
    setBets((prev) => [...prev, bet]);
  };

  return (
    <CoinsContext.Provider
      value={{ coins, addCoins, spendCoins, bets, placeBet }}
    >
      {children}
    </CoinsContext.Provider>
  );
}

export function useCoins() {
  const ctx = useContext(CoinsContext);
  if (!ctx) throw new Error("useCoins must be used within CoinsProvider");
  return ctx;
}
