import { CheckCircle2, X } from "lucide-react";
import type { Drill } from "@/lib/domain/types";

export interface PassFeedbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drill: Drill;
  xpEarned: number;
  firstTry: boolean;
  attempts: number;
  passedCount: number;
  totalCount: number;
}

export function PassFeedbackModal({
  open,
  onOpenChange,
  drill,
  xpEarned,
  firstTry,
  attempts,
  passedCount,
  totalCount,
}: PassFeedbackProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-lg border border-emerald-500/30 bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="size-5" />
            <h2 className="font-semibold">Drill passed</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close feedback"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="font-mono text-xs text-muted-foreground">{drill.title}</p>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border border-border/60 p-2">
            <dt className="font-mono text-[10px] uppercase text-muted-foreground">XP</dt>
            <dd className="font-mono text-lg font-bold text-amber-300">+{xpEarned}</dd>
          </div>
          <div className="rounded-md border border-border/60 p-2">
            <dt className="font-mono text-[10px] uppercase text-muted-foreground">Tests</dt>
            <dd className="font-mono text-lg font-bold">
              {passedCount}/{totalCount}
            </dd>
          </div>
          <div className="rounded-md border border-border/60 p-2">
            <dt className="font-mono text-[10px] uppercase text-muted-foreground">Tries</dt>
            <dd className="font-mono text-lg font-bold">{attempts}</dd>
          </div>
        </dl>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            {firstTry
              ? "Clean first-try pass — first-try bonus applied."
              : `Solved in ${attempts} attempts — persistence counts.`}
          </li>
          <li>
            {drill.content.hiddenTestCount > 0
              ? `Held up against ${drill.content.hiddenTestCount} hidden specification${drill.content.hiddenTestCount === 1 ? "" : "s"} — including edge cases.`
              : "All visible assertions green."}
          </li>
          <li>
            Takeaway: keep logic pure and I/O at the edges so every assertion
            sees the same behavior.
          </li>
        </ul>
        <button
          onClick={() => onOpenChange(false)}
          className="w-full rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Keep going
        </button>
      </div>
    </div>
  );
}
