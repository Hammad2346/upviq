"use client";

import { useEffect, useState } from "react";
import {
  MapPin, Star, Clock, Award, Link2, Briefcase,
  ChevronDown, ChevronUp, ExternalLink, Plug, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyze } from "@/contexts/analyze-context";
import { useAuth } from "@/contexts/auth-context";
import { saveAnalysis, saveProfile } from "@/lib/api";
import { Freelancer } from "@/lib/dataStructuring";
import axios from "axios";
import { useSearchParams } from "next/navigation";

function mapDbProfile(row: any): Freelancer {
  return {
    profileId:        row.profile_id,
    name:             row.name,
    title:            row.title,
    profileUrl:       row.profile_url,
    searchUrl:        row.search_url,
    location:         row.location,
    avatarUrl:        row.avatar_url,
    rate:             row.hourly_rate,
    jobSuccess:       row.job_success,
    earnings:         row.earnings,
    hasAvailableNow:  row.available_now,
    hasTopRated:      row.top_rated,
    description:      row.description,
    jobsRelatedCount: row.jobs_related_count,
    scrapedAt:        row.scraped_at,
    skills:           row.skills ?? [],
  };
}

export default function ProfilePage() {
  const [analyzed,     setAnalyzed]     = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [profile,      setProfile]      = useState<Freelancer | null>(null);
  const [oauthBanner,  setOauthBanner]  = useState<"connected" | "denied" | "error" | null>(null);

  const { analyze }                                                      = useAnalyze();
  const { dbUser, dbProfile, loading: authLoading, upworkConnected,
          refreshUpworkStatus }                                           = useAuth();

  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("upwork")
    if (status === "connected") {
      setOauthBanner("connected")
      refreshUpworkStatus()
    } else if (status === "denied") {
      setOauthBanner("denied")
    } else if (status === "error") {
      setOauthBanner("error")
    }
  }, [searchParams])

  const savedProfile  = dbProfile ? mapDbProfile(dbProfile) : null;
  const activeProfile = profile ?? savedProfile;
  const descLines     = activeProfile?.description?.split("\n");
  const descPreview   = descLines?.slice(0, 4).join("\n");

  function handleConnectUpwork() {
    if (!dbUser?.id) return
    window.location.href = `/api/auth/upwork?user_id=${dbUser.id}`
  }

  async function handleFetchAndAnalyze() {
    if (!dbUser?.id) return
    setLoading(true)
    setFetchError(null)

    try {
      const fetchRes = await axios.get(`/api/profile/fetch?user_id=${dbUser.id}`)
      const fetched: Freelancer = fetchRes.data.profile

      const saved = await saveProfile(dbUser.id, fetched)
      if (!saved.success) throw new Error("Failed to save profile")

      const analyzeRes = await axios.post("/api/analyze", { profile: fetched })
      if (!analyzeRes.data.success) throw new Error("Analysis failed")

      await saveAnalysis(saved.freelancerProfileId, dbUser.id, analyzeRes.data.data)

      setProfile(fetched)
      setAnalyzed(true)
    } catch (err: any) {
      const msg = err?.response?.data?.error
      if (msg === "upwork_not_connected" || msg === "upwork_token_expired") {
        setFetchError("Your Upwork connection expired. Please reconnect.")
        refreshUpworkStatus()
      } else {
        setFetchError("Something went wrong fetching your profile. Try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleReanalyze() {
    if (!activeProfile) return
    setLoading(true)
    try {
      const saved = await saveProfile(dbUser.id, activeProfile)
      if (saved.success) {
        const res = await axios.post("/api/analyze", { profile: activeProfile })
        if (res.data.success) {
          await saveAnalysis(saved.freelancerProfileId, dbUser.id, res.data.data)
          setAnalyzed(true)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 p-6">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-widest uppercase text-primary">Profile Analyzer</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
          Your Upwork Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Connect your Upwork account to pull your profile and run an AI analysis.
        </p>
      </div>

      <hr className="border-border" />

      {oauthBanner === "connected" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <CheckCircle2 size={16} />
          Upwork account connected successfully.
        </div>
      )}
      {(oauthBanner === "denied" || oauthBanner === "error") && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          <AlertCircle size={16} />
          {oauthBanner === "denied"
            ? "Upwork authorization was cancelled."
            : "Something went wrong connecting to Upwork. Try again."}
        </div>
      )}

      {!upworkConnected ? (
        <div className="glass-card glow-border rounded-2xl p-8 flex flex-col items-center gap-6"
          style={{ background: "radial-gradient(ellipse at top, var(--color-primary) / 0.06, transparent 60%), var(--gradient-card)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--color-primary) / 0.15, var(--color-secondary) / 0.1)", border: "1px solid var(--color-primary) / 0.2" }}>
            <Plug size={22} className="text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
              Connect your Upwork account
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              We'll fetch your profile directly from Upwork so the analysis reflects your real, live data.
            </p>
          </div>
          <Button
            onClick={handleConnectUpwork}
            className="h-11 px-6 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Connect Upwork
          </Button>
        </div>
      ) : (
        <div className="glass-card glow-border rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Upwork account connected</p>
              <p className="text-xs text-muted-foreground">Ready to fetch your latest profile data</p>
            </div>
          </div>
          <Button
            onClick={handleFetchAndAnalyze}
            disabled={loading}
            className="h-9 px-5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Fetching…
              </span>
            ) : (activeProfile ? "Re-fetch & Analyze" : "Fetch & Analyze")}
          </Button>
        </div>
      )}

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={15} />
          {fetchError}
        </div>
      )}

      {activeProfile && (
        <ProfileCard
          activeProfile={activeProfile}
          descExpanded={descExpanded}
          setDescExpanded={setDescExpanded}
          descPreview={descPreview ?? ""}
          onReanalyze={handleReanalyze}
          loading={loading}
        />
      )}
    </div>
  );
}

function ProfileCard({ activeProfile, descExpanded, setDescExpanded, descPreview, onReanalyze, loading }: {
  activeProfile:   Freelancer;
  descExpanded:    boolean;
  setDescExpanded: (v: boolean) => void;
  descPreview:     string;
  onReanalyze?:    () => void;
  loading?:        boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="glass-card glow-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="shrink-0">
            <img src={activeProfile.avatarUrl} alt={activeProfile.name}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{ border: "2px solid var(--color-border)" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </div>
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
                  {activeProfile.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5 max-w-xl leading-snug">{activeProfile.title}</p>
              </div>
              <div className="flex items-center gap-3">
                {onReanalyze && (
                  <Button onClick={onReanalyze} disabled={loading}
                    className="h-8 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Analyzing…
                      </span>
                    ) : "Reanalyze"}
                  </Button>
                )}
                <a href={activeProfile.profileUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-75 transition-opacity shrink-0">
                  View on Upwork <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin size={12} /> {activeProfile.location}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Briefcase size={12} /> {activeProfile.jobsRelatedCount} jobs</span>
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground">
                Fetched {new Date(activeProfile.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeProfile.hasTopRated && <Badge icon={<Award size={11} />} label="Top Rated" color="var(--color-secondary)" />}
              {activeProfile.hasAvailableNow && <Badge icon={<Clock size={11} />} label="Available Now" color="#10b981" />}
              {activeProfile.jobSuccess && <Badge icon={<Star size={11} />} label={`${activeProfile.jobSuccess}% Job Success`} color="var(--color-primary)" />}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="Hourly Rate" value={`$${activeProfile.rate}/hr`} />
        <StatBox label="Job Success" value={activeProfile.jobSuccess ? `${activeProfile.jobSuccess}%` : "—"} highlight />
        <StatBox label="Related Jobs" value={activeProfile.jobsRelatedCount ? `${activeProfile.jobsRelatedCount}` : "—"} />
        <StatBox label="Earnings" value={activeProfile.earnings ?? "—"} highlight />
      </div>

      <div className="glass-card glow-border rounded-2xl p-6 space-y-4">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-foreground">Skills</p>
          <p className="text-xs text-muted-foreground">{activeProfile.skills.length} skills listed on profile</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeProfile.skills.map((s) => <SkillPill key={s} label={s} />)}
        </div>
      </div>

      <div className="glass-card glow-border rounded-2xl p-6 space-y-4">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-foreground">Overview</p>
          <p className="text-xs text-muted-foreground">Profile bio as shown on Upwork</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {descExpanded ? activeProfile.description : descPreview}{!descExpanded && "…"}
        </p>
        <button onClick={() => setDescExpanded(!descExpanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-75 transition-opacity">
          {descExpanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read more</>}
        </button>
      </div>
    </div>
  );
}

function Badge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ color, borderColor: `${color}40`, background: `${color}12` }}>
      {icon}{label}
    </span>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 glow-border">
      <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold tracking-tight text-foreground" style={highlight ? { color: "var(--color-primary)" } : undefined}>
        {value}
      </span>
    </div>
  );
}

function SkillPill({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium border border-border bg-gray-100 text-foreground">
      {label}
    </span>
  );
}