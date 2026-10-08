import { Link } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth";

export function AuthButton() {
  const { user, loading, configured, signOut } = useAuth();

  if (loading) {
    return (
      <span className="font-mono text-xs text-muted-foreground">...</span>
    );
  }
  if (!configured || !user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 font-mono text-xs hover:border-primary hover:text-foreground"
      >
        <LogIn className="size-3.5" />
        Log in
      </Link>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate font-mono text-xs text-muted-foreground sm:inline">
        {user.email}
      </span>
      <button
        onClick={() => void signOut()}
        className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 font-mono text-xs hover:border-primary hover:text-foreground"
      >
        <LogOut className="size-3.5" />
        Out
      </button>
    </span>
  );
}
