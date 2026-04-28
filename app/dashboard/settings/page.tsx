"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";


function SectionCard({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div
      className="glass-card rounded-2xl p-6 space-y-5"
      style={danger ? { border: "1px solid hsl(0 75% 45% / 0.4)" } : undefined}
    >
      {children}
    </div>
  );
}


function SectionHeader({ title, subtitle, danger }: { title: string; subtitle: string; danger?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-sm font-bold" style={{ color: danger ? "hsl(0 75% 60%)" : "hsl(210 40% 98%)" }}>
        {title}
      </p>
      <p className="text-xs text-[hsl(215_20%_50%)]">{subtitle}</p>
    </div>
  );
}


function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-t border-[hsl(224_30%_14%)] first:border-0 first:pt-0">
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-[hsl(215_20%_48%)]">{description}</p>
      </div>
<Switch
  checked={checked}
  onCheckedChange={onChange}
  className="
    shrink-0 w-11 h-6 p-1 rounded-full
    border border-gray-500 bg-muted
    transition-all duration-300

    data-[state=checked]:bg-[hsl(190_95%_55%)]

    [&>span]:block
    [&>span]:w-4 [&>span]:h-4
    [&>span]:rounded-full
    [&>span]:bg-white
    [&>span]:shadow-md
    [&>span]:transition-transform [&>span]:duration-300

    data-[state=checked]:[&>span]:translate-x-3
    data-[state=unchecked]:[&>span]:translate-x-0
  "
/>
    </div>
  );
}


function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[hsl(224_30%_10%)] border-[hsl(224_30%_16%)] text-foreground placeholder:text-[hsl(215_20%_38%)] rounded-xl focus-visible:ring-[hsl(190_95%_55%/0.4)] h-11"
      />
    </div>
  );
}


export default function SettingsPage() {
  
  const [fullName,    setFullName]    = useState("Alex Morgan");
  const [handle,      setHandle]      = useState("@alexmorgan");
  const [niche,       setNiche]       = useState("React & TypeScript Development");
  const [hourlyRate,  setHourlyRate]  = useState("95");

  
  const [autoApply,   setAutoApply]   = useState(true);
  const [rankingSim,  setRankingSim]  = useState(true);
  const [kwAlerts,    setKwAlerts]    = useState(true);
  const [rateAdjust,  setRateAdjust]  = useState(false);

  
  const [shareWins,   setShareWins]   = useState(true);
  const [shareRank,   setShareRank]   = useState(true);
  const [shareEarnings, setShareEarnings] = useState(false);

  function handleSave() {
    
  }

  function handleCancel() {
    
  }

  return (
    <div className="min-h-screen space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[hsl(190_95%_55%)]">
          Account
        </p>
        <h1
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          Settings
        </h1>
        <p className="text-[hsl(215_20%_55%)] text-sm">
          Manage your profile data, optimization preferences, and outcome sharing.
        </p>
      </div>

      <hr className="border-[hsl(224_30%_16%)]" />

      <SectionCard>
        <SectionHeader
          title="Profile"
          subtitle="Used by the engine to personalize recommendations"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name"        value={fullName}   onChange={setFullName}   placeholder="Alex Morgan" />
          <Field label="Upwork handle"    value={handle}     onChange={setHandle}     placeholder="@handle" />
          <Field label="Primary niche"    value={niche}      onChange={setNiche}      placeholder="e.g. React & TypeScript" />
          <Field label="Hourly rate (USD)" value={hourlyRate} onChange={setHourlyRate} placeholder="95" type="number" />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title="Optimization preferences"
          subtitle="Control how aggressive the engine is with suggestions"
        />
        <div>
          <ToggleRow
            label="Auto-apply low-risk rewrites"
            description="Engine applies skill tag updates and minor copy fixes automatically"
            checked={autoApply}
            onChange={setAutoApply}
          />
          <ToggleRow
            label="Run ranking simulator before changes"
            description="Predict search position impact before committing edits"
            checked={rankingSim}
            onChange={setRankingSim}
          />
          <ToggleRow
            label="Real-time keyword alerts"
            description="Notify me when a keyword opportunity appears in my niche"
            checked={kwAlerts}
            onChange={setKwAlerts}
          />
          <ToggleRow
            label="Suggest rate adjustments"
            description="Recommend hourly rate changes based on niche shifts"
            checked={rateAdjust}
            onChange={setRateAdjust}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title="Outcome data sharing"
          subtitle="Help train the model — anonymously and opt-in"
        />
        <div>
          <ToggleRow
            label="Share interview & win signals"
            description="Anonymously contribute interview and contract win data to improve recommendations"
            checked={shareWins}
            onChange={setShareWins}
          />
          <ToggleRow
            label="Share ranking position changes"
            description="Help improve the model by sharing how your profile rank changes over time"
            checked={shareRank}
            onChange={setShareRank}
          />
          <ToggleRow
            label="Share earnings range"
            description="Contribute anonymized earnings data to benchmark rate recommendations"
            checked={shareEarnings}
            onChange={setShareEarnings}
          />
        </div>
      </SectionCard>

      <SectionCard danger>
        <SectionHeader
          title="Danger zone"
          subtitle="Permanent actions. Cannot be undone."
          danger
        />
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground border border-[hsl(224_30%_20%)] hover:bg-[hsl(224_30%_14%)] transition-colors"
          >
            Export all my data
          </button>
          <button
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors"
            style={{
              color: "hsl(0 75% 60%)",
              borderColor: "hsl(0 75% 45% / 0.5)",
              background: "transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(0 75% 55% / 0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Delete account
          </button>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-4 pb-8">
        <button
          onClick={handleCancel}
          className="text-sm font-semibold text-[hsl(215_20%_60%)] hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <Button
          onClick={handleSave}
          className="rounded-xl px-6 font-semibold text-sm h-10"
          style={{
            background: "linear-gradient(135deg, hsl(190 95% 55%), hsl(195 100% 65%))",
            color: "hsl(224 47% 6%)",
            boxShadow: "0 0 24px hsl(190 95% 55% / 0.35)",
          }}
        >
          Save changes
        </Button>
      </div>

    </div>
  );
}