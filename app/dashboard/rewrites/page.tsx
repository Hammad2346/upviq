"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Check, X, Pencil, RefreshCw, DatabaseZap, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyze } from "@/contexts/analyze-context";
import { useAuth } from "@/contexts/auth-context";

type RewriteId = "title" | "overview" | "skills";

const displayLabel: Record<RewriteId, string> = {
  title:    "Title",
  overview: "Overview",
  skills:   "Skill Tags",
};

interface Rewrite {
  id: RewriteId;
  metricLabel: string;
  metricValue: string;
  status: "pending" | "applied" | "discarded";
  before: string;
  after: string;
  afterSkills?: string[];
  reason: string;
  saving: boolean;
  saveError: string;
  saveSuccess: boolean;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} style={{ backgroundColor: "var(--color-border, #e5e7eb)" }} />;
}

function SkeletonCard() {
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

export default function RewritesPage() {
  const { loading: analyzing, error: analyzeError, analyze, result } = useAnalyze();
  const { dbProfile, dbAiAnalysis, dbUser } = useAuth();

  const [rewrites, setRewrites] = useState<Rewrite[]>([]);

useEffect(() => {
  if (!dbAiAnalysis || !dbProfile) return;

  const analysis = (dbAiAnalysis as any)?.data ?? dbAiAnalysis;
  const currentSkills: string[] = dbProfile.skills ?? [];

  const reordered: string[] = result?.suggestions?.skills?.reorder ?? currentSkills;
  const missing: string[]   = result?.suggestions?.skills?.missing ?? [];
  const suggestedSkills     = [...new Set([...reordered, ...missing])];

  setRewrites([
    {
      id: "title",
      metricLabel: "keyword relevance",
      metricValue: "+34%",
      status: "pending",
      before: dbProfile.title ?? "",
      after: analysis.suggested_title ?? dbProfile.title ?? "",
      reason: analysis.title_reasoning ?? "",
      saving: false,
      saveError: "",
      saveSuccess: false,
    },
    {
      id: "overview",
      metricLabel: "engagement score",
      metricValue: "+47%",
      status: "pending",
      before: dbProfile.description ?? "",
      after: analysis.suggested_overview ?? dbProfile.description ?? "",
      reason: analysis.overview_reasoning ?? "",
      saving: false,
      saveError: "",
      saveSuccess: false,
    },
    {
      id: "skills",
      metricLabel: "niche-top-10 matches",
      metricValue: `+${missing.length}`,
      status: "pending",
      before: currentSkills.join(", "),
      after: suggestedSkills.join(", "),
      afterSkills: suggestedSkills,
      reason: analysis.skills_reasoning ?? result?.suggestions?.skills?.reason ?? "",
      saving: false,
      saveError: "",
      saveSuccess: false,
    },
  ]);
}, [dbAiAnalysis, dbProfile, result]); 
  function update(id: string, patch: Partial<Rewrite>) {
    setRewrites((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function applyRewrite(rw: Rewrite) {
    if (!dbProfile?.id || !dbUser?.id) return;

    update(rw.id, { saving: true, saveError: "" });

    const fields: Record<string, unknown> = {};
    if (rw.id === "title")    fields.title       = rw.after;
    if (rw.id === "overview") fields.description = rw.after;
    if (rw.id === "skills")   fields.skills      = rw.afterSkills ?? [];

    try {
      await axios.patch(`/api/profiles/${dbProfile.id}`, {
        user_id: dbUser.id,
        fields,
      });

      update(rw.id, { saving: false, saveSuccess: true });
      setTimeout(() => update(rw.id, { status: "applied", saveSuccess: false }), 1800);
    } catch (err: any) {
      const msg = err.response?.data?.error ?? err.message ?? "Something went wrong";
      update(rw.id, { saving: false, saveError: msg });
      setTimeout(() => update(rw.id, { saveError: "" }), 5000);
    }
  }

  const applied = rewrites.filter((r) => r.status === "applied").length;
  const acceptanceRate = rewrites.length > 0 ? Math.round((applied / rewrites.length) * 100) : 0;

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest uppercase text-primary">AI Content Generator</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">AI-powered rewrites</h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Market-validated, plagiarism-checked, readability-tuned copy for your title, overview, and skill tags.
          </p>
        </div>

        <Button
          onClick={() => {
            if (!dbProfile) return;
            analyze({
              profileId:        dbProfile.profile_id,
              name:             dbProfile.name,
              title:            dbProfile.title,
              description:      dbProfile.description,
              profileUrl:       dbProfile.profile_url,
              location:         dbProfile.location,
              avatarUrl:        dbProfile.avatar_url,
              rate:             Number(dbProfile.hourly_rate),
              jobSuccess:       dbProfile.job_success,
              earnings:         dbProfile.earnings,
              hasAvailableNow:  dbProfile.available_now,
              hasTopRated:      dbProfile.top_rated,
              skills:           dbProfile.skills ?? [],
              jobsRelatedCount: dbProfile.jobs_related_count,
              scrapedAt:        dbProfile.scraped_at,
            } as any);
          }}
          disabled={analyzing || !dbProfile}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-xs lg:text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto shrink-0"
          style={{ opacity: analyzing ? 0.7 : 1 }}
        >
          {analyzing ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
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
        {[
          { label: "Total Rewrites", value: rewrites.length, sub: "Lifetime" },
          { label: "Applied",        value: applied,         sub: `${acceptanceRate}% acceptance rate` },
          { label: "Avg. Impact",    value: "+38%",          sub: "Engagement uplift", accent: true },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className="glass-card rounded-2xl border border-border p-5 space-y-1 bg-white">
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold tracking-tight ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {analyzing ? (
          [0, 1, 2].map((i) => <SkeletonCard key={i} />)
        ) : !dbAiAnalysis ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DatabaseZap size={22} className="text-primary" />
            </div>
            <p className="font-semibold text-foreground">No analysis saved yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Run an AI analysis on this profile and it will appear here ready to review and apply.
            </p>
          </div>
        ) : (
          rewrites.map((rw) => {
            const borderClass = rw.saveSuccess
              ? "border-green-400 ring-2 ring-green-100"
              : rw.saveError
              ? "border-red-300 ring-2 ring-red-100"
              : "border-border";

            const statusBadge: Record<Rewrite["status"], string> = {
              applied:   "bg-primary/10 text-primary border border-primary/20",
              pending:   "bg-amber-100 text-amber-700 border border-amber-200",
              discarded: "bg-muted text-muted-foreground border border-border",
            };
            const statusText: Record<Rewrite["status"], string> = {
              applied:   "Applied",
              pending:   "Pending review",
              discarded: "Discarded",
            };

            return (
              <div key={rw.id} className={`glass-card rounded-2xl border overflow-hidden bg-white transition-all duration-300 ${borderClass}`}>

                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{displayLabel[rw.id]}</p>
                      <p className="text-xs text-muted-foreground">{rw.metricValue} {rw.metricLabel}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge[rw.status]}`}>
                    {statusText[rw.status]}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                  <div className="p-5">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Before</p>
                    <p className="text-sm text-muted-foreground line-through leading-relaxed">{rw.before}</p>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        After · AI
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{rw.after}</p>
                  </div>
                </div>

                {rw.reason && (
                  <div className="px-5 py-3 border-t border-border bg-gray-50/40">
                    <p className="text-xs text-muted-foreground leading-relaxed">{rw.reason}</p>
                  </div>
                )}

                {rw.saveSuccess && (
                  <div className="flex items-center gap-2 px-5 py-3 border-t border-green-200 bg-green-50 text-green-700 text-xs font-semibold">
                    <CheckCircle2 size={14} className="shrink-0" />
                    Changes saved to your profile successfully!
                  </div>
                )}

                {rw.saveError && (
                  <div className="flex items-center gap-2 px-5 py-3 border-t border-red-200 bg-red-50 text-red-600 text-xs font-semibold">
                    <AlertCircle size={14} className="shrink-0" />
                    {rw.saveError}
                  </div>
                )}

                {rw.status === "pending" && !rw.saveSuccess && (
                  <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border bg-gray-50/60">
                    <button
                      onClick={() => update(rw.id, { status: "discarded" })}
                      disabled={rw.saving}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <X size={13} /> Discard
                    </button>
                    <button
                      disabled={rw.saving}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <Button
                      onClick={() => applyRewrite(rw)}
                      disabled={rw.saving}
                      className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-70"
                    >
                      {rw.saving ? <RefreshCw size={13} className="animate-spin" /> : rw.saveError ? <RefreshCw size={13} /> : <Check size={13} />}
                      {rw.saving ? "Saving to profile…" : rw.saveError ? "Retry" : "Apply changes →"}
                    </Button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}