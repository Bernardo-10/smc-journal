import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthScreen({ signIn, signUp }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{ background: "var(--bg)", fontFamily: "var(--font-body)" }}
    >
      {mode === "login" ? (
        <LoginForm onLogin={signIn} onSwitchToSignup={() => setMode("signup")} />
      ) : (
        <SignupForm onSignup={signUp} onSwitchToLogin={() => setMode("login")} />
      )}
    </div>
  );
}