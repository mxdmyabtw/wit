import { MatchCard } from "@/components/MatchCard";
import { matches } from "@/data/matches";

export default function MatchesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-100 font-heading mb-6">
        Tous les matchs
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => (
          <MatchCard key={m.id} {...m} />
        ))}
      </div>
    </div>
  );
}
