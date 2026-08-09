export const ASSETS = ["Or", "Bitcoin", "EURUSD"];
export const DIRECTIONS = ["Achat", "Vente"];
export const STRUCTURES = ["BOS haussier", "BOS baissier", "CHoCH haussier", "CHoCH baissier"];
export const ZONES = ["Discount", "Equilibrium", "Premium"];
export const RESULTS = ["En cours", "Gain", "Perte", "BE"];

export const emptyForm = {
  asset: "Or",
  direction: "Vente",
  date: new Date().toISOString().slice(0, 10),
  structure: "BOS baissier",
  zone: "Premium",
  liquiditySwept: true,
  liquidityNote: "",
  obFresh: true,
  entry: "",
  sl: "",
  tp: "",
  exit: "",
  result: "En cours",
  notes: "",
};