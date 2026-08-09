export function computeR(t) {
  if (t.result === "BE") return 0;
  if (t.result !== "Gain" && t.result !== "Perte") return null;
  const entry = parseFloat(t.entry), sl = parseFloat(t.sl), exit = parseFloat(t.exit);
  if (isNaN(entry) || isNaN(sl) || isNaN(exit)) return null;
  let risk, reward;
  if (t.direction === "Achat") {
    risk = entry - sl;
    reward = exit - entry;
  } else {
    risk = sl - entry;
    reward = entry - exit;
  }
  if (!risk || risk <= 0) return null;
  return reward / risk;
}

export function computeStats(list) {
  const decisive = list.filter((t) => t.result === "Gain" || t.result === "Perte");
  const wins = list.filter((t) => t.result === "Gain").length;
  const closed = list.filter((t) => t.result === "Gain" || t.result === "Perte" || t.result === "BE");
  const rValues = closed.map(computeR).filter((r) => r !== null);
  const totalR = rValues.reduce((a, b) => a + b, 0);
  return {
    total: list.length,
    open: list.filter((t) => t.result === "En cours").length,
    winRate: decisive.length ? (wins / decisive.length) * 100 : null,
    totalR,
    avgR: rValues.length ? totalR / rValues.length : null,
    rCount: rValues.length,
  };
}

export function groupWinRate(list, keyFn, labels) {
  const groups = {};
  labels.forEach((l) => (groups[l] = { wins: 0, losses: 0 }));
  list.forEach((t) => {
    if (t.result !== "Gain" && t.result !== "Perte") return;
    const k = keyFn(t);
    if (!groups[k]) groups[k] = { wins: 0, losses: 0 };
    if (t.result === "Gain") groups[k].wins++;
    else groups[k].losses++;
  });
  return labels.map((l) => {
    const g = groups[l] || { wins: 0, losses: 0 };
    const total = g.wins + g.losses;
    return { label: l, total, winRate: total ? (g.wins / total) * 100 : null };
  });
}

export function buildEquityCurve(list) {
  const closed = list
    .filter((t) => t.result === "Gain" || t.result === "Perte" || t.result === "BE")
    .slice()
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  let cum = 0;
  const points = [{ x: 0, y: 0 }];
  closed.forEach((t, i) => {
    const r = computeR(t) ?? 0;
    cum += r;
    points.push({ x: i + 1, y: cum });
  });
  return points;
}