import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Keyboard } from "lucide-react";

export interface ShortcutEntry {
  keys: string;
  description: string;
}

export interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutEntry[];
}

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Test execution",
    shortcuts: [{ keys: "Ctrl/⌘ + Enter", description: "Run drill test suite" }],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: "Ctrl/⌘ + K", description: "Open global search" },
      { keys: "Alt + D", description: "Go to dashboard" },
      { keys: "Alt + T", description: "Go to career tracks" },
      { keys: "Alt + L", description: "Go to leaderboard" },
      { keys: "Alt + H", description: "Go home" },
    ],
  },
  {
    title: "Help",
    shortcuts: [{ keys: "?", description: "Toggle this shortcuts panel" }],
  },
];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || target.isContentEditable) return true;
  return target.closest(".monaco-editor") !== null;
}

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "?" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      if (isTypingTarget(e.target)) return;
      const to =
        e.key.toLowerCase() === "d"
          ? "/dashboard"
          : e.key.toLowerCase() === "t"
            ? "/tracks"
            : e.key.toLowerCase() === "l"
              ? "/leaderboard"
              : e.key.toLowerCase() === "h"
                ? "/"
                : null;
      if (to) {
        e.preventDefault();
        void navigate({ to });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded px-2 py-1 font-mono text-xs text-muted-foreground hover:text-foreground"
        title="Keyboard shortcuts (?)"
        aria-label="Open keyboard shortcuts"
      >
        <Keyboard className="size-3.5" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-mono text-sm font-semibold">
              Keyboard shortcuts
            </h2>
            <div className="mt-4 space-y-4">
              {SHORTCUT_GROUPS.map((g) => (
                <div key={g.title}>
                  <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {g.title}
                  </h3>
                  <ul className="mt-1 space-y-1">
                    {g.shortcuts.map((s) => (
                      <li key={s.keys + s.description} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s.description}</span>
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                          {s.keys}
                        </kbd>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
