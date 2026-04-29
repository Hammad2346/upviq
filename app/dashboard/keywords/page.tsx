"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddKeywordDialog from "@/components/keyword/add-keyword-dialog";
import StatCard from "@/components/keyword/stat-card";
import DemandBar from "@/components/keyword/demand-bar";
import CompetitionBar from "@/components/keyword/competition-bar";
import TrendIcon from "@/components/keyword/trend-icon";
import OpportunityBadge from "@/components/keyword/opportunity-badge";

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
  { id: 1, name: "react developer", demand: 94, competition: 72, position: 8, trend: "up", opportunity: "High" },
  { id: 2, name: "typescript expert", demand: 88, competition: 64, position: 12, trend: "up", opportunity: "High" },
  { id: 3, name: "next.js specialist", demand: 82, competition: 58, position: 5, trend: "up", opportunity: "High" },
  { id: 4, name: "frontend developer", demand: 76, competition: 81, position: 19, trend: "flat", opportunity: "Medium" },
  { id: 5, name: "ui/ux developer", demand: 71, competition: 69, position: 24, trend: "down", opportunity: "Medium" },
  { id: 6, name: "tailwind css expert", demand: 65, competition: 45, position: 7, trend: "up", opportunity: "Medium" },
  { id: 7, name: "web performance", demand: 58, competition: 38, position: 3, trend: "up", opportunity: "High" },
  { id: 8, name: "javascript developer", demand: 91, competition: 88, position: 31, trend: "down", opportunity: "Low" },
];

export default function KeywordsPage() {
  const [query, setQuery] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>(INITIAL_KEYWORDS);
  const [dialogOpen, setDialogOpen] = useState(false);

  function addKeyword(name: string) {
    const demand = Math.floor(Math.random() * 40) + 40;
    const competition = Math.floor(Math.random() * 50) + 30;
    const opp: Opportunity =
      competition < 50 && demand > 65
        ? "High"
        : competition < 70
          ? "Medium"
          : "Low";

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
  const top10 = keywords.filter((k) => k.position !== null && k.position <= 10).length;
  const withPos = keywords.filter((k) => k.position !== null);
  const avgPos = withPos.length
    ? (withPos.reduce((s, k) => s + (k.position ?? 0), 0) / withPos.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest uppercase text-primary">
            Niche Intelligence
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"

            style={{ fontFamily: "Arial, sans-serif" }}
          >
            Keyword opportunities
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Live demand vs. competition signals from public job postings and competitor profiles in your niche.
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-xs lg:text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto shrink-0"

        >
          <Plus size={15} />
          Track new keyword
        </Button>
      </div>

      <hr className="border-border" />


      <div className="relative w-full max-w-lg glow-border rounded-lg">

        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
        <Input
          placeholder="Filter keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tracked Keywords" value={keywords.length} />
        <StatCard label="Avg. Position" value={avgPos === "—" ? "—" : `↑${avgPos}`} />
        <StatCard label="High-Opportunity" value={highOpp} accent />
        <StatCard label="Top-10 Rankings" value={top10} accent />
      </div>

<div className="glass-card rounded-2xl overflow-hidden glow-border">
  <div className="overflow-x-auto">
    <div className="grid grid-cols-[200px_140px_140px_80px_70px_110px] gap-4 px-6 py-4 border-b border-border bg-gray-50 min-w-[845px]">
      {["Keyword", "Demand", "Competition", "Pos.", "Trend", "Opportunity"].map((col) => (
        <span key={col} className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          {col}
        </span>
      ))}
    </div>

    {filtered.length === 0 ? (
      <div className="px-6 py-12 text-center text-muted-foreground text-sm min-w-[780px]">
        No keywords match your filter.
      </div>
    ) : (
      filtered.map((kw, i) => (
        <div
          key={kw.id}
          className="grid grid-cols-[200px_140px_140px_80px_70px_110px] gap-4 items-center px-6 py-3.5 transition-colors hover:bg-gray-50 min-w-[780px]"
          style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : undefined }}
        >
          <span
            className="text-xs font-medium text-foreground tracking-wide truncate"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
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
</div>
      <AddKeywordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={addKeyword}
      />
    </div>
  );
}