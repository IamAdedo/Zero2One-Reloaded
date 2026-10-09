import { useState, type FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { askCoach } from "@/server-fns/coach";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface ChatMsg {
  role: "user" | "coach";
  text: string;
}

const QUICK_PROMPTS = [
  "Give me a study plan",
  "I am stuck on a failing test",
  "Explain the current concept",
];

export function CoachChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const xp = useWorkspaceStore((s) => s.xp);

  async function send(text: string): Promise<void> {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setBusy(true);
    try {
      const res = await askCoach({ data: { message, context: { xpTotal: xp } } });
      setMessages((m) => [...m, { role: "coach", text: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "coach", text: "Coach is unreachable right now — try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="flex h-96 w-80 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <p className="font-mono text-xs font-semibold">
              Coach <span className="text-emerald-400">● online</span>
            </p>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close coach"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Stuck? Ask for a hint — never a full solution.
                </p>
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => void send(q)}
                    className="block w-full rounded-md border border-border/60 px-3 py-1.5 text-left text-xs hover:border-primary"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <p
                key={i}
                className={`whitespace-pre-wrap rounded-md px-3 py-2 ${
                  m.role === "user"
                    ? "ml-6 bg-primary/15 text-foreground"
                    : "mr-6 bg-muted/40 text-muted-foreground"
                }`}
              >
                {m.text}
              </p>
            ))}
            {busy && (
              <p className="font-mono text-xs text-muted-foreground">
                thinking...
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a hint..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        aria-label="Toggle coach"
      >
        <MessageCircle className="size-5" />
      </button>
    </div>
  );
}
