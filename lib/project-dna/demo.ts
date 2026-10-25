import type { AnalysisReport, AnalysisRequest } from "./types";

export function createDemoReport(
  input: AnalysisRequest,
  warning = "Live credentials are not configured. Showing a deterministic demo report."
): AnalysisReport {
  return {
    id: crypto.randomUUID(),
    mode: "demo",
    ideaTitle: input.targetAudience
      ? `AI receptionist for ${input.targetAudience.toLowerCase()}`
      : "AI receptionist for independent barbershops",
    score: 42,
    summary:
      "The core voice-booking workflow is established. The strongest opportunity is what happens when capacity changes after a booking.",
    sourcesReviewed: 24,
    viableMatches: 12,
    capturedAt: new Date().toISOString(),
    competitors: [
      {
        id: "demo-front-desk",
        name: "My AI Front Desk",
        source: "Product website",
        url: "https://www.myaifrontdesk.com/",
        description: "AI phone receptionist for appointment-based small businesses.",
        match: 82,
        overlap: ["Voice answering", "Appointment booking", "FAQ handling"],
        evidence: [
          {
            excerpt: "AI phone receptionist for appointment-based businesses.",
            sourceUrl: "https://www.myaifrontdesk.com/",
          },
        ],
      },
      {
        id: "demo-github",
        name: "AI Receptionist repositories",
        source: "GitHub",
        url: "https://github.com/search?q=ai+receptionist&type=repositories",
        description: "Open-source voice-assistant projects for answering calls and scheduling.",
        match: 71,
        overlap: ["Voice workflow", "Calendar integration"],
        evidence: [
          {
            excerpt: "Public repositories matching AI receptionist and scheduling workflows.",
            sourceUrl: "https://github.com/search?q=ai+receptionist&type=repositories",
          },
        ],
      },
      {
        id: "demo-goodcall",
        name: "Goodcall",
        source: "Product website",
        url: "https://www.goodcall.com/",
        description: "AI phone agent for local businesses with call routing and scheduling.",
        match: 67,
        overlap: ["Small businesses", "Call routing", "Scheduling"],
        evidence: [
          {
            excerpt: "AI phone agent for local businesses.",
            sourceUrl: "https://www.goodcall.com/",
          },
        ],
      },
    ],
    featureMatrix: [
      { feature: "Voice answering", project: true, competitors: [true, true, true] },
      { feature: "Appointment booking", project: true, competitors: [true, true, true] },
      { feature: "FAQ handling", project: true, competitors: [true, false, true] },
      { feature: "No-show recovery", project: false, competitors: [false, false, false] },
      { feature: "Chair capacity reasoning", project: false, competitors: [false, false, false] },
    ],
    twists: [
      {
        id: "demo-practical",
        type: "Practical",
        title: "No-show recovery engine",
        body: "Detect cancellations, contact the waitlist, and refill empty chairs automatically.",
        evidence: "Booking is common; automatic chair recovery was not found in the reviewed demo corpus.",
        evidenceUrls: ["https://www.myaifrontdesk.com/", "https://www.goodcall.com/"],
        effort: "3–4 hours",
        difficulty: "Medium",
        demoImpact: "Shows a cancelled slot being filled during the demo.",
        risks: ["Requires consent-aware outbound messaging", "Calendar race conditions"],
      },
      {
        id: "demo-technical",
        type: "Technical",
        title: "Live capacity reasoning",
        body: "Reason across barber availability, service duration, walk-ins, and customer preferences in real time.",
        evidence: "Competitors schedule appointments, but evidence of chair-level capacity reasoning was limited.",
        evidenceUrls: ["https://www.goodcall.com/"],
        effort: "5–7 hours",
        difficulty: "High",
        demoImpact: "Creates a strong before-and-after scheduling visualization.",
        risks: ["Needs realistic capacity fixtures", "Must keep inference latency low"],
      },
      {
        id: "demo-wildcard",
        type: "Wild card",
        title: "Call-to-style memory",
        body: "Turn conversations into a visual preference profile the barber sees before the customer arrives.",
        evidence: "The reviewed products focus on logistics rather than continuity of the customer experience.",
        evidenceUrls: ["https://www.myaifrontdesk.com/"],
        effort: "4–6 hours",
        difficulty: "Medium",
        demoImpact: "Produces a memorable customer card from a live call transcript.",
        risks: ["Preference extraction can be wrong", "Needs clear privacy controls"],
      },
    ],
    limitations: [
      "This is a deterministic demo corpus, not a live web scan.",
      "Similarity is not evidence of copying or plagiarism.",
      "The score represents only the sources included in this report.",
    ],
    warnings: [warning],
    provenance: {
      queries: [
        '"AI receptionist" appointment scheduling',
        'site:github.com "voice appointment booking"',
        'site:producthunt.com "AI receptionist"',
      ],
    },
  };
}
