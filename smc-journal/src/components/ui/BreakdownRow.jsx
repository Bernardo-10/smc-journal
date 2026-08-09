export default function BreakdownRow({ label, total, winRate }) {
  const pct = winRate === null ? 0 : Math.round(winRate);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-28 shrink-0 truncate" style={{ color: "var(--text-dim)" }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: winRate === null ? "0%" : `${pct}%`,
            background: winRate === null ? "var(--text-faint)" : pct >= 50 ? "var(--bull)" : "var(--bear)",
          }}
        />
      </div>
      <span
        className="text-xs w-16 text-right shrink-0"
        style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
      >
        {winRate === null ? "—" : `${pct}%`}
      </span>
      <span className="text-[10px] w-10 text-right shrink-0" style={{ color: "var(--text-faint)" }}>
        n={total}
      </span>
    </div>
  );
}