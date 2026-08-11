"use client";

import { X } from "lucide-react";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { FormEvent, useEffect, useState } from "react";

type Summary = {
  start: Date;
  end: Date;
  consumed: number;
  recordedConsumed: number;
  unloggedCalories: number;
  earned: number;
  allowance: number;
  balance: number;
};

type WeightPoint = { date: Date; value: number };

export function LastWeekSummarySheet({ open, summary, weight, weights, onClose, onSave }: { open: boolean; summary: Summary; weight: number; weights: Record<string, number>; onClose: () => void; onSave: (calories: number, weight: number) => void }) {
  const keyboardInset = useKeyboardInset(open);
  const [unlogged, setUnlogged] = useState<number | "">(summary.unloggedCalories || "");
  const [weightInput, setWeightInput] = useState<number | "">(weight || "");
  useEffect(() => {
    if (open) {
      setUnlogged(summary.unloggedCalories || "");
      setWeightInput(weight || "");
    }
  }, [open, summary.unloggedCalories, weight]);
  if (!open) return null;
  const dateRange = `${summary.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–${summary.end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 transition-[padding] duration-150 sm:items-center sm:p-5" style={{ paddingBottom: keyboardInset }} role="dialog" aria-modal="true" aria-labelledby="last-week-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="sheet-enter safe-bottom max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto border-t border-black/10 bg-white p-5 sm:rounded-lg sm:border">
      <div className="flex items-center justify-between">
        <div><p className="text-xs uppercase tracking-[.16em] text-black/40">{dateRange}</p><h2 id="last-week-title" className="mt-1 text-2xl font-semibold tracking-tight">Last Week Summary</h2></div>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded hover:bg-black/5"><X /></button>
      </div>
      <dl className="mt-6 divide-y divide-black/10 border-y border-black/10">
        <SummaryRow label="Weekly allowance" value={summary.allowance} />
        <SummaryRow label="Recorded calories" value={summary.recordedConsumed} />
        {summary.unloggedCalories > 0 && <SummaryRow label="Unlogged calories" value={summary.unloggedCalories} />}
        <SummaryRow label="Exercise earned" value={summary.earned} prefix={summary.earned > 0 ? "+" : ""} />
        {weight > 0 && <SummaryRow label="Weight" value={weight} suffix=" kg" />}
        <SummaryRow label="Final balance" value={summary.balance} prefix={summary.balance > 0 ? "+" : ""} emphasis tone={summary.balance > 0 ? "positive" : summary.balance < 0 ? "negative" : undefined} />
      </dl>
      <WeightProgression weights={weights} />
      <form onSubmit={(event: FormEvent) => { event.preventDefault(); onSave(unlogged === "" ? 0 : unlogged, weightInput === "" ? 0 : weightInput); }} className="mt-5 space-y-4" noValidate>
        <label className="block text-sm font-medium">Unlogged calories<input type="number" min="0" inputMode="numeric" value={unlogged} onChange={(event) => setUnlogged(event.target.value === "" ? "" : Number(event.target.value))} placeholder="0" className="mt-2 h-12 w-full rounded border border-black/20 px-4 text-center text-xl font-semibold outline-none focus:border-black" /></label>
        <p className="mt-2 text-xs text-black/40">Calories na nakain last week pero hindi na-record bilang meal.</p>
        <label className="block text-sm font-medium">Weight <span className="font-normal text-black/40">kg</span><div className="relative mt-2"><input type="number" min="0" step="0.1" inputMode="decimal" value={weightInput} onChange={(event) => setWeightInput(event.target.value === "" ? "" : Number(event.target.value))} placeholder="70.0" className="h-12 w-full rounded border border-black/20 px-4 pr-12 text-center text-xl font-semibold outline-none focus:border-black" /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-black/40">kg</span></div></label>
        <div className="sticky bottom-0 bg-white pt-2"><button type="submit" className="h-12 w-full rounded bg-black font-medium text-white">Save summary</button></div>
      </form>
    </div>
  </div>;
}

function WeightProgression({ weights }: { weights: Record<string, number> }) {
  const points: WeightPoint[] = Object.entries(weights)
    .filter(([date, value]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(value) && value > 0)
    .map(([date, value]) => {
      const [year, month, day] = date.split("-").map(Number);
      return { date: new Date(year, month - 1, day), value };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (points.length < 2) return <section className="mt-5 rounded-lg bg-black/[.035] p-4" aria-label="Overall weight trend">
    <h3 className="text-sm font-semibold">Weight progression</h3>
    <p className="mt-1 text-xs leading-5 text-black/45">Save weight for at least two weeks to see your progress graph.</p>
  </section>;

  const width = 440;
  const height = 120;
  const paddingX = 10;
  const paddingY = 12;
  const values = points.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = Math.max(maximum - minimum, 1);
  const coordinates = points.map((point, index) => ({
    ...point,
    x: paddingX + (index / (points.length - 1)) * (width - paddingX * 2),
    y: paddingY + ((maximum - point.value) / range) * (height - paddingY * 2),
  }));
  const change = points.at(-1)!.value - points[0].value;
  const dateLabel = (date: Date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return <section className="mt-5 rounded-lg bg-black/[.035] p-4" aria-label="Overall weight trend">
    <div className="flex items-start justify-between gap-4">
      <div><h3 className="text-sm font-semibold">Weight progression</h3><p className="mt-0.5 text-xs text-black/45">{points.length} weekly check-ins</p></div>
      <p className={`text-sm font-semibold tabular-nums ${change < 0 ? "text-green-600" : change > 0 ? "text-red-600" : ""}`}>{change > 0 ? "+" : ""}{change.toFixed(1)} kg</p>
    </div>
    <svg className="mt-3 h-28 w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Weight changed from ${points[0].value} to ${points.at(-1)!.value} kilograms`}>
      <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="currentColor" className="text-black/10" strokeDasharray="4 5" />
      <polyline points={coordinates.map(({ x, y }) => `${x},${y}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {coordinates.map(({ x, y, date, value }) => <circle key={date.toISOString()} cx={x} cy={y} r="4" fill="white" stroke="currentColor" strokeWidth="2"><title>{dateLabel(date)}: {value} kg</title></circle>)}
    </svg>
    <div className="mt-1 flex justify-between text-xs text-black/45"><span>{dateLabel(points[0].date)} · {points[0].value} kg</span><span>{dateLabel(points.at(-1)!.date)} · {points.at(-1)!.value} kg</span></div>
  </section>;
}

function SummaryRow({ label, value, prefix = "", suffix = "", emphasis = false, tone }: { label: string; value: number; prefix?: string; suffix?: string; emphasis?: boolean; tone?: "positive" | "negative" }) {
  const color = tone === "positive" ? "text-green-600" : tone === "negative" ? "text-red-600" : "";
  return <div className="flex items-center justify-between py-3"><dt className="text-sm text-black/50">{label}</dt><dd className={`${emphasis ? "text-xl" : "text-base"} font-semibold tabular-nums ${color}`}>{prefix}{value.toLocaleString()}{suffix}</dd></div>;
}
