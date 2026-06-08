"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddKeywordDialog from "@/components/keyword/add-keyword-dialog";
import StatCard from "@/components/keyword/stat-card";
import DemandBar from "@/components/keyword/demand-bar";
import CompetitionBar from "@/components/keyword/competition-bar";
// import TrendIcon from "@/components/keyword/trend-icon";       
import OpportunityBadge from "@/components/keyword/opportunity-badge";
import { useIsMobile } from "@/hooks/use-mobile";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";

type Opportunity = "High" | "Medium" | "Low";
// type TrendDir = "up" | "down" | "flat";                        

interface Keyword {
  id: number;
  keyword: string;
  upwork_skill_name: string;
  demand_score: number | null;
  competition_score: number | null;
  opportunity_score: number | null;
  raw_job_count: number | null;
  data_status: "scored" | "no_data" | null;
  snapshot_date: string | null;
  // position: number | null;                                     
  // trend: TrendDir;                                             
}

function getOpportunityLevel(score: number | null): Opportunity {
  if (!score) return "Low";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

export default function KeywordsPage() {
  const { dbUser }                      = useAuth();
  const isMobile                        = useIsMobile();
  const [query, setQuery]               = useState("");
  const [keywords, setKeywords]         = useState<Keyword[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const fetchKeywords = useCallback(async () => {
    if (!dbUser?.id) return;
    try {
      const { data } = await axios.get(`/api/market/keywords?user_id=${dbUser.id}`);
      setKeywords(data.keywords ?? []);
    } catch (err) {
      console.error("Failed to fetch keywords:", err);
    } finally {
      setLoading(false);
    }
  }, [dbUser?.id]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  async function handleAdd(keyword: string, upworkSkillName: string) {
    await axios.post("/api/market/keywords", {
      user_id:           dbUser.id,
      keyword,
      upwork_skill_name: upworkSkillName,
    });
    await fetchKeywords();
  }

  async function handleDelete(id: number) {
    await axios.delete("/api/market/keywords", {
      data: { user_id: dbUser.id, id },
    });
    await fetchKeywords();
  }

  async function handleRefresh() {
    if (refreshing || !dbUser?.id) return;
    setRefreshing(true);
    setRefreshError("");
    try {
      await axios.post("/api/market/refresh", { user_id: dbUser.id });
      await fetchKeywords();
    } catch (err: any) {
      setRefreshError(err?.response?.data?.error ?? "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  const filtered = keywords.filter((k) =>
    k.keyword.toLowerCase().includes(query.toLowerCase())
  );

  const highOpp = keywords.filter(
    (k) => getOpportunityLevel(k.opportunity_score) === "High"
  ).length;
  const scored  = keywords.filter((k) => k.data_status === "scored").length;

  // const top10  = keywords.filter((k) => k.position !== null && k.position <= 10).length;  
  // const withPos = keywords.filter((k) => k.position !== null);                            
  // const avgPos  = withPos.length                                                           
  //   ? (withPos.reduce((s, k) => s + (k.position ?? 0), 0) / withPos.length).toFixed(1)   
  //   : "—";                                                                                 

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest uppercase text-primary">
            Niche Intelligence
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Keyword opportunities
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Live demand vs. competition signals from public job postings and
            competitor profiles in your niche.
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
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"
        />
        <Input
          placeholder="Filter keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tracked Keywords" value={keywords.length} />
        <StatCard label="Scored"           value={scored} />
        <StatCard label="High-Opportunity" value={highOpp} accent />
        <StatCard label="No Data"          value={keywords.length - scored} />
        {/* <StatCard label="Avg. Position" value={avgPos === "—" ? "—" : `↑${avgPos}`} /> */}  
        {/* <StatCard label="Top-10 Rankings" value={top10} accent /> */}                        
      </div>

      
      {refreshError && (
        <p className="text-sm text-red-500">{refreshError}</p>
      )}

      
      {!isMobile ? (
        <div className="glass-card rounded-2xl overflow-hidden glow-border">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 px-6 py-4 gap-4 border-b border-border bg-gray-50 min-w-[560px]">
              {["Keyword", "Demand", "Competition", "Opportunity"].map((col) => (
                <span
                  key={col}
                  className="text-xs font-bold text-muted-foreground uppercase flex justify-center"
                >
                  {col}
                </span>
              ))}
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-muted-foreground text-sm min-w-[560px]">
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground text-sm min-w-[560px]">
                No keywords match your filter.
              </div>
            ) : (
              filtered.map((kw, i) => (
                <div
                  key={kw.id}
                  className={`grid grid-cols-4 gap-4 items-center px-6 py-3.5 transition-colors hover:bg-gray-50 min-w-[560px] ${
                    kw.data_status === "no_data" ? "opacity-50" : ""
                  }`}
                  style={{
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--color-border)"
                        : undefined,
                  }}
                >

                  <span
                    className="text-xs font-medium text-foreground flex justify-center"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {kw.keyword}
                  </span>


                  {kw.data_status === "scored" ? (
                    <DemandBar value={kw.demand_score ?? 0} />
                  ) : (
                    <span className="text-xs text-muted-foreground flex justify-center">
                      —
                    </span>
                  )}

                  {kw.data_status === "scored" ? (
                    <CompetitionBar value={kw.competition_score ?? 0} />
                  ) : (
                    <span className="text-xs text-muted-foreground flex justify-center">
                      —
                    </span>
                  )}

                  <OpportunityBadge
                    level={getOpportunityLevel(kw.opportunity_score)}
                  />

                  {/* <span className="text-xs font-bold flex justify-center text-foreground tabular-nums">
                    {kw.position !== null ? `#${kw.position}` : "—"}
                  </span> */}

                  {/* <div className="flex justify-center">
                    <TrendIcon dir={kw.trend} />
                  </div> */}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (

        <>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No keywords match your filter.
            </div>
          ) : (
            <div className="h-[400px] overflow-scroll">
              {filtered.map((kw, i) => (
                <KeywordMobileCard key={i} kw={kw} />
              ))}
            </div>
          )}
        </>
      )}

      <AddKeywordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}


function KeywordMobileCard({ kw }: { kw: Keyword }) {
  return (
    <div
      className={`p-4 border border-border rounded-lg mb-3 bg-white hover:bg-gray-50 transition-colors ${
        kw.data_status === "no_data" ? "opacity-50" : ""
      }`}
    >

      <div className="flex justify-between items-start gap-2 mb-3">
        <span
          className="font-mono text-sm font-medium text-foreground flex-1 break-words"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {kw.keyword}
        </span>
        <OpportunityBadge level={getOpportunityLevel(kw.opportunity_score)} />
      </div>

      {kw.data_status === "scored" ? (
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div>
            <span className="text-muted-foreground block mb-1 text-xs font-medium">
              Demand
            </span>
            <DemandBar value={kw.demand_score ?? 0} />
            <span className="text-foreground font-semibold mt-1 block">
              {kw.demand_score}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1 text-xs font-medium">
              Competition
            </span>
            <CompetitionBar value={kw.competition_score ?? 0} />
            <span className="text-foreground font-semibold mt-1 block">
              {kw.competition_score}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mb-3">No data available yet</p>
      )}

      {/* <div>
        <span className="text-muted-foreground block text-xs font-medium">Position</span>
        <p className="font-bold text-foreground mt-1">
          {kw.position !== null ? `#${kw.position}` : "—"}
        </p>
      </div> */}

      {/* <div className="text-right">
        <span className="text-muted-foreground block text-xs font-medium">Trend</span>
        <p className="text-lg mt-1">
          <TrendIcon dir={kw.trend} />
        </p>
      </div> */}
    </div>
  );
}