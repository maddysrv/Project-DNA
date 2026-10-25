import type { AnalysisReport, AnalysisRequest } from "./types";
import type { SearchCandidate } from "./apify";

const querySchema = {
  type: "object",
  additionalProperties: false,
  required: ["ideaTitle", "queries"],
  properties: {
    ideaTitle: { type: "string" },
    queries: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: { type: "string" },
    },
  },
} as const;

export async function createQueryPlan(input: AnalysisRequest, apiKey: string) {
  return callJson<{ ideaTitle: string; queries: string[] }>({
    apiKey,
    schemaName: "project_dna_query_plan",
    schema: querySchema,
    system:
      "You plan bounded competitive research. Generate specific web queries covering the core problem, target audience, workflow, GitHub, Devpost, and Product Hunt. Do not claim novelty.",
    user: JSON.stringify(input),
  });
}

export async function createEvidenceReport(
  input: AnalysisRequest,
  ideaTitle: string,
  candidates: SearchCandidate[],
  apiKey: string
): Promise<Omit<AnalysisReport, "id" | "mode" | "capturedAt" | "warnings" | "provenance">> {
  const result = await callJson<{
    score: number;
    summary: string;
    competitors: AnalysisReport["competitors"];
    featureMatrix: AnalysisReport["featureMatrix"];
    twists: AnalysisReport["twists"];
    limitations: string[];
  }>({
    apiKey,
    schemaName: "project_dna_evidence_report",
    schema: reportSchema,
    system: `You are an evidence-grounded product research analyst.
Use only the supplied candidates. A candidate's description is an evidence excerpt, not a complete product specification.
Select at most five meaningful competitors. Every competitor and twist must cite supplied URLs.
The score means differentiation within this bounded corpus, never global originality or evidence of copying.
Create exactly three twists in this order: Practical, Technical, Wild card.
Keep every twist feasible for a 24-36 hour hackathon and avoid generic recommendations.`,
    user: JSON.stringify({ input, ideaTitle, candidates }),
  });

  const allowedUrls = new Set(candidates.map((candidate) => candidate.url));
  for (const competitor of result.competitors) {
    if (!allowedUrls.has(competitor.url)) {
      throw new Error("Model cited a competitor URL outside the research corpus");
    }
    competitor.evidence = competitor.evidence.filter((item) => allowedUrls.has(item.sourceUrl));
  }
  for (const twist of result.twists) {
    twist.evidenceUrls = twist.evidenceUrls.filter((url) => allowedUrls.has(url));
  }

  return {
    ideaTitle,
    score: Math.max(0, Math.min(100, Math.round(result.score))),
    summary: result.summary,
    sourcesReviewed: candidates.length,
    viableMatches: result.competitors.length,
    competitors: result.competitors,
    featureMatrix: result.featureMatrix,
    twists: result.twists,
    limitations: [
      ...result.limitations,
      "Similarity is not evidence of copying or plagiarism.",
      "Results reflect only the public sources reviewed in this run.",
    ],
  };
}

async function callJson<T>({
  apiKey,
  schemaName,
  schema,
  system,
  user,
}: {
  apiKey: string;
  schemaName: string;
  schema: object;
  system: string;
  user: string;
}): Promise<T> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body.slice(0, 240)}`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  const text =
    payload.output_text ||
    payload.output
      ?.flatMap((item) => item.content || [])
      .find((content) => content.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI returned no structured output");
  return JSON.parse(text) as T;
}

const evidenceSchema = {
  type: "object",
  additionalProperties: false,
  required: ["excerpt", "sourceUrl"],
  properties: { excerpt: { type: "string" }, sourceUrl: { type: "string" } },
};

const reportSchema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "summary", "competitors", "featureMatrix", "twists", "limitations"],
  properties: {
    score: { type: "number", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    competitors: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "source", "url", "description", "match", "overlap", "evidence"],
        properties: {
          id: { type: "string" }, name: { type: "string" }, source: { type: "string" },
          url: { type: "string" }, description: { type: "string" },
          match: { type: "number", minimum: 0, maximum: 100 },
          overlap: { type: "array", items: { type: "string" } },
          evidence: { type: "array", items: evidenceSchema },
        },
      },
    },
    featureMatrix: {
      type: "array",
      minItems: 4,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["feature", "project", "competitors"],
        properties: {
          feature: { type: "string" }, project: { type: "boolean" },
          competitors: { type: "array", items: { type: "boolean" } },
        },
      },
    },
    twists: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "title", "body", "evidence", "evidenceUrls", "effort", "difficulty", "demoImpact", "risks"],
        properties: {
          id: { type: "string" }, type: { type: "string", enum: ["Practical", "Technical", "Wild card"] },
          title: { type: "string" }, body: { type: "string" }, evidence: { type: "string" },
          evidenceUrls: { type: "array", items: { type: "string" } }, effort: { type: "string" },
          difficulty: { type: "string", enum: ["Low", "Medium", "High"] },
          demoImpact: { type: "string" }, risks: { type: "array", items: { type: "string" } },
        },
      },
    },
    limitations: { type: "array", items: { type: "string" } },
  },
} as const;
