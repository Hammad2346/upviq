export default function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-1.5 glow-border">
      <span className="text-xs font-semibold tracking-widest text-[hsl(215_20%_65%)] uppercase">{label}</span>
      <span
        className="text-2xl font-bold tracking-tight"
        style={accent ? { color: "hsl(190 95% 55%)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}