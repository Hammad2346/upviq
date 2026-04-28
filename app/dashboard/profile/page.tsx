"use client";

import { useState } from "react";
import {
  MapPin,
  Star,
  Clock,
  Award,
  Link2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PROFILE_DATA = {
  name: "Salman S.",
  title: "Top AI-Enabled Game Developer | AR/VR/XR Specialist | Unity | Unreal",
  location: "Pakistan",
  avatarUrl: "https://www.upwork.com/profile-portraits/c13wfUX9wS7Q_38tVOBma1v5_gAkcQ453kLjxa1Nuw6gc8xhARhSo1RphQoI43MSa_",
  profileUrl: "https://www.upwork.com/freelancers/~01daa0337b257ef5b5?referrer_url_path=/nx/search/talent/",
  rate: 18,
  jobSuccess: 100,
  earnings: "10M+ downloads",
  hasAvailableNow: true,
  hasTopRated: true,
  jobsRelatedCount: 10,
  skills: [
    "Video Game",
    "Game Development",
    "Game Level",
    "Game Design",
    "Game Design Document",
    "Unity",
    "Unreal Engine",
    "Online Multiplayer",
    "WebGL",
    "C#",
    "Android",
    "Photon Unity Networking",
    "Game Customization",
    "Mobile Game Development",
    "React Native",
  ],
  description: `🥇 Game Design & Developer. "Let me say some words about this seller: OUTSTANDING PROFESSIONAL, OUTSTANDING PERSON, and OUTSTANDING EXPERIENCE for me. Delivered as promised and with dedication. 10 Stars from me. Thanks!" — jacksparrow427

They say, "Choose a job you love, and you will never have to work a day in your life." For a passionate gamer, what could be better than designing and developing games? I'm here to bring your ideas to life, guiding them from initial concepts through to final production using a well-structured Game Development Life Cycle (GDLC).

With over 10 years of industry experience, I've developed a wide range of cross-platform games for PC, Android, iOS, and WebGL. My work has garnered over 10 million downloads on mobile platforms, proving the impact and success of the games I've created.

I specialize in both 2D and 3D game development, across various genres, including:
🎮 Platformers and Endless Runners
🃏 Board Games and Card Games (Single Player and Multiplayer)
⚡ Hyper-casual/One-Tap Games
🔫 First-Person and Third-Person Shooters (Single Player and Multiplayer)
🛡️ RPG / Open World Games
🛠️ Simulation Games (Single-player and Multiplayer)
👾 Arcade/Action Games`,
  scrapedAt: "2026-04-01T08:36:42.806Z",
};

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 glow-border">
      <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        {label}
      </span>
      <span
        className="text-2xl font-bold tracking-tight text-foreground"
        style={highlight ? { color: "var(--color-primary)" } : undefined}
      >
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

function Badge({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <span
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{
        color,
        borderColor: `${color}40`,
        background: `${color}12`,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

export default function ProfilePage() {
  const [url, setUrl] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const profile = PROFILE_DATA;
  const descLines = profile.description.split("\n");
  const descPreview = descLines.slice(0, 4).join("\n");

  function handleAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 1400);
  }

  return (
    <div className="min-h-screen space-y-8 p-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-widest uppercase text-primary">
          Profile Analyzer
        </p>
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Analyze any Upwork profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Paste a public Upwork profile URL to pull key data and review it at a glance.
        </p>
      </div>

      <hr className="border-border" />

      {/* Analysis Input Card */}
      <div
        className="glass-card glow-border rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-primary) / 0.06, transparent 60%), var(--gradient-card)",
        }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--color-primary) / 0.15, var(--color-secondary) / 0.1)",
            border: "1px solid var(--color-primary) / 0.2",
          }}
        >
          <Search size={22} className="text-primary" />
        </div>

        {/* Instructions */}
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
            Enter a profile URL
          </p>
          <p className="text-xs text-muted-foreground">
            e.g. https://www.upwork.com/freelancers/~xxxxxxxxxxxxxxx
          </p>
        </div>

        {/* Input & Button */}
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
          <Button
            onClick={handleAnalyze}
            disabled={!url.trim() || loading}
            className="h-12 px-6 rounded-xl font-semibold text-sm shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-200 disabled:text-muted-foreground transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Analyzing…
              </span>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>

        {/* Demo Link */}
        {!analyzed && (
          <button
            onClick={() => {
              setUrl(profile.profileUrl);
              setAnalyzed(true);
            }}
            className="text-xs text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Load demo profile
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {analyzed && (
        <div className="space-y-5">
          {/* Profile Header Card */}
          <div className="glass-card glow-border rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Avatar */}
              <div className="shrink-0">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                  style={{ border: "2px solid var(--color-border)" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2
                      className="text-lg font-bold text-foreground"
                      style={{ fontFamily: "Arial, sans-serif" }}
                    >
                      {profile.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5 max-w-xl leading-snug">
                      {profile.title}
                    </p>
                  </div>
                  <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-75 transition-opacity shrink-0"
                  >
                    View on Upwork <ExternalLink size={12} />
                  </a>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={12} /> {profile.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Briefcase size={12} /> {profile.jobsRelatedCount} jobs
                  </span>
                  <span className="text-xs text-muted-foreground/50">·</span>
                  <span className="text-xs text-muted-foreground">
                    Scraped{" "}
                    {new Date(profile.scrapedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {profile.hasTopRated && (
                    <Badge
                      icon={<Award size={11} />}
                      label="Top Rated"
                      color="var(--color-secondary)"
                    />
                  )}
                  {profile.hasAvailableNow && (
                    <Badge
                      icon={<Clock size={11} />}
                      label="Available Now"
                      color="#10b981"
                    />
                  )}
                  <Badge
                    icon={<Star size={11} />}
                    label={`${profile.jobSuccess}% Job Success`}
                    color="var(--color-primary)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox label="Hourly Rate" value={`$${profile.rate}/hr`} />
            <StatBox label="Job Success" value={`${profile.jobSuccess}%`} highlight />
            <StatBox label="Related Jobs" value={`${profile.jobsRelatedCount}`} />
            <StatBox label="Mobile Impact" value="10M+" highlight />
          </div>

          {/* Skills Card */}
          <div className="glass-card glow-border rounded-2xl p-6 space-y-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">Skills</p>
              <p className="text-xs text-muted-foreground">
                {profile.skills.length} skills listed on profile
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <SkillPill key={s} label={s} />
              ))}
            </div>
          </div>

          {/* Overview Card */}
          <div className="glass-card glow-border rounded-2xl p-6 space-y-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">Overview</p>
              <p className="text-xs text-muted-foreground">
                Profile bio as shown on Upwork
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {descExpanded ? profile.description : descPreview}
              {!descExpanded && "…"}
            </p>
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-75 transition-opacity"
            >
              {descExpanded ? (
                <>
                  <ChevronUp size={13} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={13} /> Read more
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}