export function fmt(asset, val) {
  const n = parseFloat(val);
  if (val === "" || val === null || val === undefined || isNaN(n)) return "—";
  return asset === "EURUSD" ? n.toFixed(5) : n.toFixed(2);
}

export function toDisplayDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}