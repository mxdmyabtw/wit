import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { title: "text-base", wit: "text-[8px]" },
    md: { title: "text-xl", wit: "text-[10px]" },
    lg: { title: "text-3xl", wit: "text-xs" },
  };
  const s = sizes[size];

  return (
    <Link href="/" className="flex flex-col items-center group">
      <span
        className={`${s.title} font-bold tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors font-heading`}
      >
        Win is Key
      </span>
      <span
        className={`${s.wit} tracking-[0.4em] text-amber-500/90 uppercase font-heading`}
      >
        WIT
      </span>
    </Link>
  );
}
