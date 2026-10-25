export type AnalysisRequest = {
  description: string;
  targetAudience?: string;
  preferredStack?: string;
  timeConstraintHours?: number;
  revisionOf?: string;
};

export type Evidence = {
  excerpt: string;
  sourceUrl: string;
};

export type Competitor = {
  id: string;
  name: string;
  source: string;
  url: string;
  description: string;
  match: number;
  overlap: string[];
  evidence: Evidence[];
};

export type Twist = {
  id: string;
  type: "Practical" | "Technical" | "Wild card";
  title: string;
  body: string;
  evidence: string;
  evidenceUrls: string[];
  effort: string;
  difficulty: "Low" | "Medium" | "High";
  demoImpact: string;
  risks: string[];
};

export type FeatureRow = {
  feature: string;
  project: boolean;
  competitors: boolean[];
};

export type AnalysisReport = {
  id: string;
  mode: "live" | "demo";
  ideaTitle: string;
  score: number;
  summary: string;
  sourcesReviewed: number;
  viableMatches: number;
  capturedAt: string;
  competitors: Competitor[];
  featureMatrix: FeatureRow[];
  twists: Twist[];
  limitations: string[];
  warnings: string[];
  provenance: {
    apifyActorId?: string;
    apifyRunId?: string;
    apifyDatasetId?: string;
    queries: string[];
  };
};

export type ApiError = {
  error: string;
  details?: string;
};
