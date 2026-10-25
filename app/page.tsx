"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Check, ChevronRight, CircleDot, Clock3,
  Code2, Dna, ExternalLink, FlaskConical, GitBranch, Lightbulb, Radar,
  RefreshCw, Search, ShieldCheck, Sparkles, WandSparkles, Zap,
} from "lucide-react";
import type { AnalysisReport, AnalysisRequest, Twist } from "@/lib/project-dna/types";

type View = "form" | "research" | "report" | "compare";

const stages = [
  ["Parsing your project DNA", "Problem, audience, workflow"],
  ["Generating research queries", "Problem, workflow, and source-specific searches"],
  ["Running Apify discovery", "GitHub, Devpost, Product Hunt, and the public web"],
  ["Normalizing source evidence", "Removing duplicates and weak matches"],
  ["Comparing product capabilities", "Evidence-grounded overlap analysis"],
  ["Finding differentiation gaps", "Three feasible mutations"],
];

const twistIcons = [Lightbulb, Code2, WandSparkles];

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [revisedReport, setRevisedReport] = useState<AnalysisReport | null>(null);
  const [selectedTwist, setSelectedTwist] = useState(1);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("An AI receptionist that answers customer calls, books appointments, and handles scheduling for independent barbershops.");
  const [audience, setAudience] = useState("Independent barbershops");
  const [stack, setStack] = useState("Next.js, Python, Twilio");
  const [hours, setHours] = useState(24);

  useEffect(() => {
    if (view !== "research") return;
    const timer = window.setInterval(() => setStep((current) => Math.min(current + 1, 4)), 900);
    return () => window.clearInterval(timer);
  }, [view]);

  const progress = useMemo(() => Math.round(((step + 1) / stages.length) * 100), [step]);

  async function requestAnalysis(input: AnalysisRequest) {
    setError("");
    setStep(0);
    setView("research");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as AnalysisReport | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Analysis failed.");
      }
      setStep(5);
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      return payload;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis failed. Please try again.");
      setView("form");
      return null;
    }
  }

  async function handleAnalyze() {
    const next = await requestAnalysis({ description, targetAudience: audience, preferredStack: stack, timeConstraintHours: hours });
    if (next) {
      setReport(next);
      setSelectedTwist(1);
      setView("report");
    }
  }

  async function handleRescan() {
    if (!report) return;
    const twist = report.twists[selectedTwist];
    const next = await requestAnalysis({
      description: `${description}\n\nDifferentiating capability: ${twist.title}. ${twist.body}`,
      targetAudience: audience,
      preferredStack: stack,
      timeConstraintHours: hours,
      revisionOf: report.id,
    });
    if (next) {
      setRevisedReport(next);
      setView("compare");
    }
  }

  return (
    <main className="min-h-screen bg-[#070a08] text-[#edf4ec] selection:bg-lime-300 selection:text-black">
      <Nav mode={report?.mode} onHome={() => setView("form")} />
      {view === "form" && (
        <IdeaForm
          description={description} setDescription={setDescription}
          audience={audience} setAudience={setAudience}
          stack={stack} setStack={setStack} hours={hours} setHours={setHours}
          error={error} onSubmit={handleAnalyze}
        />
      )}
      {view === "research" && <ResearchProgress step={step} progress={progress} />}
      {view === "report" && report && (
        <Report report={report} selectedTwist={selectedTwist} setSelectedTwist={setSelectedTwist} onRescan={handleRescan} />
      )}
      {view === "compare" && report && revisedReport && (
        <Comparison before={report} after={revisedReport} twist={report.twists[selectedTwist]} onBack={() => setView("report")} />
      )}
    </main>
  );
}

function Nav({ mode, onHome }: { mode?: AnalysisReport["mode"]; onHome: () => void }) {
  return <nav className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#070a08]/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8"><button className="flex items-center gap-2.5" onClick={onHome}><span className="grid size-8 place-items-center rounded-lg border border-lime-300/30 bg-lime-300/10 text-lime-300"><Dna size={17} /></span><span className="font-semibold tracking-[-0.02em]">Project DNA</span><span className="hidden rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/40 sm:inline">Beta</span></button><div className="flex items-center gap-3 text-xs text-white/45"><span className="hidden items-center gap-1.5 sm:flex"><ShieldCheck size={14} /> Evidence first</span><span className="h-4 w-px bg-white/10" /><span className="flex items-center gap-1.5"><CircleDot size={13} className={mode === "live" ? "text-emerald-300" : "text-amber-300"} />{mode === "live" ? "Live research" : "Demo ready"}</span></div></div></nav>;
}

function IdeaForm(props: {
  description: string; setDescription: (value: string) => void;
  audience: string; setAudience: (value: string) => void;
  stack: string; setStack: (value: string) => void;
  hours: number; setHours: (value: number) => void;
  error: string; onSubmit: () => void;
}) {
  return <section className="relative overflow-hidden px-5 pb-24 pt-14 sm:px-8 sm:pt-24"><div className="dna-grid pointer-events-none absolute inset-0 opacity-50" /><div className="relative mx-auto max-w-6xl"><div className="mx-auto mb-12 max-w-3xl text-center"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[0.06] px-3 py-1.5 text-xs text-lime-200"><Sparkles size={13} /> Find what hasn&apos;t been built yet</div><h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">Turn an idea into a<span className="block bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">distinct project.</span></h1><p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-white/50 sm:text-lg">Research similar products, uncover evidence-backed gaps, and evolve your idea into something judges remember.</p></div><div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0c100d]/90 shadow-2xl shadow-black/40"><div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4"><div className="flex items-center gap-2 text-sm font-medium"><FlaskConical size={16} className="text-lime-300" /> New analysis</div><span className="text-xs text-white/30">Live when credentials are configured</span></div><form className="grid gap-6 p-6 sm:p-8" onSubmit={(event) => { event.preventDefault(); props.onSubmit(); }}><label className="grid gap-2 text-sm text-white/65">Project idea<textarea required minLength={30} value={props.description} onChange={(event) => props.setDescription(event.target.value)} className="min-h-36 resize-none rounded-2xl border border-white/10 bg-black/25 p-4 text-base leading-7 text-white outline-none transition focus:border-lime-300/50 focus:ring-4 focus:ring-lime-300/[0.06]" /></label><div className="grid gap-4 sm:grid-cols-3"><TextField label="Target audience" value={props.audience} onChange={props.setAudience} /><TextField label="Preferred stack" value={props.stack} onChange={props.setStack} /><label className="grid gap-2 text-sm text-white/65">Build time<input type="number" min={1} max={168} value={props.hours} onChange={(event) => props.setHours(Number(event.target.value))} className="rounded-xl border border-white/10 bg-black/25 px-3.5 py-3 text-sm text-white outline-none transition focus:border-lime-300/50" /></label></div>{props.error && <div className="flex gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-200"><AlertTriangle size={17} className="mt-0.5 shrink-0" />{props.error}</div>}<div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row"><p className="flex items-center gap-2 text-xs text-white/35"><Radar size={14} /> Researches public sources through Apify</p><button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-semibold text-[#081008] transition hover:bg-lime-200 sm:w-auto">Analyze project <ArrowRight size={16} className="transition group-hover:translate-x-0.5" /></button></div></form></div></div></section>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm text-white/65">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-white/10 bg-black/25 px-3.5 py-3 text-sm text-white outline-none transition focus:border-lime-300/50" /></label>;
}

function ResearchProgress({ step, progress }: { step: number; progress: number }) {
  return <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-5xl place-items-center px-5 py-16"><div className="w-full max-w-3xl rounded-[28px] border border-white/[0.09] bg-[#0c100d] p-7 sm:p-10"><div className="mb-10 flex items-start justify-between gap-6"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Research pipeline</p><h2 className="text-3xl font-semibold tracking-[-0.04em]">Mapping the landscape</h2><p className="mt-2 text-sm text-white/40">Collecting public evidence before making recommendations.</p></div><div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-lime-300/20 bg-lime-300/[0.06]"><RefreshCw className="animate-spin text-lime-300" size={22} /></div></div><div className="mb-8 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-300 transition-all duration-500" style={{ width: `${progress}%` }} /></div><div className="space-y-2">{stages.map(([title, subtitle], index) => <div key={title} className={`flex items-center gap-4 rounded-2xl p-3.5 transition ${index === step ? "bg-white/[0.06]" : ""}`}><span className={`grid size-8 shrink-0 place-items-center rounded-full border ${index <= step ? "border-lime-300/30 bg-lime-300/10 text-lime-300" : "border-white/10 text-white/20"}`}>{index < step ? <Check size={15} /> : index === step ? <Search size={14} /> : <span className="size-1.5 rounded-full bg-current" />}</span><div className="min-w-0 flex-1"><p className={`text-sm font-medium ${index <= step ? "text-white" : "text-white/25"}`}>{title}</p><p className="mt-0.5 text-xs text-white/30">{subtitle}</p></div>{index === step && <span className="text-xs text-lime-300">Running</span>}</div>)}</div></div></section>;
}

function Report({ report, selectedTwist, setSelectedTwist, onRescan }: { report: AnalysisReport; selectedTwist: number; setSelectedTwist: (value: number) => void; onRescan: () => void }) {
  const matrixCompetitors = report.competitors.slice(0, 3);
  return <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8"><header className="mb-9 flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-8 lg:flex-row lg:items-end"><div><div className="mb-2 flex items-center gap-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Analysis complete</p><ModeBadge mode={report.mode} /></div><h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{report.ideaTitle}</h1><div className="mt-4 flex flex-wrap gap-4 text-xs text-white/40"><span>{report.sourcesReviewed} sources reviewed</span><span>•</span><span>{report.viableMatches} viable matches</span><span>•</span><span>{new Date(report.capturedAt).toLocaleDateString()}</span></div></div><button onClick={onRescan} className="flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-semibold text-[#081008] hover:bg-lime-200">Apply twist & rescan <ArrowRight size={16} /></button></header>{report.warnings.map((warning) => <div key={warning} className="mb-5 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100/80"><AlertTriangle size={17} className="mt-0.5 shrink-0" />{warning}</div>)}<div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]"><ScoreCard report={report} /><div className="rounded-3xl border border-white/[0.08] bg-[#0c100d] p-6 sm:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-medium">Feature overlap</p><p className="mt-1 text-xs text-white/35">Your idea compared with the closest matches</p></div><span className="rounded-full bg-orange-400/10 px-2.5 py-1 text-xs text-orange-300">Bounded evidence</span></div><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="text-white/30"><tr><th className="pb-3 font-medium">Capability</th><th className="pb-3 text-center font-medium">Your idea</th>{matrixCompetitors.map((item) => <th key={item.id} className="max-w-24 truncate pb-3 text-center font-medium">{item.name}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.06]">{report.featureMatrix.map((row) => <tr key={row.feature}><td className="py-3.5 text-white/65">{row.feature}</td><MatrixCell active={row.project} />{matrixCompetitors.map((item, index) => <MatrixCell key={item.id} active={Boolean(row.competitors[index])} />)}</tr>)}</tbody></table></div></div></div><div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]"><section><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">Closest matches</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">What already exists</h2></div><GitBranch size={20} className="text-white/25" /></div><div className="space-y-3">{report.competitors.map((item) => <article key={item.id} className="rounded-2xl border border-white/[0.08] bg-[#0c100d] p-5 transition hover:border-white/15"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h3 className="font-medium">{item.name}</h3><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.name}`} className="text-white/25 hover:text-lime-300"><ExternalLink size={13} /></a></div><p className="mt-1 text-xs text-white/30">{item.source}</p></div><span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/60">{Math.round(item.match)}% match</span></div><p className="mt-4 text-sm leading-6 text-white/50">{item.description}</p><div className="mt-4 flex flex-wrap gap-2">{item.overlap.map((tag) => <span key={tag} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/45">{tag}</span>)}</div>{item.evidence[0] && <blockquote className="mt-4 border-l border-white/10 pl-3 text-xs leading-5 text-white/30">“{item.evidence[0].excerpt}”</blockquote>}</article>)}</div></section><TwistList twists={report.twists} selected={selectedTwist} onSelect={setSelectedTwist} /></div><div className="mt-8 rounded-2xl border border-white/[0.07] p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30">Research limitations</p><ul className="mt-3 grid gap-2 text-sm text-white/40 sm:grid-cols-2">{report.limitations.map((item) => <li key={item} className="flex gap-2"><span className="text-lime-300">•</span>{item}</li>)}</ul></div></section>;
}

function ScoreCard({ report }: { report: AnalysisReport }) {
  return <div className="rounded-3xl border border-white/[0.08] bg-[#0c100d] p-6 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Differentiation coverage</p><p className="mt-1 text-xs text-white/35">Within the searched corpus</p></div><Radar size={20} className="text-lime-300" /></div><div className="mt-8 flex items-end gap-3"><strong className="text-7xl font-semibold tracking-[-0.07em]">{report.score}</strong><span className="mb-2 text-xl text-white/25">/100</span></div><div className="mt-5 h-2 rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-lime-300" style={{ width: `${report.score}%` }} /></div><p className="mt-5 text-sm leading-6 text-white/45">{report.summary}</p></div>;
}

function MatrixCell({ active }: { active: boolean }) {
  return <td className="text-center"><span className={`mx-auto grid size-5 place-items-center rounded-full ${active ? "bg-lime-300/10 text-lime-300" : "bg-white/[0.04] text-white/15"}`}>{active ? <Check size={12} /> : "–"}</span></td>;
}

function TwistList({ twists, selected, onSelect }: { twists: Twist[]; selected: number; onSelect: (value: number) => void }) {
  return <section><p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">Recommended mutations</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Choose how your idea evolves</h2><div className="mt-4 space-y-3">{twists.map((twist, index) => { const Icon = twistIcons[index] || Sparkles; return <button key={twist.id} onClick={() => onSelect(index)} className={`w-full rounded-2xl border p-5 text-left transition ${selected === index ? "border-lime-300/45 bg-lime-300/[0.06]" : "border-white/[0.08] bg-[#0c100d] hover:border-white/15"}`}><div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-lime-300"><Icon size={18} /></span><div className="flex-1"><div className="flex items-center justify-between gap-3"><p className="text-xs uppercase tracking-[0.13em] text-white/35">{twist.type}</p><span className="flex items-center gap-1 text-[11px] text-white/30"><Clock3 size={12} /> {twist.effort}</span></div><h3 className="mt-1 font-medium">{twist.title}</h3><p className="mt-2 text-sm leading-6 text-white/45">{twist.body}</p><p className="mt-3 border-l border-lime-300/30 pl-3 text-xs leading-5 text-white/35">{twist.evidence}</p></div></div></button>; })}</div></section>;
}

function Comparison({ before, after, twist, onBack }: { before: AnalysisReport; after: AnalysisReport; twist: Twist; onBack: () => void }) {
  const delta = after.score - before.score;
  return <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"><button onClick={onBack} className="mb-8 flex items-center gap-1 text-sm text-white/40 hover:text-white"><ChevronRight className="rotate-180" size={16} /> Back to report</button><div className="mb-10 text-center"><span className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[0.06] px-3 py-1.5 text-xs text-lime-300"><Zap size={13} /> Rescan complete · {after.mode}</span><h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Your project evolved.</h1><p className="mx-auto mt-4 max-w-xl text-white/45">The revised idea now includes “{twist.title}.” New evidence can raise or lower the bounded differentiation score.</p></div><div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch"><MetricCard label="Before" score={before.score} tone="muted" body={before.summary} /><div className="grid place-items-center"><span className="grid size-12 place-items-center rounded-full border border-lime-300/25 bg-lime-300/10 text-lime-300"><ArrowRight size={19} /></span></div><MetricCard label={`After · ${delta >= 0 ? "+" : ""}${delta}`} score={after.score} tone="bright" body={after.summary} /></div><div className="mt-6 rounded-3xl border border-white/[0.08] bg-[#0c100d] p-6 sm:p-8"><div className="grid gap-8 md:grid-cols-3"><div><p className="text-xs uppercase tracking-[0.14em] text-white/30">Added capability</p><p className="mt-3 font-medium">{twist.title}</p><p className="mt-2 text-sm leading-6 text-white/40">{twist.body}</p></div><div><p className="text-xs uppercase tracking-[0.14em] text-white/30">Research result</p><p className="mt-3 font-medium">{after.viableMatches} viable matches</p><p className="mt-2 text-sm leading-6 text-white/40">The revised concept was checked against {after.sourcesReviewed} public results.</p></div><div><p className="text-xs uppercase tracking-[0.14em] text-white/30">Important limitation</p><p className="mt-3 font-medium">Bounded evidence</p><p className="mt-2 text-sm leading-6 text-white/40">This comparison reflects the sources reviewed, not proof of global originality.</p></div></div></div></section>;
}

function MetricCard({ label, score, body, tone }: { label: string; score: number; body: string; tone: "muted" | "bright" }) {
  return <div className={`rounded-3xl border p-7 ${tone === "bright" ? "border-lime-300/35 bg-lime-300/[0.07]" : "border-white/[0.08] bg-[#0c100d]"}`}><p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">{label}</p><div className="my-5 flex items-end gap-2"><strong className={`text-6xl tracking-[-0.06em] ${tone === "bright" ? "text-lime-300" : "text-white/60"}`}>{score}</strong><span className="mb-1 text-white/20">/100</span></div><p className="text-sm leading-6 text-white/45">{body}</p></div>;
}

function ModeBadge({ mode }: { mode: AnalysisReport["mode"] }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${mode === "live" ? "bg-emerald-300/10 text-emerald-300" : "bg-amber-300/10 text-amber-300"}`}>{mode}</span>;
}
