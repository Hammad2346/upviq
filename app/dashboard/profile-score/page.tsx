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
  { day: "Day 1",  score: 62 },
  { day: "Day 7",  score: 67 },
  { day: "Day 14", score: 74 },
  { day: "Day 21", score: 80 },
  { day: "Day 28", score: 86 },
  { day: "Day 35", score: 91 },
  { day: "Day 42", score: 94 },
];

const DIMENSIONS = [
  { label: "Title Optimization",  weight: 20, score: 96 },
  { label: "Overview Quality",    weight: 25, score: 91 },
  { label: "Skill Tags Coverage", weight: 15, score: 88 },
  { label: "Portfolio Strength",  weight: 15, score: 94 },
  { label: "Rate Positioning",    weight: 10, score: 82 },
  { label: "Engagement Signals",  weight: 15, score: 97 },
];

const SCORE_NOW   = 94;
const SCORE_START = 62;
const SCORE_GAIN  = SCORE_NOW - SCORE_START;


function CircularScore({ score }: { score: number }) {
  const size   = 180;
  const stroke = 12;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const dash   = circ * (score / 100);
  const gap    = circ - dash;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(224 30% 14%)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(190 95% 55%)" />
            <stop offset="100%" stopColor="hsl(265 85% 65%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-6xl font-bold text-foreground leading-none" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
          {score}
        </span>
        <span className="text-sm text-[hsl(215_20%_55%)] mt-1">/ 100</span>
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs text-[hsl(215_20%_45%)]">w {weight}%</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-foreground">
          {score}<span className="text-[hsl(215_20%_45%)] font-normal">/100</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-[hsl(224_30%_12%)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: "hsl(190 95% 55%)",
            boxShadow: "0 0 12px hsl(190 95% 55% / 0.6)",
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
    <div className="glass-card rounded-xl px-3 py-2 border border-[hsl(224_30%_18%)]">
      <p className="text-xs text-[hsl(215_20%_55%)]">{label}</p>
      <p className="text-sm font-bold text-[hsl(190_95%_55%)]">{payload[0].value}</p>
    </div>
  );
}


function MiniStat({ value, label, green }: { value: string; label: string; green?: boolean }) {
  return (
    <div className="flex-1 rounded-xl bg-[hsl(224_30%_10%)] border border-[hsl(224_30%_16%)] px-4 py-3 flex flex-col items-center gap-0.5">
      <span className="text-xl font-bold tabular-nums" style={{ color: green ? "hsl(145 70% 50%)" : "hsl(210 40% 98%)" }}>
        {value}
      </span>
      <span className="text-xs text-[hsl(215_20%_50%)]">{label}</span>
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
    <div className="min-h-screen space-y-6">


      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[hsl(190_95%_55%)]">
            Profile Score
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            Your optimization score
          </h1>
          <p className="text-[hsl(215_20%_65%)] max-w-xl text-sm">
            Composite score across 6 weighted dimensions, benchmarked against the top 10% in React &amp; TypeScript Development.
          </p>
        </div>
        <Button
          onClick={handleRecompute}
          disabled={recomputing}
          className="flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg, hsl(190 95% 55%), hsl(195 100% 65%))",
            color: "hsl(224 47% 6%)",
            boxShadow: "0 0 30px hsl(190 95% 55% / 0.35)",
            opacity: recomputing ? 0.7 : 1,
          }}
        >
          {recomputing ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {recomputing ? "Recomputing…" : "Recompute now"}
        </Button>
      </div>

      <hr className="border-[hsl(224_30%_16%)]" />

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-5">

        <div className="glass-card glow-border rounded-2xl p-6 flex flex-col items-center gap-5">
          <CircularScore score={SCORE_NOW} />
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-foreground">Top 3% in niche</p>
            <p className="text-xs text-[hsl(215_20%_55%)]">
              Up from {SCORE_START} (Day 1) — gained {SCORE_GAIN} points in 42 days.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <MiniStat value={String(SCORE_START)} label="Start" />
            <MiniStat value={`+${SCORE_GAIN}`}    label="Gain"  green />
            <MiniStat value={String(SCORE_NOW)}   label="Now"  />
          </div>
        </div>

        <div className="glass-card glow-border rounded-2xl p-6 space-y-3">
          <div>
            <p className="text-sm font-bold text-foreground">42-day trajectory</p>
            <p className="text-xs text-[hsl(215_20%_55%)]">Score recomputed daily as new market signal arrives</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRAJECTORY} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradSm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(190 95% 55%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(190 95% 55%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} ticks={[50, 65, 80, 95, 100]} tick={{ fill: "hsl(215 20% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="score" stroke="hsl(190 95% 55%)" strokeWidth={2} fill="url(#areaGradSm)" dot={false} activeDot={{ r: 4, fill: "hsl(190 95% 55%)", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card glow-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              Profile Score Evolution
            </p>
            <p className="text-xs text-[hsl(215_20%_50%)]">
              Trailing 42 days · Updated 2h ago
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TRAJECTORY} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradLg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(190 95% 55%)" stopOpacity={0.4}  />
                  <stop offset="95%" stopColor="hsl(190 95% 55%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="hsl(224 30% 16% / 0.6)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "hsl(215 20% 48%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                ticks={[50, 65, 80, 95, 100]}
                tick={{ fill: "hsl(215 20% 48%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(190 95% 60%)"
                strokeWidth={2.5}
                fill="url(#areaGradLg)"
                dot={false}
                activeDot={{ r: 5, fill: "hsl(190 95% 60%)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card glow-border rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-foreground">Score breakdown</p>
            <p className="text-xs text-[hsl(215_20%_55%)]">6 weighted dimensions per the model spec</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[hsl(224_30%_18%)] px-3 py-1.5 text-xs text-[hsl(215_20%_55%)]">
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