import { useAuth } from "./hooks/useAuth";
import AuthScreen from "./components/auth/AuthScreen";
import SMCJournal from "./SMCJournal";

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "var(--bg)", color: "var(--text-dim)" }}
      >
        Chargement…
      </div>
    );
  }

  if (!user) {
    return <AuthScreen signIn={signIn} signUp={signUp} />;
  }

  return <SMCJournal user={user} onLogout={signOut} />;
}