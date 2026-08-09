export default function SegButton({ options, value, onChange }) {
  return (
    <div className="flex rounded-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => onChange(opt)}
          className="flex-1 px-2 py-1.5 text-xs transition-colors"
          style={{
            background: value === opt ? "var(--gold)" : "transparent",
            color: value === opt ? "#0B0E13" : "var(--text-dim)",
            fontWeight: value === opt ? 600 : 400,
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}