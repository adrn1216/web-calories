"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";

export type MealDraft = {
  imageDataUrl: string;
  notes: string;
  description: string;
  basis: string[];
  calories: number | "";
};

type Props = { open: boolean; initial: MealDraft; editing: boolean; onClose: () => void; onSave: (draft: MealDraft) => void };

export function MealFormSheet({ open, initial, editing, onClose, onSave }: Props) {
  const [draft, setDraft] = useState(initial);
  const [phase, setPhase] = useState<"notes" | "review">("notes");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyboardInset = useKeyboardInset(open);

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setPhase(editing ? "review" : "notes");
      setError(null);
    }
  }, [open, initial, editing]);

  if (!open) return null;

  async function analyze(e: FormEvent) {
    e.preventDefault();
    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: draft.imageDataUrl, notes: draft.notes }),
      });
      const responseText = await response.text();
      let result: { error?: string; description?: string; basis?: string[]; estimatedCalories?: number };
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("May error ang app server. I-restart ang development server at subukan ulit.");
      }
      if (!response.ok) throw new Error(result.error || "Hindi ma-analyze ang photo.");
      if (!result.description || !result.basis || !result.estimatedCalories) throw new Error("Incomplete ang analysis result. Subukan ulit.");
      setDraft({ ...draft, description: result.description, basis: result.basis, calories: result.estimatedCalories });
      setPhase("review");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Hindi ma-analyze ang photo.");
    } finally {
      setAnalyzing(false);
    }
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (draft.calories === "" || draft.calories <= 0) {
      setError("Maglagay ng valid calorie estimate.");
      return;
    }
    onSave(draft);
  }

  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 transition-[padding] duration-150 sm:items-center sm:p-5" style={{ paddingBottom: keyboardInset }} role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && !analyzing && onClose()}>
    <div className="sheet-enter safe-bottom max-h-dvh w-full max-w-lg overflow-y-auto border-t border-black/10 bg-white p-5 sm:max-h-[94dvh] sm:rounded-lg sm:border">
      <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-black/40">{phase === "notes" ? "Food analysis" : "AI estimate"}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">{phase === "notes" ? "Add a note" : "Check the estimate"}</h2></div><button type="button" disabled={analyzing} onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-black/5" aria-label="Close"><X /></button></div>
      {draft.imageDataUrl && <img src={draft.imageDataUrl} alt="Selected food" className="mt-4 h-36 w-full rounded object-cover" />}

      {phase === "notes" ? <form onSubmit={analyze} className="mt-4" noValidate>
        <label className="block text-sm font-medium">Notes <span className="font-normal text-black/40">optional</span><textarea autoFocus value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="May cheese sa ilalim, diet ang drink…" rows={2} className="mt-2 w-full resize-none rounded border border-black/20 px-4 py-3 text-base outline-none focus:border-black" /></label>
        <p className="mt-2 text-xs leading-5 text-black/45">Makakatulong ang notes sa ingredients at portions na hindi malinaw sa picture.</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={analyzing} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded bg-black font-medium text-white disabled:opacity-60">{analyzing && <LoaderCircle className="animate-spin" size={18} />} {analyzing ? "Analyzing…" : "Analyze meal"}</button>
      </form> : <form onSubmit={save} className="mt-4 space-y-4" noValidate>
        <div><p className="text-xs uppercase tracking-[.14em] text-black/40">Image Analysis</p><p className="mt-1 text-sm leading-6">{draft.description}</p></div>
        <div><p className="text-xs uppercase tracking-[.14em] text-black/40">Calorie Estimate</p><ul className="mt-2 space-y-1.5 text-sm text-black/65">{draft.basis.map((item, index) => <li key={index} className="flex gap-2"><span>—</span><span>{item}</span></li>)}</ul></div>
        <label className="block border-t border-black/10 pt-4 text-center"><span className="sr-only">Estimated calories</span><input type="number" min="1" inputMode="numeric" aria-label="Estimated calories" value={draft.calories} onChange={(e) => { setDraft({ ...draft, calories: e.target.value === "" ? "" : Number(e.target.value) }); setError(null); }} className="h-16 w-full appearance-none border-0 bg-transparent p-0 text-center text-5xl font-semibold tracking-[-.05em] outline-none" /><span className="mt-1 block text-xs text-black/40">calories · tap to edit</span></label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="sticky bottom-0 z-10 bg-white pb-[max(4px,env(safe-area-inset-bottom))] pt-1"><button type="submit" className="h-12 w-full touch-manipulation rounded bg-black font-medium text-white active:bg-black/70">Confirm & save</button></div>
        {!editing && <button type="button" onClick={() => setPhase("notes")} className="h-11 w-full text-sm text-black/50">Analyze again</button>}
      </form>}
    </div>
  </div>;
}
