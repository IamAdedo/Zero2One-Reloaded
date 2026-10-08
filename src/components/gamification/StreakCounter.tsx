import { Flame, Snowflake } from "lucide-react";
import { streakMultiplier } from "@/lib/gamification/rules";

export interface StreakCounterProps {
  currentStreak: number;
  maxStreak: number;
  freezeTokens: number;
  xp: number;
  variant?: "compact" | "card";
}

function multiplierLabel(streak: number): string | null {
  const mult = streakMultiplier(streak);
  return mult > 1 ? `${mult.toFixed(1)}x XP` : null;
}

export function StreakCounter({
  currentStreak,
  maxStreak,
  freezeTokens,
  xp,
  variant = "compact",
}: StreakCounterProps) {
  const mult = multiplierLabel(currentStreak);

  if (variant === "compact") {
    return (
      <span className="flex items-center gap-3 font-mono text-xs">
        <span
          className={`flex items-center gap-1 ${currentStreak > 0 ? "text-orange-400" : "text-muted-foreground"}`}
          title={`${maxStreak}-day best`}
        >
          <Flame className="size-3.5" />
          {currentStreak}
        </span>
        <span
          className="flex items-center gap-1 text-sky-300"
          title="Streak freeze tokens"
        >
          <Snowflake className="size-3.5" />
          {freezeTokens}
        </span>
        <span className="text-amber-300" title={mult ?? "base XP rate"}>
          {xp} XP{mult ? ` · ${mult}` : ""}
        </span>
      </span>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Flame
          className={`size-5 ${currentStreak > 0 ? "text-orange-400" : "text-muted-foreground"}`}
        />
        <p className="text-2xl font-bold">
          {currentStreak}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            day{currentStreak === 1 ? "" : "s"}
          </span>
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Snowflake className="size-3.5 text-sky-300" />
          {freezeTokens} freeze
        </span>
        <span>best {maxStreak}</span>
        <span className="text-amber-300">{xp} XP</span>
      </div>
      {mult && (
        <p className="mt-2 font-mono text-[11px] text-emerald-400">
          {mult} active — keep the streak alive
        </p>
      )}
      {currentStreak === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Pass a drill to start your streak.
        </p>
      )}
    </div>
  );
}
