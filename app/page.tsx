"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, ImageUp, X } from "lucide-react";
import { CalorieHeader } from "@/components/CalorieHeader";
import { MealDraft, MealFormSheet } from "@/components/MealFormSheet";
import { MealList } from "@/components/MealList";
import { SettingsSheet } from "@/components/SettingsSheet";
import { EarnedCaloriesSheet } from "@/components/EarnedCaloriesSheet";
import { LastWeekSummarySheet } from "@/components/LastWeekSummarySheet";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MealEntry } from "@/types/meal";
import { caloriesToday, lastWeekSummary, localDateKey, mealsForToday, mealsForYesterday, weeklyCalorieBalance } from "@/utils/calorieCalculations";
import { compressImage } from "@/utils/imageCompression";
import { createId } from "@/utils/createId";
import { removeHistoricalPhotos } from "@/utils/mealStorage";
import { parseBackup } from "@/utils/backup";
import { CalorieBackup } from "@/types/backup";

const emptyDraft: MealDraft = { imageDataUrl: "", notes: "", description: "", basis: [], calories: "" };

export default function Home() {
  const [meals, setMeals, mealsReady] = useLocalStorage<MealEntry[]>("calorie-tracker-meals", []);
  const [target, setTarget] = useLocalStorage<number>("calorie-tracker-target", 2000);
  const [earnedByDate, setEarnedByDate] = useLocalStorage<Record<string, number>>("calorie-tracker-earned-calories", {});
  const [weekAdjustments, setWeekAdjustments] = useLocalStorage<Record<string, number>>("calorie-tracker-week-adjustments", {});
  const [weeklyWeights, setWeeklyWeights] = useLocalStorage<Record<string, number>>("calorie-tracker-weekly-weight", {});
  const [draft, setDraft] = useState<MealDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mealOpen, setMealOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [earnedOpen, setEarnedOpen] = useState(false);
  const [lastWeekOpen, setLastWeekOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const oldPhotosCleaned = useRef(false);
  const today = useMemo(() => mealsForToday(meals).sort((a, b) => +new Date(b.eatenAt) - +new Date(a.eatenAt)), [meals]);
  const yesterday = useMemo(() => mealsForYesterday(meals).sort((a, b) => +new Date(b.eatenAt) - +new Date(a.eatenAt)), [meals]);
  const todayKey = localDateKey();
  const earnedToday = earnedByDate[todayKey] ?? 0;
  const previousWeek = useMemo(() => {
    const base = lastWeekSummary(meals, target, new Date(), earnedByDate);
    return lastWeekSummary(meals, target, new Date(), earnedByDate, weekAdjustments[localDateKey(base.start)] ?? 0);
  }, [meals, target, earnedByDate, weekAdjustments]);
  const previousWeekKey = localDateKey(previousWeek.start);

  useEffect(() => {
    if (!mealsReady || oldPhotosCleaned.current) return;
    oldPhotosCleaned.current = true;
    const cleaned = removeHistoricalPhotos(meals);
    if (cleaned.some((meal, index) => meal.imageDataUrl !== meals[index]?.imageDataUrl)) {
      try {
        window.localStorage.setItem("calorie-tracker-meals", JSON.stringify(cleaned));
        setMeals(cleaned);
      } catch {
        setError("Hindi ma-release ang old photo storage. I-clear ang browser site data kung magpatuloy ang error.");
      }
    }
  }, [meals, mealsReady, setMeals]);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(null), 2400); }
  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    setError(null);
    try { const imageDataUrl = await compressImage(file); setEditingId(null); setDraft({ ...emptyDraft, imageDataUrl }); setMealOpen(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The photo could not be processed."); }
  }
  function saveMeal(next: MealDraft) {
    setMealOpen(false);
    const now = new Date().toISOString();
    const previous = editingId ? meals.find((m) => m.id === editingId) : undefined;
    const entry: MealEntry = { id: editingId ?? createId(), imageDataUrl: next.imageDataUrl, description: next.description, analysisBasis: next.basis, notes: next.notes, calories: Number(next.calories), eatenAt: editingId ? previous?.eatenAt ?? now : now, createdAt: previous?.createdAt ?? now };
    const updated = removeHistoricalPhotos(editingId ? meals.map((m) => m.id === editingId ? entry : m) : [entry, ...meals]);
    try { window.localStorage.setItem("calorie-tracker-meals", JSON.stringify(updated)); setMeals(updated); notify(editingId ? "Meal updated" : "Meal saved"); }
    catch { setError("Your browser storage is full. Delete an older meal or use a smaller photo, then try again."); }
  }
  function editMeal(meal: MealEntry) { setEditingId(meal.id); setDraft({ imageDataUrl: meal.imageDataUrl, notes: meal.notes ?? "", description: meal.description, basis: meal.analysisBasis ?? [], calories: meal.calories }); setMealOpen(true); }
  function deleteMeal(meal: MealEntry) { if (window.confirm("Delete this meal? This cannot be undone.")) { setMeals((all) => all.filter((m) => m.id !== meal.id)); notify("Meal deleted"); } }
  function exportBackup() {
    const backup: CalorieBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      dailyTarget: target,
      meals,
      earnedByDate,
      weekAdjustments,
      weeklyWeights,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `calorie-tracker-${localDateKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify("Backup exported");
  }
  async function importBackup(file: File) {
    const backup = parseBackup(await file.text());
    const values: Record<string, string> = {
      "calorie-tracker-meals": JSON.stringify(removeHistoricalPhotos(backup.meals)),
      "calorie-tracker-target": JSON.stringify(backup.dailyTarget),
      "calorie-tracker-earned-calories": JSON.stringify(backup.earnedByDate),
      "calorie-tracker-week-adjustments": JSON.stringify(backup.weekAdjustments),
      "calorie-tracker-weekly-weight": JSON.stringify(backup.weeklyWeights),
    };
    const previous = new Map<string, string | null>();
    try {
      for (const [key, value] of Object.entries(values)) {
        previous.set(key, window.localStorage.getItem(key));
        window.localStorage.setItem(key, value);
      }
    } catch {
      for (const key of Object.keys(values)) window.localStorage.removeItem(key);
      for (const [key, value] of previous) {
        if (value !== null) window.localStorage.setItem(key, value);
      }
      throw new Error("Kulang ang browser storage para sa backup file.");
    }
    window.location.reload();
  }
  return <main className="mx-auto flex h-dvh max-w-lg flex-col overflow-hidden bg-white">
    <CalorieHeader consumed={caloriesToday(meals)} target={target} earnedToday={earnedToday} weeklyBalance={weeklyCalorieBalance(meals, target, new Date(), earnedByDate)} onSettings={() => setSettingsOpen(true)} onEarnedCalories={() => setEarnedOpen(true)} />
    <div className="flex min-h-0 flex-1 flex-col px-4">
      {error && <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert"><span>{error}</span><button onClick={() => setError(null)} aria-label="Dismiss error"><X size={18} /></button></div>}
      <section className="grid shrink-0 grid-cols-2 gap-2 py-4">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={choosePhoto} className="sr-only" />
        <input ref={uploadRef} type="file" accept="image/*" onChange={choosePhoto} className="sr-only" />
        <button type="button" onClick={() => fileRef.current?.click()} className="flex h-12 items-center justify-center gap-2 rounded bg-black px-3 text-sm font-medium text-white hover:bg-black/80"><Camera size={19} strokeWidth={1.8} /> Take Photo</button>
        <button type="button" onClick={() => uploadRef.current?.click()} className="flex h-12 items-center justify-center gap-2 rounded border border-black/20 bg-white px-3 text-sm font-medium hover:bg-black/[.03]"><ImageUp size={19} strokeWidth={1.8} /> Upload Photo</button>
      </section>
      <section className="flex min-h-0 flex-1 flex-col"><div className="mb-1 flex shrink-0 items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-black/40">Today</p><h2 className="text-xl font-semibold tracking-tight">Your meals</h2></div><span className="text-xs text-black/45">{today.length} {today.length === 1 ? "meal" : "meals"}</span></div><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{mealsReady ? <><MealList meals={today} onEdit={editMeal} onDelete={deleteMeal} onPreview={setPreview} /><div className="mb-1 mt-5 flex items-end justify-between border-t border-black/10 pt-4"><h3 className="text-sm font-semibold uppercase tracking-[.12em] text-black/55">Yesterday</h3><span className="text-xs text-black/45">{yesterday.length} {yesterday.length === 1 ? "meal" : "meals"}</span></div>{yesterday.length ? <MealList meals={yesterday} onEdit={editMeal} onDelete={deleteMeal} onPreview={setPreview} /> : <p className="py-6 text-center text-sm text-black/40">No meals logged yesterday.</p>}</> : <div className="h-32 animate-pulse bg-black/5" />}</div></section>
      <div className="safe-bottom shrink-0 border-t border-black/10 bg-white pt-1"><button type="button" onClick={() => setLastWeekOpen(true)} className="flex h-12 w-full items-center justify-between text-sm font-medium"><span>Last Week Summary</span><span className={previousWeek.balance > 0 ? "text-green-600" : previousWeek.balance < 0 ? "text-red-600" : ""}>{previousWeek.balance > 0 ? "+" : ""}{previousWeek.balance.toLocaleString()}</span></button></div>
    </div>
    <MealFormSheet open={mealOpen} initial={draft} editing={!!editingId} onClose={() => setMealOpen(false)} onSave={saveMeal} />
    <SettingsSheet open={settingsOpen} target={target} onClose={() => setSettingsOpen(false)} onSave={(next) => { setTarget(next); setSettingsOpen(false); notify("Daily target saved"); }} onExport={exportBackup} onImport={importBackup} />
    <EarnedCaloriesSheet open={earnedOpen} current={earnedToday} onClose={() => setEarnedOpen(false)} onAdd={(amount) => { setEarnedByDate((values) => ({ ...values, [todayKey]: (values[todayKey] ?? 0) + amount })); setEarnedOpen(false); notify(`+${amount.toLocaleString()} calories added`); }} />
    <LastWeekSummarySheet open={lastWeekOpen} summary={previousWeek} weight={weeklyWeights[previousWeekKey] ?? 0} onClose={() => setLastWeekOpen(false)} onSave={(calories, weight) => { setWeekAdjustments((values) => ({ ...values, [previousWeekKey]: calories })); setWeeklyWeights((values) => ({ ...values, [previousWeekKey]: weight })); setLastWeekOpen(false); notify("Last week summary saved"); }} />
    {preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={() => setPreview(null)}><button className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white" aria-label="Close preview"><X /></button><img src={preview} alt="Meal preview" className="max-h-full max-w-full rounded-xl object-contain" /></div>}
    {toast && <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-md bg-black px-5 py-3 text-sm text-white" role="status">{toast}</div>}
  </main>;
}
