import { z } from "zod";

export type RunnerType = "webcontainer" | "pyodide" | "wasm" | "judge0";

export const MAX_BATCH_TEST_CASES = 50;
export const MAX_PARALLEL_RUNS = 5;
export const RUN_TIMEOUT_MS = 30_000;
export const MAX_SOURCE_CHARS = 100_000;
export const MAX_STDIN_CHARS = 20_000;

/** Judge0 status id for "Accepted". */
export const JUDGE0_ACCEPTED_ID = 3;

const JUDGE0_LANGUAGE_IDS: Readonly<Record<string, number>> = Object.freeze({
  python: 71,
  javascript: 93,
  typescript: 94,
  go: 60,
  c: 50,
  rust: 73,
  java: 62,
  sql: 82,
});

export function judge0LanguageId(language: string): number | null {
  return JUDGE0_LANGUAGE_IDS[language.toLowerCase()] ?? null;
}

export function isServerExecutable(language: string): boolean {
  return judge0LanguageId(language) !== null;
}

/**
 * Client-first runner selection. In-browser engines handle the interactive
 * path; the server (Judge0) is the graded fallback for languages the browser
 * cannot run and for languages where the verdict must come from server-run
 * code rather than browser-reported output.
 */
export function selectRunner(language: string): RunnerType {
  switch (language.toLowerCase()) {
    case "javascript":
    case "typescript":
      return "webcontainer";
    case "python":
      return "pyodide";
    case "go":
    case "c":
    case "rust":
      return "wasm";
    default:
      return "judge0";
  }
}

export const ExecutionTestCaseSchema = z.object({
  id: z.string().min(1).max(64),
  stdin: z.string().max(MAX_STDIN_CHARS),
  expectedStdout: z.string().max(MAX_STDIN_CHARS),
});

export const ExecuteBatchRequestSchema = z.object({
  language: z.string().min(1).max(32),
  sourceCode: z.string().min(1).max(MAX_SOURCE_CHARS),
  testCases: z
    .array(ExecutionTestCaseSchema)
    .min(1)
    .max(MAX_BATCH_TEST_CASES),
});

export type ExecuteBatchRequest = z.infer<typeof ExecuteBatchRequestSchema>;

export interface Judge0Verdict {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  statusId: number;
  timeMs: number | null;
  memoryKb: number | null;
}

export interface CaseGrading {
  id: string;
  passed: boolean;
  actualStdout: string | null;
  expectedStdout: string;
  stderr: string | null;
  compileOutput: string | null;
  timeMs: number | null;
}

export interface BatchGrading {
  results: CaseGrading[];
  allPassed: boolean;
}

/**
 * Output normalization shared by client and server graders so a drill has
 * one pass/fail definition. Trailing whitespace and trailing blank lines are
 * ignored; leading indentation is preserved for indentation-sensitive output.
 */
export function normalizeOutput(value: string | null): string {
  if (!value) return "";
  const lines = value.split(/\r\n|\r|\n/).map((line) => line.trimEnd());
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}

export function gradeVerdict(
  id: string,
  verdict: Judge0Verdict,
  expectedStdout: string,
): CaseGrading {
  const passed =
    verdict.statusId === JUDGE0_ACCEPTED_ID &&
    normalizeOutput(verdict.stdout) === normalizeOutput(expectedStdout);
  return {
    id,
    passed,
    actualStdout: verdict.stdout,
    expectedStdout,
    stderr: verdict.stderr,
    compileOutput: verdict.compileOutput,
    timeMs: verdict.timeMs,
  };
}

export function gradeBatch(
  testCases: ExecuteBatchRequest["testCases"],
  verdicts: Judge0Verdict[],
): BatchGrading {
  const results = testCases.map((tc, i) => {
    const verdict = verdicts[i];
    if (!verdict) {
      return {
        id: tc.id,
        passed: false,
        actualStdout: null,
        expectedStdout: tc.expectedStdout,
        stderr: "missing verdict",
        compileOutput: null,
        timeMs: null,
      } satisfies CaseGrading;
    }
    return gradeVerdict(tc.id, verdict, tc.expectedStdout);
  });
  return { results, allPassed: results.every((r) => r.passed) };
}

export class ExecutionNotConfiguredError extends Error {
  constructor() {
    super(
      "Code execution is not configured. Set JUDGE0_URL to enable the server fallback.",
    );
    this.name = "ExecutionNotConfiguredError";
  }
}

export class UnsupportedLanguageError extends Error {
  constructor(language: string) {
    super(`Language "${language}" has no Judge0 mapping.`);
    this.name = "UnsupportedLanguageError";
  }
}

export interface ExecutionHttpClient {
  postSubmission(input: {
    baseUrl: string;
    apiKey: string | null;
    languageId: number;
    sourceCode: string;
    stdin: string;
  }): Promise<Judge0Verdict>;
}

export interface ExecutionConfig {
  baseUrl: string | null;
  apiKey: string | null;
}

export function configFromEnv(env: {
  JUDGE0_URL?: string;
  JUDGE0_KEY?: string;
}): ExecutionConfig {
  const baseUrl = env.JUDGE0_URL?.trim() ? env.JUDGE0_URL.trim() : null;
  const apiKey = env.JUDGE0_KEY?.trim() ? env.JUDGE0_KEY.trim() : null;
  return { baseUrl, apiKey };
}

export async function runBatch(
  config: ExecutionConfig,
  http: ExecutionHttpClient,
  raw: unknown,
): Promise<BatchGrading> {
  if (!config.baseUrl) throw new ExecutionNotConfiguredError();

  const req = ExecuteBatchRequestSchema.parse(raw);
  const languageId = judge0LanguageId(req.language);
  if (languageId === null) throw new UnsupportedLanguageError(req.language);

  const verdicts: Judge0Verdict[] = new Array(req.testCases.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < req.testCases.length) {
      const index = cursor;
      cursor += 1;
      const tc = req.testCases[index];
      if (!tc) continue;
      verdicts[index] = await http.postSubmission({
        baseUrl: config.baseUrl as string,
        apiKey: config.apiKey,
        languageId: languageId as number,
        sourceCode: req.sourceCode,
        stdin: tc.stdin,
      });
    }
  }

  const workers = Array.from(
    { length: Math.min(MAX_PARALLEL_RUNS, req.testCases.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return gradeBatch(req.testCases, verdicts);
}
