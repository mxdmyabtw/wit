export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-100 font-heading mb-6">
        Règles
      </h1>
      <div className="space-y-6 text-zinc-300">
        <section>
          <h2 className="text-lg font-semibold text-amber-400 mb-2">
            1. Les pièces virtuelles
          </h2>
          <p>
            Tu reçois 1000 pièces virtuelles à l&apos;inscription. Ces pièces
            n&apos;ont aucune valeur réelle et ne peuvent pas être échangées contre
            de l&apos;argent. Elles servent uniquement au jeu.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-amber-400 mb-2">
            2. Comment parier
          </h2>
          <p>
            Choisis un match, sélectionne l&apos;équipe que tu penses gagnante, entre
            le montant de pièces à miser et valide ton pari. Les gains sont
            crédités une fois le match terminé.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-amber-400 mb-2">
            3. Gains
          </h2>
          <p>
            Si tu gagnes, tu récupères ta mise + un multiplicateur selon les
            cotes. Si tu perds, ta mise est déduite de ton solde.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-amber-400 mb-2">
            4. Comportement
          </h2>
          <p>
            Sois respectueux envers les autres joueurs. Pas de triche, pas de
            manipulation. Win is Key reste un espace fair-play.
          </p>
        </section>
      </div>
    </div>
  );
}
