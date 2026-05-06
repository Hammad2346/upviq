"use client";

import { useState } from "react";
import { Sparkles, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

type RewriteStatus = "applied" | "pending" | "discarded";

interface Rewrite {
  id: number;
  type: "Title" | "Overview" | "Skill Tags";
  timeAgo: string;
  metricLabel: string;
  metricValue: string;
  status: RewriteStatus;
  before: string;
  after: string;
}

const INITIAL_REWRITES: Rewrite[] = [
  {
    id: 1,
    type: "Title",
    timeAgo: "2 days ago",
    metricLabel: "keyword match",
    metricValue: "+34%",
    status: "applied",
    before: "Web Developer | React | Frontend",
    after: "Senior React & TypeScript Developer | AI-Powered SaaS Specialist",
  },
  {
    id: 2,
    type: "Overview",
    timeAgo: "5 hours ago",
    metricLabel: "engagement score",
    metricValue: "+47%",
    status: "pending",
    before:
      "I'm a frontend developer with experience in React. I build websites and web apps for clients...",
    after:
      "I architect performance-obsessed React + TypeScript applications for SaaS founders shipping fast. Over 60+ projects delivered with measurable impact on Core Web Vitals, conversion, and DX...",
  },
  {
    id: 3,
    type: "Skill Tags",
    timeAgo: "1 week ago",
    metricLabel: "niche-top-10 matches",
    metricValue: "+5",
    status: "applied",
    before: "JavaScript, HTML, CSS, React",
    after:
      "React, TypeScript, Next.js, AI/LLM Integration, Tailwind CSS, Edge Functions, Supabase",
  },
];

const statusStyles: Record<RewriteStatus, string> = {
  applied:
    "bg-primary/10 text-primary border border-primary/20",
  pending:
    "bg-amber-100 text-amber-700 border border-amber-200",
  discarded:
    "bg-muted text-muted-foreground border border-border",
};

const statusLabel: Record<RewriteStatus, string> = {
  applied: "Applied",
  pending: "Pending review",
  discarded: "Discarded",
};

export default function RewritesPage() {
  const [rewrites, setRewrites] = useState<Rewrite[]>(INITIAL_REWRITES);

  const totalRewrites = rewrites.length;
  const applied = rewrites.filter((r) => r.status === "applied").length;
  const acceptanceRate =
    totalRewrites > 0 ? Math.round((applied / totalRewrites) * 100) : 0;
  const avgImpact = "+38%";

  function applyRewrite(id: number) {
    setRewrites((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "applied" } : r))
    );
  }

  function discardRewrite(id: number) {
    setRewrites((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "discarded" } : r))
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest uppercase text-primary">
            AI Content Generator
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            AI-powered rewrites
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Market-validated, plagiarism-checked, readability-tuned copy for
            your title, overview, and skill tags.
          </p>
        </div>

        <Button className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-xs lg:text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto shrink-0">
          <Sparkles size={15} />
          Generate new
        </Button>
      </div>

      <hr className="border-border" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Rewrites"
          value={totalRewrites}
          sub="Lifetime"
        />
        <StatCard
          label="Applied"
          value={applied}
          sub={`${acceptanceRate}% acceptance rate`}
        />
        <StatCard
          label="Avg. Impact"
          value={avgImpact}
          sub="Engagement uplift"
          accent
        />
      </div>

      {/* Rewrite Cards */}
      <div className="space-y-4">
        {rewrites.map((rw) => (
          <RewriteCard
            key={rw.id}
            rw={rw}
            onApply={() => applyRewrite(rw.id)}
            onDiscard={() => discardRewrite(rw.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5 space-y-1 bg-white">
      <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-3xl font-bold tracking-tight ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function RewriteCard({
  rw,
  onApply,
  onDiscard,
}: {
  rw: Rewrite;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="glass-card rounded-2xl border border-border overflow-hidden bg-white">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{rw.type}</p>
            <p className="text-xs text-muted-foreground">{rw.timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-primary hidden sm:block">
            {rw.metricValue} {rw.metricLabel}
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[rw.status]}`}
          >
            {statusLabel[rw.status]}
          </span>
        </div>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
            Before
          </p>
          <p className="text-sm text-muted-foreground line-through leading-relaxed">
            {rw.before}
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              After · AI
            </span>
          </div>
          <p className="text-sm text-foreground font-medium leading-relaxed">
            {rw.after}
          </p>
        </div>
      </div>

      {/* Actions — only show for pending */}
      {rw.status === "pending" && (
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border bg-gray-50/60">
          <button
            onClick={onDiscard}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={13} /> Discard
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <Pencil size={13} /> Edit
          </button>
          <Button
            onClick={onApply}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            <Check size={13} /> Apply changes →
          </Button>
        </div>
      )}
    </div>
  );
}