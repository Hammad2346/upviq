"use client";

import { useEffect } from "react";
import { Sparkles, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAnalyze } from "@/contexts/analyze-context";

const TEST_PROFILE = {
  searchUrl:
    "https://www.upwork.com/nx/search/talent/?nbs=1&q=ai%20enabled%20game%20developer",
  name: "Salman S.",
  profileId: "01daa0337b257ef5b5",
  profileUrl:
    "https://www.upwork.com/freelancers/~01daa0337b257ef5b5",
  title:
    "Senior AI-Integrated Game Developer | Unity & Unreal | AR/VR/XR & Multiplayer Specialist",
  location: "Pakistan",
  avatarUrl: "",
  rate: 18,
  jobSuccess: 100,
  earnings: "",
  hasAvailableNow: true,
  hasTopRated: true,
  skills: [
    "Unity","Unreal Engine","C#","Multiplayer Networking",
    "Photon Unity Networking","AR/VR/XR Development","AI Model Integration",
    "Game UI/UX Design","3D Game Art","ARKit / ARCore",
    "Meta Quest Development","Online Multiplayer","Mobile Game Development",
    "WebGL","Game Design",
  ],
  description:
    "I bring over a decade of end-to-end game development experience, delivering high-performance Unity and Unreal titles across AR, VR, XR, and AI-enhanced multiplayer platforms. My expertise spans full-cycle production—from concept and UI/UX design to networked gameplay and AI model integration—ensuring immersive, scalable experiences for mobile, PC, and headset markets.",
  jobsRelatedCount: 10,
  scrapedAt: "2026-04-01T08:36:42.806Z",
};

const TRAJECTORY = [
  { day: "Day 1",  score: 62 },
  { day: "Day 7",  score: 67 },
  { day: "Day 14", score: 74 },
  { day: "Day 21", score: 80 },
  { day: "Day 28", score: 86 },
  { day: "Day 35", score: 91 },
  { day: "Day 42", score: 94 },
];

const PARAM_META: Record<string, { label: string; weight: number }> = {
  titleOptimization: { label: "Title Optimization",  weight: 23 },
  overviewQuality:   { label: "Overview Quality",    weight: 29 },
  skillTagsCoverage: { label: "Skill Tags Coverage", weight: 18 },
  ratePositioning:   { label: "Rate Positioning",    weight: 12 },
  engagementSignals: { label: "Engagement Signals",  weight: 18 },
};

function getCSSVariable(varName: string): string {
  if (typeof window !== "undefined") {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }
  return "";
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      style={{ backgroundColor: "var(--color-border, #e5e7eb)" }}
    />
  );
}

function SkeletonCircularScore() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
        <Skeleton className="rounded-full" style={{ width: 180, height: 180, borderRadius: "50%" } as React.CSSProperties} />
        <div className="absolute flex flex-col items-center gap-2">
          <Skeleton className="w-16 h-10 rounded" />
          <Skeleton className="w-10 h-3 rounded" />
        </div>
      </div>
      <div className="text-center space-y-2 w-full">
        <Skeleton className="h-4 w-32 mx-auto rounded" />
        <Skeleton className="h-3 w-48 mx-auto rounded" />
      </div>
      <div className="flex gap-3 w-full">
        {[0,1,2].map(i => <Skeleton key={i} className="flex-1 h-16 rounded-lg" />)}
      </div>
    </div>
  );
}

function SkeletonDimensionRow() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

import { useState, useEffect as useEffectInner } from "react";

function CircularScore({ score }: { score: number }) {
  const [colors, setColors] = useState({ primary: "#0F6E56", secondary: "#1D9E75" });

  useEffectInner(() => {
    setColors({
      primary:   getCSSVariable("--color-primary")   || "#0F6E56",
      secondary: getCSSVariable("--color-secondary") || "#1D9E75",
    });
  }, []);

  const size   = 180;
  const stroke = 12;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const dash   = circ * (score / 100);
  const gap    = circ - dash;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-6xl font-bold text-foreground leading-none" style={{ fontFamily: "Arial, sans-serif" }}>
          {score}
        </span>
        <span className="text-sm text-muted-foreground mt-1">/ 100</span>
      </div>
    </div>
  );
}

function DimensionRow({
  label, weight, score, maxScore, percentage, reasoning, delay,
}: {
  label: string; weight: number; score: number;
  maxScore: number; percentage: number; reasoning: string; delay: number;
}) {
  const [width, setWidth] = useState(0);

  useEffectInner(() => {
    const t = setTimeout(() => setWidth(percentage), delay);
    return () => clearTimeout(t);
  }, [percentage, delay]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">{label}</span>
          <span className="text-xs text-muted-foreground shrink-0">w {weight}%</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-2">
          {score}<span className="text-muted-foreground font-normal">/{maxScore}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: "var(--color-primary)",
            boxShadow: "var(--shadow-glow-sm)",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      {reasoning && (
        <p className="text-xs text-muted-foreground leading-relaxed">{reasoning}</p>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-primary">{payload[0].value}</p>
    </div>
  );
}

function MiniStat({ value, label, green }: { value: string; label: string; green?: boolean }) {
  return (
    <div className="flex-1 rounded-lg bg-gray-100 border border-border px-4 py-3 flex flex-col items-center gap-0.5">
      <span
        className="text-xl font-bold tabular-nums"
        style={{ color: green ? "var(--color-primary)" : "var(--color-foreground)" }}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ProfileScorePage() {
  const { result, loading, error, analyze } = useAnalyze();

  function handleRecompute() {
    analyze(TEST_PROFILE);
  }

  const overallScore = result?.overallScore ?? 0;
  const SCORE_START  = 62;
  const SCORE_GAIN   = overallScore - SCORE_START;

  const dimensions = result
    ? Object.entries(result.parameters)
        .filter(([key]) => key in PARAM_META)
        .map(([key, param]) => ({
          key,
          label:      PARAM_META[key].label,
          weight:     PARAM_META[key].weight,
          score:      param.score,
          maxScore:   param.maxScore,
          percentage: param.percentage,
          reasoning:  param.reasoning,
        }))
    : [];

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest uppercase text-primary">
            Profile Score
          </p>
          <h1
            className="text-lg lg:text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            Your optimization score
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Composite score across 5 weighted dimensions, benchmarked against the top 10% in your niche.
          </p>
        </div>
        <Button
          onClick={handleRecompute}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto shrink-0"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading
            ? <RefreshCw size={15} className="animate-spin" />
            : <Sparkles size={15} />}
          {loading ? "Recomputing…" : "Recompute now"}
        </Button>
      </div>

      <hr className="border-border" />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">

        <div className="glass-card glow-border rounded-2xl p-6 flex flex-col items-center gap-5">
          {loading ? (
            <SkeletonCircularScore />
          ) : (
            <>
              <CircularScore score={overallScore} />
              <div className="text-center space-y-1">
                <p className="text-base font-bold text-foreground">
                  {result?.name ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Benchmarked against top 10 profiles in your niche
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <MiniStat value={String(SCORE_START)} label="Start" />
                <MiniStat value={SCORE_GAIN >= 0 ? `+${SCORE_GAIN}` : String(SCORE_GAIN)} label="Gain" green />
                <MiniStat value={String(overallScore)} label="Now" />
              </div>
            </>
          )}
        </div>

        <div className="glass-card glow-border rounded-2xl p-6 space-y-3">
          <div>
            <p className="text-sm font-bold text-foreground">42-day trajectory</p>
            <p className="text-xs text-muted-foreground">Score recomputed daily as new market signal arrives</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRAJECTORY} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradSm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} ticks={[50, 65, 80, 95, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} fill="url(#areaGradSm)" dot={false} activeDot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card glow-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-base font-bold text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
              Profile Score Evolution
            </p>
            <p className="text-xs text-muted-foreground">Trailing 42 days · Updated 2h ago</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TRAJECTORY} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradLg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="4 4" opacity={0.5} />
              <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} ticks={[50, 65, 80, 95, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#areaGradLg)" dot={false} activeDot={{ r: 5, fill: "var(--color-primary)", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card glow-border rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-foreground">Score breakdown</p>
            <p className="text-xs text-muted-foreground">5 weighted dimensions per the model spec</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border px-2 sm:px-3 py-1.5 text-xs text-muted-foreground bg-gray-50 whitespace-nowrap">
            <Info size={12} />
            Weights retrained bi-weekly
          </div>
        </div>
        <div className="space-y-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonDimensionRow key={i} />)
            : dimensions.map((d, i) => (
                <DimensionRow
                  key={d.key}
                  label={d.label}
                  weight={d.weight}
                  score={d.score}
                  maxScore={d.maxScore}
                  percentage={d.percentage}
                  reasoning={d.reasoning}
                  delay={i * 100}
                />
              ))
          }
        </div>
      </div>

    </div>
  );
}