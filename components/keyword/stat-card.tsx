"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

export default function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-1.5 glow-border">
      <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</span>
      <span
        className="text-2xl font-bold tracking-tight text-foreground"
        style={accent ? { color: "var(--color-primary)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}