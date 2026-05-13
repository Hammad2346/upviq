"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Check, X, Pencil, RefreshCw, DatabaseZap, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyze } from "@/contexts/analyze-context";
import { useAuth } from "@/contexts/auth-context";

type RewriteStatus = "applied" | "pending" | "discarded";
type CardState = "idle" | "saving" | "success" | "error";

interface Rewrite {
  id: "title" | "overview" | "skills";
  type: "Title" | "Overview" | "Skill Tags";
  metricLabel: string;
  metricValue: string;
  status: RewriteStatus;
  before: string;
  after: string;
  afterSkills?: string[];
  reason: string;
}

const statusStyles: Record<RewriteStatus, string> = {
  applied:  "bg-primary/10 text-primary border border-primary/20",
  pending:  "bg-amber-100 text-amber-700 border border-amber-200",
  discarded:"bg-muted text-muted-foreground border border-border",
};

const statusLabel: Record<RewriteStatus, string> = {
  applied:  "Applied",
  pending:  "Pending review",
  discarded:"Discarded",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      style={{ backgroundColor: "var(--color-border, #e5e7eb)" }}
    />
  );
}

function SkeletonRewriteCard() {
  return (
    <div className="glass-card rounded-2xl border border-border overflow-hidden bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-5 space-y-2">
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        <div className="p-5 space-y-2">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      </div>
    </div>
  );
}

function buildRewrites(
  dbAiAnalysis: NonNullable<ReturnType<typeof useAuth>["dbAiAnalysis"]>,
  dbProfile: NonNullable<ReturnType<typeof useAuth>["dbProfile"]>
): Rewrite[] {
  const { suggested_title, suggested_overview } = dbAiAnalysis;
  const currentSkills: string[] = dbProfile.skills ?? [];
  const suggestedSkills: string[] = (dbAiAnalysis as any).suggested_skills ?? currentSkills;

  return [
    {
      id: "title",
      type: "Title",
      metricLabel: "keyword relevance",
      metricValue: "+34%",
      status: "pending",
      before: dbProfile.title ?? "",
      after: suggested_title ?? dbProfile.title ?? "",
      reason: dbAiAnalysis.title_reasoning ?? "",
    },
    {
      id: "overview",
      type: "Overview",
      metricLabel: "engagement score",
      metricValue: "+47%",
      status: "pending",
      before: dbProfile.description ?? "",
      after: suggested_overview ?? dbProfile.description ?? "",
      reason: dbAiAnalysis.overview_reasoning ?? "",
    },
    {
      id: "skills",
      type: "Skill Tags",
      metricLabel: "niche-top-10 matches",
      metricValue: `+${Math.max(0, suggestedSkills.length - currentSkills.length)}`,
      status: "pending",
      before: currentSkills.slice(0, 6).join(", "),
      after: suggestedSkills.slice(0, 6).join(", "),
      afterSkills: suggestedSkills,
      reason: dbAiAnalysis.skills_reasoning ?? "",
    },
  ];
}

export default function RewritesPage() {
  const { result, loading: analyzing, error: analyzeError, analyze } = useAnalyze();
  const { dbProfile, dbAiAnalysis, user } = useAuth();

  const [rewrites, setRewrites] = useState<Rewrite[]>([]);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!dbAiAnalysis || !dbProfile) return;
    setRewrites(buildRewrites(dbAiAnalysis, dbProfile));
  }, [dbAiAnalysis, dbProfile]);

  const totalRewrites  = rewrites.length;
  const applied        = rewrites.filter((r) => r.status === "applied").length;
  const acceptanceRate = totalRewrites > 0 ? Math.round((applied / totalRewrites) * 100) : 0;

  const setCardState = useCallback((id: string, state: CardState) => {
    setCardStates((prev) => ({ ...prev, [id]: state }));
  }, []);

  const setCardError = useCallback((id: string, msg: string) => {
    setCardErrors((prev) => ({ ...prev, [id]: msg }));
  }, []);

  async function applyRewrite(rw: Rewrite) {
    if (!dbProfile?.id || !user?.id) return;

    setCardState(rw.id, "saving");
    setCardErrors((prev) => ({ ...prev, [rw.id]: "" }));

    const fields: Record<string, unknown> = {};
    if (rw.id === "title")    fields.title       = rw.after;
    if (rw.id === "overview") fields.description = rw.after;
    if (rw.id === "skills")   fields.skills      = rw.afterSkills ?? [];

    try {
      const res = await fetch(`/api/profiles/${dbProfile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, fields }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to apply");
      }

      setCardState(rw.id, "success");
      setTimeout(() => {
        setRewrites((prev) =>
          prev.map((r) => (r.id === rw.id ? { ...r, status: "applied" } : r))
        );
        setCardState(rw.id, "idle");
      }, 1800);
    } catch (err: any) {
      setCardError(rw.id, err.message ?? "Something went wrong");
      setCardState(rw.id, "error");
      setTimeout(() => {
        setCardState(rw.id, "idle");
        setCardErrors((prev) => ({ ...prev, [rw.id]: "" }));
      }, 5000);
    }
  }

  function discardRewrite(id: Rewrite["id"]) {
    setRewrites((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "discarded" } : r))
    );
  }

  const noAnalysis = !analyzing && !dbAiAnalysis;

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

        <Button
          onClick={() => {
            if (!dbProfile) return;
            analyze({
              profileId:      dbProfile.profile_id,
              name:           dbProfile.name,
              title:          dbProfile.title,
              description:    dbProfile.description,
              profileUrl:     dbProfile.profile_url,
              location:       dbProfile.location,
              avatarUrl:      dbProfile.avatar_url,
              rate:           Number(dbProfile.hourly_rate),
              jobSuccess:     dbProfile.job_success,
              earnings:       dbProfile.earnings,
              hasAvailableNow:dbProfile.available_now,
              hasTopRated:    dbProfile.top_rated,
              skills:         dbProfile.skills ?? [],
              jobsRelatedCount: dbProfile.jobs_related_count,
              scrapedAt:      dbProfile.scraped_at,
            } as any);
          }}
          disabled={analyzing || !dbProfile}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-xs lg:text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto shrink-0"
          style={{ opacity: analyzing ? 0.7 : 1 }}
        >
          {analyzing
            ? <RefreshCw size={15} className="animate-spin" />
            : <Sparkles size={15} />}
          {analyzing ? "Generating…" : "Generate new"}
        </Button>
      </div>

      <hr className="border-border" />

      {analyzeError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {analyzeError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Rewrites"  value={totalRewrites}     sub="Lifetime" />
        <StatCard label="Applied"         value={applied}           sub={`${acceptanceRate}% acceptance rate`} />
        <StatCard label="Avg. Impact"     value="+38%"              sub="Engagement uplift" accent />
      </div>

      <div className="space-y-4">
        {analyzing
          ? [0, 1, 2].map((i) => <SkeletonRewriteCard key={i} />)
          : noAnalysis
            ? <EmptyState />
            : rewrites.map((rw) => (
                <RewriteCard
                  key={rw.id}
                  rw={rw}
                  cardState={cardStates[rw.id] ?? "idle"}
                  cardError={cardErrors[rw.id] ?? ""}
                  onApply={() => applyRewrite(rw)}
                  onDiscard={() => discardRewrite(rw.id)}
                />
              ))
        }
      </div>

    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <DatabaseZap size={22} className="text-primary" />
      </div>
      <p className="font-semibold text-foreground">No analysis saved yet</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Run an AI analysis on this profile and it will appear here ready to review and apply.
      </p>
    </div>
  );
}

function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub: string; accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5 space-y-1 bg-white">
      <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
        {label}
      </p>
      <p className={`text-3xl font-bold tracking-tight ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function RewriteCard({
  rw, cardState, cardError, onApply, onDiscard,
}: {
  rw: Rewrite;
  cardState: CardState;
  cardError: string;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const saving  = cardState === "saving";
  const success = cardState === "success";
  const error   = cardState === "error";

  const cardBorder =
    success ? "border-green-400 ring-2 ring-green-100" :
    error   ? "border-red-300  ring-2 ring-red-100"   :
              "border-border";

  return (
    <div className={`glass-card rounded-2xl border overflow-hidden bg-white transition-all duration-300 ${cardBorder}`}>

      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{rw.type}</p>
            <p className="text-xs text-muted-foreground">{rw.metricValue} {rw.metricLabel}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[rw.status]}`}>
          {statusLabel[rw.status]}
        </span>
      </div>

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

      {rw.reason && (
        <div className="px-5 py-3 border-t border-border bg-gray-50/40">
          <p className="text-xs text-muted-foreground leading-relaxed">{rw.reason}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-5 py-3 border-t border-green-200 bg-green-50 text-green-700 text-xs font-semibold">
          <CheckCircle2 size={14} className="shrink-0" />
          Changes saved to your profile successfully!
        </div>
      )}

      {error && cardError && (
        <div className="flex items-center gap-2 px-5 py-3 border-t border-red-200 bg-red-50 text-red-600 text-xs font-semibold">
          <AlertCircle size={14} className="shrink-0" />
          {cardError}
        </div>
      )}

      {(rw.status === "pending" && !success) && (
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border bg-gray-50/60">
          <button
            onClick={onDiscard}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <X size={13} /> Discard
          </button>
          <button
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <Pencil size={13} /> Edit
          </button>
          <Button
            onClick={onApply}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-70"
          >
            {saving
              ? <RefreshCw size={13} className="animate-spin" />
              : error
                ? <RefreshCw size={13} />
                : <Check size={13} />}
            {saving ? "Saving to profile…" : error ? "Retry" : "Apply changes →"}
          </Button>
        </div>
      )}

    </div>
  );
}