import { useTrades } from "./hooks/useTrades";
import React, { useState, useEffect, useMemo } from "react";
import { Plus, X, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { ASSETS, DIRECTIONS, STRUCTURES, ZONES, RESULTS, emptyForm } from "./constants";
import { fmt, toDisplayDate } from "./utils/format";
import { computeR, computeStats, groupWinRate, buildEquityCurve } from "./utils/stats";
import StatTile from "./components/ui/StatTile";
import BreakdownRow from "./components/ui/BreakdownRow";
import Toggle from "./components/ui/Toggle";
import SegButton from "./components/ui/SegButton";
import Field from "./components/ui/Field";
import ResultBadge from "./components/ui/ResultBadge";



function EquityCurve({ trades }) {
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


const inputStyle = {
  background: "var(--surface2)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
};

function RiskRewardRail({ direction, entry, sl, tp }) {
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


export default function SMCJournal({ user, onLogout }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filterAsset, setFilterAsset] = useState("Tous");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const { trades, loading, notice, addTrade, updateTrade, deleteTrade } = useTrades(user?.id);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(false);
  }

  function startEdit(t) {
    setForm({ ...t });
    setEditingId(t.id);
    setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const success = editingId
      ? await updateTrade(editingId, form)
      : await addTrade(form);
    if (success) resetForm();
}

  async function handleDelete(id) {
    if (confirmDeleteId !== id) {
        setConfirmDeleteId(id);
        return;
    }
    await deleteTrade(id);
    setConfirmDeleteId(null);
}

  const filtered = useMemo(() => {
    const list = filterAsset === "Tous" ? trades : trades.filter((t) => t.asset === filterAsset);
    return list.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id));
  }, [trades, filterAsset]);

  const stats = useMemo(() => computeStats(trades), [trades]);
  const byAsset = useMemo(() => groupWinRate(trades, (t) => t.asset, ASSETS), [trades]);
  const byLiquidity = useMemo(
    () => groupWinRate(trades, (t) => (t.liquiditySwept ? "Balayée" : "Non balayée"), ["Balayée", "Non balayée"]),
    [trades]
  );
  const byZone = useMemo(() => groupWinRate(trades, (t) => t.zone, ZONES), [trades]);
  const byOb = useMemo(
    () => groupWinRate(trades, (t) => (t.obFresh ? "OB frais" : "OB mitigé"), ["OB frais", "OB mitigé"]),
    [trades]
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "var(--bg)",
        fontFamily: "var(--font-body)",
        color: "var(--text)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        :root {
          --bg: #0B0E13;
          --surface: #131820;
          --surface2: #1A2029;
          --border: #262E3A;
          --text: #E7ECF2;
          --text-dim: #8B96A5;
          --text-faint: #5C6673;
          --bull: #35C79A;
          --bear: #F0685F;
          --gold: #D8A54B;
          --font-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
          --font-body: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
          --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
        input:focus, select:focus, textarea:focus { outline: 2px solid var(--gold); outline-offset: 1px; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <header className="mb-6 flex items-start justify-between gap-4">
        <div>
            <div className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--gold)", fontFamily: "var(--font-mono)" }}>
            OB · Structure · Liquidité · Equilibrium
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Journal SMC
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            Or · Bitcoin · EURUSD — suivi des exécutions selon tes 4 critères
            </p>
        </div>
        <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 rounded-md shrink-0"
            style={{ border: "1px solid var(--border)", color: "var(--text-dim)" }}
        >
            Déconnexion
        </button>
        </header>

        {/* Stats overview */}
        <section className="mb-6 space-y-3">
          <EquityCurve trades={trades} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatTile label="Trades" value={stats.total} sub={`${stats.open} en cours`} />
            <StatTile label="Win rate" value={stats.winRate === null ? "—" : `${stats.winRate.toFixed(0)}%`} />
            <StatTile label="R total" value={stats.rCount ? `${stats.totalR >= 0 ? "+" : ""}${stats.totalR.toFixed(2)}R` : "—"} />
            <StatTile label="R moyen" value={stats.avgR === null ? "—" : `${stats.avgR >= 0 ? "+" : ""}${stats.avgR.toFixed(2)}R`} sub={`sur ${stats.rCount} trades`} />
          </div>
        </section>

        {/* Breakdown by factor */}
        {trades.length > 0 && (
          <section
            className="mb-6 rounded-lg p-4 space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-xs tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>
              Winrate par facteur
            </h2>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gold)" }}>Par actif</p>
              {byAsset.map((g) => (
                <BreakdownRow key={g.label} {...g} />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gold)" }}>Liquidité balayée avant entrée</p>
              {byLiquidity.map((g) => (
                <BreakdownRow key={g.label} {...g} />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gold)" }}>Zone (équilibre)</p>
              {byZone.map((g) => (
                <BreakdownRow key={g.label} {...g} />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gold)" }}>Fraîcheur de l'OB</p>
              {byOb.map((g) => (
                <BreakdownRow key={g.label} {...g} />
              ))}
            </div>
          </section>
        )}

        {/* Add / edit trade */}
        {!formOpen ? (
          <button
            onClick={() => setFormOpen(true)}
            className="mb-6 w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-transform active:scale-[0.99]"
            style={{ background: "var(--gold)", color: "#0B0E13" }}
          >
            <Plus size={16} /> Nouveau trade
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-lg p-4 space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {editingId ? "Modifier le trade" : "Ticket d'ordre"}
              </h2>
              <button type="button" onClick={resetForm} style={{ color: "var(--text-faint)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Actif">
                <select
                  value={form.asset}
                  onChange={(e) => setForm({ ...form, asset: e.target.value })}
                  className="rounded-md px-2 py-1.5 text-sm"
                  style={inputStyle}
                >
                  {ASSETS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Direction">
                <SegButton options={DIRECTIONS} value={form.direction} onChange={(v) => setForm({ ...form, direction: v })} />
              </Field>
            </div>

            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="rounded-md px-2 py-1.5 text-sm"
                style={inputStyle}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Structure">
                <select
                  value={form.structure}
                  onChange={(e) => setForm({ ...form, structure: e.target.value })}
                  className="rounded-md px-2 py-1.5 text-sm"
                  style={inputStyle}
                >
                  {STRUCTURES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Zone">
                <SegButton options={ZONES} value={form.zone} onChange={(v) => setForm({ ...form, zone: v })} />
              </Field>
            </div>

            <div className="flex flex-wrap gap-4">
              <Toggle checked={form.liquiditySwept} onChange={(v) => setForm({ ...form, liquiditySwept: v })} label="Liquidité balayée" />
              <Toggle checked={form.obFresh} onChange={(v) => setForm({ ...form, obFresh: v })} label="OB frais" />
            </div>

            <Field label="Note liquidité (optionnel)">
              <input
                type="text"
                placeholder="ex : EQH balayé, ancien plus bas..."
                value={form.liquidityNote}
                onChange={(e) => setForm({ ...form, liquidityNote: e.target.value })}
                className="rounded-md px-2 py-1.5 text-sm"
                style={inputStyle}
              />
            </Field>

            <div className="flex gap-4 items-start">
              <RiskRewardRail direction={form.direction} entry={form.entry} sl={form.sl} tp={form.tp} />
              <div className="flex-1 grid grid-cols-1 gap-3">
                <Field label="Entrée">
                  <input
                    type="number"
                    step="any"
                    value={form.entry}
                    onChange={(e) => setForm({ ...form, entry: e.target.value })}
                    className="rounded-md px-2 py-1.5 text-sm w-full"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Stop loss">
                  <input
                    type="number"
                    step="any"
                    value={form.sl}
                    onChange={(e) => setForm({ ...form, sl: e.target.value })}
                    className="rounded-md px-2 py-1.5 text-sm w-full"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Take profit">
                  <input
                    type="number"
                    step="any"
                    value={form.tp}
                    onChange={(e) => setForm({ ...form, tp: e.target.value })}
                    className="rounded-md px-2 py-1.5 text-sm w-full"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Résultat">
                <select
                  value={form.result}
                  onChange={(e) => setForm({ ...form, result: e.target.value })}
                  className="rounded-md px-2 py-1.5 text-sm"
                  style={inputStyle}
                >
                  {RESULTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Prix de sortie (optionnel)">
                <input
                  type="number"
                  step="any"
                  value={form.exit}
                  onChange={(e) => setForm({ ...form, exit: e.target.value })}
                  className="rounded-md px-2 py-1.5 text-sm"
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="rounded-md px-2 py-1.5 text-sm resize-none"
                style={inputStyle}
              />
            </Field>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 rounded-md py-2 text-sm font-semibold"
                style={{ background: "var(--gold)", color: "#0B0E13" }}
              >
                {editingId ? "Enregistrer les modifications" : "Ajouter au journal"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 rounded-md text-sm"
                style={{ border: "1px solid var(--border)", color: "var(--text-dim)" }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {notice && (
          <p className="text-xs mb-4" style={{ color: "var(--bear)" }}>
            {notice}
          </p>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {["Tous", ...ASSETS].map((a) => (
            <button
              key={a}
              onClick={() => setFilterAsset(a)}
              className="px-3 py-1 rounded-full text-xs whitespace-nowrap shrink-0"
              style={{
                background: filterAsset === a ? "var(--gold)" : "var(--surface2)",
                color: filterAsset === a ? "#0B0E13" : "var(--text-dim)",
                fontWeight: filterAsset === a ? 600 : 400,
              }}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Trade list */}
        {loading ? (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Chargement du journal…
          </p>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-lg p-6 text-center text-sm"
            style={{ border: "1px dashed var(--border)", color: "var(--text-faint)" }}
          >
            {trades.length === 0
              ? "Aucun trade enregistré. Ajoute ton premier setup avec le ticket ci-dessus."
              : "Aucun trade pour ce filtre."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((t) => {
              const r = computeR(t);
              return (
                <div
                  key={t.id}
                  className="rounded-lg p-3 space-y-2"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {t.direction === "Achat" ? (
                        <TrendingUp size={14} style={{ color: "var(--bull)" }} />
                      ) : (
                        <TrendingDown size={14} style={{ color: "var(--bear)" }} />
                      )}
                      <span className="text-sm font-semibold truncate">{t.asset}</span>
                      <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                        {toDisplayDate(t.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ResultBadge result={t.result} />
                      <button onClick={() => startEdit(t)} style={{ color: "var(--text-faint)" }}>
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        style={{ color: confirmDeleteId === t.id ? "var(--bear)" : "var(--text-faint)" }}
                        title={confirmDeleteId === t.id ? "Cliquer pour confirmer" : "Supprimer"}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-4 gap-1 text-center rounded-md py-1.5"
                    style={{ background: "var(--surface2)", fontFamily: "var(--font-mono)" }}
                  >
                    {[
                      ["Entrée", t.entry],
                      ["SL", t.sl],
                      ["TP", t.tp],
                      ["Sortie", t.exit],
                    ].map(([label, val]) => (
                      <div key={label} className="flex flex-col">
                        <span className="text-[8px] uppercase" style={{ color: "var(--text-faint)" }}>
                          {label}
                        </span>
                        <span className="text-[11px]">{fmt(t.asset, val)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {[t.structure, t.zone, t.liquiditySwept ? "Liquidité balayée" : "Sans sweep", t.obFresh ? "OB frais" : "OB mitigé"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: "var(--surface2)", color: "var(--text-dim)" }}
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>

                  {t.notes && (
                    <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                      {t.notes}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <span
                      className="text-xs font-semibold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: r === null ? "var(--text-faint)" : r >= 0 ? "var(--bull)" : "var(--bear)",
                      }}
                    >
                      {r === null ? "R —" : `${r >= 0 ? "+" : ""}${r.toFixed(2)}R`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}