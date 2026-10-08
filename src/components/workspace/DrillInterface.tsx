import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  AlertCircle,
  CheckCircle2,
  EyeOff,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
  XCircle,
  Zap,
} from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { toast } from "sonner";
import type { Drill } from "@/lib/domain/types";
import { xpForPass } from "@/lib/gamification/rules";
import { scoreUnitTests } from "@/lib/quiz/scoring";
import { codeFor, useWorkspaceStore } from "@/store/useWorkspaceStore";

export interface DrillRunVerdict {
  assertionId: string;
  passed: boolean;
  hidden: boolean;
  error?: string;
}

export interface DrillPassInfo {
  xpEarned: number;
  firstTry: boolean;
  attempts: number;
}

export interface DrillInterfaceProps {
  drill: Drill;
  moduleTitle: string;
  xpReward?: number;
  isCapstone?: boolean;
  streakDays?: number;
  onRun: (drill: Drill, code: string) => Promise<DrillRunVerdict[]>;
  onPass?: (info: DrillPassInfo) => void;
}

function fileExtFor(language: string): string {
  switch (language.toLowerCase()) {
    case "python":
      return "py";
    case "typescript":
      return "ts";
    case "go":
      return "go";
    default:
      return "js";
  }
}

function monacoLanguageFor(language: string): string {
  switch (language.toLowerCase()) {
    case "python":
      return "python";
    case "go":
      return "go";
    default:
      return "typescript";
  }
}

export function DrillInterface({
  drill,
  moduleTitle,
  xpReward = 50,
  isCapstone = false,
  streakDays = 0,
  onRun,
  onPass,
}: DrillInterfaceProps) {
  const code = useWorkspaceStore((s) =>
    codeFor(s, drill.id, drill.content.starterCode),
  );
  const updateCode = useWorkspaceStore((s) => s.updateCode);

  const [verdicts, setVerdicts] = useState<DrillRunVerdict[] | null>(null);
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [consoleTab, setConsoleTab] = useState<"results" | "output">("results");

  const grading =
    verdicts === null
      ? null
      : scoreUnitTests(
          verdicts.map((v) => ({
            assertionId: v.assertionId,
            passed: v.passed,
            hidden: v.hidden,
          })),
          xpReward,
        );
  const passedCount = verdicts?.filter((v) => v.passed).length ?? 0;
  const totalCount =
    verdicts?.length ??
    drill.content.visibleTests.length + drill.content.hiddenTestCount;
  const isGreen = grading?.passed ?? false;

  async function handleRun(): Promise<void> {
    if (running) return;
    setRunning(true);
    try {
      const results = await onRun(drill, code);
      setVerdicts(results);
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      const grade = scoreUnitTests(
        results.map((v) => ({
          assertionId: v.assertionId,
          passed: v.passed,
          hidden: v.hidden,
        })),
        xpReward,
      );
      if (grade.passed) {
        const firstTry = nextAttempts === 1;
        const xpEarned = xpForPass({ streakDays, firstTry, capstone: isCapstone });
        toast.success("Drill passed", {
          description: `+${xpEarned} XP${firstTry ? " (first-try bonus)" : ""}`,
        });
        onPass?.({ xpEarned, firstTry, attempts: nextAttempts });
      } else {
        toast.error("Drill test suite failed", {
          description: "Check the assertion failures in the console and try again.",
        });
      }
    } catch (err) {
      toast.error("Execution error", {
        description:
          err instanceof Error ? err.message : "Unexpected error during execution.",
      });
    } finally {
      setRunning(false);
    }
  }

  function handleReset(): void {
    updateCode(drill.id, drill.content.starterCode);
    setVerdicts(null);
    toast.info("Editor reset to starter code");
  }

  const visibleTests = drill.content.visibleTests;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <Group orientation="horizontal" className="h-full w-full flex-1">
        <Panel defaultSize="42%" minSize="28%" maxSize="60%">
          <div className="flex h-full flex-col overflow-hidden border-r border-border bg-card/40">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="font-mono text-xs text-muted-foreground">
                {moduleTitle}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs text-amber-400">
                <Zap className="size-3.5" />+{xpReward} XP
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <h1 className="text-2xl font-bold tracking-tight">
                {drill.title}
              </h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {drill.content.language} ·{" "}
                {visibleTests.length + drill.content.hiddenTestCount} assertions
              </p>

              {isGreen ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm font-medium text-emerald-400">
                  <CheckCircle2 className="size-5 shrink-0" />
                  <span>All {totalCount} tests passing.</span>
                </div>
              ) : verdicts !== null ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm font-medium text-destructive">
                  <AlertCircle className="size-5 shrink-0" />
                  <span>
                    {totalCount - passedCount} of {totalCount} failed. Check the
                    console.
                  </span>
                </div>
              ) : null}

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {drill.content.instructions}
              </p>

              <div className="mt-8 border-t border-border/80 pt-6">
                <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Test suite ({visibleTests.length} visible
                  {drill.content.hiddenTestCount > 0
                    ? ` · ${drill.content.hiddenTestCount} hidden`
                    : ""}
                  )
                </h3>
                <div className="space-y-2">
                  {visibleTests.map((t) => {
                    const verdict = verdicts?.find((v) => v.assertionId === t.id);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3.5 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          {verdict === undefined ? (
                            <div className="size-2 rounded-full bg-muted-foreground/50" />
                          ) : verdict.passed ? (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                          ) : (
                            <XCircle className="size-4 shrink-0 text-destructive" />
                          )}
                          <span className="truncate font-mono text-xs font-medium">
                            {t.label}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Visible
                        </span>
                      </div>
                    );
                  })}
                  {drill.content.hiddenTestCount > 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-dashed border-border/70 px-3.5 py-2.5">
                      <span className="font-mono text-xs text-muted-foreground">
                        {drill.content.hiddenTestCount} hidden specification
                        {drill.content.hiddenTestCount === 1 ? "" : "s"}
                      </span>
                      <EyeOff className="size-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Separator className="w-1.5 bg-border/60 transition hover:bg-primary/50" />

        <Panel defaultSize="58%" minSize="35%">
          <Group orientation="vertical" className="h-full w-full">
            <Panel defaultSize="68%" minSize="40%">
              <div className="flex h-full flex-col overflow-hidden bg-[#1e1e1e]">
                <div className="flex items-center justify-between border-b border-border/40 bg-[#181818] px-4 py-2">
                  <span className="rounded bg-[#252526] px-3 py-1 font-mono text-xs text-zinc-300">
                    solution.{fileExtFor(drill.content.language)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleReset}
                      className="flex h-7 items-center gap-1 rounded px-2 text-xs text-zinc-400 hover:text-white"
                      title="Reset code"
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </button>
                    <button
                      onClick={handleRun}
                      disabled={running}
                      className="flex h-7 items-center gap-1 rounded bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {running ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="size-3 fill-current" />
                          Run Tests (Ctrl+Enter)
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={monacoLanguageFor(drill.content.language)}
                    value={code}
                    onChange={(val) => updateCode(drill.id, val ?? "")}
                    onMount={(editor, monaco) => {
                      editor.addCommand(
                        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                        () => void handleRun(),
                      );
                    }}
                    options={{
                      fontSize: 13,
                      lineNumbers: "on",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      tabSize: 2,
                      automaticLayout: true,
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </div>
              </div>
            </Panel>

            <Separator className="h-1.5 bg-border/60 transition hover:bg-primary/50" />

            <Panel defaultSize="32%" minSize="20%">
              <div className="flex h-full flex-col overflow-hidden border-t border-border bg-[#141414]">
                <div className="flex items-center justify-between border-b border-border/40 bg-[#1a1a1a] px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConsoleTab("results")}
                      className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-xs transition ${
                        consoleTab === "results"
                          ? "bg-zinc-800 font-semibold text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Test Results
                      {verdicts !== null && (
                        <span
                          className={`ml-1 rounded px-1.5 py-0.5 text-[10px] ${
                            isGreen
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {passedCount}/{totalCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setConsoleTab("output")}
                      className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-xs transition ${
                        consoleTab === "output"
                          ? "bg-zinc-800 font-semibold text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Terminal className="size-3.5" />
                      Output Log
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500">
                    Attempts: {attempts}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                  {running ? (
                    <div className="flex h-full items-center justify-center gap-2 text-zinc-400">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span>Executing assertions...</span>
                    </div>
                  ) : verdicts === null ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
                      <Terminal className="mb-2 size-6 opacity-50" />
                      <p>Run your test suite to inspect pass/fail output.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {verdicts.map((v) => (
                        <div
                          key={v.assertionId}
                          className={`rounded border p-2.5 ${
                            v.passed
                              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                              : "border-destructive/30 bg-destructive/5 text-destructive"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-semibold">
                              {v.passed ? (
                                <CheckCircle2 className="size-3.5" />
                              ) : (
                                <XCircle className="size-3.5" />
                              )}
                              {v.assertionId}
                            </span>
                            <span className="text-[10px] opacity-75">
                              {v.passed ? "PASSED" : "FAILED"}
                            </span>
                          </div>
                          {v.error && (
                            <pre className="mt-1.5 whitespace-pre-wrap rounded bg-black/40 p-2 text-[11px] text-red-300">
                              {v.error}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  );
}
