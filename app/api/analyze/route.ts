import { analyzeProject } from "@/lib/project-dna/analyze";
import type { AnalysisRequest, ApiError } from "@/lib/project-dna/types";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json<ApiError>({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateInput(body);
  if (!validation.ok) {
    return Response.json<ApiError>({ error: validation.error }, { status: 422 });
  }

  const report = await analyzeProject(validation.value);
  return Response.json(report, {
    headers: { "cache-control": "no-store" },
  });
}

function validateInput(body: unknown):
  | { ok: true; value: AnalysisRequest }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Request must be an object." };
  const value = body as Record<string, unknown>;
  const description = typeof value.description === "string" ? value.description.trim() : "";
  if (description.length < 30 || description.length > 6_000) {
    return { ok: false, error: "Description must contain between 30 and 6,000 characters." };
  }

  const time = typeof value.timeConstraintHours === "number" ? value.timeConstraintHours : 24;
  if (!Number.isFinite(time) || time < 1 || time > 168) {
    return { ok: false, error: "Build time must be between 1 and 168 hours." };
  }

  return {
    ok: true,
    value: {
      description,
      targetAudience: optionalText(value.targetAudience, 240),
      preferredStack: optionalText(value.preferredStack, 240),
      timeConstraintHours: Math.round(time),
      revisionOf: optionalText(value.revisionOf, 100),
    },
  };
}

function optionalText(value: unknown, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;
}
