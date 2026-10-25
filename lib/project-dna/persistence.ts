import type { AnalysisReport, AnalysisRequest } from "./types";

export async function persistAnalysis(input: AnalysisRequest, report: AnalysisReport) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/analyses`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify({
      id: report.id,
      mode: report.mode,
      input,
      report,
      created_at: report.capturedAt,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Supabase persistence failed with status ${response.status}`);
  }
  return true;
}
