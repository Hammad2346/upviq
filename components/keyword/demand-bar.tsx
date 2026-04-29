"use client";

export default function DemandBar({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-28 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: "var(--gradient-primary)",
          }}
        />
      </div>
      <span className="text-xs font-medium text-foreground w-6 tabular-nums">{value}</span>
    </div>
  );
}