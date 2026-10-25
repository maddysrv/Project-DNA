export type SearchCandidate = {
  title: string;
  url: string;
  description: string;
  source: string;
};

type ApifyResult = Record<string, unknown>;

export async function searchWithApify(queries: string[], token: string) {
  const actorId = process.env.APIFY_SEARCH_ACTOR_ID || "apify~google-search-scraper";
  const endpoint = new URL(
    `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`
  );
  endpoint.searchParams.set("token", token);
  endpoint.searchParams.set("timeout", "50");
  endpoint.searchParams.set("clean", "true");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      queries,
      maxPagesPerQuery: 1,
      resultsPerPage: 10,
      languageCode: "en",
      countryCode: "us",
      includeUnfilteredResults: false,
      saveHtml: false,
      saveHtmlToKeyValueStore: false,
    }),
    signal: AbortSignal.timeout(55_000),
  });

  if (!response.ok) {
    throw new Error(`Apify search failed with status ${response.status}`);
  }

  const runId = response.headers.get("x-apify-run-id") || undefined;
  const datasetId = response.headers.get("x-apify-dataset-id") || undefined;
  const items = (await response.json()) as ApifyResult[];
  const candidates = normalizeSearchResults(items).slice(0, 20);

  if (candidates.length === 0) {
    throw new Error("Apify returned no usable public search results");
  }

  return { actorId, runId, datasetId, candidates };
}

function normalizeSearchResults(items: ApifyResult[]): SearchCandidate[] {
  const seen = new Set<string>();
  const normalized: SearchCandidate[] = [];

  const push = (raw: Record<string, unknown>) => {
    const url = stringValue(raw.url) || stringValue(raw.link);
    const title = stringValue(raw.title) || stringValue(raw.name);
    const description =
      stringValue(raw.description) || stringValue(raw.snippet) || stringValue(raw.text);
    if (!url || !title || !description) return;

    let canonical: string;
    try {
      const parsed = new URL(url);
      parsed.hash = "";
      ["utm_source", "utm_medium", "utm_campaign", "ref"].forEach((key) =>
        parsed.searchParams.delete(key)
      );
      canonical = parsed.toString();
    } catch {
      return;
    }

    if (seen.has(canonical)) return;
    seen.add(canonical);
    normalized.push({
      title: title.slice(0, 160),
      url: canonical,
      description: description.slice(0, 700),
      source: sourceForUrl(canonical),
    });
  };

  for (const item of items) {
    const organic = item.organicResults;
    if (Array.isArray(organic)) {
      organic.forEach((result) => {
        if (result && typeof result === "object") push(result as Record<string, unknown>);
      });
    } else {
      push(item);
    }
  }

  return normalized;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sourceForUrl(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  if (hostname.includes("github.com")) return "GitHub";
  if (hostname.includes("devpost.com")) return "Devpost";
  if (hostname.includes("producthunt.com")) return "Product Hunt";
  return hostname;
}
