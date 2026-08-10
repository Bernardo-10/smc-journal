export default function RiskRewardRail({ direction, entry, sl, tp }) {
  const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp);
  const valid = !isNaN(e) && !isNaN(s) && !isNaN(t);
  let risk, reward;
  if (valid) {
    if (direction === "Achat") {
      risk = e - s;
      reward = t - e;
    } else {
      risk = s - e;
      reward = e - t;
    }
  }
  const ok = valid && risk > 0 && reward > 0;

  if (!ok) {
    return (
      <div
        className="w-16 h-36 rounded-lg flex items-center justify-center text-center px-1"
        style={{ border: "1px dashed var(--border)" }}
      >
        <span className="text-[9px] leading-tight" style={{ color: "var(--text-faint)" }}>
          Entrée / SL / TP
        </span>
      </div>
    );
  }

  const riskPct = (risk / (risk + reward)) * 100;
  const rewardPct = 100 - riskPct;
  const rr = (reward / risk).toFixed(2);
  const topLabel = direction === "Achat" ? "TP" : "SL";
  const bottomLabel = direction === "Achat" ? "SL" : "TP";
  const topFlex = direction === "Achat" ? rewardPct : riskPct;
  const bottomFlex = direction === "Achat" ? riskPct : rewardPct;
  const topColor = direction === "Achat" ? "var(--bull)" : "var(--bear)";
  const bottomColor = direction === "Achat" ? "var(--bear)" : "var(--bull)";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-36 rounded-lg overflow-hidden flex flex-col" style={{ border: "1px solid var(--border)" }}>
        <div
          className="flex items-start justify-center pt-1"
          style={{ flexGrow: topFlex, background: `${topColor}33`, minHeight: 4 }}
        >
          <span className="text-[9px] font-semibold" style={{ color: topColor }}>
            {topLabel}
          </span>
        </div>
        <div className="h-px" style={{ background: "var(--gold)" }} />
        <div
          className="flex items-end justify-center pb-1"
          style={{ flexGrow: bottomFlex, background: `${bottomColor}33`, minHeight: 4 }}
        >
          <span className="text-[9px] font-semibold" style={{ color: bottomColor }}>
            {bottomLabel}
          </span>
        </div>
      </div>
      <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>
        R:R {rr}
      </span>
    </div>
  );
}