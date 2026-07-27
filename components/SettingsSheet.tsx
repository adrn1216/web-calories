"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";

export function SettingsSheet({ open, target, onClose, onSave, onExport, onImport }: { open: boolean; target: number; onClose: () => void; onSave: (target: number) => void; onExport: () => void; onImport: (file: File) => Promise<void> }) {
  const [value, setValue] = useState(target);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const keyboardInset = useKeyboardInset(open);
  useEffect(() => { if (open) { setValue(target); setImportError(null); } }, [open, target]);
  if (!open) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (value > 0) onSave(value);
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportError(null);
    setImporting(true);
    try {
      await onImport(file);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Hindi ma-import ang backup.");
      setImporting(false);
    }
  }

  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 transition-[padding] duration-150 sm:items-center sm:p-5" style={{ paddingBottom: keyboardInset }} role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="sheet-enter safe-bottom max-h-dvh w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-5 sm:rounded-xl">
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15 sm:hidden" />
      <div className="flex items-center justify-between">
        <h2 id="settings-title" className="text-2xl font-semibold tracking-tight">Daily goal</h2>
        <button type="button" onClick={onClose} aria-label="Close settings" className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-black/5"><X /></button>
      </div>
      <p className="mt-2 text-sm text-black/55">Set the calorie target used to calculate your daily balance.</p>
      <form onSubmit={submit} className="mt-5">
        <label className="text-sm font-medium">Calories per day<input type="number" min="1" required value={value} onChange={(event) => setValue(Number(event.target.value))} className="mt-2 h-14 w-full rounded-md border border-black/20 bg-white px-4 text-lg font-medium outline-none focus:border-black" /></label>
        <button type="submit" className="mt-5 h-14 w-full rounded-md bg-black font-medium text-white hover:bg-black/80">Save target</button>
      </form>
      <div className="mt-6 border-t border-black/10 pt-5">
        <p className="text-sm font-medium">Backup data</p>
        <p className="mt-1 text-xs leading-5 text-black/45">Ilipat ang meals at settings sa ibang phone gamit ang JSON file.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onExport} className="flex h-12 items-center justify-center gap-2 rounded border border-black/20 text-sm font-medium"><Download size={17} /> Export JSON</button>
          <input ref={importRef} type="file" accept="application/json,.json" onChange={importFile} className="sr-only" />
          <button type="button" disabled={importing} onClick={() => importRef.current?.click()} className="flex h-12 items-center justify-center gap-2 rounded border border-black/20 text-sm font-medium disabled:opacity-40"><Upload size={17} /> {importing ? "Importing…" : "Import JSON"}</button>
        </div>
        {importError && <p className="mt-3 text-sm text-red-600" role="alert">{importError}</p>}
      </div>
    </div>
  </div>;
}
