import { MealEntry } from "@/types/meal";
import { Pencil, Trash2 } from "lucide-react";

type Props = { meal: MealEntry; onEdit: () => void; onDelete: () => void; onPreview: () => void };

export function MealCard({ meal, onEdit, onDelete, onPreview }: Props) {
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(meal.eatenAt));
  return (
    <article className="flex gap-3 border-b border-black/10 py-2.5">
      {meal.imageDataUrl ? <button type="button" onClick={onPreview} aria-label="Preview meal photo" className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-black/5"><img src={meal.imageDataUrl} alt="Meal" className="h-full w-full object-cover" /></button> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-black/[.04] px-2 text-center text-[10px] leading-4 text-black/35">Photo removed</div>}
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2"><p className="text-xs text-black/45">{time}</p><p className="font-semibold">{meal.calories.toLocaleString()} cal</p></div>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink/85">{meal.description}</p>
        {!!meal.analysisBasis?.length && <p className="mt-0.5 line-clamp-1 text-xs text-black/40">Basis: {meal.analysisBasis.join(" · ")}</p>}
        <div className="mt-0.5 flex justify-end gap-1">
          <button type="button" onClick={onEdit} className="flex h-11 items-center gap-1 rounded-md px-3 text-sm text-black/55 hover:bg-black/5"><Pencil size={15} /> Edit</button>
          <button type="button" onClick={onDelete} aria-label="Delete meal" className="flex h-11 w-11 items-center justify-center rounded-md text-black/45 hover:bg-black/5"><Trash2 size={16} /></button>
        </div>
      </div>
    </article>
  );
}
