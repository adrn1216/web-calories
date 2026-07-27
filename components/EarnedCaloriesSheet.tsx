"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";

export function EarnedCaloriesSheet({ open, current, onClose, onAdd }: { open: boolean; current: number; onClose: () => void; onAdd: (amount: number) => void }) {
  const [amount, setAmount] = useState<number | "">("");
  const keyboardInset = useKeyboardInset(open);
  useEffect(() => { if (open) setAmount(""); }, [open]);
  if (!open) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (amount !== "" && amount > 0) onAdd(amount);
  }

  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 transition-[padding] duration-150 sm:items-center sm:p-5" style={{ paddingBottom: keyboardInset }} role="dialog" aria-modal="true" aria-labelledby="earned-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="sheet-enter safe-bottom max-h-dvh w-full max-w-lg overflow-y-auto border-t border-black/10 bg-white p-5 sm:rounded-lg sm:border">
      <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-black/40">Exercise</p><h2 id="earned-title" className="mt-1 text-2xl font-semibold tracking-tight">Add earned calories</h2></div><button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded hover:bg-black/5"><X /></button></div>
      <p className="mt-2 text-sm text-black/50">Earned today: {current.toLocaleString()} calories</p>
      <form onSubmit={submit} className="mt-5" noValidate>
        <label className="block text-sm font-medium">Calories burned<input autoFocus type="number" min="1" inputMode="numeric" value={amount} onFocus={(event) => { const input = event.currentTarget; window.setTimeout(() => input.scrollIntoView?.({ block: "center", behavior: "smooth" }), 200); }} onChange={(event) => setAmount(event.target.value === "" ? "" : Number(event.target.value))} placeholder="200" className="mt-2 h-14 w-full appearance-none rounded-none border-x-0 border-b border-t-0 border-black/20 bg-transparent px-0 text-center text-4xl font-semibold outline-none focus:border-b-black focus-visible:outline-none" /></label>
        <div className="sticky bottom-0 bg-white pt-6"><button type="submit" disabled={amount === "" || amount <= 0} className="h-12 w-full rounded bg-black font-medium text-white disabled:opacity-30">Add calories</button></div>
      </form>
    </div>
  </div>;
}
