"use client";

import { useState } from "react";
import { Search, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddKeywordDialog from "@/components/keyword/add-keyword-dialog";
import StatCard from "@/components/keyword/stat-card";
import DemandBar from "@/components/keyword/demand-bar";
import CompetitionBar from "@/components/keyword/competition-bar";
import TrendIcon from "@/components/keyword/trend-icon";
import OpportunityBadge from "@/components/keyword/opportunity-badge";

// ─── Types ────────────────────────────────────────────────────────────────────
type Opportunity = "High" | "Medium" | "Low";
type TrendDir = "up" | "down" | "flat";

interface Keyword {
  id: number;
  name: string;
  demand: number;
  competition: number;
  position: number | null;
  trend: TrendDir;
  opportunity: Opportunity;
}

const INITIAL_KEYWORDS: Keyword[] = [
  { id: 1, name: "react developer",      demand: 94, competition: 72, position: 8,  trend: "up",   opportunity: "High"   },
  { id: 2, name: "typescript expert",    demand: 88, competition: 64, position: 12, trend: "up",   opportunity: "High"   },
  { id: 3, name: "next.js specialist",   demand: 82, competition: 58, position: 5,  trend: "up",   opportunity: "High"   },
  { id: 4, name: "frontend developer",   demand: 76, competition: 81, position: 19, trend: "flat", opportunity: "Medium" },
  { id: 5, name: "ui/ux developer",      demand: 71, competition: 69, position: 24, trend: "down", opportunity: "Medium" },
  { id: 6, name: "tailwind css expert",  demand: 65, competition: 45, position: 7,  trend: "up",   opportunity: "Medium" },
  { id: 7, name: "web performance",      demand: 58, competition: 38, position: 3,  trend: "up",   opportunity: "High"   },
  { id: 8, name: "javascript developer", demand: 91, competition: 88, position: 31, trend: "down", opportunity: "Low"    },
];

export default function KeywordsPage() {
  const [query, setQuery] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>(INITIAL_KEYWORDS);
  const [dialogOpen, setDialogOpen] = useState(false);

  function addKeyword(name: string) {
    const demand      = Math.floor(Math.random() * 40) + 40;
    const competition = Math.floor(Math.random() * 50) + 30;
    const opp: Opportunity =
      competition < 50 && demand > 65 ? "High" :
      competition < 70               ? "Medium" : "Low";

    setKeywords((prev) => [
      {
        id: Date.now(),
        name: name.toLowerCase(),
        demand,
        competition,
        position: null,
        trend: "flat",
        opportunity: opp,
      },
      ...prev,
    ]);
  }

  const filtered = keywords.filter((k) =>
    k.name.toLowerCase().includes(query.toLowerCase())
  );

  const highOpp = keywords.filter((k) => k.opportunity === "High").length;
  const top10   = keywords.filter((k) => k.position !== null && k.position <= 10).length;
  const withPos = keywords.filter((k) => k.position !== null);
  const avgPos  = withPos.length
    ? (withPos.reduce((s, k) => s + (k.position ?? 0), 0) / withPos.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen space-y-6">


      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[hsl(190_95%_55%)]">
            Niche Intelligence
          </p>
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            Keyword opportunities
          </h1>
          <p className="text-[hsl(215_20%_65%)] max-w-xl text-sm">
            Live demand vs. competition signals from public job postings and competitor profiles in your niche.
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg, hsl(190 95% 55%), hsl(195 100% 65%))",
            color: "hsl(224 47% 6%)",
            boxShadow: "0 0 30px hsl(190 95% 55% / 0.35)",
          }}
        >
          <Plus size={15} />
          Track new keyword
        </Button>
      </div>

      <hr className="border-[hsl(224_30%_16%)]" />

      <div className="relative w-full max-w-lg ">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10" />
        <Input
          placeholder="Filter keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 rounded-xl bg-[hsl(224_30%_10%)] text-foreground placeholder:text-[hsl(215_20%_45%)] focus-visible:ring-[hsl(190_95%_55%/0.5)] glow-border"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tracked Keywords" value={keywords.length} />
        <StatCard label="Avg. Position"    value={avgPos === "—" ? "—" : `↑${avgPos}`} />
        <StatCard label="High-Opportunity" value={highOpp} accent />
        <StatCard label="Top-10 Rankings"  value={top10}   accent />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden glow-border">
        <div className="grid grid-cols-[2fr_1fr_1fr_80px_70px_100px] gap-4 px-6 py-4 border-b border-[hsl(224_30%_16%)]">
          {["Keyword", "Demand", "Competition", "Pos.", "Trend", "Opportunity"].map((col) => (
            <span key={col} className="text-xs font-bold tracking-widest text-[hsl(215_20%_55%)] uppercase">
              {col}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-[hsl(215_20%_55%)] text-sm">
            No keywords match your filter.
          </div>
        ) : (
          filtered.map((kw, i) => (
            <div
              key={kw.id}
              className="grid grid-cols-[2fr_1fr_1fr_80px_70px_100px] gap-4 items-center px-6 py-3.5 transition-colors hover:bg-[hsl(224_30%_12%/0.5)]"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid hsl(224 30% 14%)" : undefined }}
            >
              <span
                className="text-xs font-medium text-foreground tracking-wide"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {kw.name}
              </span>
              <DemandBar value={kw.demand} />
              <CompetitionBar value={kw.competition} />
              <span className="text-xs font-bold text-foreground tabular-nums">
                {kw.position !== null ? `#${kw.position}` : "—"}
              </span>
              <TrendIcon dir={kw.trend} />
              <OpportunityBadge level={kw.opportunity} />
            </div>
          ))
        )}
      </div>

      {/* ── Dialog ─────────────────────────────────────────────────────────── */}
      <AddKeywordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={addKeyword}
      />
    </div>
  );
}