import { useState } from "react";

const inputStyle = {
  background: "var(--surface2)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
};

export default function LoginForm({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await onLogin(email, password);
    setSubmitting(false);
    if (error) setError(traduireErreur(error.message));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto rounded-lg p-6 space-y-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div>
        <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Connexion
        </h1>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Accède à ton journal SMC
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md px-3 py-2 text-sm"
          style={inputStyle}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
          Mot de passe
        </span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md px-3 py-2 text-sm"
          style={inputStyle}
        />
      </label>

      {error && (
        <p className="text-xs" style={{ color: "var(--bear)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md py-2 text-sm font-semibold disabled:opacity-50"
        style={{ background: "var(--gold)", color: "#0B0E13" }}
      >
        {submitting ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>
        Pas encore de compte ?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="underline"
          style={{ color: "var(--gold)" }}
        >
          Créer un compte
        </button>
      </p>
    </form>
  );
}

function traduireErreur(message) {
  if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (message.includes("Email not confirmed")) return "Confirme ton email avant de te connecter.";
  return "Une erreur est survenue. Réessaie.";
}