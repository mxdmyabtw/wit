import Link from "next/link";
import { games } from "@/data/games";

export default function GamesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-100 font-heading mb-6">
        Jeux
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {games.map((g) => (
          <Link
            key={g.id}
            href={`/matches?game=${g.id}`}
            className={`rounded-xl p-8 bg-gradient-to-br ${g.color} border border-zinc-800 hover:border-amber-500/40 transition-all text-center group`}
          >
            <span className="text-5xl group-hover:scale-110 transition-transform block">
              {g.icon}
            </span>
            <p className="mt-3 font-semibold text-zinc-200">{g.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
