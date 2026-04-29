"use client";

import { useState, useEffect } from "react";
import { Sparkles, Info, RefreshCw, ArrowRight } from "lucide-react";
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

const TRAJECTORY = [
  { day: "Day 1", score: 62 },
  { day: "Day 7", score: 67 },
  { day: "Day 14", score: 74 },
  { day: "Day 21", score: 80 },
  { day: "Day 28", score: 86 },
  { day: "Day 35", score: 91 },
  { day: "Day 42", score: 94 },
];

const DIMENSIONS = [
  { label: "Title Optimization", weight: 20, score: 96 },
  { label: "Overview Quality", weight: 25, score: 91 },
  { label: "Skill Tags Coverage", weight: 15, score: 88 },
  { label: "Portfolio Strength", weight: 15, score: 94 },
  { label: "Rate Positioning", weight: 10, score: 82 },
  { label: "Engagement Signals", weight: 15, score: 97 },
];

const SCORE_NOW = 94;
const SCORE_START = 62;
const SCORE_GAIN = SCORE_NOW - SCORE_START;

function getCSSVariable(varName: string): string {
  if (typeof window !== "undefined") {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }
  return "";
}

function CircularScore({ score }: { score: number }) {
  const [colors, setColors] = useState({ primary: "#0F6E56", secondary: "#1D9E75" });

  useEffect(() => {
    setColors({
      primary: getCSSVariable("--color-primary") || "#0F6E56",
      secondary: getCSSVariable("--color-secondary") || "#1D9E75",
    });
  }, []);

  const size = 180;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const gap = circ - dash;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#scoreGrad)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>
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

function DimensionRow({ label, weight, score, delay }: { label: string; weight: number; score: number; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">{label}</span>
          <span className="text-xs text-muted-foreground shrink-0">w {weight}%</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-2">
          {score}<span className="text-muted-foreground font-normal">/100</span>
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
  const [recomputing, setRecomputing] = useState(false);

  function handleRecompute() {
    setRecomputing(true);
    setTimeout(() => setRecomputing(false), 2000);
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">


      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest uppercase text-primary">
            Profile Score
          </p>
          <h1 className="text-lg lg:text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Arial, sans-serif" }}>
            Your optimization score
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Composite score across 6 weighted dimensions, benchmarked against the top 10% in React &amp; TypeScript Development.
          </p>
        </div>
        <Button
          onClick={handleRecompute}
          disabled={recomputing}
          className="flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto shrink-0"

          style={{
            opacity: recomputing ? 0.7 : 1,
          }}
        >
          {recomputing ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {recomputing ? "Recomputing…" : "Recompute now"}
        </Button>
      </div>

      <hr className="border-border" />
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        <div className="glass-card glow-border rounded-2xl p-6 flex flex-col items-center gap-5">
          <CircularScore score={SCORE_NOW} />
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-foreground">Top 3% in niche</p>
            <p className="text-xs text-muted-foreground">
              Up from {SCORE_START} (Day 1) — gained {SCORE_GAIN} points in 42 days.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <MiniStat value={String(SCORE_START)} label="Start" />
            <MiniStat value={`+${SCORE_GAIN}`} label="Gain" green />
            <MiniStat value={String(SCORE_NOW)} label="Now" />
          </div>
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
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} ticks={[50, 65, 80, 95, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#areaGradSm)"
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 0 }}
                />
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
            <p className="text-xs text-muted-foreground">
              Trailing 42 days · Updated 2h ago
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TRAJECTORY} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradLg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
                opacity={0.5}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                ticks={[50, 65, 80, 95, 100]}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#areaGradLg)"
                dot={false}
                activeDot={{ r: 5, fill: "var(--color-primary)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card glow-border rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-2">

          <div className="space-y-0.5">
            <p className="text-sm font-bold text-foreground">Score breakdown</p>
            <p className="text-xs text-muted-foreground">6 weighted dimensions per the model spec</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border px-2 sm:px-3 py-1.5 text-xs text-muted-foreground bg-gray-50 whitespace-nowrap">

            <Info size={12} />
            Weights retrained bi-weekly
          </div>
        </div>
        <div className="space-y-5">
          {DIMENSIONS.map((d, i) => (
            <DimensionRow key={d.label} label={d.label} weight={d.weight} score={d.score} delay={i * 100} />
          ))}
        </div>
      </div>
    </div>
  );
}