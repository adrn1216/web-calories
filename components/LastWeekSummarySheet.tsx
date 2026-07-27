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

export function LastWeekSummarySheet({ open, summary, weight, onClose, onSave }: { open: boolean; summary: Summary; weight: number; onClose: () => void; onSave: (calories: number, weight: number) => void }) {
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
    <div className="sheet-enter safe-bottom w-full max-w-lg border-t border-black/10 bg-white p-5 sm:rounded-lg sm:border">
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
      <form onSubmit={(event: FormEvent) => { event.preventDefault(); onSave(unlogged === "" ? 0 : unlogged, weightInput === "" ? 0 : weightInput); }} className="mt-5 space-y-4" noValidate>
        <label className="block text-sm font-medium">Unlogged calories<input type="number" min="0" inputMode="numeric" value={unlogged} onChange={(event) => setUnlogged(event.target.value === "" ? "" : Number(event.target.value))} placeholder="0" className="mt-2 h-12 w-full rounded border border-black/20 px-4 text-center text-xl font-semibold outline-none focus:border-black" /></label>
        <p className="mt-2 text-xs text-black/40">Calories na nakain last week pero hindi na-record bilang meal.</p>
        <label className="block text-sm font-medium">Weight <span className="font-normal text-black/40">kg</span><div className="relative mt-2"><input type="number" min="0" step="0.1" inputMode="decimal" value={weightInput} onChange={(event) => setWeightInput(event.target.value === "" ? "" : Number(event.target.value))} placeholder="70.0" className="h-12 w-full rounded border border-black/20 px-4 pr-12 text-center text-xl font-semibold outline-none focus:border-black" /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-black/40">kg</span></div></label>
        <div className="sticky bottom-0 bg-white pt-2"><button type="submit" className="h-12 w-full rounded bg-black font-medium text-white">Save summary</button></div>
      </form>
    </div>
  </div>;
}

function SummaryRow({ label, value, prefix = "", suffix = "", emphasis = false, tone }: { label: string; value: number; prefix?: string; suffix?: string; emphasis?: boolean; tone?: "positive" | "negative" }) {
  const color = tone === "positive" ? "text-green-600" : tone === "negative" ? "text-red-600" : "";
  return <div className="flex items-center justify-between py-3"><dt className="text-sm text-black/50">{label}</dt><dd className={`${emphasis ? "text-xl" : "text-base"} font-semibold tabular-nums ${color}`}>{prefix}{value.toLocaleString()}{suffix}</dd></div>;
}
