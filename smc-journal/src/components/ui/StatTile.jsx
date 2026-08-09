export default function StatTile({ label, value, sub }) {
  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-1 min-w-0"
      style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
    >
      <span className="text-[10px] tracking-widest uppercase truncate" style={{ color: "var(--text-faint)" }}>
        {label}
      </span>
      <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>
        {value}
      </span>
      {sub && (
        <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}