import { useState } from "react";

const inputStyle = {
  background: "var(--surface2)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
};

export default function SignupForm({ onSignup, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    const { error } = await onSignup(email, password);
    setSubmitting(false);

    if (error) {
      setError(traduireErreur(error.message));
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div
        className="w-full max-w-sm mx-auto rounded-lg p-6 space-y-3 text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Compte créé
        </h1>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Tu peux maintenant te connecter avec ton email et ton mot de passe.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="w-full rounded-md py-2 text-sm font-semibold"
          style={{ background: "var(--gold)", color: "#0B0E13" }}
        >
          Aller à la connexion
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto rounded-lg p-6 space-y-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div>
        <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Créer un compte
        </h1>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Démarre ton journal SMC
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

      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
          Confirmer le mot de passe
        </span>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {submitting ? "Création…" : "Créer mon compte"}
      </button>

      <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>
        Déjà un compte ?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="underline"
          style={{ color: "var(--gold)" }}
        >
          Se connecter
        </button>
      </p>
    </form>
  );
}

function traduireErreur(message) {
  if (message.includes("already registered")) return "Cet email est déjà utilisé.";
  if (message.includes("invalid")) return "Email invalide.";
  return "Une erreur est survenue. Réessaie.";
}