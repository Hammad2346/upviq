"use client";

import { useState } from "react";
import {
  MapPin, Star, Clock, Award, Link2, Briefcase,
  ChevronDown, ChevronUp, Search, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnalyze } from "@/contexts/analyze-context";
import { useAuth } from "@/contexts/auth-context";
import { saveAnalysis, saveProfile } from "@/lib/api";
import { Freelancer } from "@/lib/dataStructuring";
import axios from "axios";

const DEMO_PROFILE: Freelancer = {
  "searchUrl": "https://www.upwork.com/nx/search/talent/?nbs=1&q=ai%20enabled%20game%20developer",
  "name": "Muhammad Arif H.",
  "profileId": "01a9936b6343f6bd40",
  "profileUrl": "https://www.upwork.com/freelancers/~01a9936b6343f6bd40?referrer_url_path=/nx/search/talent/",
  "title": "Top-Rated Unity Game Developer | Multiplayer | Game Developer | VR/AR",
  "location": "Pakistan",
  "avatarUrl": "https://www.upwork.com/profile-portraits/c1agzH8GEElTk2JeAbWyE6iUNXFhqzrmuVbIQt4bqAiUDQf3mSZo0mISOgI85usTIK",
  "rate": 30,
  "jobSuccess": 100,
  "earnings": "",
  "hasAvailableNow": true,
  "hasTopRated": true,
  "skills": [
    "Game Development",
    "Unity",
    "Mobile Game Development",
    "Multiplayer",
    "AR & VR Development",
    "Mobile Game",
    "Game Design",
    "Game Level",
    "Game Controller",
    "Game UI/UX Design",
    "Unreal Engine",
    "3D Game Art",
    "2D Game Art",
    "Card Game",
    "C#"
  ],
  "description": "I’m a Top-Rated Unity Game Developer with 10+ years of experience creating high-performance, engaging games for Mobile, PC, and WebGL. I help studios, startups, and indie teams turn ideas into production-ready, scalable, and visually polished games from core gameplay mechanics and user experience to full live deployment. 🔥 Core Game Development Expertise Unity 2D & 3D Game Development Cross-Platform Game Builds (Android, iOS, PC, WebGL) Gameplay Mechanics, Progression, and Balancing Game UI & UX, Menus, HUDs, and Animations Performance Optimization (FPS, memory, loading speed) Modular & Reusable Game Systems Multiplayer Features using Photon / Mirror / Netcode AR/VR & Interactive Experiences 🧩 What I Can Build Full mobile or PC games (casual, action, strategy, or simulation) Scalable gameplay systems & reusable frameworks Matchmaking, leaderboards, and progression systems Live updates, analytics & in-app content management Interactive AR/VR or WebGL-based projects ⭐ Why Clients Choose Me ✔ Top-Rated with 100% Job Success ✔ 10+ years of diverse Unity development experience ✔ Strong system design & debugging skills ✔ Clear communication, reliable delivery, and fast iteration I understand what makes a game feel fun, optimized, and stable. My focus is always on delivering production-quality games with clean architecture, creative design, and smooth player experience. 👉 Let’s discuss how to bring your game idea to life from concept to live release.",
  "jobsRelatedCount": 20,
  "scrapedAt": "2026-04-01T08:36:42.806Z"
}
function mapDbProfile(row: any): Freelancer {
  return {
    profileId: row.profile_id,
    name: row.name,
    title: row.title,
    profileUrl: row.profile_url,
    searchUrl: row.search_url,
    location: row.location,
    avatarUrl: row.avatar_url,
    rate: row.hourly_rate,
    jobSuccess: row.job_success,
    earnings: row.earnings,
    hasAvailableNow: row.available_now,
    hasTopRated: row.top_rated,
    description: row.description,
    jobsRelatedCount: row.jobs_related_count,
    scrapedAt: row.scraped_at,
    skills: row.skills ?? [],
  };
}

export default function ProfilePage() {
  const [url, setUrl] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Freelancer | null>(null);

  const { analyze } = useAnalyze();
  const { dbUser, dbProfile, loading: authLoading } = useAuth();

  const savedProfile = dbProfile ? mapDbProfile(dbProfile) : null;
  const activeProfile = profile ?? savedProfile;
  const descLines = activeProfile?.description?.split("\n");
  const descPreview = descLines?.slice(0, 4).join("\n");

async function handleAnalyze() {
  setLoading(true);
  try {
    const saved = await saveProfile(dbUser.id, DEMO_PROFILE);

    if (saved.success) {
      const res = await axios.post("/api/analyze", { profile: DEMO_PROFILE });

      if (res.data.success) {
        await saveAnalysis(saved.freelancerProfileId, dbUser.id, res.data.data);
        setProfile(DEMO_PROFILE);
        setAnalyzed(true);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }


  if (savedProfile && !analyzed) {
    return (
      <div className="min-h-screen space-y-8 p-6">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest uppercase text-primary">Profile Analyzer</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
            Your Upwork Profile
          </h1>
          <p className="text-muted-foreground text-sm">Your saved profile. Hit Reanalyze to run a fresh AI analysis.</p>
        </div>
        <hr className="border-border" />
        <ProfileCard
          activeProfile={savedProfile}
          descExpanded={descExpanded}
          setDescExpanded={setDescExpanded}
          descPreview={descPreview ?? ""}
          onReanalyze={handleAnalyze}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 p-6">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-widest uppercase text-primary">Profile Analyzer</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
          Analyze any Upwork profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Paste a public Upwork profile URL to pull key data and review it at a glance.
        </p>
      </div>

      <hr className="border-border" />

      <div className="glass-card glow-border rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{ background: "radial-gradient(ellipse at top, var(--color-primary) / 0.06, transparent 60%), var(--gradient-card)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--color-primary) / 0.15, var(--color-secondary) / 0.1)", border: "1px solid var(--color-primary) / 0.2" }}>
          <Search size={22} className="text-primary" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-base font-bold text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>Enter a profile URL</p>
          <p className="text-xs text-muted-foreground">e.g. https://www.upwork.com/freelancers/~xxxxxxxxxxxxxxx</p>
        </div>

        <div className="flex w-full max-w-2xl gap-3">
          <div className="relative flex-1">
            <Link2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="https://www.upwork.com/freelancers/~..."
              className="pl-10 h-12 rounded-xl bg-white border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 text-sm"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={!url || loading}
            className="h-12 px-6 rounded-xl font-semibold text-sm shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-200 disabled:text-muted-foreground transition-all">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Analyzing…
              </span>
            ) : "Analyze"}
          </Button>
        </div>

        {!analyzed && (
          <button onClick={() => { setProfile(DEMO_PROFILE); setAnalyzed(true); }}
            className="text-xs text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
            Load demo profile
          </button>
        )}
      </div>

      {analyzed && activeProfile && (
        <ProfileCard
          activeProfile={activeProfile}
          descExpanded={descExpanded}
          setDescExpanded={setDescExpanded}
          descPreview={descPreview ?? ""}
        />
      )}
    </div>
  );
}

function ProfileCard({ activeProfile, descExpanded, setDescExpanded, descPreview, onReanalyze, loading }: {
  activeProfile: Freelancer;
  descExpanded: boolean;
  setDescExpanded: (v: boolean) => void;
  descPreview: string;
  onReanalyze?: () => void;
  loading?: boolean;
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
                Scraped {new Date(activeProfile.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeProfile.hasTopRated && <Badge icon={<Award size={11} />} label="Top Rated" color="var(--color-secondary)" />}
              {activeProfile.hasAvailableNow && <Badge icon={<Clock size={11} />} label="Available Now" color="#10b981" />}
              <Badge icon={<Star size={11} />} label={`${activeProfile.jobSuccess}% Job Success`} color="var(--color-primary)" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="Hourly Rate" value={`$${activeProfile.rate}/hr`} />
        <StatBox label="Job Success" value={`${activeProfile.jobSuccess}%`} highlight />
        <StatBox label="Related Jobs" value={`${activeProfile.jobsRelatedCount}`} />
        <StatBox label="Earnings" value={activeProfile.earnings} highlight />
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