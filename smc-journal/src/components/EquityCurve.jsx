import { useMemo } from "react";
import { buildEquityCurve } from "../utils/stats";

export default function EquityCurve({ trades }) {
  const pts = useMemo(() => buildEquityCurve(trades), [trades]);
  if (pts.length <= 1) {
    return (
      <div
        className="h-16 flex items-center justify-center text-xs rounded-lg"
        style={{ color: "var(--text-faint)", border: "1px dashed var(--border)" }}
      >
        La courbe apparaîtra après ton premier trade clôturé.
      </div>
    );
  }
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const maxX = Math.max(...xs, 1);
  const maxY = Math.max(...ys, 0.01);
  const minY = Math.min(...ys, -0.01);
  const range = maxY - minY || 1;
  const zeroY = 40 - ((0 - minY) / range) * 40;
  const line = pts.map((p) => `${(p.x / maxX) * 100},${40 - ((p.y - minY) / range) * 40}`).join(" ");
  const last = pts[pts.length - 1].y;
  const stroke = last >= 0 ? "var(--bull)" : "var(--bear)";
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-16">
      <line x1="0" y1={zeroY} x2="100" y2={zeroY} stroke="var(--border)" strokeWidth="0.5" />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}