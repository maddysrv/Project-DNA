import { searchWithApify } from "./apify";
import { createDemoReport } from "./demo";
import { createEvidenceReport, createQueryPlan } from "./openai";
import { persistAnalysis } from "./persistence";
import type { AnalysisReport, AnalysisRequest } from "./types";

export async function analyzeProject(input: AnalysisRequest): Promise<AnalysisReport> {
  const apifyToken = process.env.APIFY_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!apifyToken || !openaiKey) {
    const report = createDemoReport(input);
    await persistSafely(input, report);
    return report;
  }

  try {
    const plan = await createQueryPlan(input, openaiKey);
    const research = await searchWithApify(plan.queries, apifyToken);
    const generated = await createEvidenceReport(
      input,
      plan.ideaTitle,
      research.candidates,
      openaiKey
    );
    const report: AnalysisReport = {
      ...generated,
      id: crypto.randomUUID(),
      mode: "live",
      capturedAt: new Date().toISOString(),
      warnings: [],
      provenance: {
        apifyActorId: research.actorId,
        apifyRunId: research.runId,
        apifyDatasetId: research.datasetId,
        queries: plan.queries,
      },
    };
    await persistSafely(input, report);
    return report;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown live-analysis failure";
    const report = createDemoReport(
      input,
      `Live research could not complete (${detail}). Showing the deterministic demo corpus instead.`
    );
    await persistSafely(input, report);
    return report;
  }
}

async function persistSafely(input: AnalysisRequest, report: AnalysisReport) {
  try {
    await persistAnalysis(input, report);
  } catch (error) {
    report.warnings.push(
      error instanceof Error ? error.message : "The analysis could not be saved."
    );
  }
}
