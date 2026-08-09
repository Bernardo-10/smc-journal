export default function ResultBadge({ result }) {
  const map = {
    Gain: { bg: "var(--bull)", text: "#0B0E13" },
    Perte: { bg: "var(--bear)", text: "#0B0E13" },
    BE: { bg: "var(--text-faint)", text: "#0B0E13" },
    "En cours": { bg: "var(--surface2)", text: "var(--text-dim)" },
  };
  const s = map[result] || map["En cours"];
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
      style={{ background: s.bg, color: s.text }}
    >
      {result}
    </span>
  );
}