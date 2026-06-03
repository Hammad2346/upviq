"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Sparkles,
  Check,
  X,
  Pencil,
  RefreshCw,
  DatabaseZap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { RewriteResult } from "@/lib/analyze/types";

type RewriteId = "title" | "overview" | "skills";

const displayLabel: Record<RewriteId, string> = {
  title:    "Title",
  overview: "Overview",
  skills:   "Skill Tags",
};

type CardState = "idle" | "saving" | "success" | "error";

interface RewriteCard {
  id: RewriteId;
  status: "pending" | "applied" | "discarded";
  before: string;
  after: string;
  afterSkills?: string[];
  reason: string;
  cardState: CardState;
  saveError: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ backgroundColor: "var(--color-border, #e5e7eb)" }}
    />
  );
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

function buildCards(
  rewrite: RewriteResult,
  dbProfile: any
): RewriteCard[] {
  const missingSkills = rewrite.skills
    .filter((s) => s.skill_type === "missing")
    .sort((a, b) => a.position - b.position)
    .map((s) => s.skill);

  const reorderedSkills = rewrite.skills
    .filter((s) => s.skill_type === "reorder")
    .sort((a, b) => a.position - b.position)
    .map((s) => s.skill);

  const suggestedSkills = [...new Set([...reorderedSkills, ...missingSkills])];

  return [
    {
      id: "title",
      status: "pending",
      before: dbProfile.title ?? "",
      after: rewrite.suggested_title ?? dbProfile.title ?? "",
      reason: rewrite.title_reason ?? "",
      cardState: "idle",
      saveError: "",
    },
    {
      id: "overview",
      status: "pending",
      before: dbProfile.description ?? "",
      after: rewrite.suggested_overview ?? dbProfile.description ?? "",
      reason: rewrite.overview_reason ?? "",
      cardState: "idle",
      saveError: "",
    },
    {
      id: "skills",
      status: "pending",
      before: (dbProfile.skills ?? []).join(", "),
      after: suggestedSkills.join(", "),
      afterSkills: suggestedSkills,
      reason: rewrite.skills_reason ?? "",
      cardState: "idle",
      saveError: "",
    },
  ];
}

export default function RewritesPage() {
  const { dbProfile, dbAiAnalysis, dbUser } = useAuth();

  const [rewrite, setRewrite] = useState<RewriteResult | null>(null);
  const [cards, setCards] = useState<RewriteCard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [loadingRewrite, setLoadingRewrite] = useState(true);

  const fetchRewrite = useCallback(async () => {
    if (!dbProfile?.id || !dbUser?.id) return;
    try {
      const res = await axios.get(
        `/api/rewrite/${dbProfile.id}?user_id=${dbUser.id}`
      );
      if (res.data.success) {
        setRewrite(res.data.data);
        setCards(buildCards(res.data.data, dbProfile));
      }
    } catch {
    } finally {
      setLoadingRewrite(false);
    }
  }, [dbProfile, dbUser]);

  useEffect(() => {
    fetchRewrite();
  }, [fetchRewrite]);

async function generateRewrites() {
  if (!dbProfile?.id || !dbUser?.id || !dbAiAnalysis) return;

  setGenerating(true);
  setGenerateError("");

  try {
    const freshRes = await axios.get(
      `/api/profiles/${dbProfile.id}/analysis?user_id=${dbUser.id}`
    );
    if (!freshRes.data.success) throw new Error("Could not fetch latest analysis");
    
    const analysis = freshRes.data.data;

    const scoring = {
      titleOptimization: { score: analysis.title_score, reasoning: analysis.title_reasoning },
      overviewQuality:   { score: analysis.overview_score, reasoning: analysis.overview_reasoning },
      skillTagsCoverage: { score: analysis.skills_score, reasoning: analysis.skills_reasoning },
      ratePositioning:   { score: analysis.rate_score, reasoning: analysis.rate_reasoning },
      engagementSignals: { score: analysis.engagement_score, reasoning: analysis.engagement_reasoning },
    };

    const profileRes = await axios.get(`/api/profiles/${dbUser.id}`);
    const freshProfile = profileRes.data;

    const profile = {
      profileId:        freshProfile.profile_id,
      name:             freshProfile.name,
      title:            freshProfile.title,
      description:      freshProfile.description,
      profileUrl:       freshProfile.profile_url,
      location:         freshProfile.location,
      avatarUrl:        freshProfile.avatar_url,
      rate:             Number(freshProfile.hourly_rate),
      jobSuccess:       freshProfile.job_success,
      earnings:         freshProfile.earnings,
      hasAvailableNow:  freshProfile.available_now,
      hasTopRated:      freshProfile.top_rated,
      skills:           freshProfile.skills ?? [],
      jobsRelatedCount: freshProfile.jobs_related_count,
      scrapedAt:        freshProfile.scraped_at,
    };

    const res = await axios.post(`/api/rewrite/${dbProfile.id}`, {
      user_id: dbUser.id,
      profile,
      scoring,
    });

    if (res.data.success) {
      await fetchRewrite();
    }
  } catch (err: any) {
    setGenerateError(
      err.response?.data?.error ?? err.message ?? "Failed to generate rewrites"
    );
  } finally {
    setGenerating(false);
  }
}

  function updateCard(id: string, patch: Partial<RewriteCard>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function applyRewrite(card: RewriteCard) {
    if (!dbProfile?.id || !dbUser?.id) return;

    updateCard(card.id, { cardState: "saving", saveError: "" });

    const fields: Record<string, unknown> = {};
    if (card.id === "title")    fields.title       = card.after;
    if (card.id === "overview") fields.description = card.after;
    if (card.id === "skills")   fields.skills      = card.afterSkills ?? [];

    try {
      await axios.patch(`/api/profiles/${dbProfile.id}`, {
        user_id: dbUser.id,
        fields,
      });

      updateCard(card.id, { cardState: "success" });
      setTimeout(
        () => updateCard(card.id, { status: "applied", cardState: "idle" }),
        1800
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.error ?? err.message ?? "Something went wrong";
      updateCard(card.id, { cardState: "error", saveError: msg });
      setTimeout(() => updateCard(card.id, { cardState: "idle", saveError: "" }), 5000);
    }
  }

  const applied = cards.filter((c) => c.status === "applied").length;
  const acceptanceRate =
    cards.length > 0 ? Math.round((applied / cards.length) * 100) : 0;

  const isLoading = loadingRewrite || generating;
  const hasAnalysis = !!dbAiAnalysis;

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
          onClick={generateRewrites}
          disabled={isLoading || !dbProfile || !hasAnalysis}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-xs lg:text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto shrink-0"
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          {generating ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <Sparkles size={15} />
          )}
          {generating ? "Generating…" : rewrite ? "Regenerate" : "Generate rewrites"}
        </Button>
      </div>

      <hr className="border-border" />

      {generateError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {generateError}
        </div>
      )}

      {!hasAnalysis && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Run a profile analysis first before generating rewrites.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Rewrites", value: cards.length, sub: "Lifetime" },
          {
            label: "Applied",
            value: applied,
            sub: `${acceptanceRate}% acceptance rate`,
          },
          {
            label: "Avg. Impact",
            value: "+38%",
            sub: "Engagement uplift",
            accent: true,
          },
        ].map(({ label, value, sub, accent }) => (
          <div
            key={label}
            className="glass-card rounded-2xl border border-border p-5 space-y-1 bg-white"
          >
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
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [0, 1, 2].map((i) => <SkeletonCard key={i} />)
        ) : !rewrite ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DatabaseZap size={22} className="text-primary" />
            </div>
            <p className="font-semibold text-foreground">No rewrites generated yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {hasAnalysis
                ? 'Click "Generate rewrites" to create AI-powered suggestions for your profile.'
                : "Run a profile analysis first, then come back here to generate rewrites."}
            </p>
          </div>
        ) : (
          cards.map((card) => {
            const borderClass =
              card.cardState === "success"
                ? "border-green-400 ring-2 ring-green-100"
                : card.cardState === "error"
                ? "border-red-300 ring-2 ring-red-100"
                : "border-border";

            const statusBadge: Record<RewriteCard["status"], string> = {
              applied:   "bg-primary/10 text-primary border border-primary/20",
              pending:   "bg-amber-100 text-amber-700 border border-amber-200",
              discarded: "bg-muted text-muted-foreground border border-border",
            };
            const statusText: Record<RewriteCard["status"], string> = {
              applied:   "Applied",
              pending:   "Pending review",
              discarded: "Discarded",
            };

            return (
              <div
                key={card.id}
                className={`glass-card rounded-2xl border overflow-hidden bg-white transition-all duration-300 ${borderClass}`}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {displayLabel[card.id]}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge[card.status]}`}
                  >
                    {statusText[card.status]}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                  <div className="p-5">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
                      Before
                    </p>
                    <p className="text-sm text-muted-foreground line-through leading-relaxed">
                      {card.before}
                    </p>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        After · AI
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium leading-relaxed">
                      {card.after}
                    </p>
                  </div>
                </div>

                {card.reason && (
                  <div className="px-5 py-3 border-t border-border bg-gray-50/40">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {card.reason}
                    </p>
                  </div>
                )}

                {card.cardState === "success" && (
                  <div className="flex items-center gap-2 px-5 py-3 border-t border-green-200 bg-green-50 text-green-700 text-xs font-semibold">
                    <CheckCircle2 size={14} className="shrink-0" />
                    Changes saved to your profile successfully!
                  </div>
                )}

                {card.cardState === "error" && (
                  <div className="flex items-center gap-2 px-5 py-3 border-t border-red-200 bg-red-50 text-red-600 text-xs font-semibold">
                    <AlertCircle size={14} className="shrink-0" />
                    {card.saveError}
                  </div>
                )}

                {card.status === "pending" && card.cardState !== "success" && (
                  <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border bg-gray-50/60">
                    <button
                      onClick={() => updateCard(card.id, { status: "discarded" })}
                      disabled={card.cardState === "saving"}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <X size={13} /> Discard
                    </button>
                    <button
                      disabled={card.cardState === "saving"}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <Button
                      onClick={() => applyRewrite(card)}
                      disabled={card.cardState === "saving"}
                      className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-70"
                    >
                      {card.cardState === "saving" ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : card.cardState === "error" ? (
                        <RefreshCw size={13} />
                      ) : (
                        <Check size={13} />
                      )}
                      {card.cardState === "saving"
                        ? "Saving to profile…"
                        : card.cardState === "error"
                        ? "Retry"
                        : "Apply changes →"}
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