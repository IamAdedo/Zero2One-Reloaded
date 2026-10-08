import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  browserSupabaseConfig,
  getSupabaseBrowserClient,
} from "@/lib/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const client = getSupabaseBrowserClient(browserSupabaseConfig());

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!client) return;
    setBusy(true);
    try {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        toast.error("Login failed", { description: error.message });
      } else {
        toast.success("Logged in");
        void navigate({ to: "/" });
      }
    } finally {
      setBusy(false);
    }
  }

  if (!client) {
    return (
      <div className="mx-auto max-w-md space-y-3 py-12 text-center">
        <p className="font-mono text-sm text-primary">offline mode</p>
        <h1 className="text-2xl font-bold">Auth not configured</h1>
        <p className="text-sm text-muted-foreground">
          Set <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> to enable login. The app runs on
          local seed data until then.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="space-y-1 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Zero2One Reloaded
        </p>
        <h1 className="text-2xl font-bold">Log in</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1 text-sm">
          <span className="font-mono text-xs text-muted-foreground">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
            autoComplete="email"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-mono text-xs text-muted-foreground">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
