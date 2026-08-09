import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

// Conversion DB (snake_case) -> App (camelCase)
function fromDb(row) {
  return {
    id: row.id,
    asset: row.asset,
    direction: row.direction,
    date: row.date,
    structure: row.structure,
    zone: row.zone,
    liquiditySwept: row.liquidity_swept,
    liquidityNote: row.liquidity_note ?? "",
    obFresh: row.ob_fresh,
    entry: row.entry ?? "",
    sl: row.sl ?? "",
    tp: row.tp ?? "",
    exit: row.exit ?? "",
    result: row.result,
    notes: row.notes ?? "",
  };
}

// Conversion App (camelCase) -> DB (snake_case)
function toDb(form, userId) {
  return {
    user_id: userId,
    asset: form.asset,
    direction: form.direction,
    date: form.date,
    structure: form.structure,
    zone: form.zone,
    liquidity_swept: form.liquiditySwept,
    liquidity_note: form.liquidityNote || null,
    ob_fresh: form.obFresh,
    entry: form.entry || null,
    sl: form.sl || null,
    tp: form.tp || null,
    exit: form.exit || null,
    result: form.result,
    notes: form.notes || null,
  };
}

export function useTrades(userId) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const loadTrades = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setNotice("Impossible de charger le journal.");
    } else {
      setTrades(data.map(fromDb));
      setNotice("");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  async function addTrade(form) {
    const { data, error } = await supabase
      .from("trades")
      .insert(toDb(form, userId))
      .select()
      .single();

    if (error) {
      setNotice("Sauvegarde impossible — réessaie dans un instant.");
      return false;
    }
    setTrades((prev) => [fromDb(data), ...prev]);
    setNotice("");
    return true;
  }

  async function updateTrade(id, form) {
    const { data, error } = await supabase
      .from("trades")
      .update(toDb(form, userId))
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setNotice("Modification impossible — réessaie dans un instant.");
      return false;
    }
    setTrades((prev) => prev.map((t) => (t.id === id ? fromDb(data) : t)));
    setNotice("");
    return true;
  }

  async function deleteTrade(id) {
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) {
      setNotice("Suppression impossible — réessaie dans un instant.");
      return false;
    }
    setTrades((prev) => prev.filter((t) => t.id !== id));
    setNotice("");
    return true;
  }

  return { trades, loading, notice, addTrade, updateTrade, deleteTrade };
}