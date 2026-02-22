import { streamers } from "@/data/streamers";

export default function StreamersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-100 font-heading mb-6">
        Streamers
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {streamers.map((s) => (
          <div
            key={s.id}
            className="rounded-xl p-5 bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl font-bold text-amber-400">
                {s.name[0]}
              </div>
              <div>
                <p className="font-semibold text-zinc-100 text-lg">{s.name}</p>
                <p className="text-sm text-zinc-500">{s.game}</p>
                {s.live && (
                  <span className="inline-block mt-1 text-sm text-red-500 font-medium">
                    ● {s.viewers} viewers
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
