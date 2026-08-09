export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-xs"
      style={{ color: "var(--text-dim)" }}
    >
      <span
        className="w-9 h-5 rounded-full relative transition-colors shrink-0"
        style={{ background: checked ? "var(--gold)" : "var(--surface2)", border: "1px solid var(--border)" }}
      >
        <span
          className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all"
          style={{ background: "#0B0E13", left: checked ? "18px" : "2px" }}
        />
      </span>
      {label}
    </button>
  );
}