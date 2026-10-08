import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDrill } from "@/data/seed";
import {
  configFromEnv,
  createFetchHttpClient,
  runBatch,
  type BatchGrading,
} from "@/server/execution";

const RunDrillInput = z.object({
  drillId: z.string().min(1).max(64),
  code: z.string().min(1).max(100_000),
});

export const runDrill = createServerFn({ method: "POST" })
  .validator(RunDrillInput)
  .handler(async ({ data }): Promise<BatchGrading> => {
    const drill = getDrill(data.drillId);
    if (!drill) throw new Error(`Drill "${data.drillId}" not found.`);
    if (drill.kind !== "unit_test") {
      throw new Error(`Drill "${data.drillId}" is not auto-gradable.`);
    }

    const testCases = drill.content.visibleTests
      .filter((t) => t.stdin !== undefined && t.expectedStdout !== undefined)
      .map((t) => ({
        id: t.id,
        stdin: t.stdin as string,
        expectedStdout: t.expectedStdout as string,
      }));
    if (testCases.length === 0) {
      throw new Error(`Drill "${data.drillId}" has no executable tests.`);
    }

    const config = configFromEnv({
      JUDGE0_URL: process.env.JUDGE0_URL,
      JUDGE0_KEY: process.env.JUDGE0_KEY,
    });
    return runBatch(
      config,
      createFetchHttpClient(),
      { language: drill.content.language, sourceCode: data.code, testCases },
    );
  });
